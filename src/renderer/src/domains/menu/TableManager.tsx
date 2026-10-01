import { FormEvent, useMemo, useState } from 'react'
import type { CafeTable } from '../../../../shared/types'
import { newId } from '@renderer/shared/store'
import { Button } from '@renderer/shared/ui'

type Props = {
  tables: CafeTable[]
  onSaveTable: (table: CafeTable) => Promise<void>
  onDeleteTable: (tableId: string) => Promise<boolean | void>
}

export function TableManager({ tables, onSaveTable, onDeleteTable }: Props): React.JSX.Element {
  const [tblEditingId, setTblEditingId] = useState<string | null>(null)
  const [tblName, setTblName] = useState('')
  const [tblSaving, setTblSaving] = useState(false)
  const [tblError, setTblError] = useState<string | null>(null)

  const sortedTables = useMemo(
    () => [...tables].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
    [tables]
  )

  function startCreateTable(): void {
    setTblEditingId(null)
    setTblName('')
    setTblError(null)
  }

  function startEditTable(table: CafeTable): void {
    setTblEditingId(table.id)
    setTblName(table.name)
    setTblError(null)
  }

  async function handleTableSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = tblName.trim()
    if (!name) return
    setTblSaving(true)
    setTblError(null)
    try {
      await onSaveTable({
        id: tblEditingId ?? newId('tbl'),
        name
      })
      startCreateTable()
    } finally {
      setTblSaving(false)
    }
  }

  async function handleDeleteTable(table: CafeTable): Promise<void> {
    if (!window.confirm(`Delete ${table.name}?`)) return
    const ok = await onDeleteTable(table.id)
    if (ok === false) {
      setTblError(`Cannot delete “${table.name}” — it has an open tab.`)
      return
    }
    if (tblEditingId === table.id) startCreateTable()
  }

  return (
    <div className="manager-grid">
      <section className="manager-list">
        <div className="section-heading">
          <h2>Tables</h2>
          <Button variant="ghost" size="sm" onClick={startCreateTable}>
            New table
          </Button>
        </div>
        {tblError && <p className="form-error">{tblError}</p>}
        <ul>
          {sortedTables.length === 0 && <li className="empty-hint">No tables yet</li>}
          {sortedTables.map((table) => (
            <li key={table.id} className="product-row">
              <div>
                <strong>{table.name}</strong>
              </div>
              <div className="row-actions">
                <button type="button" onClick={() => startEditTable(table)}>
                  Edit
                </button>
                <button type="button" className="danger" onClick={() => handleDeleteTable(table)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="manager-form-panel">
        <h2>{tblEditingId ? 'Edit table' : 'Add table'}</h2>
        <form className="product-form" onSubmit={handleTableSubmit}>
          <label>
            Name
            <input
              value={tblName}
              onChange={(e) => setTblName(e.target.value)}
              required
              placeholder="Table 1"
            />
          </label>
          <Button type="submit" disabled={tblSaving}>
            {tblEditingId ? 'Save changes' : 'Add table'}
          </Button>
        </form>
      </section>
    </div>
  )
}
