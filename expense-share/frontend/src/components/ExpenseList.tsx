import type { Expense } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/authStore'
import { Receipt } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: () => void
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const { user } = useAuthStore()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getMyShare = (expense: Expense) => {
    const share = expense.shares.find(s => s.user.id === user?.id)
    return share?.shareAmount || 0
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No expenses yet</p>
        <p className="text-xs text-muted-foreground">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {expenses.map((expense) => {
        const isPaidByMe = expense.paidBy.id === user?.id
        const myShare = getMyShare(expense)

        return (
          <div
            key={expense.id}
            className={`p-4 rounded-lg border ${
              isPaidByMe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={expense.paidBy.imageUrl} />
                    <AvatarFallback>{getInitials(expense.paidBy.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Paid by {isPaidByMe ? 'you' : expense.paidBy.name} on {formatDate(expense.expenseDate)}
                    </p>
                  </div>
                </div>
                {expense.category && (
                  <span className="inline-block px-2 py-1 text-xs bg-white rounded-full border">
                    {expense.category}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatCurrency(expense.amount)}</p>
                {!isPaidByMe && myShare > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Your share: {formatCurrency(myShare)}
                  </p>
                )}
              </div>
            </div>
            {expense.notes && (
              <p className="text-xs text-muted-foreground mt-2">{expense.notes}</p>
            )}
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Split between:</p>
              <div className="flex flex-wrap gap-1">
                {expense.shares.map((share) => (
                  <span
                    key={share.id}
                    className="inline-flex items-center px-2 py-1 text-xs bg-white rounded-full border"
                  >
                    {share.user.name}: {formatCurrency(share.shareAmount)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
