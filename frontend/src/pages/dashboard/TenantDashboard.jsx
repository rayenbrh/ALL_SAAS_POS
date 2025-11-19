import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'
import {
  BanknotesIcon,
  ShoppingBagIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function TenantDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/tenant/dashboard')
      setStats(response.data.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  const statCards = [
    {
      name: t('todayRevenue'),
      value: `${(stats?.todayRevenue || 0).toFixed(2)} TND`,
      icon: BanknotesIcon,
      color: 'bg-green-500',
    },
    {
      name: t('todaySales'),
      value: stats?.todaySales || 0,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      name: t('totalProducts'),
      value: stats?.totalProducts || 0,
      icon: CubeIcon,
      color: 'bg-purple-500',
    },
    {
      name: t('lowStock'),
      value: stats?.lowStockProducts || 0,
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('welcome')} back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/pos" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            New Sale
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Open the POS to make a new sale
          </p>
        </Link>

        <Link to="/products/new" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Add Product
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add a new product to your inventory
          </p>
        </Link>

        <Link to="/sales" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            View Reports
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check your sales reports and analytics
          </p>
        </Link>
      </div>
    </div>
  )
}
