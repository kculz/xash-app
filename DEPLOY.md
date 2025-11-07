# Xash Platform Deployment Guide

A quick guide to deploy the Xash Platform React application on a VPS.

## 🚀 Quick Start

### 1. Server Setup
```bash
# Connect to your VPS
ssh root@your-server-ip

# Create deployment user
adduser deploy
usermod -aG sudo deploy
su - deploy

# Update system
sudo apt update && sudo apt upgrade -y
```

### 2. Install Dependencies
```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2
```

### 3. Application Setup
```bash
# Create app directory
sudo mkdir -p /var/www/xash-platform
sudo chown -R deploy:deploy /var/www/xash-platform
cd /var/www/xash-platform

# Clone your repository
git clone https://github.com/yourusername/xash-platform.git .

# Install dependencies
npm install
```

### 4. Environment Configuration
Create `.env.production`:
```env
VITE_APP_ENV=production
VITE_API_BASE_URL=https://xv.xash.co.zw/api/v1
VITE_USE_DUMMY_DATA=false
```

### 5. Build Application
```bash
npm run build
```

## 🌐 Web Server Configuration

### Nginx Setup
Create `/etc/nginx/sites-available/xash-platform`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/xash-platform/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/xash-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL Certificate
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 🔄 Process Management

### PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'xash-platform',
    script: 'npm',
    args: 'run preview',
    cwd: '/var/www/xash-platform',
    env: {
      NODE_ENV: 'production',
      PORT: 4173
    }
  }]
}
```

Start application:
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## ⚙️ Vite Configuration

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: '0.0.0.0',
    port: 4173
  }
})
```

## 📦 Package.json Scripts

Ensure your `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0 --port 4173",
    "deploy": "npm run build && pm2 reload ecosystem.config.js"
  }
}
```

## 🔒 Security & Firewall

```bash
# Enable firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 4173

# Secure SSH
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
```

## 🚀 Deployment Script

Create `deploy.sh`:
```bash
#!/bin/bash
cd /var/www/xash-platform
git pull origin main
npm install
npm run build
pm2 reload xash-platform
echo "✅ Deployment completed!"
```

Make executable:
```bash
chmod +x deploy.sh
```

## 📊 Monitoring

```bash
# Check application status
pm2 status
pm2 logs xash-platform

# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

## 🗂️ Project Structure
```
/var/www/xash-platform/
├── dist/                 # Built files (created by npm run build)
├── src/                  # Source code
├── ecosystem.config.js   # PM2 configuration
├── package.json
└── .env.production       # Environment variables
```

## 🚨 Troubleshooting

**Application not loading?**
```bash
pm2 restart xash-platform
sudo systemctl restart nginx
```

**Build errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Port conflicts?**
```bash
sudo lsof -i :4173
```

## 🔄 Quick Deploy
After initial setup, deploy updates with:
```bash
./deploy.sh
```

---

**Need Help?**
- Check PM2 logs: `pm2 logs xash-platform`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify build: `npm run build` locally first

Your app will be live at: `https://your-domain.com`