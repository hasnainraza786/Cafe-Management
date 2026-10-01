import { useState } from 'react'
import { useCafeStore } from '@renderer/shared/store'
import { ProductManager } from './ProductManager'
import { CategoryManager } from './CategoryManager'
import { TableManager } from './TableManager'
import './menu.css'

type MenuTab = 'products' | 'categories' | 'tables'

export function MenuPage(): React.JSX.Element {
  const cafe = useCafeStore()
  const [menuTab, setMenuTab] = useState<MenuTab>('products')

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
        <ProductManager
          products={cafe.store.products}
          categories={cafe.store.categories}
          onSaveProduct={cafe.saveProduct}
          onDeleteProduct={cafe.deleteProduct}
        />
      )}

      {menuTab === 'categories' && (
        <CategoryManager
          products={cafe.store.products}
          categories={cafe.store.categories}
          onSaveCategory={cafe.saveCategory}
          onDeleteCategory={cafe.deleteCategory}
        />
      )}

      {menuTab === 'tables' && (
        <TableManager
          tables={cafe.store.tables}
          onSaveTable={cafe.saveTable}
          onDeleteTable={cafe.deleteTable}
        />
      )}
    </main>
  )
}
