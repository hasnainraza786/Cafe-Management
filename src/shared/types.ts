export type PaymentMode = 'cash' | 'online' | 'credit'
export type SettleMode = 'cash' | 'online'
export type TabKind = 'table' | 'customer'

export type Category = {
  id: string
  name: string
}

export type CafeTable = {
  id: string
  name: string
}

export type Customer = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  price: number
  costPrice: number
  category: string
  available: boolean
}

export type OrderItem = {
  productId: string
  name: string
  price: number
  costPrice: number
  qty: number
}

export type OpenTab = {
  id: string
  name: string
  kind: TabKind
  refId: string
  createdAt: string
  items: OrderItem[]
}

export type CompletedOrder = {
  id: string
  orderNo: number
  tabName: string
  kind: TabKind
  refId: string
  customerId: string | null
  customerName: string | null
  items: OrderItem[]
  total: number
  profit: number
  paymentMode: PaymentMode
  completedAt: string
}

export type CreditPayment = {
  id: string
  amount: number
  method: SettleMode
  paidAt: string
}

export type CreditRecord = {
  id: string
  orderId: string
  orderNo: number
  customerId: string
  customerName: string
  items: OrderItem[]
  total: number
  profit: number
  paidAmount: number
  status: 'open' | 'partial' | 'paid'
  createdAt: string
  payments: CreditPayment[]
}

export type Expense = {
  id: string
  date: string
  amount: number
  note: string
  createdAt: string
}

export type DailyItemSale = {
  productId: string
  name: string
  qty: number
  revenue: number
  cost: number
  profit: number
}

export type DailyCreditEntry = {
  id: string
  orderNo: number
  customerName: string
  total: number
  paidAmount: number
  status: CreditRecord['status']
  createdAt: string
}

export type DailyLedger = {
  date: string
  totalSales: number
  totalProfit: number
  totalExpenses: number
  netProfit: number
  orderCount: number
  creditGiven: number
  creditCollected: number
  byPayment: Record<PaymentMode, number>
  items: DailyItemSale[]
  topItem: { productId: string; name: string; qty: number; revenue: number } | null
  expenses: Expense[]
  credits: DailyCreditEntry[]
}

/** A single chronological book entry for the transaction ledger. */
export type LedgerEntryKind = 'sale' | 'credit_payment' | 'expense'

export type LedgerEntry = {
  id: string
  kind: LedgerEntryKind
  at: string
  date: string
  title: string
  detail: string
  /** Positive = money in / receivable sale; negative = money out (expense). */
  amount: number
  /** Cash-impacting amount (credit sales are 0 until collected). */
  cashAmount: number
}

export type Store = {
  products: Product[]
  categories: Category[]
  tables: CafeTable[]
  customers: Customer[]
  openTabs: OpenTab[]
  history: CompletedOrder[]
  credits: CreditRecord[]
  expenses: Expense[]
  ledgers: DailyLedger[]
  nextOrderNo: number
}

export type CafeApi = {
  getStore: () => Promise<Store>
  setStore: (store: Store) => Promise<void>
}

export type CreateTabInput = {
  kind: TabKind
  refId: string
  name: string
}

export type CheckoutInput = {
  paymentMode: PaymentMode
  customerId?: string
}
