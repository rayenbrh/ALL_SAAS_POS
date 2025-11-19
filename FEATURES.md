# ⭐ Features Documentation

Complete guide to all features of the SaaS POS & Inventory Management Platform.

## 📑 Table of Contents

1. [Multi-Unit System](#multi-unit-system)
2. [Multi-Tenant Architecture](#multi-tenant-architecture)
3. [Role-Based Access Control](#role-based-access-control)
4. [Feature Toggles](#feature-toggles)
5. [POS Interface](#pos-interface)
6. [Inventory Management](#inventory-management)
7. [Customer Management](#customer-management)
8. [Analytics & Reporting](#analytics--reporting)
9. [Payment Methods](#payment-methods)
10. [Multi-Language Support](#multi-language-support)

---

## 🔢 Multi-Unit System

### Overview

The **Multi-Unit System** is one of the most powerful features, allowing products to be sold in various units of measurement with automatic conversion.

### Supported Unit Types

#### Weight Units
- Kilogram (kg)
- Gram (g)
- Milligram (mg)
- Ton (ton)

#### Volume Units
- Liter (L)
- Milliliter (ml)
- Centiliter (cl)
- Cup (custom Tunisian measurement)

#### Piece Units
- Piece
- Pack
- Box
- Dozen
- Carton

#### Custom Units
Tenants can define their own custom units with conversion factors.

### How It Works

#### 1. Define Base Unit

Every product has a **base unit** which is the primary unit of storage and calculation.

Example: Flour with base unit "kg"

#### 2. Add Conversion Factors

Define how other units convert to the base unit:

```json
{
  "baseUnit": "kg",
  "unitConversions": [
    { "unit": "g", "conversionFactor": 0.001 },      // 1g = 0.001kg
    { "unit": "cup", "conversionFactor": 0.18 },     // 1 cup = 0.18kg
    { "unit": "pack", "conversionFactor": 1 }        // 1 pack = 1kg
  ]
}
```

#### 3. Sell in Any Unit

At the POS, cashiers can sell in any allowed unit:
- 500g of flour
- 3 cups of flour
- 2 packs of flour

The system automatically:
- Calculates the correct price
- Deducts the appropriate stock amount
- Records the transaction in the chosen unit

### Real-World Examples

#### Example 1: Tunisian Flour (Farine)

```
Product: Farine Blanche
Base Unit: kg
Price: 2.50 TND per kg

Conversions:
- 1g = 0.001kg
- 1 cup (Tunisian) = 0.18kg
- 1 pack = 1kg

Sales Examples:
- Customer buys 500g → 0.5kg × 2.50 = 1.25 TND
- Customer buys 3 cups → 0.54kg × 2.50 = 1.35 TND
- Customer buys 2 packs → 2kg × 2.50 = 5.00 TND
```

#### Example 2: Milk (Lait)

```
Product: Lait Frais
Base Unit: L
Price: 3.20 TND per liter

Conversions:
- 1ml = 0.001L
- 1 bottle = 1L

Sales Examples:
- Customer buys 500ml → 0.5L × 3.20 = 1.60 TND
- Customer buys 2 bottles → 2L × 3.20 = 6.40 TND
```

#### Example 3: Tomatoes (Tomates)

```
Product: Tomates
Base Unit: kg
Price: 1.80 TND per kg

Conversions:
- 1g = 0.001kg

Sales Examples:
- Customer buys 750g → 0.75kg × 1.80 = 1.35 TND
- Customer buys 2kg → 2kg × 1.80 = 3.60 TND
```

### Benefits

✅ **Flexible Sales**: Sell products how customers want to buy them
✅ **Accurate Pricing**: Automatic price calculation for any quantity
✅ **Stock Accuracy**: Precise inventory tracking across all units
✅ **Local Adaptation**: Support Tunisian market needs (cups, custom units)
✅ **Less Confusion**: No manual conversion calculations needed

### Setting Up Multi-Unit Products

#### Step 1: Create Product

Navigate to Products → Add Product

#### Step 2: Select Base Unit

Choose the primary unit for storage:
- kg, L, piece, etc.

#### Step 3: Add Conversions

For each additional selling unit, define the conversion:
- Unit name
- Conversion factor (how many base units = 1 of this unit)

#### Step 4: Test at POS

The product will appear in POS with unit selector.

---

## 🏢 Multi-Tenant Architecture

### Overview

The platform supports **unlimited tenants** (stores) on a single codebase with complete data isolation.

### Architecture Type

**Shared Database with Tenant Isolation**
- Single MongoDB database
- Every document has `tenantId` field
- Automatic query filtering
- Cost-effective and scalable

### How Tenants are Isolated

#### 1. Database Level

All models include `tenantId`:

```javascript
{
  _id: ObjectId("..."),
  tenantId: ObjectId("648a1b2c..."),
  name: "Product Name",
  price: 10.00
}
```

#### 2. Middleware Level

Automatic tenant filtering on all queries:

```javascript
// User queries "all products"
Product.find()

// System automatically adds tenant filter
Product.find({ tenantId: currentUser.tenantId })
```

#### 3. Subdomain Mapping

Each tenant can have a custom subdomain:
- `tenant1.yourplatform.com`
- `tenant2.yourplatform.com`

The subdomain automatically identifies the tenant.

### Tenant Creation Flow

1. User registers → Creates Tenant
2. Tenant gets unique `tenantId`
3. Admin user created with `tenantId`
4. Subscription plan assigned
5. Feature flags set based on plan
6. 14-day trial starts automatically

### Data Security

✅ **Automatic Isolation**: Middleware ensures tenant can't access other tenant's data
✅ **No Cross-Tenant Access**: Queries always filtered by tenantId
✅ **Super Admin Override**: Only super admins can view all tenants
✅ **Audit Logging**: All data access logged

---

## 🔐 Role-Based Access Control (RBAC)

### User Roles

#### Super Admin
**Platform Owner**
- Manage all tenants
- Create/edit subscription plans
- View global analytics
- Impersonate tenants for support

#### Tenant Admin
**Store Owner**
- Full access to their store
- Manage all settings
- Manage staff
- View all reports
- Customize branding

#### Manager
**Store Manager**
- Manage products & inventory
- View reports
- Manage customers
- Process sales
- Cannot manage staff or settings

#### Cashier
**POS Operator**
- Process sales
- View products
- Add customers
- Cannot access reports or settings

#### Stock Manager
**Inventory Specialist**
- Manage inventory
- Stock in/out
- View stock reports
- Cannot process sales

#### Staff
**Basic Employee**
- Process sales (limited)
- View products
- Basic customer management

### Granular Permissions

Each role has specific permissions:

```javascript
{
  canViewSales: true,
  canCreateSales: true,
  canDeleteSales: false,
  canManageProducts: false,
  canManageInventory: false,
  canManageCustomers: true,
  canViewReports: false,
  canManageStaff: false,
  canManageSettings: false,
  canGiveDiscounts: false,
  canRefund: false
}
```

Permissions can be customized per user.

---

## 🎚️ Feature Toggles

### Overview

Super admins can enable/disable features per tenant based on their subscription plan.

### Available Features

| Feature | Description | Default |
|---------|-------------|---------|
| **Analytics** | Sales analytics & reports | ✅ Enabled |
| **Multi-Unit** | Multi-unit product system | ✅ Enabled |
| **Branches** | Multi-location support | ❌ Disabled |
| **Staff Management** | Employee management | ✅ Enabled |
| **Discounts** | Sale discounts | ✅ Enabled |
| **Loyalty** | Loyalty points program | ❌ Disabled |
| **Custom Branding** | Logo & colors | ❌ Disabled |
| **Exporting** | Export reports (PDF/Excel) | ✅ Enabled |
| **Stock Alerts** | Low stock notifications | ✅ Enabled |
| **Expiration Tracking** | Product expiry dates | ✅ Enabled |
| **Customer Credit** | Debt/credit management | ❌ Disabled |
| **Multi-Payment** | Multiple payment methods per sale | ✅ Enabled |
| **Receipt Customization** | Custom receipt templates | ❌ Disabled |
| **API Access** | REST API access | ❌ Disabled |

### How It Works

#### 1. Feature in Subscription Plan

```json
{
  "planName": "Professional",
  "features": {
    "branches": true,
    "loyalty": true,
    "custom_branding": true
  }
}
```

#### 2. Tenant Gets Features

When tenant subscribes to plan, features are copied to tenant document.

#### 3. Backend Validation

Middleware checks if tenant has feature:

```javascript
// If feature not enabled, returns 403 Forbidden
checkFeature('branches')
```

#### 4. Frontend Hides/Shows

Frontend dynamically shows features based on tenant's plan:

```jsx
{tenant.hasFeature('branches') && (
  <Link to="/branches">Branches</Link>
)}
```

### Benefits

✅ **Flexible Plans**: Create unlimited plan variations
✅ **Easy Upgrades**: Enable features without code changes
✅ **Revenue Control**: Charge more for premium features
✅ **Clean UI**: Users only see what they can use

---

## 💰 POS Interface

### Features

✅ **Fast Product Search**: Search by name, SKU, barcode
✅ **Barcode Scanner Support**: Instant product lookup
✅ **Multi-Unit Selection**: Choose unit at cart time
✅ **Cart Management**: Add, remove, adjust quantities
✅ **Hold Orders**: Save cart for later
✅ **Customer Selection**: Attach customer to sale
✅ **Discounts**: Percentage or fixed amount
✅ **Multi-Payment**: Pay with cash + card
✅ **Quick Checkout**: Complete sale in seconds
✅ **Daily Summary**: End-of-day reporting

### Workflow

1. **Search Product**: Type name or scan barcode
2. **Select Unit**: Choose selling unit (kg, g, piece, etc.)
3. **Add to Cart**: Product appears in cart
4. **Adjust Quantity**: Increase/decrease as needed
5. **Apply Discount**: Optional sale-wide or per-item
6. **Select Customer**: Optional loyalty tracking
7. **Choose Payment**: Cash, card, mobile, or mixed
8. **Complete Sale**: Generate receipt & update inventory

### Keyboard Shortcuts

- `Ctrl + F`: Focus search
- `Ctrl + H`: Hold order
- `Ctrl + K`: Clear cart
- `Enter`: Complete sale

---

## 📦 Inventory Management

### Features

✅ **Stock In/Out**: Add or remove inventory
✅ **Automatic Stock Deduction**: On every sale
✅ **Low Stock Alerts**: Notifications when stock is low
✅ **Stock Movements History**: Complete audit trail
✅ **Expiration Tracking**: Alerts for expiring products
✅ **Multi-Unit Compatible**: Track stock in any unit
✅ **Supplier Management**: Link products to suppliers
✅ **Purchase Orders**: Create POs for restocking
✅ **Stock Valuation**: Calculate inventory value

### Stock Movement Types

- **Purchase**: Received from supplier
- **Sale**: Sold to customer (automatic)
- **Return**: Customer returned product
- **Adjustment**: Manual correction
- **Transfer**: Between branches
- **Damage**: Damaged/unsellable
- **Expiry**: Expired products removed

### Stock Alerts

System automatically flags:
- **Low Stock**: Below minimum threshold
- **Out of Stock**: Zero quantity
- **Expiring Soon**: Products expiring in 7 days

---

## 👥 Customer Management

### Features

✅ **Customer Profiles**: Complete customer information
✅ **Purchase History**: Track all transactions
✅ **Loyalty Points**: Earn points on purchases (1 point per TND)
✅ **Loyalty Tiers**: Bronze, Silver, Gold, Platinum
✅ **Credit Management**: Allow credit purchases
✅ **Debt Tracking**: Monitor unpaid balances
✅ **Customer Stats**: Total spent, average order value
✅ **Marketing Consent**: Email/SMS opt-in
✅ **Birthday Tracking**: For promotions

### Loyalty System

#### Points Calculation

- 1 TND spent = 1 loyalty point
- Points can be redeemed for discounts

#### Loyalty Tiers

| Tier | Points Required | Benefits |
|------|----------------|----------|
| Bronze | 0 - 1,999 | Base rewards |
| Silver | 2,000 - 4,999 | 5% discount |
| Gold | 5,000 - 9,999 | 10% discount + priority |
| Platinum | 10,000+ | 15% discount + VIP service |

### Credit Management

Enable "Allow Credit" for trusted customers:
- Set credit limit
- Track current debt
- Payment history
- Automated reminders

---

## 📊 Analytics & Reporting

### Available Reports

#### Sales Reports
- Daily/Weekly/Monthly sales
- Sales by product
- Sales by category
- Sales by staff member
- Sales by customer
- Hourly sales distribution

#### Financial Reports
- Revenue reports
- Profit margins
- Tax reports
- Payment method breakdown
- Discount analysis

#### Inventory Reports
- Stock levels
- Low stock items
- Stock movements
- Inventory valuation
- Supplier performance

#### Customer Reports
- Customer purchase history
- Top customers
- Customer retention
- Loyalty program stats

### Export Options

- **PDF**: Formatted reports
- **Excel**: For further analysis
- **CSV**: Raw data export

### Real-Time Dashboard

View live stats:
- Today's revenue
- Today's sales count
- Active products
- Low stock alerts
- Recent transactions

---

## 💳 Payment Methods

### Supported Methods

#### Cash
Traditional cash payment

#### Card
Credit/Debit card payment

#### Tunisian Mobile Wallets
- **D17**: Popular Tunisian payment gateway
- **Flouci**: Mobile wallet payment
- **Edinar**: E-payment gateway

#### Bank Transfer
For wholesale/B2B customers

#### Credit
Allow customers to pay later (if enabled)

### Multi-Payment Support

Split payment across multiple methods:

Example:
- Customer pays 50 TND cash
- Customer pays 30 TND by card
- Total: 80 TND

---

## 🌍 Multi-Language Support

### Supported Languages

- **French (FR)**: Default language
- **Arabic (AR)**: Full RTL support
- **English (EN)**: For international users

### RTL (Right-to-Left) Support

When Arabic is selected:
- Interface flips to RTL
- Arabic fonts (Cairo)
- Proper text alignment
- Date formats adjusted

### Product Names

Products can have names in multiple languages:
- `name`: French/English name
- `nameAr`: Arabic name

POS displays both languages.

### Currency & Formats

- **Currency**: Tunisian Dinar (TND)
- **Date Format**: DD/MM/YYYY
- **Time Format**: 24h or 12h
- **Number Format**: European (1.234,56)

---

## 🔔 Notifications & Alerts

### Email Notifications

- Low stock alerts
- Product expiry warnings
- Daily sales summary
- Customer receipts
- Password reset

### SMS Notifications

(If enabled and configured)
- Order confirmations
- Delivery updates
- Payment reminders

### In-App Notifications

- Real-time alerts
- System messages
- Updates available

---

## 🎨 Customization

### Tenant Branding

Customize your store's appearance:
- **Logo**: Upload store logo
- **Colors**: Primary, secondary, accent colors
- **Receipt Header/Footer**: Custom text
- **Custom Domain**: Use your own domain

### Receipt Customization

(If enabled in plan)
- Add QR codes
- Custom templates
- Multilingual receipts
- Promotional messages

---

## 🔒 Security Features

### Authentication
- JWT access tokens (15 min expiry)
- Refresh tokens (7 days)
- Password hashing (Bcrypt)
- Rate limiting on auth endpoints

### Data Protection
- Tenant data isolation
- Encrypted passwords
- Audit logging
- Regular backups

### Access Control
- Role-based permissions
- Feature-based access
- Session management
- Automatic logout

---

## 🚀 Performance Features

### Optimizations
- Database indexing
- Query optimization
- Lazy loading
- Code splitting
- Image optimization
- Response compression

### Caching
- API response caching
- Static asset caching
- Database query caching

---

## 📱 Mobile Responsiveness

### Fully Responsive Design

✅ Works on all screen sizes:
- Desktops
- Tablets
- Phones

✅ Touch-optimized:
- Large buttons
- Swipe gestures
- Mobile-first POS

✅ Progressive Web App ready:
- Can be installed
- Works offline (limited)
- App-like experience

---

## 🎯 Future Features (Roadmap)

### Coming Soon

- [ ] Mobile apps (iOS/Android)
- [ ] Online ordering integration
- [ ] Kitchen Display System (KDS)
- [ ] Table management (for restaurants)
- [ ] Delivery management
- [ ] Advanced ML predictions
- [ ] Multi-currency support
- [ ] Accounting integration
- [ ] E-commerce storefront
- [ ] API marketplace

---

**Last Updated**: November 2025
