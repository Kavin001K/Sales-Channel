const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_u9wzkM2ArXbo@ep-polished-dew-ael3uza7-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const client = new Client({
  connectionString: connectionString,
});

async function setupDatabase() {
  try {
    console.log('Connecting to Neon PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    // Create tables
    console.log('Creating tables...');
    
    // Companies table
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        tax_id VARCHAR(100),
        logo_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category VARCHAR(100),
        barcode VARCHAR(100),
        sku VARCHAR(100),
        image TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        notes TEXT,
        total_spent DECIMAL(10,2) DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        last_visit TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    // Employees table
    await client.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        employee_id VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        position VARCHAR(100),
        salary DECIMAL(10,2),
        hire_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        UNIQUE(company_id, employee_id)
      )
    `);

    // Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        customer_id VARCHAR(255),
        employee_id VARCHAR(255),
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'completed',
        notes TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        company_id VARCHAR(255) NOT NULL,
        key VARCHAR(255) NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (company_id, key),
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )
    `);

    console.log('Tables created successfully!');

    // Insert sample data
    console.log('Inserting sample data...');

    // Sample companies
    const bcrypt = require('bcrypt');
    const sampleCompanies = [
      {
        id: 'comp_001',
        name: 'Tech Solutions Inc',
        email: 'admin@techsolutions.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        phone: '+1-555-0100',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zip_code: '94105',
        country: 'USA',
        tax_id: 'TAX123456789'
      },
      {
        id: 'comp_002',
        name: 'Retail Store Plus',
        email: 'admin@retailstore.com',
        password_hash: bcrypt.hashSync('admin123', 10),
        phone: '+1-555-0200',
        address: '456 Retail Avenue',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        tax_id: 'TAX987654321'
      }
    ];

    for (const company of sampleCompanies) {
      await client.query(`
        INSERT INTO companies (id, name, email, password_hash, phone, address, city, state, zip_code, country, tax_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [company.id, company.name, company.email, company.password_hash, company.phone, company.address, company.city, company.state, company.zip_code, company.country, company.tax_id]);
    }

    // Sample products for company 1
    const sampleProducts = [
      {
        id: 'prod_001',
        company_id: 'comp_001',
        name: 'Laptop Computer',
        description: 'High-performance laptop for business use',
        price: 1299.99,
        cost: 800.00,
        stock: 15,
        category: 'Electronics',
        barcode: '1234567890123',
        sku: 'LAP001'
      },
      {
        id: 'prod_002',
        company_id: 'comp_001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        cost: 15.00,
        stock: 50,
        category: 'Electronics',
        barcode: '1234567890124',
        sku: 'MOU001'
      },
      {
        id: 'prod_003',
        company_id: 'comp_002',
        name: 'Office Chair',
        description: 'Comfortable office chair with lumbar support',
        price: 199.99,
        cost: 120.00,
        stock: 10,
        category: 'Furniture',
        barcode: '1234567890125',
        sku: 'CHA001'
      }
    ];

    for (const product of sampleProducts) {
      await client.query(`
        INSERT INTO products (id, company_id, name, description, price, cost, stock, category, barcode, sku)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [product.id, product.company_id, product.name, product.description, product.price, product.cost, product.stock, product.category, product.barcode, product.sku]);
    }

    // Sample customers
    const sampleCustomers = [
      {
        id: 'cust_001',
        company_id: 'comp_001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA'
      },
      {
        id: 'cust_002',
        company_id: 'comp_001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90210',
        country: 'USA'
      },
      {
        id: 'cust_003',
        company_id: 'comp_002',
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '+1-555-0103',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA'
      }
    ];

    for (const customer of sampleCustomers) {
      await client.query(`
        INSERT INTO customers (id, company_id, name, email, phone, address, city, state, zip_code, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [customer.id, customer.company_id, customer.name, customer.email, customer.phone, customer.address, customer.city, customer.state, customer.zip_code, customer.country]);
    }

    // Sample employees
    const sampleEmployees = [
      {
        id: 'emp_001',
        company_id: 'comp_001',
        employee_id: 'EMP001',
        password_hash: bcrypt.hashSync('emp123', 10),
        name: 'Alice Manager',
        email: 'alice.manager@techsolutions.com',
        phone: '+1-555-0201',
        position: 'Store Manager',
        salary: 45000.00,
        hire_date: '2023-01-15'
      },
      {
        id: 'emp_002',
        company_id: 'comp_001',
        employee_id: 'EMP002',
        password_hash: bcrypt.hashSync('emp123', 10),
        name: 'Bob Sales',
        email: 'bob.sales@techsolutions.com',
        phone: '+1-555-0202',
        position: 'Sales Associate',
        salary: 32000.00,
        hire_date: '2023-03-20'
      },
      {
        id: 'emp_003',
        company_id: 'comp_002',
        employee_id: 'EMP001',
        password_hash: bcrypt.hashSync('emp123', 10),
        name: 'Carol Cashier',
        email: 'carol.cashier@retailstore.com',
        phone: '+1-555-0203',
        position: 'Cashier',
        salary: 28000.00,
        hire_date: '2023-02-10'
      }
    ];

    for (const employee of sampleEmployees) {
      await client.query(`
        INSERT INTO employees (id, company_id, employee_id, password_hash, name, email, phone, position, salary, hire_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [employee.id, employee.company_id, employee.employee_id, employee.password_hash, employee.name, employee.email, employee.phone, employee.position, employee.salary, employee.hire_date]);
    }

    // Sample transactions
    const sampleTransactions = [
      {
        id: 'trans_001',
        company_id: 'comp_001',
        customer_id: 'cust_001',
        employee_id: 'emp_001',
        items: JSON.stringify([
          { productId: 'prod_001', name: 'Laptop Computer', price: 1299.99, quantity: 1 }
        ]),
        subtotal: 1299.99,
        tax: 103.99,
        discount: 0,
        total: 1403.98,
        payment_method: 'credit_card'
      },
      {
        id: 'trans_002',
        company_id: 'comp_001',
        customer_id: 'cust_002',
        employee_id: 'emp_002',
        items: JSON.stringify([
          { productId: 'prod_002', name: 'Wireless Mouse', price: 29.99, quantity: 2 }
        ]),
        subtotal: 59.98,
        tax: 4.80,
        discount: 5.00,
        total: 59.78,
        payment_method: 'cash'
      }
    ];

    for (const transaction of sampleTransactions) {
      await client.query(`
        INSERT INTO transactions (id, company_id, customer_id, employee_id, items, subtotal, tax, discount, total, payment_method)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [transaction.id, transaction.company_id, transaction.customer_id, transaction.employee_id, transaction.items, transaction.subtotal, transaction.tax, transaction.discount, transaction.total, transaction.payment_method]);
    }

    // Default settings for each company
    const defaultSettings = [
      { company_id: 'comp_001', key: 'company_name', value: 'Tech Solutions Inc' },
      { company_id: 'comp_001', key: 'company_address', value: '123 Tech Street, San Francisco, CA 94105' },
      { company_id: 'comp_001', key: 'company_phone', value: '+1-555-0100' },
      { company_id: 'comp_001', key: 'company_email', value: 'admin@techsolutions.com' },
      { company_id: 'comp_001', key: 'tax_rate', value: '0.08' },
      { company_id: 'comp_001', key: 'currency', value: 'USD' },
      { company_id: 'comp_002', key: 'company_name', value: 'Retail Store Plus' },
      { company_id: 'comp_002', key: 'company_address', value: '456 Retail Avenue, New York, NY 10001' },
      { company_id: 'comp_002', key: 'company_phone', value: '+1-555-0200' },
      { company_id: 'comp_002', key: 'company_email', value: 'admin@retailstore.com' },
      { company_id: 'comp_002', key: 'tax_rate', value: '0.08' },
      { company_id: 'comp_002', key: 'currency', value: 'USD' }
    ];

    for (const setting of defaultSettings) {
      await client.query(`
        INSERT INTO settings (company_id, key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value
      `, [setting.company_id, setting.key, setting.value]);
    }

    console.log('Sample data inserted successfully!');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_company_category ON products(company_id, category)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_customers_company_email ON customers(company_id, email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_company_timestamp ON transactions(company_id, timestamp)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_employees_company_employee_id ON employees(company_id, employee_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_companies_email ON companies(email)');

    console.log('Indexes created successfully!');

    // Verify the setup
    console.log('\nVerifying database setup...');
    
    const companyCount = await client.query('SELECT COUNT(*) FROM companies');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const customerCount = await client.query('SELECT COUNT(*) FROM customers');
    const employeeCount = await client.query('SELECT COUNT(*) FROM employees');
    const transactionCount = await client.query('SELECT COUNT(*) FROM transactions');
    const settingCount = await client.query('SELECT COUNT(*) FROM settings');

    console.log(`✅ Companies: ${companyCount.rows[0].count}`);
    console.log(`✅ Products: ${productCount.rows[0].count}`);
    console.log(`✅ Customers: ${customerCount.rows[0].count}`);
    console.log(`✅ Employees: ${employeeCount.rows[0].count}`);
    console.log(`✅ Transactions: ${transactionCount.rows[0].count}`);
    console.log(`✅ Settings: ${settingCount.rows[0].count}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now use the application with PostgreSQL database and authentication.');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
  }
}

setupDatabase(); 