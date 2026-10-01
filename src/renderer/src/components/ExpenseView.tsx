import { FormEvent, useMemo, useState } from 'react'
import type { Expense } from '../../../shared/types'

type Props = {
  expenses: Expense[]
  todayKey: string
  onAdd: (input: { date: string; amount: number; note: string }) => Promise<void>
  onDelete: (expenseId: string) => Promise<void>
}

export function ExpenseView({ expenses, todayKey, onAdd, onDelete }: Props): React.JSX.Element {
  const [date, setDate] = useState(todayKey)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterDate, setFilterDate] = useState(todayKey)

  const filtered = useMemo(
    () =>
      [...expenses]
        .filter((e) => e.date === filterDate)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [expenses, filterDate]
  )

  const dayTotal = filtered.reduce((sum, e) => sum + e.amount, 0)

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0 || !note.trim()) return
    setSaving(true)
    try {
      await onAdd({ date, amount: value, note })
      setAmount('')
      setNote('')
      setFilterDate(date)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="expense-view">
      <div className="ledger-header">
        <div>
          <h2>Expenses</h2>
          <p className="muted">Daily costs that reduce net profit on the ledger</p>
        </div>
        <label className="date-picker">
          View date
          <input
            type="date"
            value={filterDate}
            max={todayKey}
            onChange={(e) => setFilterDate(e.target.value || todayKey)}
          />
        </label>
      </div>

      <div className="manager-grid">
        <section className="manager-list">
          <div className="section-heading">
            <h2>{filterDate === todayKey ? 'Today' : filterDate}</h2>
            <span className="muted">Total Rs {dayTotal.toFixed(0)}</span>
          </div>
          <ul>
            {filtered.length === 0 && <li className="empty-hint">No expenses for this date</li>}
            {filtered.map((expense) => (
              <li key={expense.id} className="product-row">
                <div>
                  <strong>{expense.note}</strong>
                  <span className="muted">
                    {new Date(expense.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}{' '}
                    · Rs {expense.amount.toFixed(0)}
                  </span>
                </div>
                <div className="row-actions">
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      if (window.confirm('Delete this expense?')) onDelete(expense.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="manager-form-panel">
          <h2>Add expense</h2>
          <form className="product-form" onSubmit={handleSubmit}>
            <label>
              Date
              <input
                type="date"
                value={date}
                max={todayKey}
                onChange={(e) => setDate(e.target.value || todayKey)}
                required
              />
            </label>
            <label>
              Amount (Rs)
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label>
              Note
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Milk, gas, utilities…"
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={saving}>
              Add expense
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
