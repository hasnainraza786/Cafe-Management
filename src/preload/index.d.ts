import type { CafeApi } from '../shared/types'

declare global {
  interface Window {
    api: CafeApi
  }
}

export {}
