const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  dbQuery: (text, params) => ipcRenderer.invoke('db-query', text, params),
  
  // App operations
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // Platform info
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
}); 