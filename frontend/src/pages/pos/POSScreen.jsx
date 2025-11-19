import { useEffect, useState } from 'react'
import { usePOSStore } from '../../store/posStore'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { MagnifyingGlassIcon, TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function POSScreen() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState({})

  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    discount,
    setDiscount,
  } = usePOSStore()

  useEffect(() => {
    if (search.length > 2) {
      searchProducts()
    } else {
      setProducts([])
    }
  }, [search])

  const searchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/pos/products/search?q=${search}`)
      setProducts(response.data.data.products)
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product) => {
    const unit = selectedUnit[product._id] || product.baseUnit
    addToCart(product, 1, unit)
    setSearch('')
    setProducts([])
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
        })),
        payments: [
          {
            method: 'cash',
            amount: calculateTotal(),
            status: 'completed',
          },
        ],
        discount,
      }

      await api.post('/api/pos/sale', saleData)
      toast.success('Sale completed successfully!')
      clearCart()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Sale failed')
    }
  }

  const subtotal = calculateSubtotal()
  const total = calculateTotal()

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Left Side - Products */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU, or barcode..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>

        {/* Product Results */}
        <div className="space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          )}

          {products.map((product) => (
            <div
              key={product._id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 cursor-pointer transition-colors"
              onClick={() => handleAddToCart(product)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {product.sku} | Stock: {product.stock.quantity} {product.baseUnit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {product.price.toFixed(2)} TND
                  </p>
                  <p className="text-xs text-gray-500">per {product.baseUnit}</p>
                </div>
              </div>

              {/* Unit Selector */}
              {product.allowedUnits && product.allowedUnits.length > 0 && (
                <div className="mt-2 flex gap-2">
                  {product.allowedUnits.map((unit) => (
                    <button
                      key={unit}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedUnit({ ...selectedUnit, [product._id]: unit })
                      }}
                      className={`px-2 py-1 text-xs rounded ${
                        (selectedUnit[product._id] || product.baseUnit) === unit
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Cart */}
      <div className="w-96 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Sale</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Cart is empty. Search and add products.
            </div>
          ) : (
            cart.map((item, index) => (
              <div
                key={`${item.productId}-${item.unit}-${index}`}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {item.price.toFixed(2)} TND / {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId, item.unit)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.unit, item.quantity - 1)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.unit, item.quantity + 1)}
                      className="p-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(item.price * item.quantity).toFixed(2)} TND
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium">{subtotal.toFixed(2)} TND</span>
          </div>

          {discount && (
            <div className="flex justify-between text-sm text-red-600">
              <span>Discount ({discount.type === 'percentage' ? `${discount.value}%` : `${discount.value} TND`})</span>
              <span>
                -{((discount.type === 'percentage' ? (subtotal * discount.value) / 100 : discount.value)).toFixed(2)} TND
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-700">
            <span>Total</span>
            <span className="text-primary-600">{total.toFixed(2)} TND</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full btn btn-primary py-3 text-lg"
          >
            Complete Sale
          </button>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="w-full btn btn-secondary"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  )
}
