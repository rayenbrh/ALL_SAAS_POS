import { useEffect, useState } from 'react'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function SalesList() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    fetchSales()
  }, [dateRange])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const response = await api.get(
        `/api/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      setSales(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch sales')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sales History</h1>
      </div>

      {/* Date Filter */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button onClick={fetchSales} className="btn btn-primary w-full">
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Sale #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Cashier</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id}>
                    <td className="font-medium">{sale.saleNumber}</td>
                    <td>{format(new Date(sale.saleDate), 'dd/MM/yyyy HH:mm')}</td>
                    <td>
                      {sale.customer
                        ? `${sale.customer.firstName} ${sale.customer.lastName}`
                        : 'Walk-in'}
                    </td>
                    <td>{sale.items.length}</td>
                    <td className="font-semibold">{sale.total.toFixed(2)} TND</td>
                    <td>
                      {sale.payments.map((p) => p.method).join(', ')}
                    </td>
                    <td>{sale.cashier?.firstName || sale.cashierName}</td>
                    <td>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sale.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
