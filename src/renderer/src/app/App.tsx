import { HashRouter } from 'react-router-dom'
import { CafeStoreProvider, useCafeStore } from '@renderer/shared/store'
import { AppRoutes } from './routes'

function AppGate(): React.JSX.Element {
  const cafe = useCafeStore()

  if (cafe.loading) {
    return (
      <div className="app-loading">
        <p>Opening cafe…</p>
      </div>
    )
  }

  if (cafe.error) {
    return (
      <div className="app-loading">
        <p>{cafe.error}</p>
      </div>
    )
  }

  return <AppRoutes />
}

export default function App(): React.JSX.Element {
  return (
    <CafeStoreProvider>
      <HashRouter>
        <AppGate />
      </HashRouter>
    </CafeStoreProvider>
  )
}
