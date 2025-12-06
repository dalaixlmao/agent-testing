import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { expenseApi, userApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X } from 'lucide-react'

interface AddExpenseDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ShareDetail {
  user: User
  amount: number
}

export default function AddExpenseDialog({ open, onClose, onSuccess }: AddExpenseDialogProps) {
  const { user: currentUser } = useAuthStore()
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [shares, setShares] = useState<ShareDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      loadUsers()
    }
  }, [open])

  const loadUsers = async () => {
    try {
      const response = await userApi.getAllUsers()
      setUsers(response.data.filter(u => u.id !== currentUser?.id))
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (shares.length === 0) {
      setError('Please add at least one person to split with')
      return
    }

    const totalAmount = parseFloat(amount)
    const totalShares = shares.reduce((sum, s) => sum + s.amount, 0)

    if (Math.abs(totalShares - totalAmount) > 0.01) {
      setError(`Share amounts (${totalShares.toFixed(2)}) must equal total amount (${totalAmount.toFixed(2)})`)
      return
    }

    setLoading(true)

    try {
      await expenseApi.createExpense({
        description,
        amount: totalAmount,
        expenseDate: new Date().toISOString(),
        category: category || undefined,
        notes: notes || undefined,
        shares: shares.map(s => ({
          userId: s.user.id,
          shareAmount: s.amount,
        })),
      })
      resetForm()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create expense')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setDescription('')
    setAmount('')
    setCategory('')
    setNotes('')
    setShares([])
    setError('')
  }

  const addShare = (user: User) => {
    if (shares.find(s => s.user.id === user.id)) {
      return
    }
    setShares([...shares, { user, amount: 0 }])
  }

  const removeShare = (userId: number) => {
    setShares(shares.filter(s => s.user.id !== userId))
  }

  const updateShareAmount = (userId: number, amount: number) => {
    setShares(shares.map(s => s.user.id === userId ? { ...s, amount } : s))
  }

  const splitEqually = () => {
    if (shares.length === 0 || !amount) return
    const equalAmount = parseFloat(amount) / shares.length
    setShares(shares.map(s => ({ ...s, amount: parseFloat(equalAmount.toFixed(2)) })))
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Add an expense and split it with others
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                placeholder="Dinner at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Food"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Optional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Split With</Label>
                <Button type="button" size="sm" onClick={splitEqually} disabled={shares.length === 0}>
                  Split Equally
                </Button>
              </div>

              <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={shares.find(s => s.user.id === user.id) ? "secondary" : "outline"}
                      onClick={() => addShare(user)}
                    >
                      {shares.find(s => s.user.id === user.id) ? 'Added' : 'Add'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {shares.length > 0 && (
              <div className="space-y-2">
                <Label>Share Amounts</Label>
                <div className="space-y-2">
                  {shares.map(share => (
                    <div key={share.user.id} className="flex items-center gap-2">
                      <div className="flex-1 flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={share.user.imageUrl} />
                          <AvatarFallback>{getInitials(share.user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm flex-1">{share.user.name}</span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        className="w-24"
                        value={share.amount || ''}
                        onChange={(e) => updateShareAmount(share.user.id, parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeShare(share.user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
