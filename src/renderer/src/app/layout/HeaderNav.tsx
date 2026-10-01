import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/orders', label: 'Orders' },
  { to: '/menu', label: 'Menu' },
  { to: '/history', label: 'History' },
  { to: '/credit', label: 'Credit' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/reports', label: 'Reports' },
  { to: '/ledger', label: 'Ledger' }
] as const

export function HeaderNav(): React.JSX.Element {
  return (
    <nav className="header-nav">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? 'nav-btn active' : 'nav-btn')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
