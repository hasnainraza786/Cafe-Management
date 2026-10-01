import { useMemo, useState } from 'react'
import type { Category, Product } from '../../../../shared/types'

type Props = {
  products: Product[]
  categories: Category[]
  hasActiveTab: boolean
  onAdd: (product: Product) => Promise<void>
}

export function MenuGrid({ products, categories, hasActiveTab, onAdd }: Props): React.JSX.Element {
  const categoryNames = useMemo(() => {
    const fromStore = [...categories].map((c) => c.name).sort()
    return ['All', ...fromStore]
  }, [categories])

  const [category, setCategory] = useState('All')

  const visible = products.filter(
    (p) => p.available && (category === 'All' || p.category === category)
  )

  return (
    <section className="menu-grid-panel">
      <div className="menu-grid-header">
        <h2>Menu</h2>
        {!hasActiveTab && <p className="hint">Open a tab to start adding items</p>}
      </div>

      <div className="category-chips" role="tablist" aria-label="Categories">
        {categoryNames.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={category === cat ? 'chip active' : 'chip'}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="empty-hint">No products in this category. Add some in Menu.</p>
      ) : (
        <div className="product-grid">
          {visible.map((product) => (
            <button
              key={product.id}
              type="button"
              className="product-tile"
              disabled={!hasActiveTab}
              onClick={() => onAdd(product)}
            >
              <span className="product-name">{product.name}</span>
              <span className="product-price">Rs {product.price.toFixed(0)}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
