# Deployment Guide - ShadowBank CTF Lab

## 🚀 Deploying to Render.com

### Prerequisites
1. **Git installed** - Download from https://git-scm.com/download/win
2. **GitHub account** - Sign up at https://github.com
3. **Render account** - Sign up at https://render.com

---

## Step 1: Initialize Git Repository

### 1.1 Install Git (if not installed)
- Download Git for Windows: https://git-scm.com/download/win
- Run installer with default settings
- Restart your terminal/PowerShell after installation

### 1.2 Initialize Git in Your Project
Open PowerShell/Terminal in your project folder:

```bash
cd "c:\NecessaryDownloads\shadowbank---bola-lab (1)"

# Initialize git repository
git init

# Create .gitignore file (if it doesn't exist)
```

### 1.3 Create .gitignore File
Create a file named `.gitignore` in the project root:

```
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# Build outputs
dist/
build/
*.egg-info/

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

### 1.4 Stage and Commit Files
```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ShadowBank CTF Lab with 4 vulnerabilities"

# Check status
git status
```

---

## Step 2: Push to GitHub

### 2.1 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `shadowbank-ctf-lab` (or your choice)
3. Set to **Private** (recommended - this is vulnerable code!)
4. **Don't** initialize with README
5. Click **Create repository**

### 2.2 Connect Local Repo to GitHub
```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/shadowbank-ctf-lab.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: You'll be prompted for GitHub username and password (use Personal Access Token, not password)

### 2.3 Create GitHub Personal Access Token
If you get authentication errors:
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **Generate new token**
3. Select scopes: `repo` (full control)
4. Copy the token
5. Use the token as your password when pushing

---

## Step 3: Prepare Backend for Render

### 3.1 Update backend/app.py for Production
The backend needs to listen on Render's port. Update the bottom of `backend/app.py`:

**Find this section:**
```python
if __name__ == '__main__':
    print("=" * 60)
    print("ShadowBank Vulnerable Backend - CTF Mode")
    ...
    app.run(host='127.0.0.1', port=5000, debug=True)
```

**Replace with:**
```python
import os

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
```

### 3.2 Add Gunicorn to requirements.txt
Add this line to `backend/requirements.txt`:
```
gunicorn==21.2.0
```

### 3.3 Update Frontend API Base URL
Update `services/api.ts` to use environment variable:

**Find:**
```typescript
const API_BASE = 'http://127.0.0.1:5000/api';
```

**Replace with:**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000/api';
```

Create `.env.production` file in project root:
```
VITE_API_BASE=https://your-backend-url.onrender.com/api
```

**Commit these changes:**
```bash
git add .
git commit -m "Prepare for Render deployment"
git push
```

---

## Step 4: Deploy Backend to Render

### 4.1 Create Web Service
1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect your GitHub account (if not already)
4. Select your repository: `shadowbank-ctf-lab`

### 4.2 Configure Backend Service
- **Name**: `shadowbank-backend` (or your choice)
- **Root Directory**: `backend`
- **Environment**: `Python 3`
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command**:
  ```bash
  gunicorn app:app
  ```
- **Plan**: Free (or your choice)

### 4.3 Environment Variables (Optional)
Add if needed:
- `HOST=0.0.0.0`
- `PORT=10000` (Render will override this)

### 4.4 Deploy
Click **Create Web Service** and wait for deployment.

**Copy the URL** (e.g., `https://shadowbank-backend.onrender.com`)

---

## Step 5: Deploy Frontend to Render

### 5.1 Update API Base URL
Update `.env.production` with your actual backend URL:
```
VITE_API_BASE=https://shadowbank-backend.onrender.com/api
```

Commit and push:
```bash
git add .
git commit -m "Update API base URL for production"
git push
```

### 5.2 Create Static Site
1. In Render dashboard, click **New** → **Static Site**
2. Connect repository: `shadowbank-ctf-lab`
3. Configure:
   - **Name**: `shadowbank-frontend`
   - **Root Directory**: `/` (root)
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_BASE=https://shadowbank-backend.onrender.com/api`

### 5.3 Deploy
Click **Create Static Site** and wait for deployment.

---

## Step 6: Test Your Deployment

1. Visit your frontend URL (e.g., `https://shadowbank-frontend.onrender.com`)
2. Go to `/scoreboard` to see challenges
3. Switch to **Local Python** mode (now points to Render backend)
4. Test vulnerabilities:
   - SQLi: Login with `' OR 1=1 --`
   - BOLA: Access transaction ID 1 as attacker
   - XSS: Visit `/api/search?q=<script>alert(1)</script>`
   - Admin dump: Visit `/api/admin/users`

---

## 🔒 Security Notes

⚠️ **IMPORTANT**: 
- This app is **intentionally vulnerable**
- Set repositories to **Private** on GitHub
- Consider password-protecting Render services
- **Never** use real credentials or sensitive data
- This is for **educational purposes only**

---

## 🐛 Troubleshooting

### Backend won't start?
- Check logs in Render dashboard
- Ensure `gunicorn` is in requirements.txt
- Verify start command: `gunicorn app:app`

### Frontend can't connect to backend?
- Check CORS is enabled in Flask (`CORS(app)`)
- Verify API_BASE URL is correct
- Check backend URL is accessible (visit it directly)

### Git push fails?
- Ensure Git is installed and in PATH
- Use Personal Access Token, not password
- Check remote URL is correct: `git remote -v`

### Build fails?
- Check Node.js version (Render uses latest)
- Verify all dependencies in package.json
- Check build logs in Render dashboard

---

## 📝 Quick Commands Reference

```bash
# Git setup
git init
git add .
git commit -m "Your message"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# Check status
git status
git remote -v

# Update and push
git add .
git commit -m "Update message"
git push
```

---

## 🎯 Next Steps After Deployment

1. **Test all vulnerabilities** via the deployed app
2. **Use Burp Suite** to intercept requests (if testing locally)
3. **Monitor scoreboard** at `/scoreboard` route
4. **Share with students** (if educational use)

---

**Need help?** Check Render docs: https://render.com/docs
