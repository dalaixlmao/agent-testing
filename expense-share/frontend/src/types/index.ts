export interface User {
  id: number
  name: string
  email: string
  imageUrl?: string
  provider: string
  roles: string[]
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
}

export interface ShareDetail {
  userId: number
  shareAmount: number
}

export interface ExpenseRequest {
  description: string
  amount: number
  expenseDate: string
  category?: string
  notes?: string
  shares: ShareDetail[]
}

export interface ShareResponse {
  id: number
  user: User
  shareAmount: number
  settled: boolean
}

export interface Expense {
  id: number
  description: string
  amount: number
  paidBy: User
  shares: ShareResponse[]
  expenseDate: string
  category?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Settlement {
  from: User
  to: User
  amount: number
}
