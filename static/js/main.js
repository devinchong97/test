class FacebookAdPanel {
    constructor() {
        this.accounts = [];
        this.filteredAccounts = [];
        this.currentRechargeAccount = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadAccounts();
    }
    
    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.loadingSection = document.getElementById('loadingSection');
        this.errorSection = document.getElementById('errorSection');
        this.accountsSection = document.getElementById('accountsSection');
        this.accountsTableBody = document.getElementById('accountsTableBody');
        this.accountCount = document.getElementById('accountCount');
        this.noResultsMessage = document.getElementById('noResultsMessage');
        this.rechargeModal = document.getElementById('rechargeModal');
        this.modalAccountId = document.getElementById('modalAccountId');
        this.rechargeAmount = document.getElementById('rechargeAmount');
        this.cancelRecharge = document.getElementById('cancelRecharge');
        this.confirmRecharge = document.getElementById('confirmRecharge');
        this.errorMessage = document.getElementById('errorMessage');
    }
    
    bindEvents() {
        this.searchInput.addEventListener('input', () => this.filterAccounts());
        this.refreshBtn.addEventListener('click', () => this.loadAccounts());
        this.cancelRecharge.addEventListener('click', () => this.closeRechargeModal());
        this.confirmRecharge.addEventListener('click', () => this.processRecharge());
        
        this.rechargeModal.addEventListener('click', (e) => {
            if (e.target === this.rechargeModal) {
                this.closeRechargeModal();
            }
        });
        
        this.rechargeAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processRecharge();
            }
        });
    }
    
    async loadAccounts() {
        this.showLoading();
        this.hideError();
        
        try {
            const response = await fetch('/api/accounts');
            const data = await response.json();
            
            if (data.success) {
                this.accounts = data.accounts;
                this.filteredAccounts = [...this.accounts];
                this.renderAccounts();
                this.showAccountsSection();
            } else {
                this.showError(data.error || '加载账户数据失败');
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.showError('网络错误，请检查连接后重试');
        }
    }
    
    filterAccounts() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredAccounts = [...this.accounts];
        } else {
            this.filteredAccounts = this.accounts.filter(account => 
                account.id.toLowerCase().includes(searchTerm) ||
                account.name.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderAccounts();
    }
    
    renderAccounts() {
        this.accountsTableBody.innerHTML = '';
        
        if (this.filteredAccounts.length === 0) {
            this.noResultsMessage.classList.remove('hidden');
            this.accountCount.textContent = '共 0 个账户';
            return;
        }
        
        this.noResultsMessage.classList.add('hidden');
        this.accountCount.textContent = `共 ${this.filteredAccounts.length} 个账户`;
        
        this.filteredAccounts.forEach(account => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            const statusClass = account.status === 'Active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
            
            row.innerHTML = `
                <td class="border border-gray-200 px-4 py-3 font-mono text-sm">${account.id}</td>
                <td class="border border-gray-200 px-4 py-3">${account.name}</td>
                <td class="border border-gray-200 px-4 py-3 font-semibold">${account.balance}</td>
                <td class="border border-gray-200 px-4 py-3">${account.limit}</td>
                <td class="border border-gray-200 px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${account.status}
                    </span>
                </td>
                <td class="border border-gray-200 px-4 py-3 text-center">
                    <button 
                        class="recharge-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center mx-auto"
                        data-account-id="${account.id}"
                    >
                        <i data-lucide="zap" class="w-4 h-4 mr-1"></i>
                        充值
                    </button>
                </td>
            `;
            
            this.accountsTableBody.appendChild(row);
        });
        
        lucide.createIcons();
        
        document.querySelectorAll('.recharge-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const accountId = e.currentTarget.getAttribute('data-account-id');
                this.openRechargeModal(accountId);
            });
        });
    }
    
    openRechargeModal(accountId) {
        this.currentRechargeAccount = accountId;
        this.modalAccountId.textContent = accountId;
        this.rechargeAmount.value = '';
        this.rechargeModal.classList.remove('hidden');
        this.rechargeAmount.focus();
    }
    
    closeRechargeModal() {
        this.rechargeModal.classList.add('hidden');
        this.currentRechargeAccount = null;
        this.rechargeAmount.value = '';
    }
    
    async processRecharge() {
        const amount = parseFloat(this.rechargeAmount.value);
        
        if (!amount || amount <= 0) {
            alert('请输入有效的充值金额');
            return;
        }
        
        if (amount > 1000) {
            alert('单次充值金额不能超过 $1000');
            return;
        }
        
        this.confirmRecharge.disabled = true;
        this.confirmRecharge.innerHTML = `
            <div class="loading-spinner mr-2"></div>
            正在充值...
        `;
        
        try {
            const response = await fetch('/api/recharge', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account_id: this.currentRechargeAccount,
                    amount: amount
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert(`充值成功！\n账户: ${this.currentRechargeAccount}\n金额: $${amount}`);
                this.closeRechargeModal();
                this.loadAccounts();
            } else {
                alert(`充值失败: ${data.error}`);
            }
        } catch (error) {
            console.error('Recharge error:', error);
            alert('充值过程中发生网络错误，请重试');
        } finally {
            this.confirmRecharge.disabled = false;
            this.confirmRecharge.innerHTML = `
                <i data-lucide="zap" class="w-4 h-4 mr-2"></i>
                确认充值
            `;
            lucide.createIcons();
        }
    }
    
    showLoading() {
        this.loadingSection.classList.remove('hidden');
        this.accountsSection.classList.add('hidden');
        this.errorSection.classList.add('hidden');
    }
    
    showAccountsSection() {
        this.loadingSection.classList.add('hidden');
        this.accountsSection.classList.remove('hidden');
        this.errorSection.classList.add('hidden');
    }
    
    showError(message) {
        this.loadingSection.classList.add('hidden');
        this.accountsSection.classList.add('hidden');
        this.errorSection.classList.remove('hidden');
        this.errorMessage.textContent = message;
    }
    
    hideError() {
        this.errorSection.classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FacebookAdPanel();
});
