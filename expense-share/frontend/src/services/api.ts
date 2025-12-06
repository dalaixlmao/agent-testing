import axios from 'axios'
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  Expense,
  ExpenseRequest,
  Settlement,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data),

  signup: (data: SignupRequest) =>
    api.post<AuthResponse>('/auth/signup', data),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),
}

export const userApi = {
  getAllUsers: () =>
    api.get<User[]>('/users'),

  searchUsers: (query: string) =>
    api.get<User[]>('/users/search', { params: { query } }),

  getUserById: (userId: number) =>
    api.get<User>(`/users/${userId}`),
}

export const expenseApi = {
  createExpense: (data: ExpenseRequest) =>
    api.post<Expense>('/expenses', data),

  getAllExpenses: () =>
    api.get<Expense[]>('/expenses'),

  getExpenseById: (expenseId: number) =>
    api.get<Expense>(`/expenses/${expenseId}`),

  updateExpense: (expenseId: number, data: ExpenseRequest) =>
    api.put<Expense>(`/expenses/${expenseId}`, data),

  deleteExpense: (expenseId: number) =>
    api.delete(`/expenses/${expenseId}`),
}

export const settlementApi = {
  getSettlements: () =>
    api.get<Settlement[]>('/settlements'),

  getAllSettlements: () =>
    api.get<Settlement[]>('/settlements/all'),

  getSettlementWithUser: (userId: number) =>
    api.get<Settlement>(`/settlements/with/${userId}`),
}

export default api
