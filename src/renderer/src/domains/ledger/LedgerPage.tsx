import { useMemo, useState } from 'react'
import { useCafeStore } from '@renderer/shared/store'
import { LedgerSummary } from './LedgerSummary'
import { LedgerEntryList } from './LedgerEntryList'
import './ledger.css'

export function LedgerPage(): React.JSX.Element {
  const cafe = useCafeStore()
  const [fromDate, setFromDate] = useState(cafe.todayKey)
  const [toDate, setToDate] = useState(cafe.todayKey)

  const entries = useMemo(
    () => cafe.getLedgerEntries(fromDate || cafe.todayKey, toDate || cafe.todayKey),
    [
      cafe.getLedgerEntries,
      cafe.todayKey,
      cafe.store.history,
      cafe.store.credits,
      cafe.store.expenses,
      fromDate,
      toDate
    ]
  )

  return (
    <main className="ledger-view">
      <div className="ledger-header">
        <div>
          <h2>Ledger</h2>
          <p className="muted">Every sale, credit collection, and expense as a transaction</p>
        </div>
        <div className="date-range">
          <label className="date-picker">
            From
            <input
              type="date"
              value={fromDate}
              max={cafe.todayKey}
              onChange={(e) => setFromDate(e.target.value || cafe.todayKey)}
            />
          </label>
          <label className="date-picker">
            To
            <input
              type="date"
              value={toDate}
              max={cafe.todayKey}
              onChange={(e) => setToDate(e.target.value || cafe.todayKey)}
            />
          </label>
        </div>
      </div>

      <LedgerSummary entries={entries} />

      <div className="ledger-body">
        <LedgerEntryList entries={entries} />
      </div>
    </main>
  )
}
