# Burp Suite Quick Reference - ShadowBank BOLA Attack

## 🚀 Quick Setup (5 minutes)

### 1. Start Burp Suite
- Open Burp Suite Community Edition
- Proxy should be running on `127.0.0.1:8080`

### 2. Configure Browser
- **Option A**: Use Burp's built-in browser (Burp → Proxy → Intercept → Open Browser)
- **Option B**: Configure system proxy to `127.0.0.1:8080`
- Install Burp CA certificate from `http://burpsuite`

### 3. Verify Connection
- Navigate to `http://localhost:5173` in your browser
- Check Burp → Proxy → HTTP history (should see requests)

---

## 🎯 Attack Steps (Using Repeater)

### Step 1: Login & Capture Request
1. Login as `attacker` in ShadowBank
2. Click on any transaction (e.g., transaction ID 3)
3. In Burp → Proxy → HTTP history, find:
   ```
   GET /api/transactions/3
   Authorization: Bearer 2
   ```

### Step 2: Send to Repeater
- Right-click request → **Send to Repeater**
- Go to **Repeater** tab

### Step 3: Modify & Exploit
- Change URL: `/api/transactions/3` → `/api/transactions/1`
- Keep Authorization header: `Bearer 2`
- Click **Send**
- ✅ You'll see victim's transaction data!

---

## 🔍 Attack Steps (Using Intruder - Automated)

### Step 1: Setup Intruder
1. Send transaction request to Intruder
2. Clear all payload positions
3. Mark transaction ID: `/api/transactions/§1§`

### Step 2: Configure Payloads
- **Payload type**: Numbers
- **From**: 1
- **To**: 15
- **Step**: 1

### Step 3: Run Attack
- Click **Start attack**
- Filter by Status 200
- Look for `user_id: 1` in responses (victim's transactions)

---

## 📋 Key Endpoints

| Endpoint | Method | Purpose | Vulnerable? |
|----------|--------|---------|-------------|
| `/api/login` | POST | Authenticate user | No |
| `/api/dashboard` | GET | Get user dashboard | No (properly filtered) |
| `/api/transactions/{id}` | GET | Get transaction details | **YES** ⚠️ |

---

## 🎯 Test Cases

### Test Case 1: Direct IDOR
- **Request**: `GET /api/transactions/1` with `Authorization: Bearer 2`
- **Expected**: Should return 403 Forbidden
- **Actual**: Returns transaction data (VULNERABLE!)

### Test Case 2: Enumeration
- **Request**: Try IDs 1-15 with attacker's token
- **Expected**: Only IDs 3,4,8,9,10,12,14,15 should work
- **Actual**: All IDs work (VULNERABLE!)

### Test Case 3: Negative/Invalid IDs
- **Request**: `GET /api/transactions/-1` or `/api/transactions/999`
- **Expected**: 404 Not Found
- **Actual**: 404 (correct behavior)

---

## 📊 What to Look For

### ✅ Signs of BOLA Vulnerability:
- Same Authorization token works for different user's resources
- No `user_id` validation in response
- Server returns 200 OK for unauthorized access
- No error messages about ownership

### ❌ Signs of Proper Security:
- 403 Forbidden for unauthorized access
- Error message: "Access denied" or "Unauthorized"
- Request rejected before database query
- Rate limiting on failed attempts

---

## 🔧 Burp Suite Tips

### Useful Features:
- **Match/Replace**: Highlight sensitive keywords (e.g., "user_id", "recipient_account")
- **Compare**: Compare two responses side-by-side
- **Search**: Find specific strings across all requests/responses
- **Filter**: Filter by status code, URL, etc.

### Keyboard Shortcuts:
- `Ctrl+R`: Send to Repeater
- `Ctrl+I`: Send to Intruder
- `Ctrl+F`: Search
- `F5`: Send request (in Repeater)

---

## 📝 Evidence to Capture

1. **Request Headers:**
   ```
   GET /api/transactions/1 HTTP/1.1
   Host: 127.0.0.1:5000
   Authorization: Bearer 2
   ```

2. **Response Body:**
   ```json
   {
     "id": 1,
     "user_id": 1,  // ← This is the victim's ID!
     "amount": -50000.00,
     "description": "Wire Transfer - Offshore Holdings",
     "recipient_account": "KY-2929-1111"
   }
   ```

3. **Proof of Vulnerability:**
   - Same token (Bearer 2) accessing different user's data
   - No authorization check performed
   - Sensitive data exposed

---

## 🎓 Learning Objectives

After completing this lab, you should understand:
- ✅ What BOLA/IDOR vulnerabilities are
- ✅ How to identify them using Burp Suite
- ✅ How to exploit them manually and automatically
- ✅ The impact of such vulnerabilities
- ✅ How to fix them (authorization checks)

---

## ⚠️ Remember

- This is for **educational purposes only**
- Always get authorization before testing
- Follow responsible disclosure
- Never test on production systems without permission



