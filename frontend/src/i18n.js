import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Common
      welcome: 'Welcome',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      
      // Dashboard
      dashboard: 'Dashboard',
      todayRevenue: "Today's Revenue",
      todaySales: "Today's Sales",
      totalProducts: 'Total Products',
      lowStock: 'Low Stock',

      // POS
      pos: 'Point of Sale',
      cart: 'Cart',
      addToCart: 'Add to Cart',
      checkout: 'Checkout',
      
      // Products
      products: 'Products',
      productName: 'Product Name',
      price: 'Price',
      stock: 'Stock',
      category: 'Category',
      
      // Others
      customers: 'Customers',
      sales: 'Sales',
      staff: 'Staff',
      settings: 'Settings',
    },
  },
  fr: {
    translation: {
      welcome: 'Bienvenue',
      login: 'Connexion',
      logout: 'Déconnexion',
      register: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      submit: 'Soumettre',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      search: 'Rechercher',
      
      dashboard: 'Tableau de bord',
      todayRevenue: "Revenu d'aujourd'hui",
      todaySales: "Ventes d'aujourd'hui",
      totalProducts: 'Total des produits',
      lowStock: 'Stock faible',

      pos: 'Point de vente',
      cart: 'Panier',
      addToCart: 'Ajouter au panier',
      checkout: 'Passer la commande',
      
      products: 'Produits',
      productName: 'Nom du produit',
      price: 'Prix',
      stock: 'Stock',
      category: 'Catégorie',
      
      customers: 'Clients',
      sales: 'Ventes',
      staff: 'Personnel',
      settings: 'Paramètres',
    },
  },
  ar: {
    translation: {
      welcome: 'مرحبا',
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      register: 'التسجيل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'إرسال',
      cancel: 'إلغاء',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      search: 'بحث',
      
      dashboard: 'لوحة القيادة',
      todayRevenue: 'إيرادات اليوم',
      todaySales: 'مبيعات اليوم',
      totalProducts: 'إجمالي المنتجات',
      lowStock: 'مخزون منخفض',

      pos: 'نقطة البيع',
      cart: 'السلة',
      addToCart: 'إضافة إلى السلة',
      checkout: 'الدفع',
      
      products: 'المنتجات',
      productName: 'اسم المنتج',
      price: 'السعر',
      stock: 'المخزون',
      category: 'الفئة',
      
      customers: 'العملاء',
      sales: 'المبيعات',
      staff: 'الموظفين',
      settings: 'الإعدادات',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'fr',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
