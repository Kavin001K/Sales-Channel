import { Pool } from 'pg';
import Decimal from 'decimal.js';

/**
 * Comprehensive Database Seeding Script
 * Creates realistic sample data for testing analytics and algorithms
 *
 * Generates:
 * - 100+ Products across multiple categories
 * - 80+ Customers with realistic data
 * - 50+ Employees across different roles
 * - 200+ Transactions spanning 6 months
 * - Realistic transaction patterns (peak hours, seasonal trends)
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/sales_channel',
});

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generatePhoneNumber(): string {
  return `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`;
}

function generateEmail(name: string): string {
  const domain = randomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']);
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;
}

// Sample data templates
const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Home & Kitchen',
  'Sports & Fitness',
  'Books & Stationery',
  'Beauty & Personal Care',
  'Toys & Games',
  'Furniture',
  'Automotive'
];

const PRODUCT_TEMPLATES = {
  'Electronics': [
    { name: 'Wireless Mouse', priceRange: [299, 1999], costMultiplier: 0.6 },
    { name: 'USB Cable', priceRange: [99, 499], costMultiplier: 0.5 },
    { name: 'Bluetooth Speaker', priceRange: [999, 4999], costMultiplier: 0.65 },
    { name: 'Power Bank', priceRange: [699, 2999], costMultiplier: 0.6 },
    { name: 'Phone Case', priceRange: [199, 899], costMultiplier: 0.4 },
    { name: 'Screen Protector', priceRange: [149, 599], costMultiplier: 0.5 },
    { name: 'Earphones', priceRange: [299, 2499], costMultiplier: 0.55 },
    { name: 'Laptop Bag', priceRange: [799, 2999], costMultiplier: 0.6 },
    { name: 'Keyboard', priceRange: [499, 3999], costMultiplier: 0.65 },
    { name: 'Webcam', priceRange: [1299, 5999], costMultiplier: 0.7 },
  ],
  'Clothing': [
    { name: 'T-Shirt', priceRange: [299, 999], costMultiplier: 0.5 },
    { name: 'Jeans', priceRange: [799, 2499], costMultiplier: 0.6 },
    { name: 'Shirt', priceRange: [599, 1999], costMultiplier: 0.55 },
    { name: 'Dress', priceRange: [999, 3999], costMultiplier: 0.6 },
    { name: 'Jacket', priceRange: [1499, 5999], costMultiplier: 0.65 },
    { name: 'Shoes', priceRange: [799, 4999], costMultiplier: 0.6 },
    { name: 'Cap', priceRange: [199, 699], costMultiplier: 0.5 },
    { name: 'Socks', priceRange: [99, 399], costMultiplier: 0.4 },
    { name: 'Belt', priceRange: [299, 1299], costMultiplier: 0.55 },
    { name: 'Scarf', priceRange: [249, 999], costMultiplier: 0.5 },
  ],
  'Food & Beverages': [
    { name: 'Coffee', priceRange: [120, 350], costMultiplier: 0.4 },
    { name: 'Tea', priceRange: [80, 250], costMultiplier: 0.35 },
    { name: 'Sandwich', priceRange: [150, 300], costMultiplier: 0.5 },
    { name: 'Burger', priceRange: [180, 400], costMultiplier: 0.55 },
    { name: 'Pizza Slice', priceRange: [120, 280], costMultiplier: 0.5 },
    { name: 'Soft Drink', priceRange: [40, 100], costMultiplier: 0.4 },
    { name: 'Juice', priceRange: [60, 150], costMultiplier: 0.45 },
    { name: 'Cake', priceRange: [250, 800], costMultiplier: 0.5 },
    { name: 'Cookies', priceRange: [80, 250], costMultiplier: 0.4 },
    { name: 'Chips', priceRange: [20, 80], costMultiplier: 0.35 },
  ],
  'Home & Kitchen': [
    { name: 'Dinner Set', priceRange: [999, 4999], costMultiplier: 0.6 },
    { name: 'Frying Pan', priceRange: [399, 1499], costMultiplier: 0.55 },
    { name: 'Cooker', priceRange: [1299, 3999], costMultiplier: 0.65 },
    { name: 'Mixer Grinder', priceRange: [1999, 5999], costMultiplier: 0.7 },
    { name: 'Knife Set', priceRange: [599, 1999], costMultiplier: 0.6 },
    { name: 'Storage Container', priceRange: [199, 899], costMultiplier: 0.5 },
    { name: 'Curtains', priceRange: [499, 2499], costMultiplier: 0.55 },
    { name: 'Bedsheet', priceRange: [599, 2999], costMultiplier: 0.6 },
    { name: 'Pillow', priceRange: [299, 1299], costMultiplier: 0.55 },
    { name: 'Towel Set', priceRange: [399, 1499], costMultiplier: 0.5 },
  ],
  'Sports & Fitness': [
    { name: 'Yoga Mat', priceRange: [399, 1499], costMultiplier: 0.55 },
    { name: 'Dumbbells', priceRange: [799, 3999], costMultiplier: 0.7 },
    { name: 'Resistance Bands', priceRange: [299, 999], costMultiplier: 0.5 },
    { name: 'Skipping Rope', priceRange: [199, 699], costMultiplier: 0.45 },
    { name: 'Sports Bottle', priceRange: [249, 799], costMultiplier: 0.5 },
    { name: 'Gym Bag', priceRange: [599, 2499], costMultiplier: 0.6 },
    { name: 'Cricket Bat', priceRange: [999, 4999], costMultiplier: 0.65 },
    { name: 'Football', priceRange: [499, 1999], costMultiplier: 0.6 },
    { name: 'Badminton Racket', priceRange: [699, 3999], costMultiplier: 0.65 },
    { name: 'Tennis Ball', priceRange: [150, 500], costMultiplier: 0.5 },
  ],
};

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Ananya', 'Diya', 'Aadhya', 'Avni', 'Sara', 'Anvi', 'Pari', 'Navya', 'Angel', 'Ira',
  'Rohan', 'Kabir', 'Reyansh', 'Shaurya', 'Atharv', 'Pranav', 'Advait', 'Dhruv', 'Kian', 'Viaan',
  'Saanvi', 'Kiara', 'Aanya', 'Myra', 'Shanaya', 'Riya', 'Aaradhya', 'Zara', 'Anika', 'Dhriti'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Reddy', 'Gupta', 'Mehta', 'Jain', 'Nair',
  'Iyer', 'Rao', 'Desai', 'Joshi', 'Pillai', 'Menon', 'Bhat', 'Kulkarni', 'Pandey', 'Mishra',
  'Shah', 'Kapoor', 'Malhotra', 'Chopra', 'Khanna', 'Sinha', 'Banerjee', 'Das', 'Sen', 'Ghosh'
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
  'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam'
];

const PAYMENT_METHODS = ['cash', 'card', 'upi', 'wallet'];

// Seeding functions
async function seedProducts(companyId: string): Promise<any[]> {
  console.log('🌱 Seeding products...');
  const products = [];

  for (const [category, templates] of Object.entries(PRODUCT_TEMPLATES)) {
    for (const template of templates) {
      // Create 2-3 variations of each product
      const variations = randomInt(2, 3);
      for (let i = 0; i < variations; i++) {
        const price = randomFloat(template.priceRange[0], template.priceRange[1]);
        const cost = price * template.costMultiplier;
        const stock = randomInt(10, 200);
        const minStock = randomInt(5, 20);

        const variation = i > 0 ? ` (${['Premium', 'Standard', 'Basic', 'Pro', 'Lite'][i]})` : '';

        const product = {
          id: `PROD-${Date.now()}-${randomInt(1000, 9999)}`,
          companyId,
          name: `${template.name}${variation}`,
          price,
          cost,
          stock,
          category,
          barcode: `BAR${randomInt(100000000, 999999999)}`,
          sku: `SKU-${category.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`,
          minStock,
          unit: 'pcs',
          taxRate: 18,
          isActive: true,
          createdAt: randomDate(new Date('2024-01-01'), new Date('2024-06-01')),
          updatedAt: new Date(),
        };

        products.push(product);
      }
    }
  }

  // Insert products
  for (const product of products) {
    await pool.query(
      `INSERT INTO products (id, company_id, name, price, cost, stock, category, barcode, sku, min_stock, unit, tax_rate, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO NOTHING`,
      [
        product.id, product.companyId, product.name, product.price, product.cost,
        product.stock, product.category, product.barcode, product.sku, product.minStock,
        product.unit, product.taxRate, product.isActive, product.createdAt, product.updatedAt
      ]
    );
  }

  console.log(`✅ Created ${products.length} products across ${Object.keys(PRODUCT_TEMPLATES).length} categories`);
  return products;
}

async function seedCustomers(companyId: string): Promise<any[]> {
  console.log('🌱 Seeding customers...');
  const customers = [];

  for (let i = 0; i < 80; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    const customer = {
      id: `CUST-${Date.now()}-${randomInt(1000, 9999)}`,
      companyId,
      name,
      email: generateEmail(name),
      phone: generatePhoneNumber(),
      address: `${randomInt(1, 999)}, ${randomElement(['MG Road', 'Linking Road', 'Park Street', 'Brigade Road', 'Commercial Street'])}`,
      city: randomElement(CITIES),
      state: 'India',
      pinCode: `${randomInt(100000, 999999)}`,
      totalPurchases: 0, // Will be updated after transactions
      lastVisit: null,
      createdAt: randomDate(new Date('2024-01-01'), new Date('2024-06-01')),
      updatedAt: new Date(),
    };

    customers.push(customer);
  }

  // Insert customers
  for (const customer of customers) {
    await pool.query(
      `INSERT INTO customers (id, company_id, name, email, phone, address, city, state, pin_code, total_purchases, last_visit, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        customer.id, customer.companyId, customer.name, customer.email, customer.phone,
        customer.address, customer.city, customer.state, customer.pinCode,
        customer.totalPurchases, customer.lastVisit, customer.createdAt, customer.updatedAt
      ]
    );
  }

  console.log(`✅ Created ${customers.length} customers`);
  return customers;
}

async function seedEmployees(companyId: string): Promise<any[]> {
  console.log('🌱 Seeding employees...');
  const employees = [];

  const roles = [
    { role: 'admin', count: 3 },
    { role: 'manager', count: 8 },
    { role: 'cashier', count: 40 },
  ];

  for (const { role, count } of roles) {
    for (let i = 0; i < count; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const name = `${firstName} ${lastName}`;

      const employee = {
        id: `EMP-${Date.now()}-${randomInt(1000, 9999)}`,
        companyId,
        name,
        email: generateEmail(name),
        phone: generatePhoneNumber(),
        role,
        salary: role === 'admin' ? randomInt(50000, 80000) :
                role === 'manager' ? randomInt(30000, 50000) :
                randomInt(15000, 25000),
        joiningDate: randomDate(new Date('2023-01-01'), new Date('2024-06-01')),
        isActive: Math.random() > 0.1, // 90% active
        createdAt: randomDate(new Date('2023-01-01'), new Date('2024-06-01')),
        updatedAt: new Date(),
      };

      employees.push(employee);
    }
  }

  // Insert employees
  for (const employee of employees) {
    await pool.query(
      `INSERT INTO employees (id, company_id, name, email, phone, role, salary, joining_date, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO NOTHING`,
      [
        employee.id, employee.companyId, employee.name, employee.email, employee.phone,
        employee.role, employee.salary, employee.joiningDate, employee.isActive,
        employee.createdAt, employee.updatedAt
      ]
    );
  }

  console.log(`✅ Created ${employees.length} employees (3 admins, 8 managers, 40 cashiers)`);
  return employees;
}

async function seedTransactions(
  companyId: string,
  products: any[],
  customers: any[],
  employees: any[]
): Promise<any[]> {
  console.log('🌱 Seeding transactions...');
  const transactions = [];

  // Generate transactions over the past 6 months
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  const activeEmployees = employees.filter(e => e.isActive);

  // Generate realistic transaction patterns
  for (let i = 0; i < 250; i++) {
    // Random date with peak hours (10 AM - 8 PM)
    const txDate = randomDate(startDate, new Date());
    txDate.setHours(randomInt(10, 20));
    txDate.setMinutes(randomInt(0, 59));

    // Random customer (80% existing, 20% walk-in)
    const customer = Math.random() < 0.8 ? randomElement(customers) : null;
    const employee = randomElement(activeEmployees);

    // Random items (1-7 items per transaction)
    const itemCount = randomInt(1, 7);
    const items = [];
    let subtotal = new Decimal(0);

    for (let j = 0; j < itemCount; j++) {
      const product = randomElement(products);
      const quantity = randomInt(1, 5);
      const price = new Decimal(product.price);
      const total = price.times(quantity);

      items.push({
        productId: product.id,
        productName: product.name,
        quantity,
        price: price.toNumber(),
        total: total.toNumber(),
      });

      subtotal = subtotal.plus(total);
    }

    // Calculate discount (0-20%)
    const discountPercent = Math.random() < 0.3 ? randomInt(5, 20) : 0;
    const discount = subtotal.times(discountPercent).dividedBy(100);

    // Calculate tax (18%)
    const taxableAmount = subtotal.minus(discount);
    const tax = taxableAmount.times(18).dividedBy(100);

    // Calculate total
    const total = taxableAmount.plus(tax);

    const transaction = {
      id: `TXN-${Date.now()}-${randomInt(1000, 9999)}`,
      companyId,
      customerId: customer?.id,
      customerName: customer?.name || 'Walk-in Customer',
      customerPhone: customer?.phone,
      employeeId: employee.id,
      employeeName: employee.name,
      items,
      subtotal: subtotal.toNumber(),
      discount: discount.toNumber(),
      discountPercent,
      tax: tax.toNumber(),
      taxRate: 18,
      total: total.toNumber(),
      paymentMethod: randomElement(PAYMENT_METHODS),
      paymentDetails: {},
      status: Math.random() < 0.98 ? 'completed' : 'cancelled',
      timestamp: txDate,
      createdAt: txDate,
      updatedAt: txDate,
    };

    transactions.push(transaction);
  }

  // Insert transactions
  for (const transaction of transactions) {
    await pool.query(
      `INSERT INTO transactions (
        id, company_id, customer_id, customer_name, customer_phone,
        employee_id, employee_name, items, subtotal, discount, discount_percent,
        tax, tax_rate, total, payment_method, payment_details, status,
        timestamp, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       ON CONFLICT (id) DO NOTHING`,
      [
        transaction.id, transaction.companyId, transaction.customerId,
        transaction.customerName, transaction.customerPhone, transaction.employeeId,
        transaction.employeeName, JSON.stringify(transaction.items),
        transaction.subtotal, transaction.discount, transaction.discountPercent,
        transaction.tax, transaction.taxRate, transaction.total,
        transaction.paymentMethod, JSON.stringify(transaction.paymentDetails),
        transaction.status, transaction.timestamp, transaction.createdAt,
        transaction.updatedAt
      ]
    );
  }

  console.log(`✅ Created ${transactions.length} transactions over 6 months`);
  return transactions;
}

async function updateProductStock(products: any[], transactions: any[]): Promise<void> {
  console.log('📊 Updating product stock based on transactions...');

  const stockChanges: Record<string, number> = {};

  // Calculate stock changes
  for (const transaction of transactions) {
    if (transaction.status === 'completed') {
      for (const item of transaction.items) {
        stockChanges[item.productId] = (stockChanges[item.productId] || 0) + item.quantity;
      }
    }
  }

  // Update product stock
  for (const product of products) {
    const sold = stockChanges[product.id] || 0;
    const newStock = Math.max(0, product.stock - sold);

    await pool.query(
      `UPDATE products SET stock = $1, updated_at = $2 WHERE id = $3`,
      [newStock, new Date(), product.id]
    );
  }

  console.log('✅ Product stock updated based on sales');
}

async function updateCustomerStats(customers: any[], transactions: any[]): Promise<void> {
  console.log('📊 Updating customer statistics...');

  const customerStats: Record<string, { purchases: number; lastVisit: Date }> = {};

  // Calculate customer stats
  for (const transaction of transactions) {
    if (transaction.customerId && transaction.status === 'completed') {
      if (!customerStats[transaction.customerId]) {
        customerStats[transaction.customerId] = {
          purchases: 0,
          lastVisit: transaction.timestamp
        };
      }

      customerStats[transaction.customerId].purchases += transaction.total;

      if (transaction.timestamp > customerStats[transaction.customerId].lastVisit) {
        customerStats[transaction.customerId].lastVisit = transaction.timestamp;
      }
    }
  }

  // Update customers
  for (const [customerId, stats] of Object.entries(customerStats)) {
    await pool.query(
      `UPDATE customers SET total_purchases = $1, last_visit = $2, updated_at = $3 WHERE id = $4`,
      [stats.purchases, stats.lastVisit, new Date(), customerId]
    );
  }

  console.log('✅ Customer statistics updated');
}

async function generateAnalyticsSummary(
  products: any[],
  customers: any[],
  employees: any[],
  transactions: any[]
): Promise<void> {
  console.log('\n📊 ANALYTICS SUMMARY');
  console.log('='.repeat(80));

  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.total, 0);
  const avgTransactionValue = totalRevenue / completedTransactions.length;

  // Payment method breakdown
  const paymentMethods: Record<string, number> = {};
  completedTransactions.forEach(t => {
    paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + t.total;
  });

  // Top products
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  completedTransactions.forEach(t => {
    t.items.forEach((item: any) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  completedTransactions.forEach(t => {
    t.items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + item.total;
      }
    });
  });

  console.log(`
📈 TRANSACTION STATISTICS:
   Total Transactions: ${transactions.length}
   Completed: ${completedTransactions.length}
   Cancelled: ${transactions.filter(t => t.status === 'cancelled').length}
   Total Revenue: ₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
   Average Transaction Value: ₹${avgTransactionValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

💰 PAYMENT METHOD BREAKDOWN:
${Object.entries(paymentMethods)
  .map(([method, amount]) => `   ${method.toUpperCase()}: ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${((amount / totalRevenue) * 100).toFixed(1)}%)`)
  .join('\n')}

🏆 TOP 5 PRODUCTS BY REVENUE:
${topProducts.map((p, i) => `   ${i + 1}. ${p.name}: ₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${p.quantity} units)`).join('\n')}

📦 CATEGORY REVENUE:
${Object.entries(categoryRevenue)
  .sort(([, a], [, b]) => b - a)
  .map(([cat, rev]) => `   ${cat}: ₹${rev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`)
  .join('\n')}

👥 CUSTOMER STATISTICS:
   Total Customers: ${customers.length}
   Active Customers (with purchases): ${Object.keys(customers.filter(c => c.totalPurchases > 0)).length}
   Average Customer Lifetime Value: ₹${(totalRevenue / customers.length).toLocaleString('en-IN', { minimumFractionDigits: 2 })}

👨‍💼 EMPLOYEE STATISTICS:
   Total Employees: ${employees.length}
   Active Employees: ${employees.filter(e => e.isActive).length}
   Admins: ${employees.filter(e => e.role === 'admin').length}
   Managers: ${employees.filter(e => e.role === 'manager').length}
   Cashiers: ${employees.filter(e => e.role === 'cashier').length}

📦 PRODUCT STATISTICS:
   Total Products: ${products.length}
   Categories: ${Object.keys(PRODUCT_TEMPLATES).length}
   Average Products per Category: ${(products.length / Object.keys(PRODUCT_TEMPLATES).length).toFixed(1)}
   Low Stock Items: ${products.filter(p => p.stock < p.minStock).length}
  `);

  console.log('='.repeat(80));
}

// Main seeding function
async function seedDatabase() {
  console.log('🚀 Starting comprehensive database seeding...\n');

  const companyId = 'defaultcompany';

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established\n');

    // Seed data
    const products = await seedProducts(companyId);
    const customers = await seedCustomers(companyId);
    const employees = await seedEmployees(companyId);
    const transactions = await seedTransactions(companyId, products, customers, employees);

    // Update statistics
    await updateProductStock(products, transactions);
    await updateCustomerStats(customers, transactions);

    // Generate summary
    await generateAnalyticsSummary(products, customers, employees, transactions);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n💡 TIP: Reload your application to see the new sample data');
    console.log('   Visit http://localhost:3000/dashboard to see analytics');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
