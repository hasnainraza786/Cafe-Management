import { useState } from 'react'
import type { CreditRecord, SettleMode } from '../../../../shared/types'
import { Button, ThemeSelect } from '@renderer/shared/ui'
import type { CustomerSummary } from './CustomerList'

type Props = {
  selected: CustomerSummary | null
  onPayCredit: (creditId: string, amount: number, method: SettleMode) => Promise<void>
}

export function CreditDetail({ selected, onPayCredit }: Props): React.JSX.Element {
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({})
  const [payMethods, setPayMethods] = useState<Record<string, SettleMode>>({})
  const [payingId, setPayingId] = useState<string | null>(null)

  const selectedRecords = selected
    ? [...selected.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : []

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

  if (!selected) {
    return (
      <section className="manager-form-panel credit-detail">
        <p className="empty-hint">Select a customer to view credit records</p>
      </section>
    )
  }

  return (
    <section className="manager-form-panel credit-detail">
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
                    <ThemeSelect
                      className="credit-method-select"
                      value={payMethods[credit.id] ?? 'cash'}
                      aria-label="Payment method"
                      options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'online', label: 'Online' }
                      ]}
                      onChange={(value) =>
                        setPayMethods((prev) => ({
                          ...prev,
                          [credit.id]: value as SettleMode
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      disabled={payingId === credit.id}
                      onClick={() => handlePay(credit)}
                    >
                      {payingId === credit.id ? 'Saving…' : 'Collect'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
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
                    </Button>
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
    </section>
  )
}
