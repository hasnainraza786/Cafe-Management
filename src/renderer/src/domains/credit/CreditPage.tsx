import { useMemo, useState } from 'react'
import type { Customer } from '../../../../shared/types'
import { useCafeStore } from '@renderer/shared/store'
import { CustomerList } from './CustomerList'
import { CreditDetail } from './CreditDetail'
import './credit.css'

export function CreditPage(): React.JSX.Element {
  const cafe = useCafeStore()
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerError, setCustomerError] = useState<string | null>(null)

  const customerSummaries = useMemo(() => {
    return [...cafe.store.customers]
      .map((customer) => {
        const records = cafe.store.credits.filter((c) => c.customerId === customer.id)
        const outstanding = records.reduce((sum, c) => sum + (c.total - c.paidAmount), 0)
        const openCount = records.filter((c) => c.status !== 'paid').length
        return { customer, records, outstanding, openCount }
      })
      .sort(
        (a, b) =>
          b.outstanding - a.outstanding || a.customer.name.localeCompare(b.customer.name)
      )
  }, [cafe.store.customers, cafe.store.credits])

  const selected = customerSummaries.find((s) => s.customer.id === selectedCustomerId) ?? null

  async function handleDeleteCustomer(customer: Customer): Promise<void> {
    if (!window.confirm(`Delete customer ${customer.name}?`)) return
    const ok = await cafe.deleteCustomer(customer.id)
    if (ok === false) {
      setCustomerError(`Cannot delete “${customer.name}” — open tab or unpaid credit exists.`)
      return
    }
    setCustomerError(null)
    if (selectedCustomerId === customer.id) setSelectedCustomerId(null)
  }

  return (
    <main className="credit-view">
      <div className="ledger-header">
        <div>
          <h2>Credit</h2>
          <p className="muted">Customer balances and credit collection</p>
        </div>
      </div>

      <div className="manager-grid">
        <CustomerList
          summaries={customerSummaries}
          selectedCustomerId={selectedCustomerId}
          error={customerError}
          onSelect={(id) => {
            setCustomerError(null)
            setSelectedCustomerId(id)
          }}
          onAddCustomer={async (customer) => {
            setCustomerError(null)
            await cafe.saveCustomer(customer)
          }}
          onDeleteCustomer={handleDeleteCustomer}
        />
        <CreditDetail selected={selected} onPayCredit={cafe.payCredit} />
      </div>
    </main>
  )
}
