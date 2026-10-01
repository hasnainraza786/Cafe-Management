import { useMemo, useState } from 'react'
import { useCafeStore } from '@renderer/shared/store'
import { ExpenseList } from './ExpenseList'
import { ExpenseForm } from './ExpenseForm'
import './expenses.css'

export function ExpensesPage(): React.JSX.Element {
  const cafe = useCafeStore()
  const [filterDate, setFilterDate] = useState(cafe.todayKey)

  const filtered = useMemo(
    () =>
      [...cafe.store.expenses]
        .filter((e) => e.date === filterDate)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [cafe.store.expenses, filterDate]
  )

  const dayTotal = filtered.reduce((sum, e) => sum + e.amount, 0)

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
            max={cafe.todayKey}
            onChange={(e) => setFilterDate(e.target.value || cafe.todayKey)}
          />
        </label>
      </div>

      <div className="manager-grid">
        <ExpenseList
          filterDate={filterDate}
          todayKey={cafe.todayKey}
          expenses={filtered}
          dayTotal={dayTotal}
          onDelete={cafe.deleteExpense}
        />
        <ExpenseForm
          todayKey={cafe.todayKey}
          onAdd={cafe.addExpense}
          onAdded={setFilterDate}
        />
      </div>
    </main>
  )
}
