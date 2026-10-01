import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  buildLedgerEntries,
  buildLedgerForDate,
  creditStatus,
  localDateKey,
  orderProfit,
  orderTotal,
  rebuildLedgers
} from '../../../../shared/normalize'
import type {
  CafeTable,
  Category,
  CheckoutInput,
  CompletedOrder,
  CreateTabInput,
  CreditRecord,
  Customer,
  DailyLedger,
  Expense,
  LedgerEntry,
  OpenTab,
  OrderItem,
  Product,
  SettleMode,
  Store
} from '../../../../shared/types'

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

function tabTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function emptyStore(): Store {
  return {
    products: [],
    categories: [],
    tables: [],
    customers: [],
    openTabs: [],
    history: [],
    credits: [],
    expenses: [],
    ledgers: [],
    nextOrderNo: 1
  }
}

function withLedgers(store: Store): Store {
  return {
    ...store,
    ledgers: rebuildLedgers(store.history, store.credits, store.expenses)
  }
}

export function useCafeStoreState() {
  const [store, setStore] = useState<Store | null>(null)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await window.api.getStore()
        if (cancelled) return
        setStore(data)
        setActiveTabId(data.openTabs[0]?.id ?? null)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load store')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: Store) => {
    const saved = withLedgers(next)
    setStore(saved)
    await window.api.setStore(saved)
  }, [])

  const activeTab = useMemo(
    () => store?.openTabs.find((tab) => tab.id === activeTabId) ?? null,
    [store, activeTabId]
  )

  const createTab = useCallback(
    async (input: CreateTabInput) => {
      if (!store) return
      const name = input.name.trim()
      if (!name || !input.refId) return

      const alreadyOpen = store.openTabs.some(
        (tab) => tab.kind === input.kind && tab.refId === input.refId
      )
      if (alreadyOpen) {
        const existing = store.openTabs.find(
          (tab) => tab.kind === input.kind && tab.refId === input.refId
        )
        if (existing) setActiveTabId(existing.id)
        return
      }

      const tab: OpenTab = {
        id: newId('tab'),
        name,
        kind: input.kind,
        refId: input.refId,
        createdAt: new Date().toISOString(),
        items: []
      }
      await persist({
        ...store,
        openTabs: [...store.openTabs, tab]
      })
      setActiveTabId(tab.id)
    },
    [store, persist]
  )

  const createCustomerTab = useCallback(
    async (rawName: string) => {
      if (!store) return
      const name = rawName.trim()
      if (!name) return

      const existingCustomer = store.customers.find(
        (customer) => customer.name.toLowerCase() === name.toLowerCase()
      )
      const customer = existingCustomer ?? { id: newId('cust'), name }
      const customers = existingCustomer ? store.customers : [...store.customers, customer]

      const alreadyOpen = store.openTabs.find(
        (tab) => tab.kind === 'customer' && tab.refId === customer.id
      )
      if (alreadyOpen) {
        if (!existingCustomer) {
          await persist({ ...store, customers })
        }
        setActiveTabId(alreadyOpen.id)
        return
      }

      const tab: OpenTab = {
        id: newId('tab'),
        name: customer.name,
        kind: 'customer',
        refId: customer.id,
        createdAt: new Date().toISOString(),
        items: []
      }
      await persist({
        ...store,
        customers,
        openTabs: [...store.openTabs, tab]
      })
      setActiveTabId(tab.id)
    },
    [store, persist]
  )

  const addProductToActiveTab = useCallback(
    async (product: Product) => {
      if (!store || !activeTabId) return
      const nextTabs = store.openTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab
        const existing = tab.items.find((item) => item.productId === product.id)
        const items: OrderItem[] = existing
          ? tab.items.map((item) =>
              item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
            )
          : [
              ...tab.items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                costPrice: product.costPrice,
                qty: 1
              }
            ]
        return { ...tab, items }
      })
      await persist({ ...store, openTabs: nextTabs })
    },
    [store, activeTabId, persist]
  )

  const changeQty = useCallback(
    async (productId: string, delta: number) => {
      if (!store || !activeTabId) return
      const nextTabs = store.openTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab
        const items = tab.items
          .map((item) =>
            item.productId === productId ? { ...item, qty: item.qty + delta } : item
          )
          .filter((item) => item.qty > 0)
        return { ...tab, items }
      })
      await persist({ ...store, openTabs: nextTabs })
    },
    [store, activeTabId, persist]
  )

  const removeItem = useCallback(
    async (productId: string) => {
      if (!store || !activeTabId) return
      const nextTabs = store.openTabs.map((tab) => {
        if (tab.id !== activeTabId) return tab
        return { ...tab, items: tab.items.filter((item) => item.productId !== productId) }
      })
      await persist({ ...store, openTabs: nextTabs })
    },
    [store, activeTabId, persist]
  )

  const checkout = useCallback(
    async (input: CheckoutInput) => {
      if (!store || !activeTab) return
      if (activeTab.items.length === 0) return

      let customerId: string | null = null
      let customerName: string | null = null
      let customers = store.customers

      if (input.paymentMode === 'credit') {
        if (activeTab.kind === 'customer') {
          customerId = activeTab.refId
          customerName = activeTab.name
        } else {
          const selected = store.customers.find((c) => c.id === input.customerId)
          if (!selected) return
          customerId = selected.id
          customerName = selected.name
        }
      } else if (activeTab.kind === 'customer') {
        customerId = activeTab.refId
        customerName = activeTab.name
      }

      const total = orderTotal(activeTab.items)
      const profit = orderProfit(activeTab.items)
      const completed: CompletedOrder = {
        id: newId('ord'),
        orderNo: store.nextOrderNo,
        tabName: activeTab.name,
        kind: activeTab.kind,
        refId: activeTab.refId,
        customerId,
        customerName,
        items: activeTab.items,
        total,
        profit,
        paymentMode: input.paymentMode,
        completedAt: new Date().toISOString()
      }

      let credits = store.credits
      if (input.paymentMode === 'credit' && customerId && customerName) {
        const credit: CreditRecord = {
          id: newId('cred'),
          orderId: completed.id,
          orderNo: completed.orderNo,
          customerId,
          customerName,
          items: activeTab.items,
          total,
          profit,
          paidAmount: 0,
          status: 'open',
          createdAt: completed.completedAt,
          payments: []
        }
        credits = [credit, ...credits]
      }

      const nextTabs = store.openTabs.filter((tab) => tab.id !== activeTab.id)
      await persist({
        ...store,
        customers,
        openTabs: nextTabs,
        history: [completed, ...store.history],
        credits,
        nextOrderNo: store.nextOrderNo + 1
      })
      setActiveTabId(nextTabs[0]?.id ?? null)
    },
    [store, activeTab, persist]
  )

  const cancelTab = useCallback(
    async (tabId?: string) => {
      if (!store) return
      const targetId = tabId ?? activeTabId
      if (!targetId) return
      const nextTabs = store.openTabs.filter((tab) => tab.id !== targetId)
      await persist({ ...store, openTabs: nextTabs })
      setActiveTabId((current) => {
        if (current !== targetId) return current
        return nextTabs[0]?.id ?? null
      })
    },
    [store, activeTabId, persist]
  )

  const saveProduct = useCallback(
    async (product: Product) => {
      if (!store) return
      const exists = store.products.some((p) => p.id === product.id)
      const products = exists
        ? store.products.map((p) => (p.id === product.id ? product : p))
        : [...store.products, product]
      await persist({ ...store, products })
    },
    [store, persist]
  )

  const deleteProduct = useCallback(
    async (productId: string) => {
      if (!store) return
      await persist({
        ...store,
        products: store.products.filter((p) => p.id !== productId)
      })
    },
    [store, persist]
  )

  const saveCategory = useCallback(
    async (category: Category) => {
      if (!store) return
      const trimmed = category.name.trim()
      if (!trimmed) return

      const duplicate = store.categories.some(
        (c) => c.id !== category.id && c.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (duplicate) return

      const existing = store.categories.find((c) => c.id === category.id)
      let categories: Category[]
      let products = store.products

      if (existing) {
        categories = store.categories.map((c) =>
          c.id === category.id ? { ...c, name: trimmed } : c
        )
        if (existing.name !== trimmed) {
          products = store.products.map((p) =>
            p.category === existing.name ? { ...p, category: trimmed } : p
          )
        }
      } else {
        categories = [...store.categories, { id: category.id, name: trimmed }]
      }

      await persist({ ...store, categories, products })
    },
    [store, persist]
  )

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      if (!store) return
      const category = store.categories.find((c) => c.id === categoryId)
      if (!category) return
      const inUse = store.products.some((p) => p.category === category.name)
      if (inUse) return false

      await persist({
        ...store,
        categories: store.categories.filter((c) => c.id !== categoryId)
      })
      return true
    },
    [store, persist]
  )

  const saveTable = useCallback(
    async (table: CafeTable) => {
      if (!store) return
      const trimmed = table.name.trim()
      if (!trimmed) return
      const duplicate = store.tables.some(
        (t) => t.id !== table.id && t.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (duplicate) return

      const existing = store.tables.find((t) => t.id === table.id)
      let tables: CafeTable[]
      let openTabs = store.openTabs

      if (existing) {
        tables = store.tables.map((t) => (t.id === table.id ? { ...t, name: trimmed } : t))
        if (existing.name !== trimmed) {
          openTabs = store.openTabs.map((tab) =>
            tab.kind === 'table' && tab.refId === table.id ? { ...tab, name: trimmed } : tab
          )
        }
      } else {
        tables = [...store.tables, { id: table.id, name: trimmed }]
      }

      await persist({ ...store, tables, openTabs })
    },
    [store, persist]
  )

  const deleteTable = useCallback(
    async (tableId: string) => {
      if (!store) return
      const inUse = store.openTabs.some((tab) => tab.kind === 'table' && tab.refId === tableId)
      if (inUse) return false
      await persist({
        ...store,
        tables: store.tables.filter((t) => t.id !== tableId)
      })
      return true
    },
    [store, persist]
  )

  const saveCustomer = useCallback(
    async (customer: Customer) => {
      if (!store) return
      const trimmed = customer.name.trim()
      if (!trimmed) return
      const duplicate = store.customers.some(
        (c) => c.id !== customer.id && c.name.toLowerCase() === trimmed.toLowerCase()
      )
      if (duplicate) return

      const existing = store.customers.find((c) => c.id === customer.id)
      let customers: Customer[]
      let openTabs = store.openTabs
      let credits = store.credits

      if (existing) {
        customers = store.customers.map((c) =>
          c.id === customer.id ? { ...c, name: trimmed } : c
        )
        if (existing.name !== trimmed) {
          openTabs = store.openTabs.map((tab) =>
            tab.kind === 'customer' && tab.refId === customer.id
              ? { ...tab, name: trimmed }
              : tab
          )
          credits = store.credits.map((credit) =>
            credit.customerId === customer.id
              ? { ...credit, customerName: trimmed }
              : credit
          )
        }
      } else {
        customers = [...store.customers, { id: customer.id, name: trimmed }]
      }

      await persist({ ...store, customers, openTabs, credits })
    },
    [store, persist]
  )

  const deleteCustomer = useCallback(
    async (customerId: string) => {
      if (!store) return
      const open = store.openTabs.some((tab) => tab.kind === 'customer' && tab.refId === customerId)
      const hasCredit = store.credits.some(
        (c) => c.customerId === customerId && c.status !== 'paid'
      )
      if (open || hasCredit) return false
      await persist({
        ...store,
        customers: store.customers.filter((c) => c.id !== customerId)
      })
      return true
    },
    [store, persist]
  )

  const payCredit = useCallback(
    async (creditId: string, amount: number, method: SettleMode) => {
      if (!store) return
      const credit = store.credits.find((c) => c.id === creditId)
      if (!credit || credit.status === 'paid') return
      const remaining = credit.total - credit.paidAmount
      const pay = Math.min(remaining, Math.max(0, amount))
      if (pay <= 0) return

      const nextCredits = store.credits.map((c) => {
        if (c.id !== creditId) return c
        const paidAmount = c.paidAmount + pay
        return {
          ...c,
          paidAmount,
          status: creditStatus(c.total, paidAmount),
          payments: [
            ...c.payments,
            {
              id: newId('cpay'),
              amount: pay,
              method,
              paidAt: new Date().toISOString()
            }
          ]
        }
      })

      await persist({ ...store, credits: nextCredits })
    },
    [store, persist]
  )

  const addExpense = useCallback(
    async (input: { date: string; amount: number; note: string }) => {
      if (!store) return
      const amount = Number(input.amount)
      const note = input.note.trim()
      if (!Number.isFinite(amount) || amount <= 0 || !note) return
      const expense: Expense = {
        id: newId('exp'),
        date: input.date || localDateKey(new Date().toISOString()),
        amount,
        note,
        createdAt: new Date().toISOString()
      }
      await persist({
        ...store,
        expenses: [expense, ...store.expenses]
      })
    },
    [store, persist]
  )

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      if (!store) return
      await persist({
        ...store,
        expenses: store.expenses.filter((e) => e.id !== expenseId)
      })
    },
    [store, persist]
  )

  const getLedgerForDate = useCallback(
    (date: string): DailyLedger => {
      if (!store) {
        return buildLedgerForDate([], [], [], date)
      }
      return (
        store.ledgers.find((l) => l.date === date) ??
        buildLedgerForDate(store.history, store.credits, store.expenses, date)
      )
    },
    [store]
  )

  const getLedgerEntries = useCallback(
    (from: string, to: string): LedgerEntry[] => {
      if (!store) return []
      return buildLedgerEntries(store.history, store.credits, store.expenses, from, to)
    },
    [store]
  )

  return {
    store: store ?? emptyStore(),
    loading,
    error,
    activeTabId,
    setActiveTabId,
    activeTab,
    createTab,
    createCustomerTab,
    addProductToActiveTab,
    changeQty,
    removeItem,
    checkout,
    cancelTab,
    saveProduct,
    deleteProduct,
    saveCategory,
    deleteCategory,
    saveTable,
    deleteTable,
    saveCustomer,
    deleteCustomer,
    payCredit,
    addExpense,
    deleteExpense,
    getLedgerForDate,
    getLedgerEntries,
    todayKey: localDateKey(new Date().toISOString())
  }
}

export { tabTotal, newId }
