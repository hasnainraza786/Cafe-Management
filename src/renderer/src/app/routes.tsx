import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layout/AppShell'
import { OrdersPage } from '@renderer/domains/orders'
import { MenuPage } from '@renderer/domains/menu'
import { HistoryPage } from '@renderer/domains/history'
import { CreditPage } from '@renderer/domains/credit'
import { ExpensesPage } from '@renderer/domains/expenses'
import { ReportsPage } from '@renderer/domains/reports'
import { LedgerPage } from '@renderer/domains/ledger'

export function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/orders" replace />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="credit" element={<CreditPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="ledger" element={<LedgerPage />} />
        <Route path="*" element={<Navigate to="/orders" replace />} />
      </Route>
    </Routes>
  )
}
