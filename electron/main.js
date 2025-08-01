const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const Store = require('electron-store');

// Initialize electron store for settings
const store = new Store();

let mainWindow;
let db;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.png'),
    title: 'Sales Channel - POS System'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Initialize database
  initializeDatabase();
}

function initializeDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'sales_channel.db');
  db = new Database(dbPath);
  
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      category TEXT,
      barcode TEXT,
      sku TEXT,
      image TEXT,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      country TEXT,
      notes TEXT,
      totalSpent REAL DEFAULT 0,
      visitCount INTEGER DEFAULT 0,
      lastVisit DATETIME,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      salary REAL,
      hireDate DATETIME,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      employeeId TEXT,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      paymentMethod TEXT,
      status TEXT DEFAULT 'completed',
      notes TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers (id),
      FOREIGN KEY (employeeId) REFERENCES employees (id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert default settings if they don't exist
  const settingsStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  settingsStmt.run('company_name', 'Sales Channel');
  settingsStmt.run('company_address', '');
  settingsStmt.run('company_phone', '');
  settingsStmt.run('company_email', '');
  settingsStmt.run('tax_rate', '0.08');
  settingsStmt.run('currency', 'USD');
}

// IPC handlers for database operations
ipcMain.handle('db-get-products', () => {
  const stmt = db.prepare('SELECT * FROM products WHERE isActive = 1 ORDER BY name');
  return stmt.all();
});

ipcMain.handle('db-add-product', (event, product) => {
  const stmt = db.prepare(`
    INSERT INTO products (id, name, description, price, cost, stock, category, barcode, sku, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    product.id,
    product.name,
    product.description,
    product.price,
    product.cost,
    product.stock,
    product.category,
    product.barcode,
    product.sku,
    product.image
  );
});

ipcMain.handle('db-update-product', (event, id, updates) => {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE products SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
  return stmt.run(...values);
});

ipcMain.handle('db-delete-product', (event, id) => {
  const stmt = db.prepare('UPDATE products SET isActive = 0 WHERE id = ?');
  return stmt.run(id);
});

ipcMain.handle('db-get-customers', () => {
  const stmt = db.prepare('SELECT * FROM customers WHERE isActive = 1 ORDER BY name');
  return stmt.all();
});

ipcMain.handle('db-add-customer', (event, customer) => {
  const stmt = db.prepare(`
    INSERT INTO customers (id, name, email, phone, address, city, state, zipCode, country, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    customer.id,
    customer.name,
    customer.email,
    customer.phone,
    customer.address,
    customer.city,
    customer.state,
    customer.zipCode,
    customer.country,
    customer.notes
  );
});

ipcMain.handle('db-update-customer', (event, id, updates) => {
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(id);
  
  const stmt = db.prepare(`UPDATE customers SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`);
  return stmt.run(...values);
});

ipcMain.handle('db-get-employees', () => {
  const stmt = db.prepare('SELECT * FROM employees WHERE isActive = 1 ORDER BY name');
  return stmt.all();
});

ipcMain.handle('db-add-employee', (event, employee) => {
  const stmt = db.prepare(`
    INSERT INTO employees (id, name, email, phone, position, salary, hireDate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    employee.id,
    employee.name,
    employee.email,
    employee.phone,
    employee.position,
    employee.salary,
    employee.hireDate
  );
});

ipcMain.handle('db-get-transactions', () => {
  const stmt = db.prepare(`
    SELECT t.*, c.name as customerName, e.name as employeeName 
    FROM transactions t 
    LEFT JOIN customers c ON t.customerId = c.id 
    LEFT JOIN employees e ON t.employeeId = e.id 
    ORDER BY t.timestamp DESC
  `);
  return stmt.all();
});

ipcMain.handle('db-add-transaction', (event, transaction) => {
  const stmt = db.prepare(`
    INSERT INTO transactions (id, customerId, employeeId, items, subtotal, tax, discount, total, paymentMethod, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    transaction.id,
    transaction.customerId,
    transaction.employeeId,
    JSON.stringify(transaction.items),
    transaction.subtotal,
    transaction.tax,
    transaction.discount,
    transaction.total,
    transaction.paymentMethod,
    transaction.notes
  );
});

ipcMain.handle('db-get-settings', () => {
  const stmt = db.prepare('SELECT key, value FROM settings');
  const settings = {};
  const rows = stmt.all();
  rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
});

ipcMain.handle('db-update-settings', (event, settings) => {
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, value);
  }
  return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (db) {
    db.close();
  }
}); 