import { useCafeStore } from '@renderer/shared/store'
import { TabRail } from './TabRail'
import { MenuGrid } from './MenuGrid'
import { ActiveOrder } from './ActiveOrder'
import './orders.css'

export function OrdersPage(): React.JSX.Element {
  const cafe = useCafeStore()

  return (
    <main className="pos-layout">
      <TabRail
        tabs={cafe.store.openTabs}
        tables={cafe.store.tables}
        customers={cafe.store.customers}
        activeTabId={cafe.activeTabId}
        onSelect={cafe.setActiveTabId}
        onCreate={cafe.createTab}
        onCreateCustomerTab={cafe.createCustomerTab}
        onCancel={cafe.cancelTab}
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
  )
}
