# ShadowBank CTF - API Security Training Lab 🏦🔓

<div align="center">

![ShadowBank Banner](https://img.shields.io/badge/ShadowBank-CTF%20Lab-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0zIDkuNWwxMiA2LjV2LTguNWwtMTIgOC41bTAgMHYtMTBtMCAxMGwxMi02LjV2OC41bC0xMi02LjV6Ii8+PC9zdmc+)

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-3-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?style=flat-square&logo=docker)](https://www.docker.com/)

**A vulnerable-by-design banking application for learning API security — inspired by OWASP Juice Shop**

[🚀 Quick Start](#-quick-start) • [🎯 Challenges](#-challenges) • [☁️ Deployment](#️-deployment) • [📚 Learning](#-learning-resources)

</div>

---

## 🌟 Features

### 🎮 OWASP Juice Shop-Style CTF
- **8 Security Challenges** with progressive difficulty (⭐ to ⭐⭐⭐⭐⭐)
- **Categorized Vulnerabilities** - Injection, Access Control, XSS, and more
- **Hint System** with progressive reveals
- **Achievement Badges** for milestones
- **Real-time Progress Tracking**
- **Beautiful Scoreboard** with confetti celebrations! 🎉

### 🔒 Vulnerability Categories
| Category | Challenges | Difficulty Range |
|----------|-----------|------------------|
| 💉 Injection | SQL Injection Bypass | ⭐⭐ |
| 🚪 Broken Access Control | BOLA/IDOR, Token Enumeration | ⭐ - ⭐⭐⭐ |
| ⚡ XSS | Reflected Cross-Site Scripting | ⭐⭐ |
| 📋 Sensitive Data Exposure | Admin Endpoint, API Key Theft | ⭐⭐ - ⭐⭐⭐ |
| ⚙️ Security Misconfiguration | Hidden Admin Account | ⭐⭐⭐⭐ |
| 📝 Input Validation | Mass Assignment | ⭐⭐⭐⭐ |

### 🛠️ Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Python Flask (optional - can run in simulation mode)
- **Styling**: Modern glassmorphism, gradients, and animations

---

## 🚀 Quick Start

### Option 1: Simulation Mode (No Backend Required)
```bash
# Install dependencies
npm install

# Start the frontend
npm run dev
```
Open http://localhost:5173 — The app runs entirely in the browser using mock data!

### Option 2: Full Stack with Docker 🐳
```bash
# Build and run
docker-compose up --build

# Or use Docker directly
docker build -t shadowbank .
docker run -p 8080:8080 shadowbank
```
Open http://localhost:8080

### Option 3: Full Stack (Development)
```bash
# Terminal 1: Start Python backend
cd backend
pip install flask flask-cors
python app.py  # Runs on http://127.0.0.1:5000

# Terminal 2: Start frontend
npm run dev    # Runs on http://localhost:5173
```
On the login screen, switch to **"Local Python"** mode.

---

## 🎯 Challenges

### ⭐ Easy
| # | Challenge | Category | Points |
|---|-----------|----------|--------|
| 2 | BOLA / IDOR Attack | Broken Access Control | 100 |

### ⭐⭐ Medium
| # | Challenge | Category | Points |
|---|-----------|----------|--------|
| 1 | SQL Injection Login Bypass | Injection | 200 |
| 3 | Reflected XSS Attack | XSS | 200 |
| 5 | API Key Theft | Broken Access Control | 200 |

### ⭐⭐⭐ Hard
| # | Challenge | Category | Points |
|---|-----------|----------|--------|
| 4 | Sensitive Data Exposure | Sensitive Data Exposure | 300 |
| 7 | Token Enumeration | Cryptographic Failures | 300 |

### ⭐⭐⭐⭐ Expert
| # | Challenge | Category | Points |
|---|-----------|----------|--------|
| 6 | Mass Assignment | Improper Input Validation | 400 |
| 8 | Hidden Admin Account | Security Misconfiguration | 400 |

**Total Points Available: 2100**

---

## ☁️ Deployment

### 🟣 Vercel (Frontend Only - Recommended for Quick Deploy)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/shadowbank)

1. Push this repo to GitHub
2. Import into Vercel
3. Build settings auto-detected:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 🟢 Railway (Full Stack with Backend)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Connect your GitHub repo
2. Railway auto-detects the Dockerfile
3. Deploy with one click!

### 🔵 Netlify (Frontend Only)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

Configuration in `netlify.toml` handles SPA routing automatically.

### 🐳 Docker (Self-Hosted)
```bash
# Production build
docker build -t shadowbank .
docker run -d -p 8080:8080 --name shadowbank-ctf shadowbank

# Development with hot reload
docker-compose --profile dev up
```

### 🌐 Other Platforms
- **Render**: Use Docker or Python buildpack
- **Fly.io**: `fly launch` auto-detects Dockerfile
- **Google Cloud Run**: `gcloud run deploy`
- **AWS App Runner**: Connect GitHub repo

---

## 🔧 Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend port |
| `HOST` | `0.0.0.0` | Bind address |
| `VITE_API_BASE` | `http://127.0.0.1:5000/api` | API endpoint |

### Customizing for Production
```bash
# Build with custom API endpoint
VITE_API_BASE=https://your-api.com/api npm run build
```

---

## 🎓 Learning Paths

### Beginner (1-2 hours)
1. Start with **BOLA/IDOR** (⭐) - The most common API vulnerability
2. Try **SQL Injection** (⭐⭐) - Classic web security flaw
3. Complete **XSS** (⭐⭐) - Understand client-side attacks

### Intermediate (2-4 hours)
4. Find the **Sensitive Data Exposure** (⭐⭐⭐)
5. Exploit **Token Enumeration** (⭐⭐⭐)
6. Steal **API Keys** (⭐⭐)

### Advanced (4+ hours)
7. Master **Mass Assignment** (⭐⭐⭐⭐)
8. Discover the **Hidden Admin** (⭐⭐⭐⭐)

---

## 📚 Learning Resources

### OWASP References
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP Top 10 Web Security Risks](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### Practice Tools
- [Burp Suite](https://portswigger.net/burp) - Intercept and modify requests
- [OWASP ZAP](https://www.zaproxy.org/) - Free security testing
- [Postman](https://www.postman.com/) - API exploration

### Related Labs
- [OWASP Juice Shop](https://owasp.org/www-project-juice-shop/)
- [DVWA](https://dvwa.co.uk/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)

---

## ⚠️ Security Warning

> **⚠️ INTENTIONALLY VULNERABLE**
> 
> This application contains **deliberate security flaws** for educational purposes.
> 
> - ❌ **DO NOT** use this code in production
> - ❌ **DO NOT** deploy with real sensitive data
> - ❌ **DO NOT** test on systems you don't own
> - ✅ **DO** use for learning and training
> - ✅ **DO** host in isolated environments

---

## 🤝 Contributing

Contributions are welcome! Ideas for new challenges, UI improvements, or documentation fixes.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/shadowbank

# Create feature branch
git checkout -b feature/new-challenge

# Make changes and submit PR
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for the security community**

[⭐ Star this repo](https://github.com/YOUR_USERNAME/shadowbank) if you found it helpful!

</div>
