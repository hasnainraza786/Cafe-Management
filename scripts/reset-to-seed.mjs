#!/usr/bin/env node
/**
 * Replace cafe-store.json with a fresh seed store (menu/tables only, no orders/credits/expenses).
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Load compiled JS if present; otherwise evaluate seed via dynamic import of TS is hard —
// duplicate minimal seed write by spawning tsx, or import from built out.
// Prefer importing from source via node --experimental / copy seed logic inline.

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function createSeedStore() {
  const categories = [
    { id: id('cat'), name: 'Coffee' },
    { id: id('cat'), name: 'Tea' },
    { id: id('cat'), name: 'Food' },
    { id: id('cat'), name: 'Bakery' },
    { id: id('cat'), name: 'Drinks' }
  ]
  const cat = (name) => categories.find((c) => c.name === name)?.name ?? name
  return {
    products: [
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
    ],
    categories,
    tables: [
      { id: id('tbl'), name: 'Table 1' },
      { id: id('tbl'), name: 'Table 2' },
      { id: id('tbl'), name: 'Table 3' },
      { id: id('tbl'), name: 'Table 4' }
    ],
    customers: [],
    openTabs: [],
    history: [],
    credits: [],
    expenses: [],
    ledgers: [],
    nextOrderNo: 1
  }
}

function storeCandidates() {
  const home = homedir()
  const appName = 'cafe-order-manager'
  const paths = [
    join(home, '.config', appName, 'cafe-store.json'),
    join(home, 'AppData', 'Roaming', appName, 'cafe-store.json'),
    join(home, 'Library', 'Application Support', appName, 'cafe-store.json')
  ]
  if (process.platform === 'linux') {
    paths.push(join(home, '.config', 'Electron', 'cafe-store.json'))
  } else if (process.platform === 'darwin') {
    paths.push(join(home, 'Library', 'Application Support', 'Electron', 'cafe-store.json'))
  } else if (process.platform === 'win32') {
    paths.push(join(home, 'AppData', 'Roaming', 'Electron', 'cafe-store.json'))
  }
  return paths
}

const path = storeCandidates().find((p) => existsSync(p)) ?? storeCandidates()[0]
const dir = dirname(path)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

writeFileSync(path, JSON.stringify(createSeedStore(), null, 2), 'utf-8')
console.log(`Wrote fresh seed store to ${path}`)
console.log('Restart or reload the app to pick it up.')
