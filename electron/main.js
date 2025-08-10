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

  // Create companies table
  await db.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      country TEXT,
      taxId TEXT,
      logo TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create users table for authentication
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      companyId TEXT REFERENCES companies(id),
      isActive BOOLEAN DEFAULT true,
      lastLogin TIMESTAMPTZ,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create subscription plans table
  await db.query(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration INTEGER NOT NULL, -- in days
      features JSONB,
      tokenLimit INTEGER DEFAULT 1000,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create company subscriptions table
  await db.query(`
    CREATE TABLE IF NOT EXISTS company_subscriptions (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
      planId TEXT REFERENCES subscription_plans(id),
      status TEXT DEFAULT 'active',
      startDate TIMESTAMPTZ DEFAULT NOW(),
      endDate TIMESTAMPTZ,
      tokensUsed INTEGER DEFAULT 0,
      customPrice REAL,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create support tickets table
  await db.query(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'medium',
      assignedTo TEXT,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create products table with company association
  await db.query(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      cost REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      minStock INTEGER DEFAULT 0,
      category TEXT,
      barcode TEXT,
      sku TEXT,
      unit TEXT,
      mrp REAL,
      supplier TEXT,
      taxRate REAL DEFAULT 0,
      image TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create customers table with company association
  await db.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address JSONB,
      loyaltyPoints INTEGER DEFAULT 0,
      totalSpent REAL DEFAULT 0,
      visits INTEGER DEFAULT 0,
      lastVisit TIMESTAMPTZ,
      notes TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create employees table with company association
  await db.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      role TEXT NOT NULL,
      permissions JSONB,
      hourlyRate REAL,
      pin TEXT,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMPTZ DEFAULT NOW(),
      updatedAt TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Create transactions table with company association
  await db.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      companyId TEXT REFERENCES companies(id),
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

  // Create settings table
  await db.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert default subscription plans
  const defaultPlans = [
    {
      id: 'basic_plan',
      name: 'Basic Plan',
      description: 'Perfect for small businesses',
      price: 29.99,
      duration: 30,
      features: JSON.stringify(['Basic POS', 'Up to 100 products', 'Basic reporting']),
      tokenLimit: 1000
    },
    {
      id: 'pro_plan',
      name: 'Pro Plan',
      description: 'Ideal for growing businesses',
      price: 59.99,
      duration: 30,
      features: JSON.stringify(['Advanced POS', 'Unlimited products', 'Advanced reporting', 'Multi-user support']),
      tokenLimit: 5000
    },
    {
      id: 'enterprise_plan',
      name: 'Enterprise Plan',
      description: 'For large businesses with custom needs',
      price: 99.99,
      duration: 30,
      features: JSON.stringify(['Full POS suite', 'Unlimited everything', 'Priority support', 'Custom integrations']),
      tokenLimit: 10000
    }
  ];

  for (const plan of defaultPlans) {
    await db.query(`
      INSERT INTO subscription_plans (id, name, description, price, duration, features, tokenLimit)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO NOTHING
    `, [plan.id, plan.name, plan.description, plan.price, plan.duration, plan.features, plan.tokenLimit]);
  }

  // Insert default settings
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

  console.log('Database initialized successfully');
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