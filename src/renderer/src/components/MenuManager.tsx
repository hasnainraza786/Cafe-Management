import { FormEvent, useMemo, useState } from 'react'
import type { CafeTable, Category, Product } from '../../../shared/types'
import { newId } from '../hooks/useCafeStore'

type Props = {
  products: Product[]
  categories: Category[]
  tables: CafeTable[]
  onSaveProduct: (product: Product) => Promise<void>
  onDeleteProduct: (productId: string) => Promise<void>
  onSaveCategory: (category: Category) => Promise<void>
  onDeleteCategory: (categoryId: string) => Promise<boolean | void>
  onSaveTable: (table: CafeTable) => Promise<void>
  onDeleteTable: (tableId: string) => Promise<boolean | void>
}

const emptyProductForm = {
  name: '',
  price: '',
  costPrice: '',
  category: '',
  available: true
}

type MenuTab = 'products' | 'categories' | 'tables'

export function MenuManager({
  products,
  categories,
  tables,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onSaveTable,
  onDeleteTable
}: Props): React.JSX.Element {
  const [menuTab, setMenuTab] = useState<MenuTab>('products')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProductForm)
  const [saving, setSaving] = useState(false)

  const [catEditingId, setCatEditingId] = useState<string | null>(null)
  const [catName, setCatName] = useState('')
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState<string | null>(null)

  const [tblEditingId, setTblEditingId] = useState<string | null>(null)
  const [tblName, setTblName] = useState('')
  const [tblSaving, setTblSaving] = useState(false)
  const [tblError, setTblError] = useState<string | null>(null)

  const sorted = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.category === b.category ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category)
      ),
    [products]
  )

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

  const sortedTables = useMemo(
    () => [...tables].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })),
    [tables]
  )

  function startCreate(): void {
    setEditingId(null)
    setForm({
      ...emptyProductForm,
      category: sortedCategories[0]?.name ?? ''
    })
  }

  function startEdit(product: Product): void {
    setEditingId(product.id)
    setForm({
      name: product.name,
      price: String(product.price),
      costPrice: String(product.costPrice),
      category: product.category,
      available: product.available
    })
  }

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = form.name.trim()
    const category = form.category.trim()
    const price = Number(form.price)
    const costPrice = Number(form.costPrice)
    if (!name || !category || !Number.isFinite(price) || price < 0) return
    if (!Number.isFinite(costPrice) || costPrice < 0) return

    setSaving(true)
    try {
      await onSaveProduct({
        id: editingId ?? newId('p'),
        name,
        category,
        price,
        costPrice,
        available: form.available
      })
      startCreate()
    } finally {
      setSaving(false)
    }
  }

  function startCreateCategory(): void {
    setCatEditingId(null)
    setCatName('')
    setCatError(null)
  }

  function startEditCategory(category: Category): void {
    setCatEditingId(category.id)
    setCatName(category.name)
    setCatError(null)
  }

  async function handleCategorySubmit(event: FormEvent): Promise<void> {
    event.preventDefault()
    const name = catName.trim()
    if (!name) return

    setCatSaving(true)
    setCatError(null)
    try {
      await onSaveCategory({
        id: catEditingId ?? newId('cat'),
        name
      })
      startCreateCategory()
    } finally {
      setCatSaving(false)
    }
  }

  async function handleDeleteCategory(category: Category): Promise<void> {
    const inUse = products.some((p) => p.category === category.name)
    if (inUse) {
      setCatError(`Cannot delete “${category.name}” — products still use it.`)
      return
    }
    if (!window.confirm(`Delete category ${category.name}?`)) return
    const ok = await onDeleteCategory(category.id)
    if (ok === false) {
      setCatError(`Cannot delete “${category.name}” — products still use it.`)
      return
    }
    if (catEditingId === category.id) startCreateCategory()
  }

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
    <main className="manager-view">
      <div className="manager-tabs">
        <button
          type="button"
          className={menuTab === 'products' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setMenuTab('products')}
        >
          Products
        </button>
        <button
          type="button"
          className={menuTab === 'categories' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setMenuTab('categories')}
        >
          Categories
        </button>
        <button
          type="button"
          className={menuTab === 'tables' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setMenuTab('tables')}
        >
          Tables
        </button>
      </div>

      {menuTab === 'products' && (
        <div className="manager-grid">
          <section className="manager-list">
            <div className="section-heading">
              <h2>Products</h2>
              <button type="button" className="btn-ghost" onClick={startCreate}>
                New product
              </button>
            </div>
            <ul>
              {sorted.length === 0 && <li className="empty-hint">No products yet</li>}
              {sorted.map((product) => (
                <li key={product.id} className="product-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span className="muted">
                      {product.category} · Sell Rs {product.price.toFixed(0)} · Cost Rs{' '}
                      {product.costPrice.toFixed(0)}
                      {!product.available ? ' · Unavailable' : ''}
                    </span>
                  </div>
                  <div className="row-actions">
                    <button type="button" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        if (window.confirm(`Delete ${product.name}?`)) onDeleteProduct(product.id)
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="manager-form-panel">
            <h2>{editingId ? 'Edit product' : 'Add product'}</h2>
            <form className="product-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </label>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  required
                  disabled={sortedCategories.length === 0}
                >
                  {sortedCategories.length === 0 && <option value="">Add a category first</option>}
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sell price (Rs)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  required
                />
              </label>
              <label>
                Cost price (Rs)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.costPrice}
                  onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
                  required
                />
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                />
                Available on menu
              </label>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || sortedCategories.length === 0}
              >
                {editingId ? 'Save changes' : 'Add product'}
              </button>
            </form>
          </section>
        </div>
      )}

      {menuTab === 'categories' && (
        <div className="manager-grid">
          <section className="manager-list">
            <div className="section-heading">
              <h2>Categories</h2>
              <button type="button" className="btn-ghost" onClick={startCreateCategory}>
                New category
              </button>
            </div>
            {catError && <p className="form-error">{catError}</p>}
            <ul>
              {sortedCategories.length === 0 && <li className="empty-hint">No categories yet</li>}
              {sortedCategories.map((category) => {
                const count = products.filter((p) => p.category === category.name).length
                return (
                  <li key={category.id} className="product-row">
                    <div>
                      <strong>{category.name}</strong>
                      <span className="muted">
                        {count} product{count === 1 ? '' : 's'}
                      </span>
                    </div>
                    <div className="row-actions">
                      <button type="button" onClick={() => startEditCategory(category)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDeleteCategory(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="manager-form-panel">
            <h2>{catEditingId ? 'Edit category' : 'Add category'}</h2>
            <form className="product-form" onSubmit={handleCategorySubmit}>
              <label>
                Name
                <input
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  placeholder="Coffee, Tea, Food…"
                />
              </label>
              <button type="submit" className="btn-primary" disabled={catSaving}>
                {catEditingId ? 'Save changes' : 'Add category'}
              </button>
            </form>
          </section>
        </div>
      )}

      {menuTab === 'tables' && (
        <div className="manager-grid">
          <section className="manager-list">
            <div className="section-heading">
              <h2>Tables</h2>
              <button type="button" className="btn-ghost" onClick={startCreateTable}>
                New table
              </button>
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
                    <button
                      type="button"
                      className="danger"
                      onClick={() => handleDeleteTable(table)}
                    >
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
              <button type="submit" className="btn-primary" disabled={tblSaving}>
                {tblEditingId ? 'Save changes' : 'Add table'}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
