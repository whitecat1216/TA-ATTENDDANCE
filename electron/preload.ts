import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  showSaveDialog: (defaultName: string) =>
    ipcRenderer.invoke('show-save-dialog', defaultName),
})
