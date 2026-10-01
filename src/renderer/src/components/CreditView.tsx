import { FormEvent, useMemo, useState } from 'react'
import type { CreditRecord, Customer, SettleMode } from '../../../shared/types'
import { newId } from '../hooks/useCafeStore'

type Props = {
  customers: Customer[]
  credits: CreditRecord[]
  onSaveCustomer: (customer: Customer) => Promise<void>
  onDeleteCustomer: (customerId: string) => Promise<boolean | void>
  onPayCredit: (creditId: string, amount: number, method: SettleMode) => Promise<void>
}

export function CreditView({
  customers,
  credits,
  onSaveCustomer,
  onDeleteCustomer,
  onPayCredit
}: Props): React.JSX.Element {
  const [customerName, setCustomerName] = useState('')
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [customerError, setCustomerError] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({})
  const [payMethods, setPayMethods] = useState<Record<string, SettleMode>>({})
  const [payingId, setPayingId] = useState<string | null>(null)

  const customerSummaries = useMemo(() => {
    return [...customers]
      .map((customer) => {
        const records = credits.filter((c) => c.customerId === customer.id)
        const outstanding = records.reduce((sum, c) => sum + (c.total - c.paidAmount), 0)
        const openCount = records.filter((c) => c.status !== 'paid').length
        return { customer, records, outstanding, openCount }
      })
      .sort((a, b) => b.outstanding - a.outstanding || a.customer.name.localeCompare(b.customer.name))
  }, [customers, credits])

  const selected = customerSummaries.find((s) => s.customer.id === selectedCustomerId) ?? null
  const selectedRecords = selected
    ? [...selected.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []

  async function handleAddCustomer(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = customerName.trim()
    if (!name) return
    setSavingCustomer(true)
    setCustomerError(null)
    try {
      await onSaveCustomer({ id: newId('cust'), name })
      setCustomerName('')
    } finally {
      setSavingCustomer(false)
    }
  }

  async function handleDeleteCustomer(customer: Customer): Promise<void> {
    if (!window.confirm(`Delete customer ${customer.name}?`)) return
    const ok = await onDeleteCustomer(customer.id)
    if (ok === false) {
      setCustomerError(`Cannot delete “${customer.name}” — open tab or unpaid credit exists.`)
      return
    }
    if (selectedCustomerId === customer.id) setSelectedCustomerId(null)
  }

  async function handlePay(credit: CreditRecord): Promise<void> {
    const remaining = credit.total - credit.paidAmount
    const raw = payAmounts[credit.id]
    const amount = raw === undefined || raw === '' ? remaining : Number(raw)
    if (!Number.isFinite(amount) || amount <= 0) return
    const method = payMethods[credit.id] ?? 'cash'
    setPayingId(credit.id)
    try {
      await onPayCredit(credit.id, Math.min(amount, remaining), method)
      setPayAmounts((prev) => {
        const next = { ...prev }
        delete next[credit.id]
        return next
      })
    } finally {
      setPayingId(null)
    }
  }

  return (
    <main className="credit-view">
      <div className="ledger-header">
        <div>
          <h2>Credit</h2>
          <p className="muted">Customer balances — sales enter the ledger only when collected</p>
        </div>
      </div>

      <div className="manager-grid">
        <section className="manager-list">
          <div className="section-heading">
            <h2>Customers</h2>
          </div>
          <form className="product-form inline-form" onSubmit={handleAddCustomer}>
            <label>
              Add customer
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer name"
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={savingCustomer}>
              Add
            </button>
          </form>
          {customerError && <p className="form-error">{customerError}</p>}
          <ul>
            {customerSummaries.length === 0 && (
              <li className="empty-hint">No customers yet</li>
            )}
            {customerSummaries.map(({ customer, outstanding, openCount }) => (
              <li key={customer.id}>
                <button
                  type="button"
                  className={
                    selectedCustomerId === customer.id ? 'history-card active' : 'history-card'
                  }
                  onClick={() => setSelectedCustomerId(customer.id)}
                >
                  <strong className="history-tab-name">{customer.name}</strong>
                  <span className="history-date">
                    {openCount} open · Due Rs {outstanding.toFixed(0)}
                  </span>
                </button>
                <div className="row-actions compact-actions">
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDeleteCustomer(customer)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="manager-form-panel credit-detail">
          {!selected ? (
            <p className="empty-hint">Select a customer to view credit records</p>
          ) : (
            <>
              <h2>{selected.customer.name}</h2>
              <p className="muted">
                Outstanding <strong>Rs {selected.outstanding.toFixed(0)}</strong>
              </p>
              {selectedRecords.length === 0 ? (
                <p className="empty-hint">No credit orders for this customer</p>
              ) : (
                <ul className="credit-record-list">
                  {selectedRecords.map((credit) => {
                    const remaining = credit.total - credit.paidAmount
                    return (
                      <li key={credit.id} className="credit-record">
                        <div className="credit-record-top">
                          <strong>Order #{credit.orderNo}</strong>
                          <span className={`credit-status ${credit.status}`}>{credit.status}</span>
                        </div>
                        <p className="muted">
                          {new Date(credit.createdAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                        <div className="payment-summary-row">
                          <span>Total</span>
                          <strong>Rs {credit.total.toFixed(0)}</strong>
                        </div>
                        <div className="payment-summary-row">
                          <span>Paid</span>
                          <strong>Rs {credit.paidAmount.toFixed(0)}</strong>
                        </div>
                        <div className="payment-summary-row">
                          <span>Remaining</span>
                          <strong>Rs {remaining.toFixed(0)}</strong>
                        </div>

                        {credit.status !== 'paid' && (
                          <div className="credit-pay-row">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              max={remaining}
                              placeholder={`Amount (max ${remaining.toFixed(0)})`}
                              value={payAmounts[credit.id] ?? ''}
                              onChange={(e) =>
                                setPayAmounts((prev) => ({ ...prev, [credit.id]: e.target.value }))
                              }
                            />
                            <select
                              value={payMethods[credit.id] ?? 'cash'}
                              onChange={(e) =>
                                setPayMethods((prev) => ({
                                  ...prev,
                                  [credit.id]: e.target.value as SettleMode
                                }))
                              }
                            >
                              <option value="cash">Cash</option>
                              <option value="online">Online</option>
                            </select>
                            <button
                              type="button"
                              className="btn-primary"
                              disabled={payingId === credit.id}
                              onClick={() => handlePay(credit)}
                            >
                              {payingId === credit.id ? 'Saving…' : 'Collect'}
                            </button>
                            <button
                              type="button"
                              className="btn-ghost"
                              disabled={payingId === credit.id}
                              onClick={async () => {
                                setPayingId(credit.id)
                                try {
                                  await onPayCredit(
                                    credit.id,
                                    remaining,
                                    payMethods[credit.id] ?? 'cash'
                                  )
                                } finally {
                                  setPayingId(null)
                                }
                              }}
                            >
                              Full
                            </button>
                          </div>
                        )}

                        {credit.payments.length > 0 && (
                          <ul className="credit-payments">
                            {credit.payments.map((payment) => (
                              <li key={payment.id}>
                                Rs {payment.amount.toFixed(0)} via {payment.method} ·{' '}
                                {new Date(payment.paidAt).toLocaleString([], {
                                  dateStyle: 'medium',
                                  timeStyle: 'short'
                                })}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}
