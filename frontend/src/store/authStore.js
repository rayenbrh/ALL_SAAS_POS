import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/api/auth/login', { email, password })
          const { user, tenant, accessToken, refreshToken } = response.data.data

          set({
            user,
            tenant,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Login successful!')
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.error || 'Login failed')
          return false
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/api/auth/register', data)
          const { user, tenant, accessToken, refreshToken } = response.data.data

          set({
            user,
            tenant,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })

          toast.success('Registration successful!')
          return true
        } catch (error) {
          set({ isLoading: false })
          toast.error(error.response?.data?.error || 'Registration failed')
          return false
        }
      },

      logout: async () => {
        try {
          await api.post('/api/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        }

        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })

        toast.success('Logged out successfully')
      },

      checkAuth: async () => {
        const { accessToken } = get()

        if (!accessToken) {
          set({ isAuthenticated: false, isLoading: false })
          return
        }

        try {
          const response = await api.get('/api/auth/me')
          const { user, tenant } = response.data.data

          set({ user, tenant, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({
            user: null,
            tenant: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()

        if (!refreshToken) {
          return false
        }

        try {
          const response = await api.post('/api/auth/refresh', { refreshToken })
          const { accessToken: newAccessToken } = response.data.data

          set({ accessToken: newAccessToken })
          return true
        } catch (error) {
          set({
            user: null,
            tenant: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
          return false
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
