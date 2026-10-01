import { FormEvent, useState } from 'react'
import type { CreditRecord, Customer } from '../../../../shared/types'
import { newId } from '@renderer/shared/store'
import { Button } from '@renderer/shared/ui'

export type CustomerSummary = {
  customer: Customer
  records: CreditRecord[]
  outstanding: number
  openCount: number
}

type Props = {
  summaries: CustomerSummary[]
  selectedCustomerId: string | null
  error: string | null
  onSelect: (customerId: string) => void
  onAddCustomer: (customer: Customer) => Promise<void>
  onDeleteCustomer: (customer: Customer) => Promise<void>
}

export function CustomerList({
  summaries,
  selectedCustomerId,
  error,
  onSelect,
  onAddCustomer,
  onDeleteCustomer
}: Props): React.JSX.Element {
  const [customerName, setCustomerName] = useState('')
  const [savingCustomer, setSavingCustomer] = useState(false)

  async function handleAddCustomer(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = customerName.trim()
    if (!name) return
    setSavingCustomer(true)
    try {
      await onAddCustomer({ id: newId('cust'), name })
      setCustomerName('')
    } finally {
      setSavingCustomer(false)
    }
  }

  return (
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
        <Button type="submit" size="sm" disabled={savingCustomer}>
          Add
        </Button>
      </form>
      {error && <p className="form-error">{error}</p>}
      <ul>
        {summaries.length === 0 && <li className="empty-hint">No customers yet</li>}
        {summaries.map(({ customer, outstanding, openCount }) => (
          <li key={customer.id} className="product-row customer-row">
            <button
              type="button"
              className={
                selectedCustomerId === customer.id ? 'customer-select active' : 'customer-select'
              }
              onClick={() => onSelect(customer.id)}
            >
              <strong>{customer.name}</strong>
              <span className="muted">
                {openCount} open · Due Rs {outstanding.toFixed(0)}
              </span>
            </button>
            <div className="row-actions">
              <button type="button" className="danger" onClick={() => onDeleteCustomer(customer)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
