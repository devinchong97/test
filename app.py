from flask import Flask, render_template, jsonify, request
import os
from dotenv import load_dotenv
import json
import logging
from playwright_scraper import FacebookScraper
from virtual_card_manager import VirtualCardManager

load_dotenv()

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

facebook_scraper = FacebookScraper()
card_manager = VirtualCardManager()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    try:
        logger.info("Starting Facebook account extraction...")
        accounts = facebook_scraper.extract_accounts()
        logger.info(f"Successfully extracted {len(accounts)} accounts")
        return jsonify({
            'success': True,
            'accounts': accounts,
            'count': len(accounts)
        })
    except Exception as e:
        logger.error(f"Error extracting accounts: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'accounts': []
        }), 500

@app.route('/api/recharge', methods=['POST'])
def recharge_account():
    try:
        data = request.get_json()
        account_id = data.get('account_id')
        amount = data.get('amount')
        
        if not account_id or not amount:
            return jsonify({
                'success': False,
                'error': 'Account ID and amount are required'
            }), 400
        
        logger.info(f"Starting recharge for account {account_id} with amount ${amount}")
        result = card_manager.recharge_account(account_id, amount)
        
        return jsonify({
            'success': True,
            'message': f'Recharge of ${amount} for account {account_id} completed successfully',
            'result': result
        })
    except Exception as e:
        logger.error(f"Error during recharge: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Facebook Ad Filter System'
    })

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
