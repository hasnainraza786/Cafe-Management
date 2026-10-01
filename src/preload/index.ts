import { contextBridge, ipcRenderer } from 'electron'
import type { CafeApi, Store } from '../shared/types'

const api: CafeApi = {
  getStore: () => ipcRenderer.invoke('store:get'),
  setStore: (store: Store) => ipcRenderer.invoke('store:set', store)
}

contextBridge.exposeInMainWorld('api', api)
