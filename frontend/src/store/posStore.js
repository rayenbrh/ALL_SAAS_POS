import { create } from 'zustand'
import toast from 'react-hot-toast'

export const usePOSStore = create((set, get) => ({
  cart: [],
  customer: null,
  discount: null,
  notes: '',

  addToCart: (product, quantity, unit) => {
    const { cart } = get()
    const existingItem = cart.find(
      (item) => item.productId === product._id && item.unit === unit
    )

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.productId === product._id && item.unit === unit
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      })
    } else {
      set({
        cart: [
          ...cart,
          {
            productId: product._id,
            product,
            quantity,
            unit,
            price: product.price,
          },
        ],
      })
    }

    toast.success('Item added to cart')
  },

  removeFromCart: (productId, unit) => {
    set({
      cart: get().cart.filter(
        (item) => !(item.productId === productId && item.unit === unit)
      ),
    })
  },

  updateQuantity: (productId, unit, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId, unit)
      return
    }

    set({
      cart: get().cart.map((item) =>
        item.productId === productId && item.unit === unit
          ? { ...item, quantity }
          : item
      ),
    })
  },

  clearCart: () => {
    set({ cart: [], customer: null, discount: null, notes: '' })
  },

  setCustomer: (customer) => {
    set({ customer })
  },

  setDiscount: (discount) => {
    set({ discount })
  },

  setNotes: (notes) => {
    set({ notes })
  },

  calculateSubtotal: () => {
    const { cart } = get()
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  },

  calculateTotal: () => {
    const { cart, discount } = get()
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    if (discount) {
      if (discount.type === 'percentage') {
        subtotal -= (subtotal * discount.value) / 100
      } else {
        subtotal -= discount.value
      }
    }

    return subtotal
  },
}))
