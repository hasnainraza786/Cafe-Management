import { useMemo, useState } from 'react'
import { useCafeStore } from '@renderer/shared/store'
import { ReportsOverview } from './ReportsOverview'
import { ReportsCreditPanel } from './ReportsCreditPanel'
import { ReportsExpensesPanel } from './ReportsExpensesPanel'
import './reports.css'

type ReportsTab = 'overview' | 'credit' | 'expenses'

export function ReportsPage(): React.JSX.Element {
  const cafe = useCafeStore()
  const dateOptions = useMemo(() => {
    const set = new Set(cafe.store.ledgers.map((l) => l.date))
    set.add(cafe.todayKey)
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [cafe.store.ledgers, cafe.todayKey])

  const [selectedDate, setSelectedDate] = useState(cafe.todayKey)
  const [tab, setTab] = useState<ReportsTab>('overview')
  const ledger = cafe.getLedgerForDate(selectedDate)
  const isToday = selectedDate === cafe.todayKey

  return (
    <main className="reports-view">
      <div className="ledger-header">
        <div>
          <h2>{isToday ? "Today's report" : 'Daily report'}</h2>
          <p className="muted">
            All sales including credit orders. Item sales are recognized at checkout.
          </p>
        </div>
        <label className="date-picker">
          Date
          <input
            type="date"
            value={selectedDate}
            max={cafe.todayKey}
            onChange={(e) => setSelectedDate(e.target.value || cafe.todayKey)}
            list="ledger-dates"
          />
          <datalist id="ledger-dates">
            {dateOptions.map((date) => (
              <option key={date} value={date} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="ledger-tabs" role="tablist" aria-label="Ledger sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'overview'}
          className={tab === 'overview' ? 'ledger-tab active' : 'ledger-tab'}
          onClick={() => setTab('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'credit'}
          className={tab === 'credit' ? 'ledger-tab active' : 'ledger-tab'}
          onClick={() => setTab('credit')}
        >
          Credit
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'expenses'}
          className={tab === 'expenses' ? 'ledger-tab active' : 'ledger-tab'}
          onClick={() => setTab('expenses')}
        >
          Expenses
        </button>
      </div>

      <div className="ledger-body">
        {tab === 'overview' && <ReportsOverview ledger={ledger} />}
        {tab === 'credit' && <ReportsCreditPanel ledger={ledger} />}
        {tab === 'expenses' && <ReportsExpensesPanel ledger={ledger} />}
      </div>
    </main>
  )
}
