import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { createSeedStore } from '../shared/seed'
import { normalizeStore } from '../shared/normalize'
import type { Store } from '../shared/types'

function storePath(): string {
  return join(app.getPath('userData'), 'cafe-store.json')
}

function loadStore(): Store {
  const path = storePath()
  try {
    if (!existsSync(path)) {
      const seed = createSeedStore()
      saveStore(seed)
      return seed
    }
    const raw = readFileSync(path, 'utf-8')
    const store = normalizeStore(JSON.parse(raw))
    saveStore(store)
    return store
  } catch {
    const seed = createSeedStore()
    saveStore(seed)
    return seed
  }
}

function saveStore(store: Store): void {
  const dir = app.getPath('userData')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  writeFileSync(storePath(), JSON.stringify(store, null, 2), 'utf-8')
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Cafe Order Manager',
    backgroundColor: '#1c1410',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('store:get', () => loadStore())
  ipcMain.handle('store:set', (_event, store: Store) => {
    saveStore(store)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
