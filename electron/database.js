const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { app, ipcMain } = require('electron');

let db;

function initializeDatabase() {
  const userData = app.getPath('userData');
  const dbPath = path.join(userData, 'sales-channel-local.db');

  if (!fs.existsSync(userData)) {
    fs.mkdirSync(userData, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Schema: SQLite-compatible
  const exec = (sql) => db.exec(sql);

  exec(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    tax_id TEXT,
    logo_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    features TEXT,
    token_limit INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS company_subscriptions (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES subscription_plans(id),
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'active',
    tokens_used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    cost REAL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    category TEXT,
    barcode TEXT,
    sku TEXT,
    unit TEXT,
    mrp REAL,
    supplier TEXT,
    tax_rate REAL DEFAULT 0,
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    visits INTEGER DEFAULT 0,
    last_visit TEXT,
    notes TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT,
    permissions TEXT,
    hourly_rate REAL,
    pin TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id),
    employee_id TEXT REFERENCES employees(id),
    items TEXT NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    payment_method TEXT,
    status TEXT DEFAULT 'completed',
    notes TEXT,
    timestamp TEXT DEFAULT (datetime('now'))
  );`);

  exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`);

  // Seed defaults (ON CONFLICT DO NOTHING equivalent in SQLite)
  const insertPlan = db.prepare(`INSERT OR IGNORE INTO subscription_plans (id, name, price, duration_days, features, token_limit, is_active) VALUES (?,?,?,?,?,?,1)`);
  const defaults = [
    ['550e8400-e29b-41d4-a716-446655440001', 'Basic Monthly', 29.99, 30, JSON.stringify(['5 Users','1000 Transactions/Month','Basic Reporting']), 1000],
    ['550e8400-e29b-41d4-a716-446655440002', 'Pro Monthly', 79.99, 30, JSON.stringify(['20 Users','5000 Transactions/Month','Advanced Reporting','API Access']), 5000],
    ['550e8400-e29b-41d4-a716-446655440003', 'Enterprise Yearly', 999.99, 365, JSON.stringify(['Unlimited Users','Unlimited Transactions','Premium Support','Custom Integrations']), 100000],
  ];
  const txn = db.transaction(() => {
    defaults.forEach(d => insertPlan.run(d));
  });
  txn();

  return db;
}

function registerHandlers(ipc) {
  ipc.handle('db-query', (event, sql, params = []) => {
    try {
      // Determine statement type
      const trimmed = (sql || '').trim().toUpperCase();
      if (trimmed.startsWith('SELECT')) {
        const stmt = db.prepare(sql);
        const rows = stmt.all(params);
        return rows;
      } else if (trimmed.startsWith('INSERT')) {
        const stmt = db.prepare(sql);
        const info = stmt.run(params);
        return { changes: info.changes, lastInsertRowid: info.lastInsertRowid };
      } else if (trimmed.startsWith('UPDATE') || trimmed.startsWith('DELETE') || trimmed.startsWith('CREATE') || trimmed.startsWith('DROP')) {
        const stmt = db.prepare(sql);
        const info = stmt.run(params);
        return { changes: info.changes };
      } else {
        const stmt = db.prepare(sql);
        const info = stmt.run(params);
        return { changes: info.changes };
      }
    } catch (error) {
      console.error('SQLite query error:', error, sql);
      return { error: String(error.message || error) };
    }
  });
}

module.exports = { initializeDatabase, registerHandlers };



