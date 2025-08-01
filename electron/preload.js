const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getProducts: () => ipcRenderer.invoke('db-get-products'),
  addProduct: (product) => ipcRenderer.invoke('db-add-product', product),
  updateProduct: (id, updates) => ipcRenderer.invoke('db-update-product', id, updates),
  deleteProduct: (id) => ipcRenderer.invoke('db-delete-product', id),
  
  getCustomers: () => ipcRenderer.invoke('db-get-customers'),
  addCustomer: (customer) => ipcRenderer.invoke('db-add-customer', customer),
  updateCustomer: (id, updates) => ipcRenderer.invoke('db-update-customer', id, updates),
  
  getEmployees: () => ipcRenderer.invoke('db-get-employees'),
  addEmployee: (employee) => ipcRenderer.invoke('db-add-employee', employee),
  
  getTransactions: () => ipcRenderer.invoke('db-get-transactions'),
  addTransaction: (transaction) => ipcRenderer.invoke('db-add-transaction', transaction),
  
  getSettings: () => ipcRenderer.invoke('db-get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('db-update-settings', settings),
  
  // App operations
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window'),
  
  // Platform info
  platform: process.platform,
  isDev: process.env.NODE_ENV === 'development'
}); 