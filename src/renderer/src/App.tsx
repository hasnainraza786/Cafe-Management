import { useCafeStore } from './hooks/useCafeStore'
import { TabRail } from './components/TabRail'
import { MenuGrid } from './components/MenuGrid'
import { ActiveOrder } from './components/ActiveOrder'
import { MenuManager } from './components/MenuManager'
import { OrderHistory } from './components/OrderHistory'
import { DailyLedgerView } from './components/DailyLedgerView'
import { CreditView } from './components/CreditView'
import { ExpenseView } from './components/ExpenseView'

export default function App(): React.JSX.Element {
  const cafe = useCafeStore()

  if (cafe.loading) {
    return (
      <div className="app-loading">
        <p>Opening cafe…</p>
      </div>
    )
  }

  if (cafe.error) {
    return (
      <div className="app-loading">
        <p>{cafe.error}</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">Cafe</span>
          <span className="brand-sub">Order Manager</span>
        </div>
        <nav className="header-nav">
          <button
            type="button"
            className={cafe.view === 'pos' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('pos')}
          >
            Orders
          </button>
          <button
            type="button"
            className={cafe.view === 'menu' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('menu')}
          >
            Menu
          </button>
          <button
            type="button"
            className={cafe.view === 'history' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('history')}
          >
            History
          </button>
          <button
            type="button"
            className={cafe.view === 'credit' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('credit')}
          >
            Credit
          </button>
          <button
            type="button"
            className={cafe.view === 'expenses' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('expenses')}
          >
            Expenses
          </button>
          <button
            type="button"
            className={cafe.view === 'ledger' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => cafe.setView('ledger')}
          >
            Ledger
          </button>
        </nav>
      </header>

      {cafe.view === 'pos' && (
        <main className="pos-layout">
          <TabRail
            tabs={cafe.store.openTabs}
            tables={cafe.store.tables}
            customers={cafe.store.customers}
            activeTabId={cafe.activeTabId}
            onSelect={cafe.setActiveTabId}
            onCreate={cafe.createTab}
          />
          <MenuGrid
            products={cafe.store.products}
            categories={cafe.store.categories}
            hasActiveTab={Boolean(cafe.activeTab)}
            onAdd={cafe.addProductToActiveTab}
          />
          <ActiveOrder
            tab={cafe.activeTab}
            customers={cafe.store.customers}
            onChangeQty={cafe.changeQty}
            onRemoveItem={cafe.removeItem}
            onCheckout={cafe.checkout}
            onCancel={cafe.cancelTab}
          />
        </main>
      )}

      {cafe.view === 'menu' && (
        <MenuManager
          products={cafe.store.products}
          categories={cafe.store.categories}
          tables={cafe.store.tables}
          onSaveProduct={cafe.saveProduct}
          onDeleteProduct={cafe.deleteProduct}
          onSaveCategory={cafe.saveCategory}
          onDeleteCategory={cafe.deleteCategory}
          onSaveTable={cafe.saveTable}
          onDeleteTable={cafe.deleteTable}
        />
      )}

      {cafe.view === 'history' && <OrderHistory history={cafe.store.history} />}

      {cafe.view === 'credit' && (
        <CreditView
          customers={cafe.store.customers}
          credits={cafe.store.credits}
          onSaveCustomer={cafe.saveCustomer}
          onDeleteCustomer={cafe.deleteCustomer}
          onPayCredit={cafe.payCredit}
        />
      )}

      {cafe.view === 'expenses' && (
        <ExpenseView
          expenses={cafe.store.expenses}
          todayKey={cafe.todayKey}
          onAdd={cafe.addExpense}
          onDelete={cafe.deleteExpense}
        />
      )}

      {cafe.view === 'ledger' && (
        <DailyLedgerView
          ledgers={cafe.store.ledgers}
          todayKey={cafe.todayKey}
          getLedgerForDate={cafe.getLedgerForDate}
        />
      )}
    </div>
  )
}
