# ShadowBank - API Security Lab (BOLA/IDOR)

ShadowBank is a vulnerable-by-design banking application built to demonstrate **Broken Object Level Authorization (BOLA)**.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally (Frontend Only - Simulation Mode)
This runs the app in **Simulation Mode** (Browser Mock DB). No Python backend required.
```bash
npm run dev
```

### 3. Run Full Stack (Optional)
If you want to test against the real vulnerable Python API:
1.  Run the backend: `python backend/app.py` (Ensure you have Flask installed).
2.  Run the frontend: `npm run dev`
3.  On the login screen, switch the mode to **Local Python**.
4.  Visit `/scoreboard` to see CTF progress for the four lab challenges.

---

## ☁️ Deployment

### Deploying to Vercel / Netlify
This project is ready for static deployment. 
1.  Push this code to a GitHub repository.
2.  Import the project into Vercel or Netlify.
3.  The build settings should be auto-detected:
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`

**Note:** The deployed version will default to **Simulation Mode**. This is perfect for sharing the lab without hosting a backend server. The "Local Python" mode will only work if you also host the Python backend publicly and update `services/api.ts` with the new URL.

---

## ⚠️ Security Warning
This application contains **intentional security vulnerabilities** (BOLA/IDOR). 
*   **DO NOT** use this code for a real banking application.
*   **DO NOT** deploy the Python backend to a public server containing real sensitive data.
*   This is strictly for educational purposes.
