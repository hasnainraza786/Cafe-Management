# Cafe Order Manager

Desktop POS for a small cafe. Manage table/customer tabs, menu, credit accounts, daily expenses, checkout, and a daily ledger.

## Stack

- Electron + Vite + React + TypeScript (`electron-vite`)
- Local JSON persistence in Electron `userData`

## Run

```bash
cd ~/Projects/cafe-order-manager
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Reset history & ledger

Clears completed orders, credit records, and daily ledgers (keeps products, categories, tables, customers, expenses, open tabs):

```bash
npm run reset:history
```

Then reload or restart the app.

## Usage

1. **Orders** — open a tab from the table/customer dropdown, add items, choose payment (cash / online / credit). Table credit requires selecting a customer.
2. **Menu** — products (sell + cost), categories, and tables CRUD.
3. **History** — compact order cards; click for details.
4. **Credit** — customers and outstanding credit; collect full or partial payments (then they count on the ledger).
5. **Expenses** — daily expenses that reduce net profit on the ledger.
6. **Ledger** — recognized sales (cash/online + collected credit), expenses, net profit, and item performance.
