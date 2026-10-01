import type { DailyLedger } from '../../../../shared/types'

type Props = {
  ledger: DailyLedger
}

export function ReportsOverview({ ledger }: Props): React.JSX.Element {
  return (
    <>
      <section className="ledger-summary ledger-summary-wide">
        <article className="ledger-stat">
          <span className="ledger-stat-label">Recognized sales</span>
          <strong>Rs {ledger.totalSales.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Gross profit</span>
          <strong>Rs {ledger.totalProfit.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Expenses</span>
          <strong>Rs {ledger.totalExpenses.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Net profit</span>
          <strong>Rs {ledger.netProfit.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Orders</span>
          <strong>{ledger.orderCount}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Credit given</span>
          <strong>Rs {ledger.creditGiven.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Credit collected</span>
          <strong>Rs {ledger.creditCollected.toFixed(0)}</strong>
        </article>
        <article className="ledger-stat">
          <span className="ledger-stat-label">Highest item sale</span>
          <strong>
            {ledger.topItem ? `${ledger.topItem.name} (${ledger.topItem.qty} sold)` : '—'}
          </strong>
          {ledger.topItem && (
            <span className="muted">Rs {ledger.topItem.revenue.toFixed(0)} revenue</span>
          )}
        </article>
      </section>

      <section className="ledger-payments">
        <h3>By payment mode</h3>
        <div className="payment-summary-row">
          <span>Cash</span>
          <strong>Rs {ledger.byPayment.cash.toFixed(0)}</strong>
        </div>
        <div className="payment-summary-row">
          <span>Online</span>
          <strong>Rs {ledger.byPayment.online.toFixed(0)}</strong>
        </div>
        <div className="payment-summary-row">
          <span>Credit</span>
          <strong>Rs {ledger.byPayment.credit.toFixed(0)}</strong>
        </div>
      </section>

      <section className="ledger-items">
        <h3>Item sales</h3>
        {ledger.items.length === 0 ? (
          <p className="empty-hint">No sales for this date</p>
        ) : (
          <ul className="ledger-item-list">
            {ledger.items.map((item) => (
              <li key={item.productId} className="ledger-item-row">
                <div>
                  <strong>{item.name}</strong>
                  <span className="muted">
                    Sold {item.qty} · Revenue Rs {item.revenue.toFixed(0)}
                  </span>
                </div>
                <div className="ledger-item-profit">
                  <span className="muted">Profit today</span>
                  <strong>Rs {item.profit.toFixed(0)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
