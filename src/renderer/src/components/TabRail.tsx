import { FormEvent, useMemo, useState } from 'react'
import type { CafeTable, CreateTabInput, Customer, OpenTab } from '../../../shared/types'
import { tabTotal } from '../hooks/useCafeStore'

type Props = {
  tabs: OpenTab[]
  tables: CafeTable[]
  customers: Customer[]
  activeTabId: string | null
  onSelect: (id: string) => void
  onCreate: (input: CreateTabInput) => Promise<void>
}

export function TabRail({
  tabs,
  tables,
  customers,
  activeTabId,
  onSelect,
  onCreate
}: Props): React.JSX.Element {
  const [selection, setSelection] = useState('')
  const [busy, setBusy] = useState(false)

  const options = useMemo(() => {
    const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name))
    const sortedCustomers = [...customers].sort((a, b) => a.name.localeCompare(b.name))
    return { sortedTables, sortedCustomers }
  }, [tables, customers])

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    if (!selection || busy) return
    const [kind, refId] = selection.split(':') as ['table' | 'customer', string]
    const name =
      kind === 'table'
        ? tables.find((t) => t.id === refId)?.name
        : customers.find((c) => c.id === refId)?.name
    if (!name) return

    setBusy(true)
    try {
      await onCreate({ kind, refId, name })
      setSelection('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="tab-rail">
      <h2>Open tabs</h2>
      <form className="new-tab-form" onSubmit={handleSubmit}>
        <select
          value={selection}
          onChange={(e) => setSelection(e.target.value)}
          aria-label="Select table or customer"
          required
        >
          <option value="">Select table or customer…</option>
          {options.sortedTables.length > 0 && (
            <optgroup label="Tables">
              {options.sortedTables.map((table) => (
                <option key={table.id} value={`table:${table.id}`}>
                  {table.name}
                </option>
              ))}
            </optgroup>
          )}
          {options.sortedCustomers.length > 0 && (
            <optgroup label="Customers">
              {options.sortedCustomers.map((customer) => (
                <option key={customer.id} value={`customer:${customer.id}`}>
                  {customer.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <button type="submit" disabled={!selection || busy}>
          Open
        </button>
      </form>
      {tables.length === 0 && customers.length === 0 && (
        <p className="hint">Add tables in Menu, or customers in Credit.</p>
      )}

      <ul className="tab-list">
        {tabs.length === 0 && <li className="empty-hint">No open tabs yet</li>}
        {tabs.map((tab) => {
          const count = tab.items.reduce((n, item) => n + item.qty, 0)
          const total = tabTotal(tab.items)
          return (
            <li key={tab.id}>
              <button
                type="button"
                className={tab.id === activeTabId ? 'tab-card active' : 'tab-card'}
                onClick={() => onSelect(tab.id)}
              >
                <span className="tab-name">{tab.name}</span>
                <span className="tab-meta">
                  {tab.kind === 'table' ? 'Table' : 'Customer'} · {count} item
                  {count === 1 ? '' : 's'} · Rs {total.toFixed(0)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
