import type { LedgerEntry } from '../../../../shared/types'

type Props = {
  entries: LedgerEntry[]
}

export function LedgerSummary({ entries }: Props): React.JSX.Element {
  const sales = entries
    .filter((e) => e.kind === 'sale')
    .reduce((sum, e) => sum + e.amount, 0)
  const creditIn = entries
    .filter((e) => e.kind === 'credit_payment')
    .reduce((sum, e) => sum + e.amount, 0)
  const expenses = entries
    .filter((e) => e.kind === 'expense')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0)
  const cashIn = entries.reduce((sum, e) => sum + Math.max(0, e.cashAmount), 0)
  const cashOut = entries.reduce((sum, e) => sum + Math.max(0, -e.cashAmount), 0)

  return (
    <section className="ledger-tx-summary">
      <article className="ledger-stat">
        <span className="ledger-stat-label">Sales booked</span>
        <strong>Rs {sales.toFixed(0)}</strong>
      </article>
      <article className="ledger-stat">
        <span className="ledger-stat-label">Credit collected</span>
        <strong>Rs {creditIn.toFixed(0)}</strong>
      </article>
      <article className="ledger-stat">
        <span className="ledger-stat-label">Expenses</span>
        <strong>Rs {expenses.toFixed(0)}</strong>
      </article>
      <article className="ledger-stat">
        <span className="ledger-stat-label">Cash in</span>
        <strong className="amount-in">Rs {cashIn.toFixed(0)}</strong>
      </article>
      <article className="ledger-stat">
        <span className="ledger-stat-label">Cash out</span>
        <strong className="amount-out">Rs {cashOut.toFixed(0)}</strong>
      </article>
      <article className="ledger-stat">
        <span className="ledger-stat-label">Entries</span>
        <strong>{entries.length}</strong>
      </article>
    </section>
  )
}
