import type { CompletedOrder } from '../../../../shared/types'

type Props = {
  history: CompletedOrder[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function HistoryList({ history, selectedId, onSelect }: Props): React.JSX.Element {
  return (
    <ul className="history-list">
      {history.map((order) => (
        <li key={order.id}>
          <button
            type="button"
            className={selectedId === order.id ? 'history-card active' : 'history-card'}
            onClick={() => onSelect(order.id === selectedId ? null : order.id)}
          >
            <span className="history-order-no">#{order.orderNo}</span>
            <strong className="history-tab-name">{order.tabName}</strong>
            <span className="history-date">
              {new Date(order.completedAt).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short'
              })}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
