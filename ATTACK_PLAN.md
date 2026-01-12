# BOLA/IDOR Attack Plan - ShadowBank Lab

## 🎯 Objective
Exploit **Broken Object Level Authorization (BOLA)** / **Insecure Direct Object Reference (IDOR)** vulnerability to access unauthorized transaction data.

---

## 📋 Understanding the Vulnerability

### The Vulnerability
The `/api/transactions/{id}` endpoint does **NOT** verify that the requested transaction belongs to the authenticated user. It only checks:
- ✅ Is the user authenticated? (token valid)
- ❌ Does the transaction belong to this user? (MISSING!)

### Attack Scenario
- **Victim User**: `victim` (ID: 1) - Has high-value transactions (IDs: 1, 2, 5, 6, 7, 11, 13)
- **Attacker User**: `attacker` (ID: 2) - Has low-value transactions (IDs: 3, 4, 8, 9, 10, 12, 14, 15)
- **Goal**: Access victim's confidential transaction details

---

## 🔧 Step 1: Setup Burp Suite

### 1.1 Install & Configure Burp Suite
1. Download Burp Suite Community Edition (free) from PortSwigger
2. Open Burp Suite
3. Go to **Proxy** → **Options** → **Proxy Listeners**
4. Ensure proxy is running on `127.0.0.1:8080`

### 1.2 Configure Browser Proxy
1. **Chrome/Edge**: Install "Proxy SwitchyOmega" extension OR use Burp's built-in browser
2. **Firefox**: Settings → Network Settings → Manual Proxy
   - HTTP Proxy: `127.0.0.1`
   - Port: `8080`
   - Check "Use this proxy for all protocols"
3. Install Burp's CA certificate:
   - Visit `http://burpsuite` in your browser
   - Download `cacert.der`
   - Import it into your browser's certificate store

### 1.3 Verify Proxy is Working
1. Open browser and navigate to `http://localhost:5173`
2. Check Burp Suite → **Proxy** → **HTTP history**
3. You should see requests appearing

---

## 🎯 Step 2: Initial Reconnaissance

### 2.1 Login as Attacker
1. Navigate to `http://localhost:5173`
2. Login with:
   - Username: `attacker`
   - Password: (any - simulation mode doesn't check password)
3. Observe your own transactions in the dashboard

### 2.2 Identify API Endpoints
In Burp Suite, look for these requests:

**Login Request:**
```
POST /api/login HTTP/1.1
Host: 127.0.0.1:5000
Content-Type: application/json

{"username":"attacker","password":"anything"}
```

**Response:**
```json
{
  "token": "2",
  "user": {
    "id": 2,
    "username": "attacker",
    ...
  }
}
```

**Dashboard Request:**
```
GET /api/dashboard HTTP/1.1
Host: 127.0.0.1:5000
Authorization: Bearer 2
```

**Transaction Request (VULNERABLE):**
```
GET /api/transactions/3 HTTP/1.1
Host: 127.0.0.1:5000
Authorization: Bearer 2
```

---

## 🔓 Step 3: Exploit the BOLA Vulnerability

### 3.1 Method 1: Using Burp Repeater (Recommended)

1. **Intercept a legitimate transaction request:**
   - In the ShadowBank app, click on one of YOUR transactions (e.g., ID: 3)
   - In Burp Suite → **Proxy** → **Intercept**, you'll see:
     ```
     GET /api/transactions/3 HTTP/1.1
     Authorization: Bearer 2
     ```

2. **Send to Repeater:**
   - Right-click the request → **Send to Repeater**
   - Go to **Repeater** tab

3. **Modify the transaction ID:**
   - Change `GET /api/transactions/3` to `GET /api/transactions/1`
   - Keep the same Authorization header: `Bearer 2`
   - Click **Send**

4. **Observe the response:**
   - You should receive transaction #1's details (belongs to victim!)
   - Response will include:
     ```json
     {
       "id": 1,
       "user_id": 1,
       "amount": -50000.00,
       "description": "Wire Transfer - Offshore Holdings",
       "recipient_account": "KY-2929-1111",
       ...
     }
     ```

### 3.2 Method 2: Using Burp Intruder (Automated Enumeration)

1. **Send request to Intruder:**
   - Right-click the transaction request → **Send to Intruder**
   - Go to **Intruder** tab

2. **Configure attack:**
   - **Attack type**: Sniper
   - **Target**: `GET /api/transactions/§1§`
   - Clear all payload positions except the transaction ID

3. **Set payloads:**
   - **Payload type**: Numbers
   - **From**: 1
   - **To**: 15
   - **Step**: 1

4. **Start attack:**
   - Click **Start attack**
   - Watch as it enumerates all transaction IDs
   - Look for successful responses (Status 200) with different `user_id` values

5. **Analyze results:**
   - Filter by status code 200
   - Compare `user_id` in responses
   - Transactions with `user_id: 1` belong to the victim!

### 3.3 Method 3: Manual Browser Testing

1. In the ShadowBank dashboard, use the "Developer / API Console" panel
2. Enter transaction ID: `1` (victim's transaction)
3. Click **GET**
4. You'll see victim's confidential transaction details!

---

## 📊 Step 4: Document the Attack

### What to Capture:

1. **Request/Response pairs:**
   - Legitimate request (your own transaction)
   - Unauthorized request (victim's transaction)
   - Compare the Authorization headers (they're identical!)

2. **Evidence of vulnerability:**
   - Same token used for both requests
   - Server returns data without checking ownership
   - No error messages indicating authorization failure

3. **Sensitive data exposed:**
   - Transaction amounts
   - Recipient account numbers
   - Transaction descriptions
   - Dates and categories

---

## 🎓 Step 5: Understanding the Impact

### What You've Demonstrated:
- ✅ **BOLA/IDOR**: Accessing objects (transactions) without proper authorization
- ✅ **Information Disclosure**: Exposing sensitive financial data
- ✅ **Privacy Violation**: Viewing another user's confidential transactions

### Real-World Impact:
- Financial data breach
- Privacy violations (GDPR, CCPA)
- Competitive intelligence gathering
- Identity theft preparation
- Regulatory fines

---

## 🛡️ Step 6: How to Fix (For Learning)

### The Fix:
The backend should verify ownership:

```python
# VULNERABLE CODE (current):
transaction = db.get_transaction(transaction_id)
return transaction  # ❌ No ownership check!

# SECURE CODE (fixed):
transaction = db.get_transaction(transaction_id)
if transaction.user_id != current_user.id:
    return {"error": "Unauthorized"}, 403  # ✅ Ownership verified!
return transaction
```

---

## 📝 Testing Checklist

- [ ] Burp Suite proxy configured and working
- [ ] Successfully intercepted login request
- [ ] Captured transaction API request
- [ ] Modified transaction ID in Repeater
- [ ] Successfully accessed victim's transaction (ID: 1)
- [ ] Used Intruder to enumerate all transactions
- [ ] Documented request/response pairs
- [ ] Identified all victim transactions (IDs: 1, 2, 5, 6, 7, 11, 13)

---

## 🚀 Quick Start Commands

### If using Python Backend:
```bash
# Terminal 1: Start Python backend
cd backend
python app.py  # Runs on http://127.0.0.1:5000

# Terminal 2: Start frontend
npm run dev  # Runs on http://localhost:5173
```

### Test Accounts:
- **Attacker**: `username: attacker` (ID: 2)
- **Victim**: `username: victim` (ID: 1)

---

## 💡 Pro Tips

1. **Use Burp's Match/Replace**: Automatically highlight sensitive data
2. **Save requests**: Right-click → Save item for later analysis
3. **Compare responses**: Use Burp's "Compare" feature to spot differences
4. **Check for rate limiting**: Try rapid requests to see if there's protection
5. **Test edge cases**: Negative IDs, very large IDs, non-numeric IDs

---

## ⚠️ Important Notes

- This is a **vulnerable-by-design** application for educational purposes
- **DO NOT** use these techniques on systems you don't own
- Always get written authorization before security testing
- Follow responsible disclosure practices

---

## 📚 Additional Resources

- [OWASP Top 10 - A01:2021 Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
- [PortSwigger Web Security Academy - IDOR](https://portswigger.net/web-security/access-control/idor)
- [Burp Suite Documentation](https://portswigger.net/burp/documentation)



