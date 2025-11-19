// User Roles
const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  TENANT_ADMIN: 'tenant_admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  STOCK_MANAGER: 'stock_manager',
  STAFF: 'staff',
};

// Subscription Status
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

// Billing Cycles
const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
};

// Payment Status
const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  D17: 'd17',
  FLOUCI: 'flouci',
  EDINAR: 'edinar',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT: 'credit',
};

// Transaction Types
const TRANSACTION_TYPES = {
  SALE: 'sale',
  RETURN: 'return',
  EXCHANGE: 'exchange',
};

// Stock Movement Types
const STOCK_MOVEMENT_TYPES = {
  PURCHASE: 'purchase',
  SALE: 'sale',
  RETURN: 'return',
  ADJUSTMENT: 'adjustment',
  TRANSFER: 'transfer',
  DAMAGE: 'damage',
  EXPIRY: 'expiry',
};

// Unit Types
const UNIT_TYPES = {
  WEIGHT: 'weight',
  VOLUME: 'volume',
  PIECE: 'piece',
  CUSTOM: 'custom',
};

// Weight Units
const WEIGHT_UNITS = {
  KG: 'kg',
  G: 'g',
  MG: 'mg',
  TON: 'ton',
};

// Volume Units
const VOLUME_UNITS = {
  L: 'l',
  ML: 'ml',
  CL: 'cl',
  CUP: 'cup',
};

// Piece Units
const PIECE_UNITS = {
  PIECE: 'piece',
  PACK: 'pack',
  BOX: 'box',
  DOZEN: 'dozen',
  CARTON: 'carton',
};

// Discount Types
const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

// Feature Flags
const FEATURES = {
  ANALYTICS: 'analytics',
  MULTI_UNIT: 'multi_unit',
  BRANCHES: 'branches',
  STAFF_MANAGEMENT: 'staff_management',
  DISCOUNTS: 'discounts',
  LOYALTY: 'loyalty',
  CUSTOM_BRANDING: 'custom_branding',
  EXPORTING: 'exporting',
  STOCK_ALERTS: 'stock_alerts',
  EXPIRATION_TRACKING: 'expiration_tracking',
  CUSTOMER_CREDIT: 'customer_credit',
  MULTI_PAYMENT: 'multi_payment',
  RECEIPTS_CUSTOMIZATION: 'receipts_customization',
  API_ACCESS: 'api_access',
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  HOLD: 'hold',
};

// Languages
const LANGUAGES = {
  AR: 'ar',
  FR: 'fr',
  EN: 'en',
};

// Currencies
const CURRENCIES = {
  TND: 'TND',
  EUR: 'EUR',
  USD: 'USD',
};

// Default Values
const DEFAULTS = {
  CURRENCY: 'TND',
  LANGUAGE: 'fr',
  TIMEZONE: 'Africa/Tunis',
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  VAT_RATE: 19, // Tunisia VAT rate: 19%
  TRIAL_DAYS: 14,
  TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  MIN_STOCK_ALERT: 10,
};

// File Upload
const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
};

// Tunisian Governorates
const GOVERNORATES = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
];

module.exports = {
  USER_ROLES,
  SUBSCRIPTION_STATUS,
  BILLING_CYCLES,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  STOCK_MOVEMENT_TYPES,
  UNIT_TYPES,
  WEIGHT_UNITS,
  VOLUME_UNITS,
  PIECE_UNITS,
  DISCOUNT_TYPES,
  FEATURES,
  ORDER_STATUS,
  LANGUAGES,
  CURRENCIES,
  DEFAULTS,
  UPLOAD,
  GOVERNORATES,
};
