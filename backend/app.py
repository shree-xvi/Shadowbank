from flask import Flask, request, jsonify, Response, redirect, make_response
from flask_cors import CORS
from typing import Dict, List, Optional
import os
import json
import base64
import hashlib
import time
import re
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
DB_PATH = os.environ.get('DB_PATH', 'shadowbank.db')

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            password TEXT NOT NULL,
            api_key TEXT,
            balance REAL DEFAULT 0,
            account_number TEXT,
            role TEXT DEFAULT 'user',
            is_admin INTEGER DEFAULT 0,
            ssn TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            amount REAL,
            description TEXT,
            date TEXT,
            recipient_account TEXT,
            category TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # User progress table - stores solved challenges per user
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            challenge_key TEXT,
            solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, challenge_key)
        )
    ''')
    
    # Revealed hints table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS revealed_hints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            challenge_key TEXT,
            hint_index INTEGER,
            revealed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, challenge_key, hint_index)
        )
    ''')
    
    # Comments table for stored XSS
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            text TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    # Global scoreboard (for multi-user CTF)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scoreboard (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE,
            username TEXT,
            total_score INTEGER DEFAULT 0,
            challenges_solved INTEGER DEFAULT 0,
            last_solve TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    ''')
    
    conn.commit()
    
    # Seed default users if not exists
    seed_users(cursor)
    seed_transactions(cursor)
    seed_comments(cursor)
    
    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

def seed_users(cursor):
    """Seed default users"""
    default_users = [
        (1, 'victim', 'victim@shadowbank.com', '12345', 'key_victim_secret_123', 1500000.00, 'SB-8829-9921', 'user', 0, '123-45-6789', '+1-555-0100'),
        (2, 'attacker', 'attacker@evil.com', '12345', 'key_attacker_public_456', 50.00, 'SB-1102-3344', 'user', 0, '987-65-4321', '+1-555-0200'),
        (3, 'admin', 'admin@shadowbank.com', '12345', 'key_admin_super_secret_789', 999999999.99, 'SB-ADMIN-0001', 'admin', 1, '000-00-0001', '+1-555-0001'),
    ]
    
    for user in default_users:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO users (id, username, email, password, api_key, balance, account_number, role, is_admin, ssn, phone)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', user)
        except sqlite3.IntegrityError:
            pass

def seed_transactions(cursor):
    """Seed default transactions"""
    transactions = [
        (1, 1, -50000.00, 'Wire Transfer - Offshore Holdings', '2023-10-12', 'KY-2929-1111', 'Debit'),
        (2, 1, 250000.00, 'Dividend Payout - Corp A', '2023-10-15', 'SB-8829-9921', 'Credit'),
        (3, 2, -15.00, 'Coffee Shop', '2023-10-20', 'MERCHANT-99', 'Debit'),
        (4, 2, -5.00, 'Bus Ticket', '2023-10-21', 'MERCHANT-22', 'Debit'),
        (5, 1, -1200.00, 'Luxury Car Lease Payment', '2023-10-01', 'AUTO-LEASE-01', 'Debit'),
        (6, 1, -450.00, 'Golf Club Membership', '2023-10-05', 'CLUB-ELITE', 'Debit'),
        (7, 1, 15000.00, 'Consulting Fee - Tech Strategy', '2023-10-18', 'SB-8829-9921', 'Credit'),
        (8, 2, -12.50, 'Fast Food Lunch', '2023-10-22', 'BURGER-KING', 'Debit'),
        (9, 2, 2500.00, 'Monthly Salary', '2023-10-25', 'SB-1102-3344', 'Credit'),
        (10, 2, -60.00, 'Gas Station Fuel', '2023-10-26', 'SHELL-01', 'Debit'),
        (11, 1, -3200.00, 'Fine Art Auction Deposit', '2023-10-28', 'SOTHEBYS-NYC', 'Debit'),
        (12, 2, -9.99, 'Streaming Service', '2023-10-28', 'NETFLIX', 'Debit'),
        (13, 1, -150.00, 'Executive Lunch', '2023-10-30', 'NOBU-DOWNTOWN', 'Debit'),
        (14, 2, -45.00, 'Grocery Store', '2023-10-29', 'WHOLE-FOODS', 'Debit'),
        (15, 2, -120.00, 'Utility Bill - Electric', '2023-10-30', 'CITY-POWER', 'Debit'),
        (16, 3, -1000000.00, 'SECRET: Black Budget Transfer', '2023-10-01', 'CLASSIFIED', 'Debit'),
        (17, 3, 5000000.00, 'SECRET: Government Contract', '2023-10-15', 'SB-ADMIN-0001', 'Credit'),
    ]
    
    for tx in transactions:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO transactions (id, user_id, amount, description, date, recipient_account, category)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', tx)
        except sqlite3.IntegrityError:
            pass

def seed_comments(cursor):
    """Seed default comments"""
    comments = [
        (1, 1, 'Great banking service!', '2023-10-01'),
        (2, 2, 'Nice app', '2023-10-15'),
    ]
    
    for comment in comments:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO comments (id, user_id, text, timestamp)
                VALUES (?, ?, ?, ?)
            ''', comment)
        except sqlite3.IntegrityError:
            pass

# Rate limiting storage
request_counts: Dict[str, List[float]] = {}

# 18 CHALLENGES DEFINITION
challenges: Dict[str, Dict] = {
    # Original 8 challenges
    'sqli': {'id': 1, 'key': 'sqli', 'title': 'SQL Injection Login Bypass', 'description': "Bypass login with SQL injection", 'category': 'Injection', 'difficulty': 2, 'points': 200},
    'bola': {'id': 2, 'key': 'bola', 'title': 'BOLA / IDOR Attack', 'description': 'Access another user transaction by ID', 'category': 'Broken Access Control', 'difficulty': 1, 'points': 100},
    'xss': {'id': 3, 'key': 'xss', 'title': 'Reflected XSS', 'description': 'Inject script via search query', 'category': 'XSS', 'difficulty': 2, 'points': 200},
    'admin_dump': {'id': 4, 'key': 'admin_dump', 'title': 'Sensitive Data Exposure', 'description': 'Access unprotected admin endpoint', 'category': 'Sensitive Data Exposure', 'difficulty': 3, 'points': 300},
    'api_key_theft': {'id': 5, 'key': 'api_key_theft', 'title': 'API Key Theft', 'description': 'Steal API keys from exposed data', 'category': 'Broken Access Control', 'difficulty': 2, 'points': 200},
    'mass_assignment': {'id': 6, 'key': 'mass_assignment', 'title': 'Mass Assignment', 'description': 'Modify balance via profile update', 'category': 'Improper Input Validation', 'difficulty': 4, 'points': 400},
    'weak_token': {'id': 7, 'key': 'weak_token', 'title': 'Token Enumeration', 'description': 'Exploit predictable tokens', 'category': 'Cryptographic Failures', 'difficulty': 3, 'points': 300},
    'hidden_admin': {'id': 8, 'key': 'hidden_admin', 'title': 'Hidden Admin Account', 'description': 'Login to the secret admin account', 'category': 'Security Misconfiguration', 'difficulty': 4, 'points': 400},
    
    # NEW: 10 Additional challenges
    'stored_xss': {'id': 9, 'key': 'stored_xss', 'title': 'Stored XSS via Comments', 'description': 'Persist malicious script in comments', 'category': 'XSS', 'difficulty': 3, 'points': 300},
    'ssrf': {'id': 10, 'key': 'ssrf', 'title': 'Server-Side Request Forgery', 'description': 'Make server fetch internal resources', 'category': 'SSRF', 'difficulty': 4, 'points': 400},
    'jwt_none': {'id': 11, 'key': 'jwt_none', 'title': 'JWT Algorithm None Attack', 'description': 'Bypass JWT verification with none algorithm', 'category': 'Cryptographic Failures', 'difficulty': 4, 'points': 400},
    'path_traversal': {'id': 12, 'key': 'path_traversal', 'title': 'Path Traversal', 'description': 'Read files outside web root', 'category': 'Injection', 'difficulty': 3, 'points': 300},
    'rate_limit': {'id': 13, 'key': 'rate_limit', 'title': 'Missing Rate Limiting', 'description': 'Brute force the password reset', 'category': 'Security Misconfiguration', 'difficulty': 2, 'points': 200},
    'xxe': {'id': 14, 'key': 'xxe', 'title': 'XML External Entity (XXE)', 'description': 'Exploit XML parser to read files', 'category': 'Injection', 'difficulty': 5, 'points': 500},
    'open_redirect': {'id': 15, 'key': 'open_redirect', 'title': 'Open Redirect', 'description': 'Redirect users to malicious site', 'category': 'Security Misconfiguration', 'difficulty': 2, 'points': 200},
    'insecure_deserialization': {'id': 16, 'key': 'insecure_deserialization', 'title': 'Insecure Deserialization', 'description': 'Execute code via pickle payload', 'category': 'Injection', 'difficulty': 5, 'points': 500},
    'broken_auth': {'id': 17, 'key': 'broken_auth', 'title': 'Password Reset Poisoning', 'description': 'Hijack password reset flow', 'category': 'Broken Authentication', 'difficulty': 4, 'points': 400},
    'verbose_errors': {'id': 18, 'key': 'verbose_errors', 'title': 'Verbose Error Messages', 'description': 'Extract info from stack traces', 'category': 'Security Misconfiguration', 'difficulty': 1, 'points': 100},
}


def mark_solved(user_id: int, challenge_key: str) -> None:
    """Mark a challenge as solved for a user (persistent)"""
    if challenge_key not in challenges:
        return
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Insert into user_progress
        cursor.execute('''
            INSERT OR IGNORE INTO user_progress (user_id, challenge_key)
            VALUES (?, ?)
        ''', (user_id, challenge_key))
        
        # Update scoreboard
        points = challenges[challenge_key]['points']
        cursor.execute('''
            INSERT INTO scoreboard (user_id, username, total_score, challenges_solved, last_solve)
            VALUES (?, (SELECT username FROM users WHERE id = ?), ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(user_id) DO UPDATE SET 
                total_score = total_score + ?,
                challenges_solved = challenges_solved + 1,
                last_solve = CURRENT_TIMESTAMP
        ''', (user_id, user_id, points, points))
        
        conn.commit()
    except Exception as e:
        print(f"Error marking challenge solved: {e}")
    finally:
        conn.close()


def get_user_from_token(token: str) -> Optional[Dict]:
    """Extract user from token"""
    try:
        user_id = int(token)
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return dict(row)
        return None
    except ValueError:
        return None


def get_user_solved_challenges(user_id: int) -> set:
    """Get set of challenge keys solved by user"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT challenge_key FROM user_progress WHERE user_id = ?', (user_id,))
    solved = {row[0] for row in cursor.fetchall()}
    conn.close()
    return solved


# ====================
# API ENDPOINTS
# ====================

@app.route('/api/login', methods=['POST'])
def login():
    """Login endpoint - VULNERABLE to SQL Injection"""
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    conn = get_db()
    cursor = conn.cursor()
    
    # Check for SQL injection bypass
    if "' or" in username.lower() or '" or' in username.lower() or "1=1" in username:
        cursor.execute('SELECT * FROM users LIMIT 1')
        user = cursor.fetchone()
        if user:
            user = dict(user)
            mark_solved(user['id'], 'sqli')
            conn.close()
            return jsonify({
                'token': str(user['id']),
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'balance': user['balance'],
                    'account_number': user['account_number']
                }
            })
    
    # Normal login
    cursor.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    user = dict(user)
    
    # Check for hidden admin login
    if user.get('username') == 'admin':
        mark_solved(user['id'], 'hidden_admin')

    return jsonify({
        'token': str(user['id']),
        'user': {
            'id': user['id'],
            'username': user['username'],
            'balance': user['balance'],
            'account_number': user['account_number']
        }
    })


@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()
    
    # Validation
    if not username or len(username) < 3:
        return jsonify({'error': 'Username must be at least 3 characters'}), 400
    
    if not password or len(password) < 4:
        return jsonify({'error': 'Password must be at least 4 characters'}), 400
    
    # Check for reserved usernames
    reserved = ['admin', 'victim', 'attacker', 'root', 'administrator']
    if username.lower() in reserved:
        return jsonify({'error': 'This username is reserved'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if username exists
    cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Username already taken'}), 400
    
    # Generate account number and API key
    import random
    import secrets
    account_number = f'SB-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}'
    api_key = f'key_{username}_{secrets.token_hex(8)}'
    
    # Create user with starting balance
    starting_balance = 100.00  # New users get $100
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password, api_key, balance, account_number, role, is_admin)
            VALUES (?, ?, ?, ?, ?, ?, 'user', 0)
        ''', (username, email, password, api_key, starting_balance, account_number))
        
        user_id = cursor.lastrowid
        
        # Add a welcome transaction
        cursor.execute('''
            INSERT INTO transactions (user_id, amount, description, date, recipient_account, category)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (user_id, starting_balance, 'Welcome Bonus - New Account', datetime.now().strftime('%Y-%m-%d'), account_number, 'Credit'))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Registration successful!',
            'token': str(user_id),
            'user': {
                'id': user_id,
                'username': username,
                'balance': starting_balance,
                'account_number': account_number
            }
        })
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get user dashboard"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC', (user['id'],))
    transactions = [dict(row) for row in cursor.fetchall()]
    conn.close()

    return jsonify({
        'balance': user['balance'],
        'account_number': user['account_number'],
        'recent_transactions': [
            {'id': tx['id'], 'amount': tx['amount'], 'description': tx['description'], 'date': tx['date'], 'category': tx['category']}
            for tx in transactions
        ]
    })


@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id: int):
    """VULNERABLE TO BOLA/IDOR - No ownership check!"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)

    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM transactions WHERE id = ?', (transaction_id,))
    tx = cursor.fetchone()
    conn.close()

    if not tx:
        return jsonify({'error': 'Transaction not found'}), 404

    tx = dict(tx)
    
    # VULNERABILITY: Return transaction without checking ownership
    if tx['user_id'] != user['id']:
        mark_solved(user['id'], 'bola')

    return jsonify(tx)


@app.route('/api/search')
def search():
    """VULNERABLE TO REFLECTED XSS"""
    q = request.args.get('q', '')
    
    # Get user from token if present
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2  # Default to attacker
    
    if '<script' in q.lower():
        mark_solved(user_id, 'xss')
    
    html = f"""
    <html><body>
        <h3>Search Results</h3>
        <div>You searched for: {q}</div>
    </body></html>
    """
    return Response(html, mimetype='text/html')


@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    """VULNERABLE - No authentication required"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    mark_solved(user_id, 'admin_dump')
    mark_solved(user_id, 'api_key_theft')
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users')
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({'users': users})


@app.route('/api/scoreboard', methods=['GET'])
def scoreboard():
    """CTF scoreboard - returns all challenges with user's progress"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    
    solved = set()
    if user:
        solved = get_user_solved_challenges(user['id'])
    
    challenge_list = []
    for ch in challenges.values():
        challenge_list.append({
            **ch,
            'solved': ch['key'] in solved
        })
    
    return jsonify({'challenges': challenge_list})


@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    """Global leaderboard - shows top players"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT username, total_score, challenges_solved, last_solve 
        FROM scoreboard 
        ORDER BY total_score DESC, last_solve ASC 
        LIMIT 50
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    return jsonify({
        'leaderboard': [
            {
                'rank': i + 1,
                'username': row[0],
                'score': row[1],
                'solved': row[2],
                'lastSolve': row[3]
            }
            for i, row in enumerate(rows)
        ]
    })


@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Get user's progress"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    solved = get_user_solved_challenges(user['id'])
    total_points = sum(ch['points'] for ch in challenges.values() if ch['key'] in solved)
    
    return jsonify({
        'userId': user['id'],
        'username': user['username'],
        'totalScore': total_points,
        'solvedCount': len(solved),
        'totalChallenges': len(challenges),
        'completionPercentage': round((len(solved) / len(challenges)) * 100),
        'solvedChallenges': list(solved)
    })


@app.route('/api/progress/reset', methods=['POST'])
def reset_progress():
    """Reset user's progress"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM user_progress WHERE user_id = ?', (user['id'],))
    cursor.execute('DELETE FROM revealed_hints WHERE user_id = ?', (user['id'],))
    cursor.execute('DELETE FROM scoreboard WHERE user_id = ?', (user['id'],))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Progress reset successfully'})


# ====================
# NEW CHALLENGE ENDPOINTS
# ====================

@app.route('/api/comments', methods=['GET'])
def get_comments():
    """Get all comments - displays stored XSS payloads"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM comments ORDER BY id DESC')
    comments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    html_comments = []
    for c in comments:
        html_comments.append(f"<div class='comment'><b>User {c['user_id']}</b>: {c['text']}</div>")
    
    html = f"""<html><body><h3>User Comments</h3>{''.join(html_comments)}</body></html>"""
    return Response(html, mimetype='text/html')


@app.route('/api/comments', methods=['POST'])
def add_comment():
    """VULNERABLE TO STORED XSS"""
    data = request.get_json()
    text = data.get('text', '')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if '<script' in text.lower():
        mark_solved(user_id, 'stored_xss')
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO comments (user_id, text) VALUES (?, ?)', (user_id, text))
    conn.commit()
    comment_id = cursor.lastrowid
    conn.close()
    
    return jsonify({'message': 'Comment added', 'id': comment_id})


@app.route('/api/fetch-url')
def fetch_url():
    """VULNERABLE TO SSRF"""
    url = request.args.get('url', '')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if not url:
        return jsonify({'error': 'URL parameter required'}), 400
    
    if 'localhost' in url or '127.0.0.1' in url or '0.0.0.0' in url or 'internal' in url or 'file://' in url:
        mark_solved(user_id, 'ssrf')
        return jsonify({
            'message': 'SSRF Successful!',
            'internal_data': {
                'db_password': 'super_secret_db_password',
                'aws_key': 'AKIA1234567890EXAMPLE',
                'internal_api': 'http://internal-api.shadowbank.local/admin'
            }
        })
    
    return jsonify({'message': f'Fetched: {url}', 'content': 'External content would be here'})


@app.route('/api/jwt/verify', methods=['POST'])
def jwt_verify():
    """VULNERABLE TO JWT NONE ALGORITHM ATTACK"""
    data = request.get_json()
    token_data = data.get('token', '')
    
    auth_token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(auth_token)
    user_id = user['id'] if user else 2
    
    try:
        parts = token_data.split('.')
        if len(parts) != 3:
            return jsonify({'error': 'Invalid JWT format'}), 400
        
        header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
        
        if header.get('alg', '').lower() == 'none':
            mark_solved(user_id, 'jwt_none')
            return jsonify({
                'message': 'JWT Verified (INSECURE!)',
                'payload': payload,
                'warning': 'Algorithm "none" was accepted!'
            })
        
        return jsonify({'message': 'JWT parsed', 'payload': payload})
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/files')
def read_file():
    """VULNERABLE TO PATH TRAVERSAL"""
    filename = request.args.get('name', 'readme.txt')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if '..' in filename or filename.startswith('/'):
        mark_solved(user_id, 'path_traversal')
        
        if 'passwd' in filename or 'etc' in filename:
            return jsonify({
                'filename': filename,
                'content': 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin'
            })
    
    return jsonify({'filename': filename, 'content': 'Default file content.'})


@app.route('/api/password-reset', methods=['POST'])
def password_reset():
    """VULNERABLE - No rate limiting"""
    data = request.get_json()
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    ip = request.remote_addr
    if ip not in request_counts:
        request_counts[ip] = []
    request_counts[ip].append(time.time())
    
    recent = [t for t in request_counts[ip] if time.time() - t < 60]
    request_counts[ip] = recent
    
    if len(recent) > 10:
        mark_solved(user_id, 'rate_limit')
        return jsonify({
            'message': 'Brute force detected! No rate limiting in place.',
            'attempts_in_last_minute': len(recent)
        })
    
    code = data.get('code', '')
    if code == '1337':
        return jsonify({'message': 'Password reset successful!'})
    
    return jsonify({'message': 'Invalid reset code', 'attempts': len(recent)}), 400


@app.route('/api/xml/parse', methods=['POST'])
def parse_xml():
    """VULNERABLE TO XXE"""
    xml_data = request.data.decode('utf-8')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if '<!ENTITY' in xml_data or 'SYSTEM' in xml_data or 'file://' in xml_data:
        mark_solved(user_id, 'xxe')
        return jsonify({
            'message': 'XXE Attack Detected!',
            'parsed_data': {'warning': 'XML parser allowed external entities!'}
        })
    
    return jsonify({'message': 'XML parsed', 'data': xml_data[:100]})


@app.route('/api/redirect')
def open_redirect():
    """VULNERABLE TO OPEN REDIRECT"""
    url = request.args.get('url', '/')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if url.startswith('http://') or url.startswith('https://') or url.startswith('//'):
        if 'shadowbank' not in url.lower():
            mark_solved(user_id, 'open_redirect')
    
    return jsonify({'redirect_to': url, 'message': 'User would be redirected'})


@app.route('/api/import-data', methods=['POST'])
def import_data():
    """VULNERABLE TO INSECURE DESERIALIZATION"""
    data = request.get_json()
    serialized = data.get('data', '')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    if 'pickle' in str(serialized).lower() or '__reduce__' in str(serialized) or 'os.system' in str(serialized):
        mark_solved(user_id, 'insecure_deserialization')
        return jsonify({
            'message': 'Deserialization attack detected!',
            'simulated_rce': 'Command would execute: whoami -> root'
        })
    
    return jsonify({'message': 'Data imported', 'received': str(serialized)[:100]})


@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """VULNERABLE TO HOST HEADER INJECTION"""
    data = request.get_json()
    email = data.get('email', '')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    host = request.headers.get('Host', 'shadowbank.com')
    x_forwarded = request.headers.get('X-Forwarded-Host', '')
    
    if x_forwarded and x_forwarded != host:
        mark_solved(user_id, 'broken_auth')
        return jsonify({
            'message': 'Password reset email sent!',
            'debug_info': {
                'reset_link': f'http://{x_forwarded}/reset?token=secret_reset_token',
                'warning': 'Reset link uses attacker-controlled host!'
            }
        })
    
    return jsonify({'message': 'Password reset email sent!'})


@app.route('/api/debug/error')
def verbose_error():
    """VULNERABLE - Exposes sensitive info"""
    error_type = request.args.get('type', 'generic')
    
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    user_id = user['id'] if user else 2
    
    mark_solved(user_id, 'verbose_errors')
    
    if error_type == 'db':
        return jsonify({
            'error': 'Database Connection Failed',
            'details': {
                'host': 'db.internal.shadowbank.local',
                'port': 5432,
                'password': 'Pr0d_DB_P@ssw0rd!'
            }
        }), 500
    
    return jsonify({
        'error': 'Internal Server Error',
        'details': {
            'secret_key': 'flask_secret_key_do_not_expose',
            'debug_mode': True
        }
    }), 500


@app.route('/api/profile', methods=['PUT'])
def update_profile():
    """VULNERABLE TO MASS ASSIGNMENT"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    user_id = user['id']
    
    conn = get_db()
    cursor = conn.cursor()
    
    for key, value in data.items():
        if key in ['balance', 'is_admin', 'role']:
            mark_solved(user_id, 'mass_assignment')
        
        # Update the field (VULNERABLE!)
        try:
            cursor.execute(f'UPDATE users SET {key} = ? WHERE id = ?', (value, user_id))
        except:
            pass
    
    conn.commit()
    
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    updated_user = dict(cursor.fetchone())
    conn.close()
    
    return jsonify({'message': 'Profile updated', 'user': updated_user})


@app.route('/api/challenges', methods=['GET'])
def get_challenges():
    """Get all challenges with progress"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = get_user_from_token(token)
    
    solved = set()
    if user:
        solved = get_user_solved_challenges(user['id'])
    
    return jsonify({
        'challenges': [
            {**ch, 'solved': ch['key'] in solved}
            for ch in challenges.values()
        ]
    })


if __name__ == '__main__':
    print("=" * 60)
    print("ShadowBank CTF - Persistent Mode")
    print("=" * 60)
    
    # Initialize database
    init_db()
    
    print(f"\n📁 Database: {DB_PATH}")
    print(f"🎯 Challenges: {len(challenges)} total")
    print(f"💾 Progress is now PERSISTENT!")
    
    print("\n⚠️  WARNING: This application contains intentional vulnerabilities!")
    
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"\nStarting server on {host}:{port}")
    print("\nKey Endpoints:")
    print("  GET  /api/scoreboard      ← Challenge status (per user)")
    print("  GET  /api/leaderboard     ← Global rankings")
    print("  GET  /api/progress        ← User's progress")
    print("  POST /api/progress/reset  ← Reset user's progress")
    
    print("\n" + "=" * 60 + "\n")
    
    app.run(host=host, port=port, debug=False)