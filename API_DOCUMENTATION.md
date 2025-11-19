# 📚 API Documentation

Complete API documentation for the SaaS POS & Inventory Management Platform.

## Base URL

```
http://localhost:5000/api    (Development)
https://your-domain.com/api  (Production)
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to obtain a new access token:

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

---

## 🔐 Authentication Endpoints

### Register New Tenant

Create a new tenant account with admin user.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "businessName": "My Store",
  "subdomain": "mystore",
  "email": "admin@mystore.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+21612345678",
  "businessType": "grocery"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "...",
      "email": "admin@mystore.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tenant_admin",
      "tenantId": "..."
    },
    "tenant": {
      "id": "...",
      "businessName": "My Store",
      "subdomain": "mystore",
      "subscription": {
        "status": "trial",
        "trialEndsAt": "2024-02-15T..."
      }
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "admin@mystore.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "tenant": { ... },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "user": { ... },
    "tenant": { ... }
  }
}
```

---

## 🏪 POS Endpoints

### Create Sale

Complete a sale transaction with cart items and payment.

**Endpoint:** `POST /api/pos/sale`
**Auth:** Required
**Roles:** tenant_admin, manager, cashier, staff

**Request Body:**
```json
{
  "items": [
    {
      "productId": "648a1b2c3d4e5f6g7h8i9j0k",
      "quantity": 2,
      "unit": "kg",
      "notes": "Customer preference"
    },
    {
      "productId": "748a1b2c3d4e5f6g7h8i9j0k",
      "quantity": 1,
      "unit": "piece"
    }
  ],
  "customer": "548a1b2c3d4e5f6g7h8i9j0k",
  "payments": [
    {
      "method": "cash",
      "amount": 50.00
    }
  ],
  "discount": {
    "type": "percentage",
    "value": 10,
    "reason": "Loyal customer"
  },
  "notes": "Express delivery requested"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Sale completed successfully",
  "data": {
    "sale": {
      "id": "...",
      "saleNumber": "SL2401001",
      "items": [...],
      "subtotal": 55.00,
      "discountAmount": 5.50,
      "taxAmount": 9.31,
      "total": 58.81,
      "amountPaid": 60.00,
      "change": 1.19,
      "status": "completed",
      "saleDate": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Search Products for POS

**Endpoint:** `GET /api/pos/products/search`
**Auth:** Required

**Query Parameters:**
- `q` - Search term (name, SKU, barcode)
- `barcode` - Search by barcode only

**Example:**
```http
GET /api/pos/products/search?q=milk
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "...",
        "name": "Lait",
        "nameAr": "حليب",
        "sku": "PROD-002",
        "barcode": "6191234567891",
        "price": 3.20,
        "baseUnit": "l",
        "allowedUnits": ["l", "ml", "bottle"],
        "unitConversions": [...],
        "stock": {
          "quantity": 50,
          "unit": "l"
        },
        "isActive": true
      }
    ]
  }
}
```

### Hold Order

Save current cart for later retrieval.

**Endpoint:** `POST /api/pos/hold-order`
**Auth:** Required

**Request Body:**
```json
{
  "items": [...],
  "customer": "548a1b2c3d4e5f6g7h8i9j0k",
  "notes": "Customer will return in 30 minutes"
}
```

**Response:** `201 Created`

### Get Held Orders

**Endpoint:** `GET /api/pos/held-orders`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Held orders retrieved successfully",
  "data": {
    "sales": [
      {
        "id": "...",
        "items": [...],
        "customer": { ... },
        "heldAt": "2024-01-15T10:25:00Z",
        "notes": "..."
      }
    ]
  }
}
```

### Retrieve Held Order

**Endpoint:** `POST /api/pos/retrieve-order/:id`
**Auth:** Required

**Response:** `200 OK`

### Daily Summary

Get today's sales summary for POS.

**Endpoint:** `GET /api/pos/daily-summary`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Daily summary retrieved successfully",
  "data": {
    "summary": {
      "totalSales": 45,
      "totalRevenue": 1250.50,
      "totalDiscount": 125.00,
      "totalTax": 237.60,
      "cashSales": 30,
      "cardSales": 15
    }
  }
}
```

---

## 📦 Product Endpoints

### Get All Products

**Endpoint:** `GET /api/products`
**Auth:** Required

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search term
- `category` - Filter by category ID
- `isActive` - Filter by status (true/false)

**Example:**
```http
GET /api/products?page=1&limit=20&search=milk&isActive=true
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "pageSize": 20,
    "totalItems": 95,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Single Product

**Endpoint:** `GET /api/products/:id`
**Auth:** Required

**Response:** `200 OK`

### Create Product

**Endpoint:** `POST /api/products`
**Auth:** Required
**Roles:** tenant_admin, manager

**Request Body:**
```json
{
  "name": "Farine Blanche",
  "nameAr": "دقيق أبيض",
  "description": "High quality white flour",
  "sku": "PROD-101",
  "barcode": "6191234567890",
  "category": "648a1b2c3d4e5f6g7h8i9j0k",
  "baseUnit": "kg",
  "unitType": "weight",
  "price": 2.50,
  "cost": 1.80,
  "allowedUnits": ["kg", "g", "cup", "pack"],
  "unitConversions": [
    { "unit": "g", "conversionFactor": 0.001 },
    { "unit": "cup", "conversionFactor": 0.18 },
    { "unit": "pack", "conversionFactor": 1 }
  ],
  "stock": {
    "quantity": 100,
    "unit": "kg",
    "minStock": 20,
    "maxStock": 500
  },
  "taxable": true,
  "taxRate": 19,
  "isActive": true
}
```

**Response:** `201 Created`

### Update Product

**Endpoint:** `PUT /api/products/:id`
**Auth:** Required
**Roles:** tenant_admin, manager

**Request Body:** Same as create (partial updates allowed)

**Response:** `200 OK`

### Delete Product

**Endpoint:** `DELETE /api/products/:id`
**Auth:** Required
**Roles:** tenant_admin, manager

**Response:** `200 OK`

### Get Low Stock Products

**Endpoint:** `GET /api/products/low-stock`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Low stock products retrieved",
  "data": {
    "products": [
      {
        "id": "...",
        "name": "Tomates",
        "stock": {
          "quantity": 8,
          "minStock": 15
        },
        "isLowStock": true
      }
    ]
  }
}
```

---

## 📊 Sales Endpoints

### Get Sales History

**Endpoint:** `GET /api/sales`
**Auth:** Required

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `startDate` - Filter start date (YYYY-MM-DD)
- `endDate` - Filter end date (YYYY-MM-DD)
- `status` - Filter by status

**Example:**
```http
GET /api/sales?startDate=2024-01-01&endDate=2024-01-31&status=completed
```

**Response:** `200 OK` (Paginated)

### Get Single Sale

**Endpoint:** `GET /api/sales/:id`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Sale retrieved successfully",
  "data": {
    "sale": {
      "id": "...",
      "saleNumber": "SL2401001",
      "items": [
        {
          "product": { ... },
          "productName": "Lait",
          "quantity": 2,
          "unit": "l",
          "unitPrice": 3.20,
          "total": 6.40
        }
      ],
      "customer": { ... },
      "cashier": { ... },
      "subtotal": 55.00,
      "discountAmount": 5.50,
      "taxAmount": 9.31,
      "total": 58.81,
      "payments": [...],
      "saleDate": "2024-01-15T10:30:00Z",
      "status": "completed"
    }
  }
}
```

---

## 📈 Analytics Endpoints

### Sales Analytics

**Endpoint:** `GET /api/analytics/sales`
**Auth:** Required
**Roles:** tenant_admin, manager

**Query Parameters:**
- `startDate` - Start date (required)
- `endDate` - End date (required)

**Example:**
```http
GET /api/analytics/sales?startDate=2024-01-01&endDate=2024-01-31
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Analytics retrieved",
  "data": {
    "sales": [
      {
        "_id": "2024-01-15",
        "totalRevenue": 1250.50,
        "totalSales": 45,
        "totalDiscount": 125.00
      },
      ...
    ]
  }
}
```

### Product Performance

**Endpoint:** `GET /api/analytics/products`
**Auth:** Required
**Roles:** tenant_admin, manager

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Product performance retrieved",
  "data": {
    "products": [
      {
        "name": "Lait",
        "sku": "PROD-002",
        "totalSold": 150,
        "totalRevenue": 480.00
      },
      ...
    ]
  }
}
```

---

## 👥 Customer Endpoints

### Get All Customers

**Endpoint:** `GET /api/customers`
**Auth:** Required

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name, phone, email

**Response:** `200 OK` (Paginated)

### Get Single Customer

**Endpoint:** `GET /api/customers/:id`
**Auth:** Required

**Response:** `200 OK`

### Create Customer

**Endpoint:** `POST /api/customers`
**Auth:** Required

**Request Body:**
```json
{
  "firstName": "Ahmed",
  "lastName": "Ben Ali",
  "phone": "+21612345678",
  "email": "ahmed@email.com",
  "address": {
    "street": "123 Rue Habib Bourguiba",
    "city": "Tunis",
    "governorate": "Tunis",
    "country": "Tunisia"
  },
  "type": "retail",
  "allowCredit": false,
  "creditLimit": 0
}
```

**Response:** `201 Created`

### Update Customer

**Endpoint:** `PUT /api/customers/:id`
**Auth:** Required

**Response:** `200 OK`

### Delete Customer

**Endpoint:** `DELETE /api/customers/:id`
**Auth:** Required
**Roles:** tenant_admin, manager

**Response:** `200 OK`

---

## 👨‍💼 Staff Endpoints

### Get All Staff

**Endpoint:** `GET /api/staff`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK` (Paginated)

### Create Staff Member

**Endpoint:** `POST /api/staff`
**Auth:** Required
**Roles:** tenant_admin

**Request Body:**
```json
{
  "firstName": "Mohamed",
  "lastName": "Salah",
  "email": "mohamed@mystore.com",
  "password": "SecurePass123",
  "phone": "+21612345679",
  "role": "cashier",
  "permissions": {
    "canViewSales": true,
    "canCreateSales": true,
    "canDeleteSales": false,
    "canManageProducts": false,
    "canManageInventory": false,
    "canManageCustomers": true,
    "canViewReports": false,
    "canManageStaff": false,
    "canManageSettings": false,
    "canGiveDiscounts": false,
    "canRefund": false
  }
}
```

**Response:** `201 Created`

### Update Staff Member

**Endpoint:** `PUT /api/staff/:id`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

### Delete Staff Member

**Endpoint:** `DELETE /api/staff/:id`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

---

## 🏢 Tenant Endpoints

### Get Dashboard Stats

**Endpoint:** `GET /api/tenant/dashboard`
**Auth:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Dashboard stats retrieved",
  "data": {
    "stats": {
      "todayRevenue": 1250.50,
      "todaySales": 45,
      "totalProducts": 156,
      "lowStockProducts": 8
    }
  }
}
```

### Get Tenant Settings

**Endpoint:** `GET /api/tenant/settings`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

### Update Tenant Settings

**Endpoint:** `PUT /api/tenant/settings`
**Auth:** Required
**Roles:** tenant_admin

**Request Body:**
```json
{
  "businessName": "My Updated Store",
  "email": "contact@mystore.com",
  "phone": "+21612345678",
  "settings": {
    "currency": "TND",
    "language": "fr",
    "timezone": "Africa/Tunis",
    "taxRate": 19,
    "receiptFooter": "Thank you for your purchase!",
    "lowStockThreshold": 10
  }
}
```

**Response:** `200 OK`

### Update Branding

**Endpoint:** `PUT /api/tenant/settings/branding`
**Auth:** Required
**Roles:** tenant_admin

**Request Body:**
```json
{
  "logo": "https://cloudinary.com/...",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1E40AF",
  "accentColor": "#10B981"
}
```

**Response:** `200 OK`

---

## 👑 Super Admin Endpoints

### Get Dashboard Stats

**Endpoint:** `GET /api/superadmin/dashboard`
**Auth:** Required
**Roles:** super_admin

**Response:** `200 OK`

### Get All Tenants

**Endpoint:** `GET /api/superadmin/tenants`
**Auth:** Required
**Roles:** super_admin

**Query Parameters:**
- `page`, `limit`, `search`, `status`

**Response:** `200 OK` (Paginated)

### Create Tenant

**Endpoint:** `POST /api/superadmin/tenants`
**Auth:** Required
**Roles:** super_admin

**Response:** `201 Created`

### Update Tenant

**Endpoint:** `PUT /api/superadmin/tenants/:id`
**Auth:** Required
**Roles:** super_admin

**Response:** `200 OK`

### Delete Tenant

**Endpoint:** `DELETE /api/superadmin/tenants/:id`
**Auth:** Required
**Roles:** super_admin

**Response:** `200 OK`

### Impersonate Tenant

Login as tenant admin for support purposes.

**Endpoint:** `POST /api/superadmin/impersonate/:id`
**Auth:** Required
**Roles:** super_admin

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Impersonation successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": { ... },
    "tenant": { ... }
  }
}
```

### Get Subscription Plans

**Endpoint:** `GET /api/superadmin/plans`
**Auth:** Required
**Roles:** super_admin

**Response:** `200 OK`

### Create Subscription Plan

**Endpoint:** `POST /api/superadmin/plans`
**Auth:** Required
**Roles:** super_admin

**Request Body:**
```json
{
  "name": "Professional",
  "slug": "professional",
  "description": "For growing businesses",
  "price": 99,
  "billingCycle": "monthly",
  "trialDays": 14,
  "features": {
    "analytics": true,
    "multi_unit": true,
    "branches": true,
    ...
  },
  "limits": {
    "maxProducts": 500,
    "maxStaff": 10,
    "maxBranches": 3,
    ...
  }
}
```

**Response:** `201 Created`

---

## 🏭 Inventory Endpoints

### Stock In

Add stock to product inventory.

**Endpoint:** `POST /api/inventory/stock-in`
**Auth:** Required
**Roles:** tenant_admin, manager, stock_manager

**Request Body:**
```json
{
  "productId": "648a1b2c3d4e5f6g7h8i9j0k",
  "quantity": 50,
  "unit": "kg",
  "unitCost": 1.80,
  "notes": "Supplier: ABC Foods",
  "reference": "PO-2024-001"
}
```

**Response:** `200 OK`

### Stock Out

Remove stock from inventory (for adjustments, damage, etc.).

**Endpoint:** `POST /api/inventory/stock-out`
**Auth:** Required
**Roles:** tenant_admin, manager, stock_manager

**Request Body:**
```json
{
  "productId": "648a1b2c3d4e5f6g7h8i9j0k",
  "quantity": 5,
  "unit": "kg",
  "reason": "damage",
  "notes": "Damaged during transport"
}
```

**Response:** `200 OK`

### Get Stock Movements

**Endpoint:** `GET /api/inventory/movements`
**Auth:** Required
**Roles:** tenant_admin, manager, stock_manager

**Query Parameters:**
- `productId` - Filter by product
- `startDate` - Start date
- `endDate` - End date

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stock movements retrieved",
  "data": {
    "movements": [
      {
        "id": "...",
        "product": { ... },
        "type": "purchase",
        "quantity": 50,
        "unit": "kg",
        "stockBefore": 25,
        "stockAfter": 75,
        "movementDate": "2024-01-15T10:00:00Z",
        "createdBy": { ... }
      }
    ]
  }
}
```

---

## 🏢 Branch Endpoints

*(Only available if tenant has "branches" feature enabled)*

### Get All Branches

**Endpoint:** `GET /api/branches`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

### Create Branch

**Endpoint:** `POST /api/branches`
**Auth:** Required
**Roles:** tenant_admin

**Request Body:**
```json
{
  "name": "Branch Downtown",
  "code": "BR001",
  "email": "downtown@mystore.com",
  "phone": "+21612345680",
  "address": {
    "street": "456 Avenue Habib Bourguiba",
    "city": "Tunis",
    "governorate": "Tunis",
    "country": "Tunisia"
  },
  "manager": "548a1b2c3d4e5f6g7h8i9j0k"
}
```

**Response:** `201 Created`

### Update Branch

**Endpoint:** `PUT /api/branches/:id`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

### Delete Branch

**Endpoint:** `DELETE /api/branches/:id`
**Auth:** Required
**Roles:** tenant_admin

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common Error Codes

- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Rate Limiting

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- POS endpoints: 60 requests per minute

When rate limited, response includes:
```json
{
  "success": false,
  "error": "Too many requests, please try again later."
}
```

---

## Testing

### Using cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@epicerie.tn","password":"Admin@123"}'

# Get products (with auth)
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Import the collection from `/postman/collection.json`
2. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `access_token`: (auto-updated after login)
3. Run requests

---

**API Version:** 1.0.0
**Last Updated:** November 2025
