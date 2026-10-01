import type { DailyLedger } from '../../../../shared/types'

type Props = {
  ledger: DailyLedger
}

export function ReportsExpensesPanel({ ledger }: Props): React.JSX.Element {
  return (
    <section className="ledger-items">
      <h3>Expenses</h3>
      {ledger.expenses.length === 0 ? (
        <p className="empty-hint">No expenses for this date</p>
      ) : (
        <ul className="ledger-item-list">
          {ledger.expenses.map((expense) => (
            <li key={expense.id} className="ledger-item-row">
              <div>
                <strong>{expense.note}</strong>
              </div>
              <div className="ledger-item-profit">
                <strong>Rs {expense.amount.toFixed(0)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
