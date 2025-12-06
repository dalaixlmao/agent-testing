import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/authStore'
import { expenseApi, settlementApi } from '@/services/api'
import type { Expense, Settlement } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, LogOut, ArrowRight, TrendingUp, TrendingDown, Receipt } from 'lucide-react'
import AddExpenseDialog from '@/components/AddExpenseDialog'
import ExpenseList from '@/components/ExpenseList'

export default function Dashboard() {
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddExpense, setShowAddExpense] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    try {
      const [expensesRes, settlementsRes] = await Promise.all([
        expenseApi.getAllExpenses(),
        settlementApi.getSettlements(),
      ])
      setExpenses(expensesRes.data)
      setSettlements(settlementsRes.data)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const calculateTotals = () => {
    const totalPaid = expenses
      .filter((e) => e.paidBy.id === user?.id)
      .reduce((sum, e) => sum + e.amount, 0)

    const totalOwed = expenses
      .flatMap((e) => e.shares)
      .filter((s) => s.user.id === user?.id)
      .reduce((sum, s) => sum + s.shareAmount, 0)

    return { totalPaid, totalOwed, balance: totalPaid - totalOwed }
  }

  const { totalPaid, totalOwed, balance } = calculateTotals()

  const myDebts = settlements.filter((s) => s.from.id === user?.id)
  const owedToMe = settlements.filter((s) => s.to.id === user?.id)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Receipt className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Expense Share</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">Money you've paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOwed)}</div>
              <p className="text-xs text-muted-foreground">Money you owe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance</CardTitle>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(balance))}
              </div>
              <p className="text-xs text-muted-foreground">
                {balance >= 0 ? 'You are owed' : 'You owe'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Settlements</CardTitle>
                    <CardDescription>Who owes whom</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {myDebts.length === 0 && owedToMe.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No settlements yet
                  </p>
                ) : (
                  <>
                    {myDebts.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-red-600">You Owe</h4>
                        {myDebts.map((settlement, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={settlement.to.imageUrl} />
                                <AvatarFallback>{getInitials(settlement.to.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{settlement.to.name}</p>
                                <p className="text-xs text-muted-foreground">{settlement.to.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-600">
                                {formatCurrency(settlement.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {owedToMe.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-green-600">Owed to You</h4>
                        {owedToMe.map((settlement, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={settlement.from.imageUrl} />
                                <AvatarFallback>{getInitials(settlement.from.name)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{settlement.from.name}</p>
                                <p className="text-xs text-muted-foreground">{settlement.from.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-600">
                                {formatCurrency(settlement.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>Your expense history</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddExpense(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={expenses} onUpdate={loadData} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AddExpenseDialog
        open={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        onSuccess={loadData}
      />
    </div>
  )
}
