# 🚀 Deployment Guide

Complete guide to deploying the SaaS POS & Inventory Management Platform.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Nginx Configuration](#nginx-configuration)
7. [SSL/HTTPS Setup](#ssl-https-setup)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Docker & Docker Compose**: Latest stable version (optional but recommended)
- **Git**: For version control

### Recommended

- Ubuntu 20.04 LTS or higher
- Minimum 2GB RAM, 2 CPU cores
- 20GB free disk space

## Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ALL_SAAS_POS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env

# Seed demo data
npm run seed

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env
nano .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

**Demo Credentials:**
- Super Admin: `superadmin@platform.com` / `SuperAdmin@2024`
- Tenant: `admin@epicerie.tn` / `Admin@123`

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### 1. Prepare Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Edit with production values
nano backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# Edit with production values
nano frontend/.env
```

#### 2. Build and Start Containers

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### 3. Check Service Status

```bash
docker-compose ps
```

### Option 2: Manual Deployment

#### 1. Setup MongoDB

```bash
# Install MongoDB on Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Deploy Backend

```bash
cd backend

# Install dependencies (production only)
npm ci --only=production

# Seed database
npm run seed

# Install PM2 globally
sudo npm install -g pm2

# Start with PM2
pm2 start src/server.js --name "pos-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### 3. Deploy Frontend

```bash
cd frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Install serve globally
sudo npm install -g serve

# Serve the built app
pm2 start "serve -s dist -l 3000" --name "pos-frontend"
pm2 save
```

#### 4. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt update
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/pos-platform
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pos-platform /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/saas_pos
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/saas_pos

# JWT Secrets (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters
JWT_REFRESH_SECRET=your-very-secure-refresh-secret-minimum-32-characters
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
FRONTEND_URL=https://your-domain.com

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
EMAIL_FROM=noreply@your-domain.com

# Payment Gateways (Tunisian)
D17_API_KEY=your-d17-api-key
FLOUCI_APP_TOKEN=your-flouci-token
EDINAR_API_KEY=your-edinar-key

# Optional: File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend Environment Variables

```env
VITE_API_URL=https://your-domain.com
VITE_APP_NAME=Your POS Platform
```

## Database Setup

### MongoDB Atlas (Cloud - Recommended for Production)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist your server IP
5. Get connection string
6. Update `MONGODB_URI` in backend `.env`

### Local MongoDB

```bash
# Create database and user
mongosh

use saas_pos
db.createUser({
  user: "posadmin",
  pwd: "secure_password_here",
  roles: [{ role: "readWrite", db: "saas_pos" }]
})

# Update connection string in .env
MONGODB_URI=mongodb://posadmin:secure_password_here@localhost:27017/saas_pos
```

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Nginx will automatically be configured for HTTPS.

### Manual SSL Certificate

If you have your own SSL certificate:

```bash
# Copy certificates
sudo cp your-certificate.crt /etc/ssl/certs/
sudo cp your-private-key.key /etc/ssl/private/

# Update Nginx configuration
sudo nano /etc/nginx/sites-available/pos-platform
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-certificate.crt;
    ssl_certificate_key /etc/ssl/private/your-private-key.key;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring & Maintenance

### PM2 Monitoring

```bash
# View running processes
pm2 status

# View logs
pm2 logs pos-backend
pm2 logs pos-frontend

# Monitor resources
pm2 monit

# Restart services
pm2 restart pos-backend
pm2 restart pos-frontend

# Reload without downtime
pm2 reload all
```

### Database Backups

#### Automated Backup Script

Create `/home/user/backup-mongo.sh`:

```bash
#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/mongodb"
mkdir -p $BACKUP_DIR

mongodump --uri="mongodb://localhost:27017/saas_pos" --out="$BACKUP_DIR/backup_$TIMESTAMP"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

Make executable and add to cron:

```bash
chmod +x /home/user/backup-mongo.sh

# Add to crontab (run daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /home/user/backup-mongo.sh
```

### System Logs

```bash
# Backend logs
pm2 logs pos-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Health Checks

```bash
# Check backend health
curl http://localhost:5000/health

# Check if services are running
sudo systemctl status nginx
sudo systemctl status mongod
pm2 status
```

### Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (minimum 32 characters)
- [ ] Enable firewall (ufw)
- [ ] Keep systems updated
- [ ] Regular backups configured
- [ ] SSL/HTTPS enabled
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] Rate limiting enabled
- [ ] Audit logs reviewed regularly

### Firewall Configuration

```bash
# Install and enable UFW
sudo apt install ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

## Scaling Recommendations

### For 1-100 Tenants
- Single server: 2 CPU, 4GB RAM
- MongoDB Atlas M10
- Estimated cost: ~$50-100/month

### For 100-500 Tenants
- Load balancer + 2-3 app servers
- MongoDB Atlas M30
- Redis for caching
- CDN for static assets
- Estimated cost: ~$300-500/month

### For 500+ Tenants
- Kubernetes cluster
- MongoDB sharding
- Multiple regions
- Background job queues
- Estimated cost: ~$1000+/month

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs pos-backend

# Check MongoDB connection
mongosh --eval "db.version()"

# Check if port is in use
lsof -i :5000
```

### Frontend Build Errors

```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

### Database Connection Issues

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Test connection
mongosh "mongodb://localhost:27017/saas_pos"

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

## Support

For additional support:
- Documentation: Check README.md
- Issues: Create GitHub issue
- Email: support@your-domain.com

---

**Last Updated**: November 2025
