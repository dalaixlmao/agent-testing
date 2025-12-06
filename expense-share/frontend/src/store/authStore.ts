import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  return {
    user,
    token,
    isAuthenticated: !!token,
    setAuth: (user, token) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      set({ user, token, isAuthenticated: true })
    },
    clearAuth: () => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null, isAuthenticated: false })
    },
    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user))
      set({ user })
    },
  }
})
