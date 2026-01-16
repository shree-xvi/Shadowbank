# ShadowBank CTF - Docker Image
# Multi-stage build for optimal size

# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/app.py ./

# Copy built frontend
COPY --from=frontend-builder /app/dist ./static

# Create a simple Flask app that serves both API and static files
RUN cat > server.py << 'EOF'
from flask import Flask, send_from_directory, request, jsonify, Response
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# Import the API routes from app.py
exec(open('app.py').read())

# Serve static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
EOF

# Expose port
EXPOSE 8080

# Environment variables
ENV PORT=8080
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Run the server
CMD ["python", "server.py"]
