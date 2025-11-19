import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'

// Layouts
import DashboardLayout from './layouts/DashboardLayout'
import POSLayout from './layouts/POSLayout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard Pages
import TenantDashboard from './pages/dashboard/TenantDashboard'
import SuperAdminDashboard from './pages/dashboard/SuperAdminDashboard'

// Product Pages
import ProductList from './pages/products/ProductList'
import ProductForm from './pages/products/ProductForm'

// POS
import POSScreen from './pages/pos/POSScreen'

// Sales
import SalesList from './pages/sales/SalesList'

// Customers
import CustomerList from './pages/customers/CustomerList'

// Staff
import StaffList from './pages/staff/StaffList'

// Settings
import Settings from './pages/settings/Settings'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { checkAuth, isLoading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - POS */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <POSLayout>
                  <POSScreen />
                </POSLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TenantDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Super Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <DashboardLayout>
                  <SuperAdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Products */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductForm />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Sales */}
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SalesList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Customers */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CustomerList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Staff */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StaffList />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App
