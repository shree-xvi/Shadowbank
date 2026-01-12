# Installing Burp Suite CA Certificate in Chrome

## 🎯 Quick Steps

### Step 1: Start Burp Suite
1. Open Burp Suite Community Edition
2. Ensure the proxy is running (Proxy → Options → Proxy Listeners should show `127.0.0.1:8080`)

### Step 2: Download the Certificate
1. Open Chrome browser
2. Navigate to: **`http://burpsuite`** or **`http://127.0.0.1:8080`**
3. You should see the Burp Suite welcome page
4. Click on **"CA Certificate"** button/link
5. The certificate file (`cacert.der`) will download

**Alternative method if the above doesn't work:**
- Navigate directly to: **`http://burpsuite/cert`** or **`http://127.0.0.1:8080/cert`**

### Step 3: Install Certificate in Chrome

#### Method A: Chrome Settings (Recommended)
1. Open Chrome
2. Click the **three dots** (⋮) → **Settings**
3. Search for **"certificates"** or navigate to **Privacy and security** → **Security**
4. Scroll down and click **"Manage certificates"** or **"Manage device certificates"**
5. Go to the **"Authorities"** tab
6. Click **"Import"**
7. Browse to your Downloads folder and select `cacert.der`
8. Check **"Trust this certificate for identifying websites"**
9. Click **OK**

#### Method B: Windows Certificate Store (Works for Chrome)
1. Press **Windows Key + R**
2. Type: `certmgr.msc` and press Enter
3. Navigate to **Trusted Root Certification Authorities** → **Certificates**
4. Right-click **Certificates** → **All Tasks** → **Import**
5. Click **Next**
6. Browse to your Downloads folder, change file type to **"All Files (*.*)"**
7. Select `cacert.der`
8. Click **Next**
9. Select **"Place all certificates in the following store"**
10. Ensure **"Trusted Root Certification Authorities"** is selected
11. Click **Next** → **Finish**
12. Click **Yes** on the security warning
13. Click **OK**

### Step 4: Restart Chrome
- Close all Chrome windows completely
- Reopen Chrome

### Step 5: Verify Installation
1. Configure Chrome to use Burp proxy (see below)
2. Navigate to any HTTPS site (e.g., `https://www.google.com`)
3. Check Burp Suite → Proxy → HTTP history
4. You should see HTTPS requests without certificate errors

---

## 🔧 Configure Chrome to Use Burp Proxy

### Option 1: Chrome Extension (Easiest)
1. Install **"Proxy SwitchyOmega"** extension from Chrome Web Store
2. Configure it:
   - Protocol: HTTP
   - Server: `127.0.0.1`
   - Port: `8080`
3. Enable the proxy when testing

### Option 2: Chrome Launch Arguments
Create a shortcut with these arguments:
```
chrome.exe --proxy-server="http=127.0.0.1:8080;https=127.0.0.1:8080" --ignore-certificate-errors
```

### Option 3: System Proxy (Windows)
1. Windows Settings → **Network & Internet** → **Proxy**
2. Set Manual proxy:
   - Address: `127.0.0.1`
   - Port: `8080`
   - Check "Use the same proxy for all protocols"
3. Save

---

## 🐛 Troubleshooting

### Certificate download page not loading?
- Ensure Burp Suite is running
- Try `http://127.0.0.1:8080` instead of `http://burpsuite`
- Check Windows Firewall isn't blocking port 8080
- Verify proxy is enabled in Burp Suite

### Certificate import fails?
- Make sure you're importing to **Trusted Root Certification Authorities**
- Try importing as `.der` format (not converting to `.pem`)
- Run Chrome as Administrator if needed

### Still getting certificate errors?
- Clear Chrome cache: `Ctrl+Shift+Delete`
- Restart Chrome completely
- Verify certificate is in the correct store
- Check Burp Suite proxy is intercepting (Proxy → Intercept is ON)

### Chrome not sending traffic to Burp?
- Verify proxy settings are correct
- Check Burp Suite → Proxy → Options → Proxy Listeners is enabled
- Ensure "Intercept client requests" is ON (if you want to intercept)
- Try disabling other proxy/VPN software

---

## ✅ Verification Checklist

- [ ] Burp Suite is running
- [ ] Certificate downloaded (`cacert.der` in Downloads)
- [ ] Certificate imported to Trusted Root Certification Authorities
- [ ] Chrome restarted
- [ ] Chrome proxy configured to `127.0.0.1:8080`
- [ ] HTTPS sites load without certificate errors
- [ ] Requests appear in Burp Suite → Proxy → HTTP history

---

## 📝 Quick Reference

**Certificate Download URL:**
- `http://burpsuite/cert`
- `http://127.0.0.1:8080/cert`

**Proxy Settings:**
- Server: `127.0.0.1`
- Port: `8080`

**Certificate Store:**
- Windows: Trusted Root Certification Authorities
- Chrome: Uses Windows certificate store

---

## 🎓 Why This is Needed

Chrome uses HTTPS (encrypted) for most websites. To intercept and inspect HTTPS traffic, Burp Suite acts as a "man-in-the-middle" proxy. This requires:
1. **Proxy configuration** - Route traffic through Burp
2. **CA certificate** - Chrome must trust Burp's certificate to decrypt HTTPS

Without the certificate, Chrome will show "NET::ERR_CERT_AUTHORITY_INVALID" errors for HTTPS sites.

---

## 🔒 Security Note

The Burp Suite CA certificate allows Burp to decrypt your HTTPS traffic. Only install it on:
- ✅ Your own development/testing machine
- ✅ Machines you own and control
- ❌ Never install on shared/public computers
- ❌ Never install on production systems

You can remove it later by:
1. Opening `certmgr.msc`
2. Finding "PortSwigger CA" in Trusted Root Certification Authorities
3. Right-click → Delete



