import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        api.get('/api/superadmin/dashboard'),
        api.get('/api/superadmin/tenants?limit=10'),
      ])

      setStats(statsRes.data.data.stats)
      setTenants(tenantsRes.data.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Super Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tenants</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {stats?.totalTenants || 0}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Tenants</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {stats?.activeTenants || 0}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Trial Tenants</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats?.trialTenants || 0}
          </p>
        </div>

        <div className="card p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {(stats?.monthlyRevenue || 0).toFixed(2)} TND
          </p>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="card">
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Tenants
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant._id}>
                  <td className="font-medium">{tenant.businessName}</td>
                  <td>{tenant.email}</td>
                  <td>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tenant.subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tenant.subscription.status}
                    </span>
                  </td>
                  <td>{new Date(tenant.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
