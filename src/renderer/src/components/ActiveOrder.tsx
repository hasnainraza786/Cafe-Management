import { useEffect, useState } from 'react'
import type { CheckoutInput, Customer, OpenTab, PaymentMode } from '../../../shared/types'
import { tabTotal } from '../hooks/useCafeStore'

type Props = {
  tab: OpenTab | null
  customers: Customer[]
  onChangeQty: (productId: string, delta: number) => Promise<void>
  onRemoveItem: (productId: string) => Promise<void>
  onCheckout: (input: CheckoutInput) => Promise<void>
  onCancel: () => Promise<void>
}

const PAYMENT_OPTIONS: { value: PaymentMode; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'online', label: 'Online' },
  { value: 'credit', label: 'Credit' }
]

export function ActiveOrder({
  tab,
  customers,
  onChangeQty,
  onRemoveItem,
  onCheckout,
  onCancel
}: Props): React.JSX.Element {
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [creditCustomerId, setCreditCustomerId] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setPaymentMode('cash')
    setCreditCustomerId('')
  }, [tab?.id])

  if (!tab) {
    return (
      <aside className="active-order">
        <h2>Current order</h2>
        <p className="empty-hint">Select or open a tab</p>
      </aside>
    )
  }

  const total = tabTotal(tab.items)
  const needsCustomerForCredit = paymentMode === 'credit' && tab.kind === 'table'
  const sortedCustomers = [...customers].sort((a, b) => a.name.localeCompare(b.name))
  const canCheckout =
    tab.items.length > 0 &&
    !confirming &&
    (!needsCustomerForCredit || Boolean(creditCustomerId))

  async function handleCheckout(): Promise<void> {
    if (!tab || tab.items.length === 0) return
    if (needsCustomerForCredit && !creditCustomerId) return
    setConfirming(true)
    try {
      await onCheckout({
        paymentMode,
        customerId: needsCustomerForCredit ? creditCustomerId : undefined
      })
      setPaymentMode('cash')
      setCreditCustomerId('')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <aside className="active-order">
      <div className="active-order-header">
        <h2>{tab.name}</h2>
        <span className="order-time">
          {tab.kind === 'table' ? 'Table' : 'Customer'} · Opened{' '}
          {new Date(tab.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <ul className="order-lines">
        {tab.items.length === 0 && <li className="empty-hint">Tap menu items to add</li>}
        {tab.items.map((item) => (
          <li key={item.productId} className="order-line">
            <div className="line-info">
              <span className="line-name">{item.name}</span>
              <span className="line-sub">
                Rs {item.price.toFixed(0)} × {item.qty}
              </span>
            </div>
            <div className="line-actions">
              <button type="button" onClick={() => onChangeQty(item.productId, -1)} aria-label="Decrease">
                −
              </button>
              <span className="line-qty">{item.qty}</span>
              <button type="button" onClick={() => onChangeQty(item.productId, 1)} aria-label="Increase">
                +
              </button>
              <button
                type="button"
                className="remove-btn"
                onClick={() => onRemoveItem(item.productId)}
                aria-label="Remove"
              >
                ×
              </button>
            </div>
            <span className="line-total">Rs {(item.price * item.qty).toFixed(0)}</span>
          </li>
        ))}
      </ul>

      <div className="order-footer">
        <div className="order-total">
          <span>Total</span>
          <strong>Rs {total.toFixed(0)}</strong>
        </div>

        <fieldset className="payment-modes" disabled={tab.items.length === 0}>
          <legend>Payment mode</legend>
          <div className="payment-options">
            {PAYMENT_OPTIONS.map((option) => (
              <label key={option.value} className={paymentMode === option.value ? 'pay-chip active' : 'pay-chip'}>
                <input
                  type="radio"
                  name="paymentMode"
                  value={option.value}
                  checked={paymentMode === option.value}
                  onChange={() => setPaymentMode(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {needsCustomerForCredit && (
          <label className="credit-customer-pick">
            Credit customer
            <select
              value={creditCustomerId}
              onChange={(e) => setCreditCustomerId(e.target.value)}
              required
            >
              <option value="">Select customer…</option>
              {sortedCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {sortedCustomers.length === 0 && (
              <span className="hint">Add a customer in the Credit tab first.</span>
            )}
          </label>
        )}

        <button
          type="button"
          className="btn-primary"
          disabled={!canCheckout}
          onClick={() => handleCheckout()}
        >
          Checkout
        </button>
        <button type="button" className="btn-ghost" onClick={() => onCancel()}>
          Cancel tab
        </button>
      </div>
    </aside>
  )
}
