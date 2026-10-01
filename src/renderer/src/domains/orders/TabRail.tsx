import { useMemo, useState } from 'react'
import type { CafeTable, CreateTabInput, Customer, OpenTab, TabKind } from '../../../../shared/types'
import { tabTotal } from '@renderer/shared/store'
import { ThemeSelect } from '@renderer/shared/ui'

type Props = {
  tabs: OpenTab[]
  tables: CafeTable[]
  customers: Customer[]
  activeTabId: string | null
  onSelect: (id: string) => void
  onCreate: (input: CreateTabInput) => Promise<void>
  onCreateCustomerTab: (name: string) => Promise<void>
  onCancel: (tabId: string) => Promise<void>
}

export function TabRail({
  tabs,
  tables,
  customers,
  activeTabId,
  onSelect,
  onCreate,
  onCreateCustomerTab,
  onCancel
}: Props): React.JSX.Element {
  const [kind, setKind] = useState<TabKind>('table')
  const [selection, setSelection] = useState('')
  const [busy, setBusy] = useState(false)

  const options = useMemo(() => {
    if (kind === 'table') {
      return [...tables]
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map((table) => ({ value: table.id, label: table.name }))
    }
    return [...customers]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((customer) => ({ value: customer.id, label: customer.name }))
  }, [kind, tables, customers])

  async function openExisting(refId: string): Promise<void> {
    if (!refId || busy) return
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

  async function openNewCustomer(name: string): Promise<void> {
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      await onCreateCustomerTab(name)
      setSelection('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="tab-rail">
      <h2>Open tabs</h2>

      <div className="tab-kind-switch" role="tablist" aria-label="Open by">
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'table'}
          className={kind === 'table' ? 'tab-kind-btn active' : 'tab-kind-btn'}
          onClick={() => {
            setKind('table')
            setSelection('')
          }}
        >
          Tables
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === 'customer'}
          className={kind === 'customer' ? 'tab-kind-btn active' : 'tab-kind-btn'}
          onClick={() => {
            setKind('customer')
            setSelection('')
          }}
        >
          Customers
        </button>
      </div>

      <div className="new-tab-form">
        <ThemeSelect
          value={selection}
          searchable
          placeholder={kind === 'table' ? 'Search tables…' : 'Search or add customer…'}
          searchPlaceholder={kind === 'table' ? 'Search tables…' : 'Search or add customer…'}
          aria-label={kind === 'table' ? 'Select table' : 'Select customer'}
          options={options}
          disabled={busy}
          onChange={(value) => {
            setSelection(value)
            void openExisting(value)
          }}
          onCreateFromSearch={
            kind === 'customer'
              ? (name) => {
                  void openNewCustomer(name)
                }
              : undefined
          }
        />
      </div>

      {/* {kind === 'table' && tables.length === 0 && (
        <p className="hint">Add tables in Menu.</p>
      )}
      {kind === 'customer' && (
        <p className="hint">Type a name and press Enter to open or create.</p>
      )} */}

      <ul className="tab-list">
        {tabs.length === 0 && <li className="empty-hint">No open tabs yet</li>}
        {tabs.map((tab) => {
          const count = tab.items.reduce((n, item) => n + item.qty, 0)
          const total = tabTotal(tab.items)
          return (
            <li key={tab.id}>
              <div className={tab.id === activeTabId ? 'tab-card active' : 'tab-card'}>
                <button
                  type="button"
                  className="tab-card-main"
                  onClick={() => onSelect(tab.id)}
                >
                  <span className="tab-name">{tab.name}</span>
                  <span className="tab-meta">
                    {count} item
                    {count === 1 ? '' : 's'} · Rs {total.toFixed(0)}
                  </span>
                </button>
                <button
                  type="button"
                  className="tab-cancel-btn"
                  aria-label={`Cancel ${tab.name}`}
                  title="Cancel tab"
                  onClick={() => void onCancel(tab.id)}
                >
                  ×
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
