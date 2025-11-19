# 🚀 SaaS POS & Inventory Management Platform

**Enterprise-level Multi-Tenant POS System for the Tunisian Market**

Built with MERN Stack (MongoDB, Express.js, React.js, Node.js)

## 🌟 Features

### Super Admin (Platform Owner)
- 📊 Global dashboard with analytics
- 🏢 Tenant management (create, edit, disable tenants)
- 💳 Subscription & billing management
- 🎯 Feature toggles per tenant
- 📈 Revenue analytics across all tenants
- 🔐 Tenant impersonation for support

### Tenant Admin (Store Owner)
- 🎨 Custom branding (logo, colors, domain)
- 📦 Advanced product management
- ⚖️ **Multi-unit system** (kg, g, L, ml, pieces, custom units)
- 💰 Modern POS interface
- 📊 Inventory management
- 📈 Sales analytics & reports
- 🏪 Multi-branch support
- 👥 Staff & role management
- 👤 Customer management & loyalty
- 🧾 Customizable receipts

### Core Features
- 🌐 Multi-tenant architecture
- 🔒 JWT authentication + refresh tokens
- 🎚️ Dynamic feature toggles
- 🌓 Light/Dark themes
- 🌍 Multi-language (Arabic/French/English)
- ➡️ RTL support
- 📱 Mobile-responsive
- 🐳 Docker-ready
- 🚀 Production-ready

## 🏗️ Architecture

### Multi-Tenant Strategy
This platform uses a **shared database with tenant isolation** approach:
- Single MongoDB database
- Every document includes `tenantId` field
- Middleware automatically filters by tenant
- Scalable and cost-effective

### Technology Stack

**Backend:**
- Node.js 18+
- Express.js 4.x
- MongoDB 6+ with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Winston for logging

**Frontend:**
- React 18+
- TailwindCSS 3+
- Zustand (state management)
- React Router 6+
- Axios for API calls
- i18next (internationalization)
- Framer Motion (animations)

**DevOps:**
- Docker & Docker Compose
- Nginx reverse proxy
- PM2 process manager
- CI/CD ready

## 📁 Project Structure

```
ALL_SAAS_POS/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # MongoDB schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── tests/              # Unit & integration tests
│   ├── .env.example        # Environment variables template
│   ├── Dockerfile          # Backend container
│   └── package.json
│
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── store/         # Zustand stores
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Helper functions
│   │   ├── locales/       # i18n translations
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── Dockerfile         # Frontend container
│   ├── tailwind.config.js # TailwindCSS config
│   └── package.json
│
├── nginx/                  # Nginx configuration
│   └── nginx.conf
│
├── docker-compose.yml      # Multi-container setup
├── .dockerignore
├── .gitignore
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB 6+ (local or Atlas)
- Docker & Docker Compose (optional)
- npm or yarn

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd ALL_SAAS_POS

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your MongoDB URI and secrets

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

#### Option 2: Manual Setup

```bash
# 1. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# 2. Setup Frontend (in new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with backend API URL
npm run dev
```

### Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- Super admin account
- 2 demo tenants
- Sample products with multi-unit conversions
- Demo staff users
- Sample sales data

## 🔑 Default Credentials

### Super Admin
- Email: `superadmin@platform.com`
- Password: `SuperAdmin@2024`

### Demo Tenant 1 (Épicerie Moderne)
- Email: `admin@epicerie.tn`
- Password: `Admin@123`

### Demo Tenant 2 (Supermarché Atlas)
- Email: `admin@atlas.tn`
- Password: `Admin@123`

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register          # Register new tenant
POST   /api/auth/login             # Login
POST   /api/auth/refresh           # Refresh access token
POST   /api/auth/logout            # Logout
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Reset password
```

### Super Admin Endpoints

```
GET    /api/superadmin/dashboard         # Global analytics
GET    /api/superadmin/tenants           # List all tenants
POST   /api/superadmin/tenants           # Create tenant
PUT    /api/superadmin/tenants/:id       # Update tenant
DELETE /api/superadmin/tenants/:id       # Delete tenant
GET    /api/superadmin/subscriptions     # Subscription plans
POST   /api/superadmin/subscriptions     # Create plan
POST   /api/superadmin/impersonate/:id   # Impersonate tenant
```

### Tenant Admin Endpoints

```
GET    /api/tenant/dashboard              # Tenant analytics
PUT    /api/tenant/settings/branding      # Update branding
GET    /api/tenant/products               # List products
POST   /api/tenant/products               # Create product
PUT    /api/tenant/products/:id           # Update product
DELETE /api/tenant/products/:id           # Delete product
GET    /api/tenant/inventory              # Inventory management
POST   /api/tenant/inventory/stock-in     # Add stock
POST   /api/tenant/inventory/stock-out    # Remove stock
GET    /api/tenant/staff                  # Staff management
POST   /api/tenant/staff                  # Create staff
GET    /api/tenant/customers              # Customer list
POST   /api/tenant/customers              # Create customer
GET    /api/tenant/branches               # Branches
POST   /api/tenant/branches               # Create branch
```

### POS Endpoints

```
POST   /api/pos/sale                    # Create sale
GET    /api/pos/products/search         # Search products
GET    /api/pos/held-orders             # Get held orders
POST   /api/pos/hold-order              # Hold current order
POST   /api/pos/retrieve-order/:id      # Retrieve held order
POST   /api/pos/receipt/:saleId         # Generate receipt
GET    /api/pos/daily-summary           # Daily sales summary
```

### Analytics Endpoints

```
GET    /api/analytics/sales             # Sales analytics
GET    /api/analytics/products          # Product performance
GET    /api/analytics/revenue           # Revenue reports
GET    /api/analytics/export/pdf        # Export to PDF
GET    /api/analytics/export/excel      # Export to Excel
```

## 🎯 Multi-Unit System

### Overview
The platform supports selling products in multiple units with automatic conversion:

### Supported Unit Types

**Weight:**
- Kilogram (kg)
- Gram (g)
- Milligram (mg)

**Volume:**
- Liter (L)
- Milliliter (ml)
- Cup (custom Tunisian measurement)

**Piece:**
- Piece
- Pack
- Box
- Dozen

**Custom Units:**
Tenants can define their own units

### Example: Multi-Unit Product

```javascript
{
  name: "Farine",
  baseUnit: "kg",
  basePricePerUnit: 2.5, // 2.5 TND per kg
  conversions: [
    { unit: "g", conversionFactor: 0.001 },      // 1g = 0.001kg
    { unit: "cup", conversionFactor: 0.18 },     // 1 cup = 0.18kg
    { unit: "pack", conversionFactor: 1 }        // 1 pack = 1kg
  ]
}
```

When selling:
- 500g of Farine = 2.5 × 0.5 = 1.25 TND
- 3 cups of Farine = 2.5 × 0.18 × 3 = 1.35 TND
- 2 packs of Farine = 2.5 × 1 × 2 = 5 TND

### Adding Custom Units

```javascript
// Tenant can create custom conversions
{
  productId: "...",
  customUnit: {
    name: "Sachet",
    conversionFactor: 0.25  // 1 sachet = 0.25kg
  }
}
```

## 🌐 Multi-Tenant Architecture

### How It Works

1. **Tenant Isolation:**
   - Each tenant has a unique `tenantId`
   - All data documents include `tenantId` field
   - Middleware automatically filters queries by tenant

2. **Domain/Subdomain Mapping:**
   - Tenants can have custom subdomains
   - Example: `epicerie.yourdomain.com`
   - Subdomain automatically identifies tenant

3. **Feature Toggles:**
   - Super admin enables/disables features per tenant
   - Frontend dynamically shows/hides features
   - Backend validates feature access

4. **Data Flow:**
```
Request → Extract tenantId from JWT/subdomain
       → Middleware adds tenantId to req.tenant
       → All DB queries auto-filter by tenantId
       → Response only contains tenant's data
```

## 🔐 Security Features

- ✅ JWT access tokens (15 min expiry)
- ✅ Refresh tokens (7 days expiry)
- ✅ Bcrypt password hashing
- ✅ Rate limiting on auth endpoints
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Audit logging for all actions

## 🎨 Customization

### Tenant Branding

Tenants can customize:
- Logo (uploaded to cloud storage)
- Primary color
- Secondary color
- Store name
- Receipt header/footer
- Custom subdomain

### Themes

Users can switch between:
- Light mode
- Dark mode
- Auto (system preference)

### Languages

Supported languages:
- Arabic (AR) - RTL
- French (FR)
- English (EN)

## 📊 Subscription Plans

### Plan Structure

```javascript
{
  name: "Starter",
  price: 49,           // TND per month
  billingCycle: "monthly",
  features: {
    maxProducts: 100,
    maxStaff: 3,
    maxBranches: 1,
    analytics: true,
    multiUnit: true,
    customBranding: false,
    apiAccess: false
  }
}
```

### Tunisian Payment Methods

Integrated payment providers:
- 💳 D17 (Tunisian online payment)
- 📱 Flouci (mobile wallet)
- 💰 Edinar (e-payment gateway)
- 🏦 Bank card payments
- ✋ Manual payment approval

## 🚀 Deployment

### Production Deployment with Docker

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/saas_pos
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Payment Gateways
D17_API_KEY=your-d17-key
FLOUCI_API_KEY=your-flouci-key
EDINAR_API_KEY=your-edinar-key
```

#### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=POS Platform
```

### Scaling Recommendations

**For 1-50 tenants:**
- Single server (2 CPU, 4GB RAM)
- MongoDB Atlas M10
- Cost: ~$50-100/month

**For 50-500 tenants:**
- Load balancer + 2-3 app servers
- MongoDB Atlas M30
- Redis for sessions
- Cost: ~$300-500/month

**For 500+ tenants:**
- Kubernetes cluster
- MongoDB sharding
- CDN for static assets
- Background job queue (Bull)
- Cost: ~$1000+/month

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 📈 Performance Optimization

- ✅ Database indexing on tenantId, SKU, barcode
- ✅ Redis caching for frequently accessed data
- ✅ Lazy loading in React
- ✅ Code splitting
- ✅ Image optimization (WebP format)
- ✅ API response compression
- ✅ MongoDB aggregation pipelines
- ✅ Connection pooling

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh --eval "db.version()"

# Check connection string format
mongodb://localhost:27017/saas_pos
# OR for Atlas:
mongodb+srv://username:password@cluster.mongodb.net/dbname
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Docker Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Check logs
docker-compose logs backend
```

## 🤝 Contributing

This is a proprietary SaaS platform. Internal development only.

## 📄 License

Proprietary - All Rights Reserved

## 🆘 Support

For support and questions:
- Email: support@yourplatform.com
- Documentation: https://docs.yourplatform.com

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Multi-tenant architecture
- ✅ Super admin panel
- ✅ Tenant admin panel
- ✅ POS interface
- ✅ Multi-unit system
- ✅ Basic analytics

### Phase 2 (Q1 2025)
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics & ML predictions
- 🔄 Loyalty program system
- 🔄 Online ordering integration
- 🔄 Kitchen display system (KDS)

### Phase 3 (Q2 2025)
- 📅 Accounting integration
- 📅 E-commerce storefront
- 📅 Supplier portal
- 📅 Advanced reporting
- 📅 API marketplace

---

**Built with ❤️ for the Tunisian market**

Version: 1.0.0
Last Updated: November 2025
