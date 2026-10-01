import { createSeedStore } from './seed'
import type {
  CafeTable,
  Category,
  CompletedOrder,
  CreditPayment,
  CreditRecord,
  Customer,
  DailyLedger,
  Expense,
  LedgerEntry,
  OpenTab,
  OrderItem,
  PaymentMode,
  Product,
  SettleMode,
  Store,
  TabKind
} from './types'

const PAYMENT_MODES: PaymentMode[] = ['cash', 'online', 'credit']
const SETTLE_MODES: SettleMode[] = ['cash', 'online']

function isPaymentMode(value: unknown): value is PaymentMode {
  return typeof value === 'string' && PAYMENT_MODES.includes(value as PaymentMode)
}

function isSettleMode(value: unknown): value is SettleMode {
  return typeof value === 'string' && SETTLE_MODES.includes(value as SettleMode)
}

function isTabKind(value: unknown): value is TabKind {
  return value === 'table' || value === 'customer'
}

function localDateKey(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function normalizeItem(raw: Partial<OrderItem>): OrderItem {
  const price = Number(raw.price) || 0
  const costPrice = Number(raw.costPrice)
  return {
    productId: String(raw.productId ?? ''),
    name: String(raw.name ?? 'Item'),
    price,
    costPrice: Number.isFinite(costPrice) ? costPrice : 0,
    qty: Math.max(1, Number(raw.qty) || 1)
  }
}

function orderProfit(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + (item.price - item.costPrice) * item.qty, 0)
}

function orderTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function creditStatus(total: number, paidAmount: number): CreditRecord['status'] {
  if (paidAmount <= 0) return 'open'
  if (paidAmount + 0.0001 >= total) return 'paid'
  return 'partial'
}

function normalizePayment(raw: Partial<CreditPayment>): CreditPayment {
  return {
    id: String(raw.id ?? `cpay_${Math.random().toString(36).slice(2, 8)}`),
    amount: Math.max(0, Number(raw.amount) || 0),
    method: isSettleMode(raw.method) ? raw.method : 'cash',
    paidAt: String(raw.paidAt ?? new Date().toISOString())
  }
}

function normalizeCredit(raw: Partial<CreditRecord>): CreditRecord {
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeItem) : []
  const total = Number(raw.total)
  const profit = Number(raw.profit)
  const payments = Array.isArray(raw.payments) ? raw.payments.map(normalizePayment) : []
  const paidFromPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = Math.max(0, Number(raw.paidAmount) || paidFromPayments)
  const resolvedTotal = Number.isFinite(total) ? total : orderTotal(items)

  return {
    id: String(raw.id ?? `cred_${Math.random().toString(36).slice(2, 8)}`),
    orderId: String(raw.orderId ?? ''),
    orderNo: Number(raw.orderNo) || 0,
    customerId: String(raw.customerId ?? ''),
    customerName: String(raw.customerName ?? 'Customer'),
    items,
    total: resolvedTotal,
    profit: Number.isFinite(profit) ? profit : orderProfit(items),
    paidAmount: Math.min(paidAmount, resolvedTotal),
    status: creditStatus(resolvedTotal, Math.min(paidAmount, resolvedTotal)),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    payments
  }
}

function normalizeExpense(raw: Partial<Expense>): Expense {
  return {
    id: String(raw.id ?? `exp_${Math.random().toString(36).slice(2, 8)}`),
    date: String(raw.date ?? localDateKey(new Date().toISOString())),
    amount: Math.max(0, Number(raw.amount) || 0),
    note: String(raw.note ?? '').trim() || 'Expense',
    createdAt: String(raw.createdAt ?? new Date().toISOString())
  }
}

function normalizeOrder(raw: Partial<CompletedOrder>, fallbackNo: number): CompletedOrder {
  const items = Array.isArray(raw.items) ? raw.items.map(normalizeItem) : []
  const total = Number(raw.total)
  const profit = Number(raw.profit)
  return {
    id: String(raw.id ?? `ord_${fallbackNo}`),
    orderNo: Number(raw.orderNo) || fallbackNo,
    tabName: String(raw.tabName ?? 'Tab'),
    kind: isTabKind(raw.kind) ? raw.kind : 'customer',
    refId: String(raw.refId ?? ''),
    customerId: raw.customerId ? String(raw.customerId) : null,
    customerName: raw.customerName ? String(raw.customerName) : null,
    items,
    total: Number.isFinite(total) ? total : orderTotal(items),
    profit: Number.isFinite(profit) ? profit : orderProfit(items),
    paymentMode: isPaymentMode(raw.paymentMode) ? raw.paymentMode : 'cash',
    completedAt: String(raw.completedAt ?? new Date().toISOString())
  }
}

function addScaledItems(
  itemMap: Map<string, DailyLedger['items'][number]>,
  items: OrderItem[],
  ratio: number
): void {
  if (ratio <= 0) return
  for (const item of items) {
    const qty = item.qty * ratio
    const revenue = item.price * item.qty * ratio
    const cost = item.costPrice * item.qty * ratio
    const profit = revenue - cost
    const existing = itemMap.get(item.productId)
    if (existing) {
      existing.qty += qty
      existing.revenue += revenue
      existing.cost += cost
      existing.profit += profit
    } else {
      itemMap.set(item.productId, {
        productId: item.productId,
        name: item.name,
        qty,
        revenue,
        cost,
        profit
      })
    }
  }
}

export function buildLedgerForDate(
  history: CompletedOrder[],
  credits: CreditRecord[],
  expenses: Expense[],
  date: string
): DailyLedger {
  const byPayment: Record<PaymentMode, number> = { cash: 0, online: 0, credit: 0 }
  const itemMap = new Map<string, DailyLedger['items'][number]>()
  let totalSales = 0
  let totalProfit = 0
  let orderCount = 0
  let creditCollected = 0

  for (const order of history) {
    if (localDateKey(order.completedAt) !== date) continue

    totalSales += order.total
    totalProfit += order.profit
    byPayment[order.paymentMode] += order.total
    orderCount += 1
    addScaledItems(itemMap, order.items, 1)
  }

  for (const credit of credits) {
    for (const payment of credit.payments) {
      if (localDateKey(payment.paidAt) !== date) continue
      creditCollected += payment.amount
    }
  }

  const dayCredits = credits
    .filter((credit) => localDateKey(credit.createdAt) === date)
    .map((credit) => ({
      id: credit.id,
      orderNo: credit.orderNo,
      customerName: credit.customerName,
      total: credit.total,
      paidAmount: credit.paidAmount,
      status: credit.status,
      createdAt: credit.createdAt
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const creditGiven = dayCredits.reduce((sum, credit) => sum + credit.total, 0)

  const dayExpenses = expenses.filter((e) => e.date === date)
  const totalExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0)

  const items = Array.from(itemMap.values()).sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
  const top = items[0]
    ? {
        productId: items[0].productId,
        name: items[0].name,
        qty: Number(items[0].qty.toFixed(2)),
        revenue: items[0].revenue
      }
    : null

  return {
    date,
    totalSales,
    totalProfit,
    totalExpenses,
    netProfit: totalProfit - totalExpenses,
    orderCount,
    creditGiven,
    creditCollected,
    byPayment,
    items: items.map((item) => ({
      ...item,
      qty: Number(item.qty.toFixed(2))
    })),
    topItem: top,
    expenses: dayExpenses,
    credits: dayCredits
  }
}

export function rebuildLedgers(
  history: CompletedOrder[],
  credits: CreditRecord[],
  expenses: Expense[]
): DailyLedger[] {
  const dates = new Set<string>()
  for (const order of history) {
    dates.add(localDateKey(order.completedAt))
  }
  for (const credit of credits) {
    dates.add(localDateKey(credit.createdAt))
    for (const payment of credit.payments) {
      dates.add(localDateKey(payment.paidAt))
    }
  }
  for (const expense of expenses) {
    dates.add(expense.date)
  }

  return Array.from(dates)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => buildLedgerForDate(history, credits, expenses, date))
}

function inDateRange(dateKey: string, from: string, to: string): boolean {
  const start = from <= to ? from : to
  const end = from <= to ? to : from
  return dateKey >= start && dateKey <= end
}

/** Chronological transaction ledger entries for a from–to date range. */
export function buildLedgerEntries(
  history: CompletedOrder[],
  credits: CreditRecord[],
  expenses: Expense[],
  from: string,
  to: string
): LedgerEntry[] {
  const entries: LedgerEntry[] = []

  for (const order of history) {
    const date = localDateKey(order.completedAt)
    if (!inDateRange(date, from, to)) continue
    const paymentLabel =
      order.paymentMode.charAt(0).toUpperCase() + order.paymentMode.slice(1)
    const itemSummary = order.items
      .map((item) => `${item.qty}× ${item.name}`)
      .join(', ')
    entries.push({
      id: `sale_${order.id}`,
      kind: 'sale',
      at: order.completedAt,
      date,
      title: `Order #${order.orderNo} · ${order.tabName}`,
      detail: `${paymentLabel}${order.customerName ? ` · ${order.customerName}` : ''} · ${itemSummary}`,
      amount: order.total,
      cashAmount: order.paymentMode === 'credit' ? 0 : order.total
    })
  }

  for (const credit of credits) {
    for (const payment of credit.payments) {
      const date = localDateKey(payment.paidAt)
      if (!inDateRange(date, from, to)) continue
      const method = payment.method.charAt(0).toUpperCase() + payment.method.slice(1)
      entries.push({
        id: `cpay_${payment.id}`,
        kind: 'credit_payment',
        at: payment.paidAt,
        date,
        title: `Credit collected · ${credit.customerName}`,
        detail: `Order #${credit.orderNo} · via ${method}`,
        amount: payment.amount,
        cashAmount: payment.amount
      })
    }
  }

  for (const expense of expenses) {
    if (!inDateRange(expense.date, from, to)) continue
    entries.push({
      id: `exp_${expense.id}`,
      kind: 'expense',
      at: expense.createdAt,
      date: expense.date,
      title: `Expense · ${expense.note}`,
      detail: expense.date,
      amount: -expense.amount,
      cashAmount: -expense.amount
    })
  }

  return entries.sort((a, b) => b.at.localeCompare(a.at) || b.id.localeCompare(a.id))
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

/** Upgrade older cafe-store.json shapes to the current Store schema. */
export function normalizeStore(raw: unknown): Store {
  if (!raw || typeof raw !== 'object') {
    return createSeedStore()
  }

  const data = raw as Partial<Store> & {
    products?: Partial<Product>[]
    history?: Partial<CompletedOrder>[]
  }

  if (!Array.isArray(data.products) || !Array.isArray(data.openTabs) || !Array.isArray(data.history)) {
    return createSeedStore()
  }

  const products: Product[] = data.products.map((p, i) => {
    const price = Number(p.price) || 0
    const costPrice = Number(p.costPrice)
    return {
      id: String(p.id ?? `p_${i}`),
      name: String(p.name ?? 'Product'),
      price,
      costPrice: Number.isFinite(costPrice) ? costPrice : 0,
      category: String(p.category ?? 'General'),
      available: p.available !== false
    }
  })

  let categories: Category[] = Array.isArray(data.categories)
    ? data.categories
        .filter((c) => c && typeof c === 'object')
        .map((c, i) => ({
          id: String((c as Category).id ?? `cat_${i}`),
          name: String((c as Category).name ?? '').trim()
        }))
        .filter((c) => c.name)
    : []

  if (categories.length === 0) {
    const names = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()
    categories = names.map((name) => ({ id: id('cat'), name }))
    if (categories.length === 0) {
      categories = [{ id: id('cat'), name: 'General' }]
    }
  }

  let tables: CafeTable[] = Array.isArray(data.tables)
    ? data.tables
        .filter((t) => t && typeof t === 'object')
        .map((t, i) => ({
          id: String((t as CafeTable).id ?? `tbl_${i}`),
          name: String((t as CafeTable).name ?? '').trim()
        }))
        .filter((t) => t.name)
    : []

  if (tables.length === 0) {
    tables = [1, 2, 3, 4].map((n) => ({ id: id('tbl'), name: `Table ${n}` }))
  }

  let customers: Customer[] = Array.isArray(data.customers)
    ? data.customers
        .filter((c) => c && typeof c === 'object')
        .map((c, i) => ({
          id: String((c as Customer).id ?? `cust_${i}`),
          name: String((c as Customer).name ?? '').trim()
        }))
        .filter((c) => c.name)
    : []

  const openTabs: OpenTab[] = data.openTabs.map((tab, i) => {
    const name = String(tab.name ?? 'Tab')
    const kind: TabKind = isTabKind(tab.kind) ? tab.kind : 'customer'
    let refId = String(tab.refId ?? '')
    if (!refId) {
      if (kind === 'table') {
        const match = tables.find((t) => t.name === name)
        refId = match?.id ?? tables[0]?.id ?? id('tbl')
      } else {
        let match = customers.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (!match) {
          match = { id: id('cust'), name }
          customers = [...customers, match]
        }
        refId = match.id
      }
    }
    return {
      id: String(tab.id ?? `tab_${i}`),
      name,
      kind,
      refId,
      createdAt: String(tab.createdAt ?? new Date().toISOString()),
      items: Array.isArray(tab.items) ? tab.items.map(normalizeItem) : []
    }
  })

  const history: CompletedOrder[] = data.history.map((order, i) => normalizeOrder(order, i + 1))

  let credits: CreditRecord[] = Array.isArray(data.credits)
    ? data.credits.map((c) => normalizeCredit(c as Partial<CreditRecord>))
    : []

  // Backfill credit records from historical credit orders if missing
  if (credits.length === 0) {
    for (const order of history) {
      if (order.paymentMode !== 'credit') continue
      const customerName = order.customerName ?? order.tabName
      let customer = customers.find((c) => c.name.toLowerCase() === customerName.toLowerCase())
      if (!customer) {
        customer = { id: order.customerId ?? id('cust'), name: customerName }
        customers = [...customers, customer]
      }
      credits.push({
        id: id('cred'),
        orderId: order.id,
        orderNo: order.orderNo,
        customerId: customer.id,
        customerName: customer.name,
        items: order.items,
        total: order.total,
        profit: order.profit,
        paidAmount: 0,
        status: 'open',
        createdAt: order.completedAt,
        payments: []
      })
    }
  }

  for (const credit of credits) {
    if (!customers.some((c) => c.id === credit.customerId)) {
      customers = [...customers, { id: credit.customerId, name: credit.customerName }]
    }
  }

  const expenses: Expense[] = Array.isArray(data.expenses)
    ? data.expenses.map((e) => normalizeExpense(e as Partial<Expense>))
    : []

  const maxOrderNo = history.reduce((max, o) => Math.max(max, o.orderNo), 0)
  const nextOrderNo = Math.max(Number(data.nextOrderNo) || 1, maxOrderNo + 1)

  return {
    products,
    categories,
    tables,
    customers,
    openTabs,
    history,
    credits,
    expenses,
    ledgers: rebuildLedgers(history, credits, expenses),
    nextOrderNo
  }
}

export { localDateKey, orderProfit, orderTotal, creditStatus }
