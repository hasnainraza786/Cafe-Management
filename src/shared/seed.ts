import type { CafeTable, Category, Customer, Product, Store } from './types'

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

const seedCategories: Category[] = [
  { id: id('cat'), name: 'Coffee' },
  { id: id('cat'), name: 'Tea' },
  { id: id('cat'), name: 'Food' },
  { id: id('cat'), name: 'Bakery' },
  { id: id('cat'), name: 'Drinks' }
]

const seedTables: CafeTable[] = [
  { id: id('tbl'), name: 'Table 1' },
  { id: id('tbl'), name: 'Table 2' },
  { id: id('tbl'), name: 'Table 3' },
  { id: id('tbl'), name: 'Table 4' }
]

const seedCustomers: Customer[] = []

function cat(name: string): string {
  return seedCategories.find((c) => c.name === name)?.name ?? name
}

const seedProducts: Product[] = [
  { id: id('p'), name: 'Espresso', price: 250, costPrice: 80, category: cat('Coffee'), available: true },
  { id: id('p'), name: 'Americano', price: 300, costPrice: 90, category: cat('Coffee'), available: true },
  { id: id('p'), name: 'Cappuccino', price: 400, costPrice: 120, category: cat('Coffee'), available: true },
  { id: id('p'), name: 'Latte', price: 450, costPrice: 140, category: cat('Coffee'), available: true },
  { id: id('p'), name: 'Green Tea', price: 280, costPrice: 70, category: cat('Tea'), available: true },
  { id: id('p'), name: 'Masala Chai', price: 200, costPrice: 50, category: cat('Tea'), available: true },
  { id: id('p'), name: 'Club Sandwich', price: 650, costPrice: 280, category: cat('Food'), available: true },
  { id: id('p'), name: 'Chicken Wrap', price: 550, costPrice: 240, category: cat('Food'), available: true },
  { id: id('p'), name: 'Croissant', price: 320, costPrice: 110, category: cat('Bakery'), available: true },
  { id: id('p'), name: 'Brownie', price: 280, costPrice: 90, category: cat('Bakery'), available: true },
  { id: id('p'), name: 'Fresh Juice', price: 350, costPrice: 120, category: cat('Drinks'), available: true },
  { id: id('p'), name: 'Mineral Water', price: 100, costPrice: 30, category: cat('Drinks'), available: true }
]

export function createSeedStore(): Store {
  return {
    products: seedProducts,
    categories: seedCategories,
    tables: seedTables,
    customers: seedCustomers,
    openTabs: [],
    history: [],
    credits: [],
    expenses: [],
    ledgers: [],
    nextOrderNo: 1
  }
}
