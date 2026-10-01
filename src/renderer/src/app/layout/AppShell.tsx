import { Outlet } from 'react-router-dom'
import { HeaderNav } from './HeaderNav'
import './AppShell.css'

export function AppShell(): React.JSX.Element {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">Cafe</span>
          <span className="brand-sub">Order Manager</span>
        </div>
        <HeaderNav />
      </header>
      <Outlet />
    </div>
  )
}
