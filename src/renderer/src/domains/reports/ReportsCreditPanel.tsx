import type { DailyLedger } from '../../../../shared/types'

type Props = {
  ledger: DailyLedger
}

export function ReportsCreditPanel({ ledger }: Props): React.JSX.Element {
  return (
    <section className="ledger-items">
      <div className="ledger-credit-summary">
        <article className="ledger-stat">
          <span className="ledger-stat-label">Credit given today</span>
          <strong>Rs {ledger.creditGiven.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Credit collected today</span>
          <strong>Rs {ledger.creditCollected.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Credit orders</span>
          <strong>{ledger.credits.length}</strong>
        </article>
      </div>

      <h3>Credit given</h3>
      {ledger.credits.length === 0 ? (
        <p className="empty-hint">No credit given on this date</p>
      ) : (
        <ul className="ledger-item-list">
          {ledger.credits.map((credit) => (
            <li key={credit.id} className="ledger-item-row">
              <div>
                <strong>
                  Order #{credit.orderNo} · {credit.customerName}
                </strong>
                <span className="muted">
                  {new Date(credit.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  · Paid Rs {credit.paidAmount.toFixed(0)} of Rs {credit.total.toFixed(0)}
                </span>
              </div>
              <div className="ledger-item-profit">
                <span className={`credit-status ${credit.status}`}>{credit.status}</span>
                <strong>Rs {credit.total.toFixed(0)}</strong>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
