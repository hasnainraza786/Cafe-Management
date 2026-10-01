import { FormEvent, useMemo, useState } from 'react'
import type { Category, Product } from '../../../../shared/types'
import { newId } from '@renderer/shared/store'
import { Button } from '@renderer/shared/ui'

type Props = {
  products: Product[]
  categories: Category[]
  onSaveCategory: (category: Category) => Promise<void>
  onDeleteCategory: (categoryId: string) => Promise<boolean | void>
}

export function CategoryManager({
  products,
  categories,
  onSaveCategory,
  onDeleteCategory
}: Props): React.JSX.Element {
  const [catEditingId, setCatEditingId] = useState<string | null>(null)
  const [catName, setCatName] = useState('')
  const [catSaving, setCatSaving] = useState(false)
  const [catError, setCatError] = useState<string | null>(null)

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  )

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

  return (
    <div className="manager-grid">
      <section className="manager-list">
        <div className="section-heading">
          <h2>Categories</h2>
          <Button variant="ghost" size="sm" onClick={startCreateCategory}>
            New category
          </Button>
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
          <Button type="submit" disabled={catSaving}>
            {catEditingId ? 'Save changes' : 'Add category'}
          </Button>
        </form>
      </section>
    </div>
  )
}
