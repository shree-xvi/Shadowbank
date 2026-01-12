from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from typing import Dict, List, Optional
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to connect

# MOCK DATABASE (In-memory)
users: Dict[int, Dict] = {
    1: {
        'id': 1,
        'username': 'victim',
        'api_key': 'key_victim_secret_123',
        'password': '12345',  # In real app, this would be hashed
        'balance': 1500000.00,
        'account_number': 'SB-8829-9921'
    },
    2: {
        'id': 2,
        'username': 'attacker',
        'api_key': 'key_attacker_public_456',
        'password': '12345',
        'balance': 50.00,
        'account_number': 'SB-1102-3344'
    }
}

transactions: List[Dict] = [
    # Victim's Transactions (High Value / Confidential)
    {'id': 1, 'user_id': 1, 'amount': -50000.00, 'description': 'Wire Transfer - Offshore Holdings', 'date': '2023-10-12', 'recipient_account': 'KY-2929-1111', 'category': 'Debit'},
    {'id': 2, 'user_id': 1, 'amount': 250000.00, 'description': 'Dividend Payout - Corp A', 'date': '2023-10-15', 'recipient_account': 'SB-8829-9921', 'category': 'Credit'},
    {'id': 5, 'user_id': 1, 'amount': -1200.00, 'description': 'Luxury Car Lease Payment', 'date': '2023-10-01', 'recipient_account': 'AUTO-LEASE-01', 'category': 'Debit'},
    {'id': 6, 'user_id': 1, 'amount': -450.00, 'description': 'Golf Club Membership', 'date': '2023-10-05', 'recipient_account': 'CLUB-ELITE', 'category': 'Debit'},
    {'id': 7, 'user_id': 1, 'amount': 15000.00, 'description': 'Consulting Fee - Tech Strategy', 'date': '2023-10-18', 'recipient_account': 'SB-8829-9921', 'category': 'Credit'},
    {'id': 11, 'user_id': 1, 'amount': -3200.00, 'description': 'Fine Art Auction Deposit', 'date': '2023-10-28', 'recipient_account': 'SOTHEBYS-NYC', 'category': 'Debit'},
    {'id': 13, 'user_id': 1, 'amount': -150.00, 'description': 'Executive Lunch', 'date': '2023-10-30', 'recipient_account': 'NOBU-DOWNTOWN', 'category': 'Debit'},

    # Attacker's Transactions (Low Value / Everyday)
    {'id': 3, 'user_id': 2, 'amount': -15.00, 'description': 'Coffee Shop', 'date': '2023-10-20', 'recipient_account': 'MERCHANT-99', 'category': 'Debit'},
    {'id': 4, 'user_id': 2, 'amount': -5.00, 'description': 'Bus Ticket', 'date': '2023-10-21', 'recipient_account': 'MERCHANT-22', 'category': 'Debit'},
    {'id': 8, 'user_id': 2, 'amount': -12.50, 'description': 'Fast Food Lunch', 'date': '2023-10-22', 'recipient_account': 'BURGER-KING', 'category': 'Debit'},
    {'id': 9, 'user_id': 2, 'amount': 2500.00, 'description': 'Monthly Salary', 'date': '2023-10-25', 'recipient_account': 'SB-1102-3344', 'category': 'Credit'},
    {'id': 10, 'user_id': 2, 'amount': -60.00, 'description': 'Gas Station Fuel', 'date': '2023-10-26', 'recipient_account': 'SHELL-01', 'category': 'Debit'},
    {'id': 12, 'user_id': 2, 'amount': -9.99, 'description': 'Streaming Service', 'date': '2023-10-28', 'recipient_account': 'NETFLIX', 'category': 'Debit'},
    {'id': 14, 'user_id': 2, 'amount': -45.00, 'description': 'Grocery Store', 'date': '2023-10-29', 'recipient_account': 'WHOLE-FOODS', 'category': 'Debit'},
    {'id': 15, 'user_id': 2, 'amount': -120.00, 'description': 'Utility Bill - Electric', 'date': '2023-10-30', 'recipient_account': 'CITY-POWER', 'category': 'Debit'}
]

challenges: Dict[str, Dict] = {
    'sqli': {
        'id': 1,
        'key': 'sqli',
        'title': 'SQL Injection Login Bypass',
        'description': "Bypass login with `' OR 1=1 --`",
        'solved': False
    },
    'bola': {
        'id': 2,
        'key': 'bola',
        'title': 'BOLA / IDOR on Transactions',
        'description': 'Access another user transaction by ID',
        'solved': False
    },
    'xss': {
        'id': 3,
        'key': 'xss',
        'title': 'Reflected XSS Search',
        'description': 'Inject script via search query',
        'solved': False
    },
    'admin_dump': {
        'id': 4,
        'key': 'admin_dump',
        'title': 'Sensitive Data Exposure',
        'description': 'Dump all users (including passwords)',
        'solved': False
    },
}


def mark_solved(key: str) -> None:
    if key in challenges:
        challenges[key]['solved'] = True


def get_user_from_token(token: str) -> Optional[Dict]:
    """Extract user from token. In this lab, token is just the user_id as string."""
    try:
        user_id = int(token)
        return users.get(user_id)
    except ValueError:
        return None


@app.route('/api/login', methods=['POST'])
def login():
    """Login endpoint - returns token"""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    # Intentionally vulnerable SQL-like string concatenation (SQLi)
    crafted_query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"

    # SQLi bypass: attacker can inject `' OR 1=1 --`
    if "' or" in username.lower() or '" or' in username.lower():
        mark_solved('sqli')
        user = list(users.values())[0]  # Return first user to simulate injection bypass
    else:
        user = next((u for u in users.values() if u['username'] == username and u['password'] == password), None)

    if not user:
        return jsonify({'error': 'Invalid credentials', 'query': crafted_query}), 401

    # Return token (in this lab, token is just the user_id as string)
    return jsonify({
        'token': str(user['id']),
        'user': {
            'id': user['id'],
            'username': user['username'],
            'balance': user['balance'],
            'account_number': user['account_number']
        }
    })


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get user dashboard - properly filters transactions"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    # SECURE: Filter transactions by user_id
    user_transactions = [tx for tx in transactions if tx['user_id'] == user['id']]
    user_transactions.sort(key=lambda x: x['id'], reverse=True)

    return jsonify({
        'balance': user['balance'],
        'account_number': user['account_number'],
        'recent_transactions': [
            {
                'id': tx['id'],
                'amount': tx['amount'],
                'description': tx['description'],
                'date': tx['date'],
                'category': tx['category']
            }
            for tx in user_transactions
        ]
    })


@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id: int):
    """
    Get transaction details - VULNERABLE TO BOLA/IDOR!

    VULNERABILITY: This endpoint does NOT check if the transaction belongs to the authenticated user.
    It only checks if the user is authenticated, not if they own the resource.
    """
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    # Find transaction by ID
    transaction = next((tx for tx in transactions if tx['id'] == transaction_id), None)

    if not transaction:
        return jsonify({'error': 'Transaction not found'}), 404

    # ⚠️ VULNERABILITY: We return the transaction without checking if it belongs to the user!
    if transaction['user_id'] != user['id']:
        mark_solved('bola')

    return jsonify(transaction)


@app.route('/api/search')
def search():
    """
    Reflected XSS lab endpoint.
    Returns unsanitized HTML with the query echoed back.
    """
    q = request.args.get('q', '')
    if '<script' in q.lower():
        mark_solved('xss')
    html = f"""
    <html>
      <body>
        <h3>Search Results</h3>
        <div>You searched for: {q}</div>
      </body>
    </html>
    """
    return Response(html, mimetype='text/html')


@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    """
    Sensitive Data Exposure: dumps all users including passwords without auth.
    """
    mark_solved('admin_dump')
    return jsonify({'users': list(users.values())})


@app.route('/api/scoreboard', methods=['GET'])
def scoreboard():
    """CTF scoreboard for challenges."""
    return jsonify({'challenges': list(challenges.values())})


if __name__ == '__main__':
    print("=" * 60)
    print("ShadowBank Vulnerable Backend - CTF Mode")
    print("=" * 60)
    print("\n⚠️  WARNING: This application contains intentional vulnerabilities!")
    print("   DO NOT use in production or with real data.\n")
    
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"Starting server on {host}:{port}")
    print("API endpoints:")
    print("  POST /api/login                ← SQLi bypass possible")
    print("  GET  /api/dashboard")
    print("  GET  /api/transactions/<id>    ← BOLA/IDOR")
    print("  GET  /api/search?q=            ← Reflected XSS")
    print("  GET  /api/admin/users          ← Sensitive data exposure")
    print("  GET  /api/scoreboard           ← Challenge status")
    print("\n" + "=" * 60 + "\n")
    
    app.run(host=host, port=port, debug=False)