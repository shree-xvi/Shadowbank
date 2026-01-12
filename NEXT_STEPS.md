# 🎯 Next Steps - ShadowBank BOLA Attack Lab

## ✅ Current Status
- ✅ Frontend is running on `http://localhost:5173`
- ✅ Project dependencies installed
- ✅ Attack plan documentation created

---

## 🚀 Option 1: Test with Simulation Mode (Current Setup)

**You're already set up!** The app is running in simulation mode.

### Quick Test (No Burp Suite needed):
1. Open `http://localhost:5173`
2. Login as `attacker`
3. In the "Developer / API Console" panel, enter transaction ID: `1`
4. Click **GET**
5. ✅ You'll see victim's transaction (BOLA vulnerability!)

---

## 🔧 Option 2: Test with Real Python Backend + Burp Suite

### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Python Backend
```bash
python app.py
```
Backend will run on `http://127.0.0.1:5000`

### Step 3: Switch to Real Backend Mode
1. In the ShadowBank login page, click **"Local Python"** mode
2. Login as `attacker`
3. Now all requests will go to the Python backend (interceptable by Burp!)

---

## 🎯 Burp Suite Attack Workflow

### Phase 1: Setup (5 minutes)
1. **Install Burp Suite** (if not already installed)
2. **Configure Proxy**:
   - Burp → Proxy → Options → Proxy Listeners
   - Ensure running on `127.0.0.1:8080`
3. **Configure Browser**:
   - Use Burp's built-in browser OR
   - Set system proxy to `127.0.0.1:8080`
   - Install Burp CA certificate
4. **Verify**: Navigate to `http://localhost:5173` and see requests in Burp

### Phase 2: Reconnaissance (5 minutes)
1. **Login as attacker** in ShadowBank
2. **Observe requests** in Burp → Proxy → HTTP history:
   - `POST /api/login` - Login request
   - `GET /api/dashboard` - Dashboard data
   - `GET /api/transactions/{id}` - Transaction details

### Phase 3: Exploitation (10 minutes)

#### Method A: Manual (Repeater)
1. Click on your transaction (ID: 3) in the app
2. In Burp → Proxy → HTTP history, find the request
3. Right-click → **Send to Repeater**
4. Change transaction ID: `/api/transactions/3` → `/api/transactions/1`
5. Click **Send**
6. ✅ View victim's transaction data!

#### Method B: Automated (Intruder)
1. Send transaction request to Intruder
2. Mark transaction ID as payload position
3. Set payload: Numbers 1-15
4. Start attack
5. Filter by Status 200
6. Identify all victim transactions (user_id: 1)

### Phase 4: Documentation (5 minutes)
- Capture request/response pairs
- Document the vulnerability
- Note sensitive data exposed

---

## 📚 Documentation Files Created

1. **ATTACK_PLAN.md** - Comprehensive attack guide with detailed steps
2. **BURP_QUICK_REFERENCE.md** - Quick reference for Burp Suite operations
3. **NEXT_STEPS.md** - This file (overview and next actions)

---

## 🎓 Learning Objectives Checklist

- [ ] Understand what BOLA/IDOR vulnerabilities are
- [ ] Set up Burp Suite proxy
- [ ] Intercept HTTP requests
- [ ] Use Burp Repeater to modify requests
- [ ] Use Burp Intruder for automated enumeration
- [ ] Identify authorization bypass vulnerabilities
- [ ] Document security findings
- [ ] Understand the impact of such vulnerabilities

---

## 🔍 Key Vulnerable Endpoint

```
GET /api/transactions/{id}
Authorization: Bearer {token}
```

**Vulnerability**: Server doesn't verify that transaction `{id}` belongs to the user identified by `{token}`.

**Proof**: 
- Login as `attacker` (token: `2`)
- Request transaction ID `1` (belongs to `victim`, user_id: `1`)
- Server returns transaction data without checking ownership

---

## 💡 Pro Tips

1. **Start Simple**: Test manually in the app first (simulation mode)
2. **Then Use Burp**: Switch to real backend mode for Burp Suite testing
3. **Compare Modes**: Notice how simulation mode works in-browser vs real API calls
4. **Document Everything**: Take screenshots of requests/responses
5. **Try Variations**: Test with different transaction IDs, negative numbers, etc.

---

## 🛠️ Troubleshooting

### Burp Suite not intercepting requests?
- Check proxy is running on port 8080
- Verify browser proxy settings
- Ensure CA certificate is installed
- Try Burp's built-in browser

### Python backend not starting?
- Check Python is installed: `python --version`
- Install dependencies: `pip install -r backend/requirements.txt`
- Check port 5000 is not in use
- Look for error messages in terminal

### Frontend not connecting to backend?
- Ensure backend is running on `http://127.0.0.1:5000`
- Check browser console for errors
- Verify "Local Python" mode is selected
- Check CORS is enabled (it is in the backend code)

---

## 📖 Additional Resources

- **OWASP Top 10**: https://owasp.org/Top10/A01_2021-Broken_Access_Control/
- **PortSwigger Academy**: https://portswigger.net/web-security/access-control/idor
- **Burp Suite Docs**: https://portswigger.net/burp/documentation

---

## ⚠️ Important Reminders

- This is a **vulnerable-by-design** application for learning
- **DO NOT** use these techniques on systems you don't own
- Always get written authorization before security testing
- Follow responsible disclosure practices

---

## 🎯 Recommended Attack Sequence

1. ✅ **Read ATTACK_PLAN.md** - Understand the vulnerability
2. ✅ **Test in Simulation Mode** - Quick manual test
3. ✅ **Set up Burp Suite** - Configure proxy
4. ✅ **Start Python Backend** - For real API testing
5. ✅ **Switch to Local Python Mode** - In ShadowBank login
6. ✅ **Intercept & Modify** - Use Burp Repeater
7. ✅ **Automate Enumeration** - Use Burp Intruder
8. ✅ **Document Findings** - Capture evidence

---

**Ready to start?** Begin with the manual test in simulation mode, then move to Burp Suite for the full experience!



