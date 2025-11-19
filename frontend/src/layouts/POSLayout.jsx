import { Link } from 'react-router-dom'
import { HomeIcon } from '@heroicons/react/24/outline'

export default function POSLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">Point of Sale</h1>
          <Link
            to="/dashboard"
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
          >
            <HomeIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4">{children}</main>
    </div>
  )
}
