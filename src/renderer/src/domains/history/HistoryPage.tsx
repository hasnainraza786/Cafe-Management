import { useMemo, useState } from 'react'
import { localDateKey } from '../../../../shared/normalize'
import { useCafeStore } from '@renderer/shared/store'
import { HistoryList } from './HistoryList'
import { HistoryDetail } from './HistoryDetail'
import './history.css'

export function HistoryPage(): React.JSX.Element {
  const { store, todayKey } = useCafeStore()
  const [fromDate, setFromDate] = useState(todayKey)
  const [toDate, setToDate] = useState(todayKey)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const from = fromDate || todayKey
    const to = toDate || todayKey
    const start = from <= to ? from : to
    const end = from <= to ? to : from
    return store.history.filter((order) => {
      const key = localDateKey(order.completedAt)
      return key >= start && key <= end
    })
  }, [store.history, fromDate, toDate, todayKey])

  const selected = filtered.find((o) => o.id === selectedId) ?? null

  return (
    <main className="history-view">
      <div className="history-header">
        <div>
          <h2>Order history</h2>
          <p className="muted">Completed orders for the selected date range</p>
        </div>
        <div className="date-range">
          <label className="date-picker">
            From
            <input
              type="date"
              value={fromDate}
              max={todayKey}
              onChange={(e) => {
                setFromDate(e.target.value || todayKey)
                setSelectedId(null)
              }}
            />
          </label>
          <label className="date-picker">
            To
            <input
              type="date"
              value={toDate}
              max={todayKey}
              onChange={(e) => {
                setToDate(e.target.value || todayKey)
                setSelectedId(null)
              }}
            />
          </label>
        </div>
      </div>

      {store.history.length === 0 ? (
        <p className="empty-hint">Completed orders will appear here</p>
      ) : filtered.length === 0 ? (
        <p className="empty-hint">No orders in this date range</p>
      ) : (
        <div className="history-layout">
          <HistoryList history={filtered} selectedId={selectedId} onSelect={setSelectedId} />
          <HistoryDetail order={selected} />
        </div>
      )}
    </main>
  )
}
