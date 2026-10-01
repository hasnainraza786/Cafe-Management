import type { LedgerEntry } from '../../../../shared/types'

type Props = {
  entries: LedgerEntry[]
}

function kindLabel(kind: LedgerEntry['kind']): string {
  if (kind === 'sale') return 'Sale'
  if (kind === 'credit_payment') return 'Credit in'
  return 'Expense'
}

export function LedgerEntryList({ entries }: Props): React.JSX.Element {
  if (entries.length === 0) {
    return <p className="empty-hint">No transactions in this date range</p>
  }

  return (
    <ul className="ledger-entry-list">
      {entries.map((entry) => (
        <li key={entry.id} className={`ledger-entry ledger-entry-${entry.kind}`}>
          <div className="ledger-entry-main">
            <span className={`ledger-entry-kind ${entry.kind}`}>{kindLabel(entry.kind)}</span>
            <div>
              <strong>{entry.title}</strong>
              <span className="muted">{entry.detail}</span>
            </div>
          </div>
          <div className="ledger-entry-meta">
            <span className="muted">
              {new Date(entry.at).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
            <strong className={entry.amount < 0 ? 'amount-out' : 'amount-in'}>
              {entry.amount < 0 ? '−' : '+'}Rs {Math.abs(entry.amount).toFixed(0)}
            </strong>
          </div>
        </li>
      ))}
    </ul>
  )
}
