require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User.model');
const Tenant = require('../models/Tenant.model');
const SubscriptionPlan = require('../models/SubscriptionPlan.model');
const Product = require('../models/Product.model');
const Category = require('../models/Category.model');
const { USER_ROLES, SUBSCRIPTION_STATUS, FEATURES } = require('../config/constants');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Clearing existing data...');
    await User.deleteMany({});
    await Tenant.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('📦 Creating subscription plans...');
    const plans = await SubscriptionPlan.create([
      {
        name: 'Starter',
        slug: 'starter',
        description: 'Perfect for small businesses just getting started',
        price: 49,
        billingCycle: 'monthly',
        trialDays: 14,
        features: {
          [FEATURES.ANALYTICS]: true,
          [FEATURES.MULTI_UNIT]: true,
          [FEATURES.BRANCHES]: false,
          [FEATURES.STAFF_MANAGEMENT]: true,
          [FEATURES.DISCOUNTS]: true,
          [FEATURES.LOYALTY]: false,
          [FEATURES.CUSTOM_BRANDING]: false,
          [FEATURES.EXPORTING]: true,
          [FEATURES.STOCK_ALERTS]: true,
          [FEATURES.EXPIRATION_TRACKING]: true,
        },
        limits: {
          maxProducts: 100,
          maxStaff: 3,
          maxBranches: 1,
          maxCustomers: 500,
          maxTransactionsPerMonth: 500,
          storageLimit: 500,
        },
        isActive: true,
        isPublic: true,
        displayOrder: 1,
      },
      {
        name: 'Professional',
        slug: 'professional',
        description: 'For growing businesses with advanced needs',
        price: 99,
        billingCycle: 'monthly',
        trialDays: 14,
        features: {
          [FEATURES.ANALYTICS]: true,
          [FEATURES.MULTI_UNIT]: true,
          [FEATURES.BRANCHES]: true,
          [FEATURES.STAFF_MANAGEMENT]: true,
          [FEATURES.DISCOUNTS]: true,
          [FEATURES.LOYALTY]: true,
          [FEATURES.CUSTOM_BRANDING]: true,
          [FEATURES.EXPORTING]: true,
          [FEATURES.STOCK_ALERTS]: true,
          [FEATURES.EXPIRATION_TRACKING]: true,
          [FEATURES.CUSTOMER_CREDIT]: true,
        },
        limits: {
          maxProducts: 500,
          maxStaff: 10,
          maxBranches: 3,
          maxCustomers: 2000,
          maxTransactionsPerMonth: 2000,
          storageLimit: 2000,
        },
        isPopular: true,
        isActive: true,
        isPublic: true,
        displayOrder: 2,
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        description: 'Unlimited everything for large businesses',
        price: 199,
        billingCycle: 'monthly',
        trialDays: 14,
        features: Object.keys(FEATURES).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
        limits: {
          maxProducts: -1,
          maxStaff: -1,
          maxBranches: -1,
          maxCustomers: -1,
          maxTransactionsPerMonth: -1,
          storageLimit: -1,
        },
        isActive: true,
        isPublic: true,
        displayOrder: 3,
      },
    ]);

    console.log('👤 Creating super admin...');
    const superAdmin = await User.create({
      email: 'superadmin@platform.com',
      password: 'SuperAdmin@2024',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+21612345678',
      role: USER_ROLES.SUPER_ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    console.log('🏢 Creating demo tenants...');
    const tenant1 = await Tenant.create({
      businessName: 'Épicerie Moderne',
      subdomain: 'epicerie',
      email: 'admin@epicerie.tn',
      phone: '+21612345679',
      businessType: 'grocery',
      address: {
        street: '15 Avenue Habib Bourguiba',
        city: 'Tunis',
        governorate: 'Tunis',
        country: 'Tunisia',
      },
      subscription: {
        planId: plans[1]._id,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: plans[1].features,
        limits: plans[1].limits,
      },
      createdBy: superAdmin._id,
    });

    const tenant1Admin = await User.create({
      tenantId: tenant1._id,
      email: 'admin@epicerie.tn',
      password: 'Admin@123',
      firstName: 'Mohamed',
      lastName: 'Ben Ali',
      phone: '+21612345679',
      role: USER_ROLES.TENANT_ADMIN,
      isActive: true,
      isEmailVerified: true,
    });

    // Create categories
    const categories = await Category.create([
      { tenantId: tenant1._id, name: 'Fruits & Légumes', nameAr: 'الفواكه والخضروات', slug: 'fruits-legumes', icon: '🥬', color: '#10b981' },
      { tenantId: tenant1._id, name: 'Pain & Pâtisserie', nameAr: 'الخبز والمعجنات', slug: 'pain-patisserie', icon: '🍞', color: '#f59e0b' },
      { tenantId: tenant1._id, name: 'Produits Laitiers', nameAr: 'منتجات الألبان', slug: 'produits-laitiers', icon: '🥛', color: '#3b82f6' },
      { tenantId: tenant1._id, name: 'Épicerie', nameAr: 'البقالة', slug: 'epicerie', icon: '🏪', color: '#8b5cf6' },
    ]);

    // Create sample products with multi-unit system
    await Product.create([
      {
        tenantId: tenant1._id,
        name: 'Farine',
        nameAr: 'دقيق',
        sku: 'PROD-001',
        barcode: '6191234567890',
        category: categories[3]._id,
        baseUnit: 'kg',
        unitType: 'weight',
        price: 2.5,
        cost: 1.8,
        allowedUnits: ['kg', 'g', 'cup', 'pack'],
        unitConversions: [
          { unit: 'g', conversionFactor: 0.001 },
          { unit: 'cup', conversionFactor: 0.18 },
          { unit: 'pack', conversionFactor: 1 },
        ],
        stock: { quantity: 100, unit: 'kg', minStock: 20 },
        isActive: true,
      },
      {
        tenantId: tenant1._id,
        name: 'Lait',
        nameAr: 'حليب',
        sku: 'PROD-002',
        barcode: '6191234567891',
        category: categories[2]._id,
        baseUnit: 'l',
        unitType: 'volume',
        price: 3.2,
        cost: 2.5,
        allowedUnits: ['l', 'ml', 'bottle'],
        unitConversions: [
          { unit: 'ml', conversionFactor: 0.001 },
          { unit: 'bottle', conversionFactor: 1 },
        ],
        stock: { quantity: 50, unit: 'l', minStock: 10 },
        isActive: true,
      },
      {
        tenantId: tenant1._id,
        name: 'Tomates',
        nameAr: 'طماطم',
        sku: 'PROD-003',
        barcode: '6191234567892',
        category: categories[0]._id,
        baseUnit: 'kg',
        unitType: 'weight',
        price: 1.8,
        cost: 1.2,
        allowedUnits: ['kg', 'g'],
        unitConversions: [
          { unit: 'g', conversionFactor: 0.001 },
        ],
        stock: { quantity: 75, unit: 'kg', minStock: 15 },
        isActive: true,
      },
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@platform.com / SuperAdmin@2024');
    console.log('Tenant Admin: admin@epicerie.tn / Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
