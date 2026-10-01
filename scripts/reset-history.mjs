#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const appName = 'cafe-order-manager'

function storeCandidates() {
  const home = homedir()
  const paths = [
    join(home, '.config', appName, 'cafe-store.json'),
    join(home, 'AppData', 'Roaming', appName, 'cafe-store.json'),
    join(home, 'Library', 'Application Support', appName, 'cafe-store.json')
  ]

  // electron-vite / unpackaged Electron sometimes uses "Electron"
  if (process.platform === 'linux') {
    paths.push(join(home, '.config', 'Electron', 'cafe-store.json'))
  } else if (process.platform === 'darwin') {
    paths.push(join(home, 'Library', 'Application Support', 'Electron', 'cafe-store.json'))
  } else if (process.platform === 'win32') {
    paths.push(join(home, 'AppData', 'Roaming', 'Electron', 'cafe-store.json'))
  }

  return paths
}

const path = storeCandidates().find((p) => existsSync(p))

if (!path) {
  console.log('No cafe-store.json found. Nothing to reset.')
  process.exit(0)
}

const store = JSON.parse(readFileSync(path, 'utf-8'))
const historyCount = Array.isArray(store.history) ? store.history.length : 0
const ledgerCount = Array.isArray(store.ledgers) ? store.ledgers.length : 0
const creditCount = Array.isArray(store.credits) ? store.credits.length : 0

store.history = []
store.credits = []
store.ledgers = []
store.nextOrderNo = 1

writeFileSync(path, JSON.stringify(store, null, 2), 'utf-8')

console.log(`Reset ${path}`)
console.log(
  `Cleared ${historyCount} order(s), ${creditCount} credit record(s), and ${ledgerCount} ledger day(s).`
)
console.log('Order numbering starts again at #1.')
console.log('Reload or restart the app to refresh the UI.')
