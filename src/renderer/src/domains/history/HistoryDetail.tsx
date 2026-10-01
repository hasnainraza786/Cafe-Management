import type { CompletedOrder } from '../../../../shared/types'

type Props = {
  order: CompletedOrder | null
}

function formatPayment(mode: CompletedOrder['paymentMode']): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1)
}

export function HistoryDetail({ order }: Props): React.JSX.Element {
  if (!order) {
    return (
      <aside className="history-detail">
        <p className="empty-hint">Select an order to view details</p>
      </aside>
    )
  }

  return (
    <aside className="history-detail">
      <div className="history-detail-header">
        <h3>Order #{order.orderNo}</h3>
        <p className="muted">{order.tabName}</p>
        <p className="muted">
          {new Date(order.completedAt).toLocaleString([], {
            dateStyle: 'full',
            timeStyle: 'short'
          })}
        </p>
      </div>
      <ul className="history-items">
        {order.items.map((item) => (
          <li key={`${order.id}-${item.productId}`}>
            {item.qty}× {item.name}
            <span>Rs {(item.price * item.qty).toFixed(0)}</span>
          </li>
        ))}
      </ul>
      <div className="history-meta-rows">
        <div className="history-total">
          <span>Payment</span>
          <strong>{formatPayment(order.paymentMode)}</strong>
        </div>
        <div className="history-total">
          <span>Total</span>
          <strong>Rs {order.total.toFixed(0)}</strong>
        </div>
        <div className="history-total">
          <span>Profit</span>
          <strong>Rs {order.profit.toFixed(0)}</strong>
        </div>
      </div>
    </aside>
  )
}
