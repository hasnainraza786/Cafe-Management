import { createContext, useContext, type ReactNode } from 'react'
import { useCafeStoreState } from './useCafeStore'

export type CafeStore = ReturnType<typeof useCafeStoreState>

const CafeStoreContext = createContext<CafeStore | null>(null)

export function CafeStoreProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const value = useCafeStoreState()
  return <CafeStoreContext.Provider value={value}>{children}</CafeStoreContext.Provider>
}

export function useCafeStore(): CafeStore {
  const ctx = useContext(CafeStoreContext)
  if (!ctx) {
    throw new Error('useCafeStore must be used within CafeStoreProvider')
  }
  return ctx
}
