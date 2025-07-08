# Facebook广告费充值助手

一个用于管理和充值Facebook广告账户的Web应用程序，提供账户搜索、筛选和自动充值功能。

## 功能特性

- **自动账户提取**: 使用Playwright自动登录Facebook并提取广告账户数据
- **实时搜索筛选**: 通过账户ID快速筛选和定位目标账户
- **一键充值**: 集成虚拟卡平台，支持快速充值操作
- **响应式设计**: 支持桌面和移动设备访问

## 技术架构

- **前端**: HTML5, TailwindCSS, JavaScript
- **后端**: Python Flask
- **自动化**: Playwright (Facebook数据提取)
- **数据库**: 内存存储 (开发版本)

## 安装部署

### 环境要求

- Python 3.8+
- Chrome/Chromium浏览器

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd facebook_ad_filter_system
```

2. 安装依赖
```bash
pip install -r requirements.txt
playwright install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入Facebook登录凭据
```

4. 启动应用
```bash
python app.py
```

5. 访问应用
打开浏览器访问: http://localhost:5000

## 使用说明

### 首次登录设置

1. 修改 `playwright_scraper.py` 中的 `headless=False`
2. 运行脚本进行手动登录: `python playwright_scraper.py`
3. 在弹出的浏览器中完成Facebook登录和2FA验证
4. 恢复 `headless=True` 设置

### 界面操作

1. **查看账户**: 页面加载后自动显示所有Facebook广告账户
2. **搜索筛选**: 在搜索框中输入账户ID进行实时筛选
3. **账户充值**: 点击账户行的"充值"按钮，输入金额完成充值

## API接口

### GET /api/accounts
获取所有Facebook广告账户列表

### POST /api/recharge
为指定账户执行充值操作
```json
{
  "account_id": "act_123456789",
  "amount": 100
}
```

### GET /api/health
健康检查接口

## 安全说明

- Facebook登录凭据通过环境变量管理
- 浏览器会话数据存储在本地 `playwright_user_data` 目录
- 虚拟卡充值功能当前为模拟实现

## 开发说明

### 项目结构
```
facebook_ad_filter_system/
├── app.py                 # Flask主应用
├── playwright_scraper.py  # Facebook数据提取
├── virtual_card_manager.py # 虚拟卡充值管理
├── requirements.txt       # Python依赖
├── .env                   # 环境配置
├── templates/
│   └── index.html        # 前端页面
├── static/
│   ├── js/main.js        # 前端JavaScript
│   └── css/styles.css    # 自定义样式
└── playwright_user_data/ # 浏览器会话数据
```

### 扩展开发

- 虚拟卡集成: 修改 `virtual_card_manager.py` 实现真实的卡平台API调用
- 数据持久化: 集成数据库存储账户和交易记录
- 用户认证: 添加用户登录和权限管理
- 监控告警: 集成账户余额监控和自动告警

## 故障排除

### 常见问题

1. **Facebook登录失败**
   - 检查账户凭据是否正确
   - 确认2FA代码有效性
   - 检查网络连接状态

2. **账户数据为空**
   - 确认Facebook账户有广告管理权限
   - 检查Playwright浏览器安装
   - 查看应用日志获取详细错误信息

3. **充值功能异常**
   - 当前为模拟实现，检查日志输出
   - 实际部署需要配置真实的虚拟卡平台

### 日志查看

应用运行时会输出详细日志，包括:
- Facebook登录状态
- 账户提取过程
- 充值操作记录
- 错误和异常信息

## 许可证

本项目仅供内部使用，请遵守Facebook服务条款和相关法律法规。
