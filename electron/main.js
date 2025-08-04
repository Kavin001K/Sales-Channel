const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { Pool } = require('@neondatabase/serverless');
const Store = require('electron-store');
require('dotenv-expand')(require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }));

// Initialize electron store for settings
const store = new Store();

let mainWindow;
let db;

async function createWindow() {
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
  await initializeDatabase();
}

async function initializeDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = {
    query: async (text, params) => {
      const client = await pool.connect();
      try {
        const res = await client.query(text, params);
        return res;
      } finally {
        client.release();
      }
    },
    end: () => pool.end(),
  };

  await db.query(`
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
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
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
      lastVisit TIMESTAMPTZ,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      salary REAL,
      hireDate TIMESTAMPTZ,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      customerId TEXT REFERENCES customers(id),
      employeeId TEXT REFERENCES employees(id),
      items JSONB NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      paymentMethod TEXT,
      status TEXT DEFAULT 'completed',
      notes TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const settings = [
    { key: 'company_name', value: 'Sales Channel' },
    { key: 'company_address', value: '' },
    { key: 'company_phone', value: '' },
    { key: 'company_email', value: '' },
    { key: 'tax_rate', value: '0.08' },
    { key: 'currency', value: 'USD' }
  ];

  for (const setting of settings) {
    await db.query('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [setting.key, setting.value]);
  }
}

// IPC handlers for database operations
ipcMain.handle('db-query', async (event, text, params) => {
  try {
    const { rows } = await db.query(text, params);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error);
    throw error;
  }
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

app.on('before-quit', async () => {
  if (db) {
    await db.end();
  }
}); 