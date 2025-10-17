import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Enhanced SQLite Database Service with DBMS capabilities
export class SQLiteDBMS {
  private db: Database.Database;
  private static instance: SQLiteDBMS;

  private constructor() {
    const dbPath = path.join(process.cwd(), 'data', 'sales-channel.db');

    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database with optimized settings
    this.db = new Database(dbPath, {
      verbose: console.log,
      fileMustExist: false
    });

    // Enable WAL mode for better concurrency
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 10000');
    this.db.pragma('temp_store = MEMORY');
    this.db.pragma('mmap_size = 30000000000');

    this.initializeSchema();
    this.createTriggers();
    this.createIndexes();
    this.registerStatisticalFunctions();

    console.log('✅ SQLite DBMS initialized successfully');
  }

  static getInstance(): SQLiteDBMS {
    if (!SQLiteDBMS.instance) {
      SQLiteDBMS.instance = new SQLiteDBMS();
    }
    return SQLiteDBMS.instance;
  }

  private initializeSchema(): void {
    // Companies table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'India',
        tax_id TEXT,
        gstin TEXT,
        logo_url TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products table with inventory tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL CHECK(price >= 0),
        cost REAL NOT NULL CHECK(cost >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
        category TEXT,
        barcode TEXT,
        sku TEXT,
        image TEXT,
        min_stock INTEGER DEFAULT 10,
        max_stock INTEGER DEFAULT 1000,
        unit TEXT DEFAULT 'pcs',
        supplier TEXT,
        tax_rate REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    // Customers table with loyalty tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'India',
        gstin TEXT,
        loyalty_points INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0 CHECK(total_spent >= 0),
        visit_count INTEGER DEFAULT 0,
        last_visit DATETIME,
        avg_transaction_value REAL DEFAULT 0,
        customer_lifetime_value REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    // Employees table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        position TEXT,
        salary REAL,
        hire_date DATE,
        performance_score REAL DEFAULT 0,
        total_sales REAL DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        UNIQUE(company_id, employee_id)
      );
    `);

    // Transactions table with detailed tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        customer_id TEXT,
        employee_id TEXT,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL CHECK(subtotal >= 0),
        tax REAL DEFAULT 0 CHECK(tax >= 0),
        discount REAL DEFAULT 0 CHECK(discount >= 0),
        total REAL NOT NULL CHECK(total >= 0),
        payment_method TEXT DEFAULT 'cash',
        payment_details TEXT,
        status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'cancelled', 'refunded')),
        notes TEXT,
        profit_margin REAL DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      );
    `);

    // Analytics cache table for pre-computed metrics
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        metric_value REAL,
        period_start DATE,
        period_end DATE,
        computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    // Real-time events log for audit trail
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS event_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        user_id TEXT,
        event_data TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    // Stock movement tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        company_id TEXT NOT NULL,
        movement_type TEXT NOT NULL CHECK(movement_type IN ('sale', 'purchase', 'adjustment', 'return')),
        quantity INTEGER NOT NULL,
        previous_stock INTEGER NOT NULL,
        new_stock INTEGER NOT NULL,
        reference_id TEXT,
        notes TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Database schema initialized');
  }

  private createTriggers(): void {
    // Auto-update timestamp triggers
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_companies_timestamp
      AFTER UPDATE ON companies
      FOR EACH ROW
      BEGIN
        UPDATE companies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_products_timestamp
      AFTER UPDATE ON products
      FOR EACH ROW
      BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_customers_timestamp
      AFTER UPDATE ON customers
      FOR EACH ROW
      BEGIN
        UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
      END;
    `);

    // Auto-calculate customer metrics
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS calculate_customer_metrics
      AFTER UPDATE OF total_spent, visit_count ON customers
      FOR EACH ROW
      BEGIN
        UPDATE customers
        SET
          avg_transaction_value = CASE WHEN NEW.visit_count > 0 THEN NEW.total_spent / NEW.visit_count ELSE 0 END,
          customer_lifetime_value = NEW.total_spent * 1.2
        WHERE id = NEW.id;
      END;
    `);

    // Stock movement logging
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS log_stock_changes
      AFTER UPDATE OF stock ON products
      FOR EACH ROW
      WHEN OLD.stock != NEW.stock
      BEGIN
        INSERT INTO stock_movements (product_id, company_id, movement_type, quantity, previous_stock, new_stock)
        VALUES (NEW.id, NEW.company_id,
                CASE WHEN NEW.stock > OLD.stock THEN 'purchase' ELSE 'sale' END,
                ABS(NEW.stock - OLD.stock), OLD.stock, NEW.stock);
      END;
    `);

    // Event logging for transactions
    this.db.exec(`
      CREATE TRIGGER IF NOT EXISTS log_transaction_events
      AFTER INSERT ON transactions
      FOR EACH ROW
      BEGIN
        INSERT INTO event_log (company_id, event_type, entity_type, entity_id, event_data)
        VALUES (NEW.company_id, 'create', 'transaction', NEW.id,
                json_object('total', NEW.total, 'status', NEW.status));
      END;
    `);

    console.log('✅ Database triggers created');
  }

  private createIndexes(): void {
    // Performance optimization indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock <= min_stock',
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)',
      'CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id, is_active)',
      'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone)',
      'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
      'CREATE INDEX IF NOT EXISTS idx_employees_company ON employees(company_id, employee_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id, timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(DATE(timestamp))',
      'CREATE INDEX IF NOT EXISTS idx_analytics_cache ON analytics_cache(company_id, metric_type, period_start, period_end)',
      'CREATE INDEX IF NOT EXISTS idx_event_log_company ON event_log(company_id, timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id, timestamp DESC)'
    ];

    indexes.forEach(sql => this.db.exec(sql));
    console.log('✅ Database indexes created');
  }

  private registerStatisticalFunctions(): void {
    // Register custom statistical functions for advanced analytics

    // Standard deviation function
    this.db.function('stddev', {
      varargs: true,
      deterministic: true
    }, (...values: number[]) => {
      if (values.length === 0) return 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      return Math.sqrt(variance);
    });

    // Median function
    this.db.function('median', {
      varargs: true,
      deterministic: true
    }, (...values: number[]) => {
      if (values.length === 0) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    });

    // Moving average function
    this.db.function('moving_avg', {
      varargs: true,
      deterministic: true
    }, (window: number, ...values: number[]) => {
      if (values.length < window) return values.reduce((a, b) => a + b, 0) / values.length;
      const lastN = values.slice(-window);
      return lastN.reduce((a, b) => a + b, 0) / window;
    });

    // Exponential smoothing
    this.db.function('exp_smooth', {
      varargs: true,
      deterministic: true
    }, (alpha: number, ...values: number[]) => {
      if (values.length === 0) return 0;
      return values.reduce((smoothed, value) => alpha * value + (1 - alpha) * smoothed, values[0]);
    });

    console.log('✅ Statistical functions registered');
  }

  // Execute raw SQL with prepared statements
  execute(sql: string, params: any[] = []): Database.RunResult {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  // Query with prepared statements
  query<T = any>(sql: string, params: any[] = []): T[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as T[];
  }

  // Query single row
  queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const stmt = this.db.prepare(sql);
    return stmt.get(...params) as T | undefined;
  }

  // Transaction support
  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  // Backup database
  backup(destinationPath: string): void {
    const backup = this.db.backup(destinationPath);
    backup.step(-1);
    backup.close();
    console.log(`✅ Database backed up to ${destinationPath}`);
  }

  // Get database statistics
  getStats(): any {
    const stats = {
      companies: this.queryOne('SELECT COUNT(*) as count FROM companies'),
      products: this.queryOne('SELECT COUNT(*) as count FROM products'),
      customers: this.queryOne('SELECT COUNT(*) as count FROM customers'),
      employees: this.queryOne('SELECT COUNT(*) as count FROM employees'),
      transactions: this.queryOne('SELECT COUNT(*) as count FROM transactions'),
      dbSize: fs.statSync(path.join(process.cwd(), 'data', 'sales-channel.db')).size
    };
    return stats;
  }

  // Close database connection
  close(): void {
    this.db.close();
    console.log('✅ Database connection closed');
  }
}

// Export singleton instance
export const sqliteDB = SQLiteDBMS.getInstance();
