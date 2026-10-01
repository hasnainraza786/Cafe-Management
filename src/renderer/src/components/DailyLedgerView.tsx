import { useMemo, useState } from 'react'
import type { DailyLedger } from '../../../shared/types'

type Props = {
  ledgers: DailyLedger[]
  todayKey: string
  getLedgerForDate: (date: string) => DailyLedger
}

export function DailyLedgerView({ ledgers, todayKey, getLedgerForDate }: Props): React.JSX.Element {
  const dateOptions = useMemo(() => {
    const set = new Set(ledgers.map((l) => l.date))
    set.add(todayKey)
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [ledgers, todayKey])

  const [selectedDate, setSelectedDate] = useState(todayKey)
  const ledger = getLedgerForDate(selectedDate)
  const isToday = selectedDate === todayKey

  return (
    <main className="ledger-view">
      <div className="ledger-header">
        <div>
          <h2>{isToday ? "Today's ledger" : 'Daily ledger'}</h2>
          <p className="muted">
            Cash/online sales + collected credit − expenses. Unpaid credit is excluded.
          </p>
        </div>
        <label className="date-picker">
          Date
          <input
            type="date"
            value={selectedDate}
            max={todayKey}
            onChange={(e) => setSelectedDate(e.target.value || todayKey)}
            list="ledger-dates"
          />
          <datalist id="ledger-dates">
            {dateOptions.map((date) => (
              <option key={date} value={date} />
            ))}
          </datalist>
        </label>
      </div>

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
          <span className="ledger-stat-label">Paid orders</span>
          <strong>{ledger.orderCount}</strong>
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
        <h3>By payment (recognized)</h3>
        <div className="payment-summary-row">
          <span>Cash</span>
          <strong>Rs {ledger.byPayment.cash.toFixed(0)}</strong>
        </div>
        <div className="payment-summary-row">
          <span>Online</span>
          <strong>Rs {ledger.byPayment.online.toFixed(0)}</strong>
        </div>
        <div className="payment-summary-row">
          <span>Credit collected</span>
          <strong>Rs {ledger.byPayment.credit.toFixed(0)}</strong>
        </div>
      </section>

      <section className="ledger-items">
        <h3>Item sales (recognized)</h3>
        {ledger.items.length === 0 ? (
          <p className="empty-hint">No recognized sales for this date</p>
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
    </main>
  )
}
