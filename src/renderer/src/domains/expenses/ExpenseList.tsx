import type { Expense } from '../../../../shared/types'

type Props = {
  filterDate: string
  todayKey: string
  expenses: Expense[]
  dayTotal: number
  onDelete: (expenseId: string) => Promise<void>
}

export function ExpenseList({
  filterDate,
  todayKey,
  expenses,
  dayTotal,
  onDelete
}: Props): React.JSX.Element {
  return (
    <section className="manager-list">
      <div className="section-heading">
        <h2>{filterDate === todayKey ? 'Today' : filterDate}</h2>
        <span className="muted">Total Rs {dayTotal.toFixed(0)}</span>
      </div>
      <ul>
        {expenses.length === 0 && <li className="empty-hint">No expenses for this date</li>}
        {expenses.map((expense) => (
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
                  if (window.confirm('Delete this expense?')) void onDelete(expense.id)
                }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
