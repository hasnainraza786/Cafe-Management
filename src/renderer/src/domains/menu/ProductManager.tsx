import { FormEvent, useMemo, useState } from 'react'
import type { Category, Product } from '../../../../shared/types'
import { newId } from '@renderer/shared/store'
import { Button, ThemeSelect } from '@renderer/shared/ui'

type Props = {
  products: Product[]
  categories: Category[]
  onSaveProduct: (product: Product) => Promise<void>
  onDeleteProduct: (productId: string) => Promise<void>
}

const emptyProductForm = {
  name: '',
  price: '',
  costPrice: '',
  category: '',
  available: true
}

export function ProductManager({
  products,
  categories,
  onSaveProduct,
  onDeleteProduct
}: Props): React.JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProductForm)
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="manager-grid">
      <section className="manager-list">
        <div className="section-heading">
          <h2>Products</h2>
          <Button variant="ghost" size="sm" onClick={startCreate}>
            New product
          </Button>
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
            <ThemeSelect
              value={form.category}
              placeholder={
                sortedCategories.length === 0 ? 'Add a category first' : 'Select category…'
              }
              aria-label="Category"
              disabled={sortedCategories.length === 0}
              options={sortedCategories.map((category) => ({
                value: category.name,
                label: category.name
              }))}
              onChange={(value) => setForm((f) => ({ ...f, category: value }))}
            />
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
          <Button
            type="submit"
            disabled={saving || sortedCategories.length === 0 || !form.category}
          >
            {editingId ? 'Save changes' : 'Add product'}
          </Button>
        </form>
      </section>
    </div>
  )
}
