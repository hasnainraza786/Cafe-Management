import { useState } from 'react'
import type { CompletedOrder } from '../../../shared/types'

type Props = {
  history: CompletedOrder[]
}

function formatPayment(mode: CompletedOrder['paymentMode']): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export function OrderHistory({ history }: Props): React.JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = history.find((o) => o.id === selectedId) ?? null

  return (
    <main className="history-view">
      <h2>Order history</h2>
      {history.length === 0 ? (
        <p className="empty-hint">Completed orders will appear here</p>
      ) : (
        <div className="history-layout">
          <ul className="history-list">
            {history.map((order) => (
              <li key={order.id}>
                <button
                  type="button"
                  className={selectedId === order.id ? 'history-card active' : 'history-card'}
                  onClick={() => setSelectedId(order.id === selectedId ? null : order.id)}
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

          <aside className="history-detail">
            {!selected ? (
              <p className="empty-hint">Select an order to view details</p>
            ) : (
              <>
                <div className="history-detail-header">
                  <h3>Order #{selected.orderNo}</h3>
                  <p className="muted">{selected.tabName}</p>
                  <p className="muted">
                    {new Date(selected.completedAt).toLocaleString([], {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                <ul className="history-items">
                  {selected.items.map((item) => (
                    <li key={`${selected.id}-${item.productId}`}>
                      {item.qty}× {item.name}
                      <span>Rs {(item.price * item.qty).toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
                <div className="history-meta-rows">
                  <div className="history-total">
                    <span>Payment</span>
                    <strong>{formatPayment(selected.paymentMode)}</strong>
                  </div>
                  <div className="history-total">
                    <span>Total</span>
                    <strong>Rs {selected.total.toFixed(0)}</strong>
                  </div>
                  <div className="history-total">
                    <span>Profit</span>
                    <strong>Rs {selected.profit.toFixed(0)}</strong>
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
