import { sqliteDB } from './sqlite-database';
import bcrypt from 'bcryptjs';

// Sample Data Seeder for Development
export class DataSeeder {
  static async seedAll(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      // Check if data already exists
      const existingCompanies = sqliteDB.queryOne('SELECT COUNT(*) as count FROM companies');
      if (existingCompanies && (existingCompanies as any).count > 0) {
        console.log('✅ Database already has data, skipping seed');
        return;
      }

      await this.seedCompanies();
      await this.seedProducts();
      await this.seedCustomers();
      await this.seedEmployees();
      await this.seedTransactions();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      throw error;
    }
  }

  private static async seedCompanies(): Promise<void> {
    const passwordHash = await bcrypt.hash('password', 10);

    const companies = [
      {
        id: 'company-1',
        name: 'Default Company',
        email: 'admin@defaultcompany.com',
        password_hash: passwordHash,
        phone: '+91 9876543210',
        address: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip_code: '400001',
        country: 'India',
        tax_id: 'GST123456789',
        gstin: '27AABCU9603R1ZM'
      },
      {
        id: 'company-2',
        name: 'Ace-Bill',
        email: 'info@acebill.com',
        password_hash: passwordHash,
        phone: '+91 8765432109',
        address: '456 Commerce Plaza',
        city: 'Delhi',
        state: 'Delhi',
        zip_code: '110001',
        country: 'India',
        tax_id: 'GST987654321',
        gstin: '07AABCU9603R1ZN'
      }
    ];

    for (const company of companies) {
      sqliteDB.execute(`
        INSERT INTO companies (id, name, email, password_hash, phone, address, city, state, zip_code, country, tax_id, gstin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [company.id, company.name, company.email, company.password_hash, company.phone, company.address, company.city, company.state, company.zip_code, company.country, company.tax_id, company.gstin]);
    }

    console.log('✅ Companies seeded');
  }

  private static async seedProducts(): Promise<void> {
    const products = [
      // Electronics
      { name: 'Laptop - Dell XPS 13', category: 'Electronics', price: 89999, cost: 75000, stock: 25, barcode: 'EL001', sku: 'LAPTOP-XPS13', min_stock: 5 },
      { name: 'iPhone 15 Pro', category: 'Electronics', price: 134900, cost: 110000, stock: 30, barcode: 'EL002', sku: 'IPHONE-15PRO', min_stock: 10 },
      { name: 'Samsung Galaxy S24', category: 'Electronics', price: 79999, cost: 65000, stock: 40, barcode: 'EL003', sku: 'GALAXY-S24', min_stock: 10 },
      { name: 'iPad Air', category: 'Electronics', price: 59900, cost: 48000, stock: 20, barcode: 'EL004', sku: 'IPAD-AIR', min_stock: 5 },
      { name: 'AirPods Pro', category: 'Electronics', price: 24900, cost: 20000, stock: 50, barcode: 'EL005', sku: 'AIRPODS-PRO', min_stock: 15 },

      // Clothing
      { name: 'Men\'s T-Shirt - Blue', category: 'Clothing', price: 799, cost: 400, stock: 100, barcode: 'CL001', sku: 'TSHIRT-BLUE-M', min_stock: 20 },
      { name: 'Women\'s Jeans', category: 'Clothing', price: 1999, cost: 1200, stock: 75, barcode: 'CL002', sku: 'JEANS-WOMEN', min_stock: 15 },
      { name: 'Running Shoes', category: 'Clothing', price: 3499, cost: 2200, stock: 60, barcode: 'CL003', sku: 'SHOES-RUN', min_stock: 10 },
      { name: 'Winter Jacket', category: 'Clothing', price: 4999, cost: 3200, stock: 35, barcode: 'CL004', sku: 'JACKET-WINTER', min_stock: 8 },

      // Food & Beverages
      { name: 'Organic Milk - 1L', category: 'Food', price: 65, cost: 45, stock: 200, barcode: 'FD001', sku: 'MILK-1L', min_stock: 50 },
      { name: 'Brown Bread', category: 'Food', price: 45, cost: 30, stock: 150, barcode: 'FD002', sku: 'BREAD-BROWN', min_stock: 40 },
      { name: 'Coffee Beans - 500g', category: 'Food', price: 599, cost: 400, stock: 80, barcode: 'FD003', sku: 'COFFEE-500G', min_stock: 20 },
      { name: 'Green Tea Box', category: 'Food', price: 299, cost: 180, stock: 90, barcode: 'FD004', sku: 'TEA-GREEN', min_stock: 25 },

      // Home & Kitchen
      { name: 'Mixer Grinder', category: 'Home', price: 3999, cost: 2800, stock: 15, barcode: 'HK001', sku: 'MIXER-GR', min_stock: 3 },
      { name: 'Electric Kettle', category: 'Home', price: 1299, cost: 900, stock: 25, barcode: 'HK002', sku: 'KETTLE-EL', min_stock: 5 },
      { name: 'Dinner Set - 24 pcs', category: 'Home', price: 2499, cost: 1600, stock: 20, barcode: 'HK003', sku: 'DINNER-SET', min_stock: 4 },

      // Books & Stationery
      { name: 'Notebook A4', category: 'Stationery', price: 120, cost: 70, stock: 300, barcode: 'ST001', sku: 'NOTE-A4', min_stock: 100 },
      { name: 'Pen Set (10 pcs)', category: 'Stationery', price: 250, cost: 150, stock: 200, barcode: 'ST002', sku: 'PEN-SET', min_stock: 50 },
      { name: 'Bestseller Novel', category: 'Books', price: 499, cost: 350, stock: 45, barcode: 'BK001', sku: 'NOVEL-BS', min_stock: 10 },

      // Sports & Fitness
      { name: 'Yoga Mat', category: 'Sports', price: 999, cost: 650, stock: 40, barcode: 'SP001', sku: 'YOGA-MAT', min_stock: 10 },
      { name: 'Dumbbells - 5kg Pair', category: 'Sports', price: 1799, cost: 1200, stock: 30, barcode: 'SP002', sku: 'DUMBBELL-5KG', min_stock: 8 },
      { name: 'Cricket Bat', category: 'Sports', price: 2999, cost: 2000, stock: 15, barcode: 'SP003', sku: 'BAT-CRICKET', min_stock: 5 }
    ];

    for (const product of products) {
      sqliteDB.execute(`
        INSERT INTO products (id, company_id, name, category, price, cost, stock, barcode, sku, min_stock, unit, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `prod-${product.sku}`,
        'company-1',
        product.name,
        product.category,
        product.price,
        product.cost,
        product.stock,
        product.barcode,
        product.sku,
        product.min_stock,
        'pcs',
        1
      ]);
    }

    console.log('✅ Products seeded (22 items)');
  }

  private static async seedCustomers(): Promise<void> {
    const customers = [
      { name: 'Rajesh Kumar', email: 'rajesh@email.com', phone: '+91 9876543211', city: 'Mumbai', state: 'Maharashtra', loyalty_points: 150 },
      { name: 'Priya Sharma', email: 'priya@email.com', phone: '+91 9876543212', city: 'Delhi', state: 'Delhi', loyalty_points: 320 },
      { name: 'Amit Patel', email: 'amit@email.com', phone: '+91 9876543213', city: 'Ahmedabad', state: 'Gujarat', loyalty_points: 85 },
      { name: 'Sneha Reddy', email: 'sneha@email.com', phone: '+91 9876543214', city: 'Hyderabad', state: 'Telangana', loyalty_points: 240 },
      { name: 'Vikram Singh', email: 'vikram@email.com', phone: '+91 9876543215', city: 'Jaipur', state: 'Rajasthan', loyalty_points: 410 },
      { name: 'Ananya Iyer', email: 'ananya@email.com', phone: '+91 9876543216', city: 'Chennai', state: 'Tamil Nadu', loyalty_points: 190 },
      { name: 'Rohit Desai', email: 'rohit@email.com', phone: '+91 9876543217', city: 'Pune', state: 'Maharashtra', loyalty_points: 560 },
      { name: 'Kavita Mehta', email: 'kavita@email.com', phone: '+91 9876543218', city: 'Bangalore', state: 'Karnataka', loyalty_points: 125 },
      { name: 'Arjun Nair', email: 'arjun@email.com', phone: '+91 9876543219', city: 'Kochi', state: 'Kerala', loyalty_points: 275 },
      { name: 'Pooja Gupta', email: 'pooja@email.com', phone: '+91 9876543220', city: 'Kolkata', state: 'West Bengal', loyalty_points: 95 }
    ];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      sqliteDB.execute(`
        INSERT INTO customers (id, company_id, name, email, phone, city, state, country, loyalty_points, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `cust-${i + 1}`,
        'company-1',
        customer.name,
        customer.email,
        customer.phone,
        customer.city,
        customer.state,
        'India',
        customer.loyalty_points,
        1
      ]);
    }

    console.log('✅ Customers seeded (10 customers)');
  }

  private static async seedEmployees(): Promise<void> {
    const passwordHash = await bcrypt.hash('password', 10);

    const employees = [
      { employee_id: 'EMP001', name: 'John Doe', position: 'cashier', salary: 25000 },
      { employee_id: 'EMP002', name: 'Sarah Johnson', position: 'manager', salary: 45000 },
      { employee_id: 'EMP003', name: 'Mike Williams', position: 'cashier', salary: 24000 },
      { employee_id: 'EMP004', name: 'Emily Brown', position: 'sales', salary: 28000 },
      { employee_id: 'EMP005', name: 'David Lee', position: 'admin', salary: 35000 }
    ];

    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];
      sqliteDB.execute(`
        INSERT INTO employees (id, company_id, employee_id, password_hash, name, position, salary, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `emp-${i + 1}`,
        'company-1',
        emp.employee_id,
        passwordHash,
        emp.name,
        emp.position,
        emp.salary,
        1
      ]);
    }

    console.log('✅ Employees seeded (5 employees)');
  }

  private static async seedTransactions(): Promise<void> {
    // Generate transactions for the last 30 days
    const now = new Date();
    const products = sqliteDB.query('SELECT id, name, price FROM products LIMIT 10');
    const customers = sqliteDB.query('SELECT id FROM customers');
    const employees = sqliteDB.query('SELECT id FROM employees');

    for (let day = 30; day >= 0; day--) {
      const transactionDate = new Date(now);
      transactionDate.setDate(transactionDate.getDate() - day);

      // Generate 3-8 random transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 6) + 3;

      for (let i = 0; i < transactionsPerDay; i++) {
        const numItems = Math.floor(Math.random() * 3) + 1;
        const items = [];
        let subtotal = 0;

        for (let j = 0; j < numItems; j++) {
          const product: any = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const price = product.price;

          items.push({
            productId: product.id,
            name: product.name,
            quantity,
            price
          });

          subtotal += price * quantity;
        }

        const tax = subtotal * 0.18; // 18% GST
        const discount = Math.random() > 0.7 ? subtotal * 0.1 : 0; // 10% discount on 30% of orders
        const total = subtotal + tax - discount;

        const customer: any = customers[Math.floor(Math.random() * customers.length)];
        const employee: any = employees[Math.floor(Math.random() * employees.length)];
        const paymentMethods = ['cash', 'card', 'upi', 'wallet'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

        sqliteDB.execute(`
          INSERT INTO transactions (id, company_id, customer_id, employee_id, items, subtotal, tax, discount, total, payment_method, status, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          `txn-${day}-${i}`,
          'company-1',
          customer.id,
          employee.id,
          JSON.stringify(items),
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          'completed',
          transactionDate.toISOString()
        ]);

        // Update customer stats
        sqliteDB.execute(`
          UPDATE customers
          SET total_spent = total_spent + ?, visit_count = visit_count + 1, last_visit = ?
          WHERE id = ?
        `, [total, transactionDate.toISOString(), customer.id]);
      }
    }

    console.log('✅ Transactions seeded (150+ transactions over 30 days)');
  }
}
