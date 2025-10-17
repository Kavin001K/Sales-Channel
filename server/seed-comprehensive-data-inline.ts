import { storage } from './storage';
import type {
  InsertProduct,
  InsertCustomer,
  InsertEmployee,
  InsertTransaction,
} from '@shared/schema';

/**
 * Comprehensive Data Seeder for In-Memory Storage
 * Generates 50+ records for each entity with realistic patterns
 */

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomElement<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber(): string {
  return `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`;
}

function generateEmail(name: string): string {
  const domain = randomElement(['gmail.com', 'yahoo.com', 'outlook.com', 'email.com', 'mail.com']);
  return `${name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;
}

// Sample data arrays
const FIRST_NAMES = [
  'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Ananya', 'Rohit', 'Kavita',
  'Arjun', 'Pooja', 'Ravi', 'Anjali', 'Karan', 'Neha', 'Sanjay', 'Deepa',
  'Manish', 'Swati', 'Nikhil', 'Priyanka', 'Aditya', 'Meera', 'Rahul', 'Sakshi',
  'Vijay', 'Nisha', 'Suresh', 'Rina', 'Anil', 'Shalini', 'Ramesh', 'Geeta',
  'Manoj', 'Sunita', 'Dinesh', 'Preeti', 'Ashok', 'Rekha', 'Harish', 'Suman'
];

const LAST_NAMES = [
  'Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Iyer', 'Desai', 'Mehta',
  'Nair', 'Gupta', 'Joshi', 'Rao', 'Verma', 'Agarwal', 'Chopra', 'Das',
  'Khan', 'Malhotra', 'Bose', 'Kapoor', 'Pandey', 'Mishra', 'Saxena', 'Jain',
  'Sinha', 'Banerjee', 'Trivedi', 'Shukla', 'Dubey', 'Thakur'
];

const CITIES = [
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Bangalore', state: 'Karnataka' },
  { name: 'Hyderabad', state: 'Telangana' },
  { name: 'Chennai', state: 'Tamil Nadu' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Pune', state: 'Maharashtra' },
  { name: 'Ahmedabad', state: 'Gujarat' },
  { name: 'Jaipur', state: 'Rajasthan' },
  { name: 'Kochi', state: 'Kerala' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Coimbatore', state: 'Tamil Nadu' }
];

const STREETS = [
  'MG Road', 'Park Street', 'Main Road', 'Church Street', 'Brigade Road',
  'Commercial Street', 'Infantry Road', 'Residency Road', 'Station Road',
  'Market Street', 'Bazaar Road', 'Temple Road', 'Gandhi Nagar', 'Nehru Place',
  'Ring Road', 'Link Road', 'Highway Road', 'Service Road'
];

// Product categories and templates
const PRODUCT_CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverages', 'Home & Kitchen',
  'Sports & Fitness', 'Books & Stationery', 'Beauty & Personal Care',
  'Toys & Games', 'Furniture', 'Automotive'
];

const PRODUCT_TEMPLATES: Record<string, Array<{ name: string; priceRange: [number, number]; costMultiplier: number }>> = {
  'Electronics': [
    { name: 'Wireless Mouse', priceRange: [299, 1999], costMultiplier: 0.6 },
    { name: 'USB Cable', priceRange: [99, 499], costMultiplier: 0.5 },
    { name: 'Phone Case', priceRange: [199, 999], costMultiplier: 0.4 },
    { name: 'Power Bank', priceRange: [799, 2999], costMultiplier: 0.55 },
    { name: 'Earphones', priceRange: [299, 3999], costMultiplier: 0.5 },
    { name: 'Screen Guard', priceRange: [149, 599], costMultiplier: 0.35 },
    { name: 'Bluetooth Speaker', priceRange: [999, 4999], costMultiplier: 0.6 },
    { name: 'Smart Watch', priceRange: [1999, 14999], costMultiplier: 0.65 },
    { name: 'Laptop Stand', priceRange: [499, 1999], costMultiplier: 0.5 },
    { name: 'Webcam', priceRange: [1299, 5999], costMultiplier: 0.55 }
  ],
  'Clothing': [
    { name: 'T-Shirt', priceRange: [299, 1499], costMultiplier: 0.45 },
    { name: 'Jeans', priceRange: [999, 3999], costMultiplier: 0.5 },
    { name: 'Shirt', priceRange: [699, 2499], costMultiplier: 0.48 },
    { name: 'Dress', priceRange: [1299, 4999], costMultiplier: 0.5 },
    { name: 'Jacket', priceRange: [1999, 7999], costMultiplier: 0.55 },
    { name: 'Shoes', priceRange: [1499, 6999], costMultiplier: 0.52 },
    { name: 'Sandals', priceRange: [499, 2499], costMultiplier: 0.45 },
    { name: 'Socks', priceRange: [99, 499], costMultiplier: 0.4 },
    { name: 'Cap', priceRange: [299, 999], costMultiplier: 0.42 },
    { name: 'Scarf', priceRange: [399, 1499], costMultiplier: 0.48 }
  ],
  'Food & Beverages': [
    { name: 'Milk', priceRange: [50, 80], costMultiplier: 0.7 },
    { name: 'Bread', priceRange: [30, 60], costMultiplier: 0.65 },
    { name: 'Coffee', priceRange: [299, 999], costMultiplier: 0.6 },
    { name: 'Tea', priceRange: [149, 599], costMultiplier: 0.58 },
    { name: 'Biscuits', priceRange: [30, 150], costMultiplier: 0.55 },
    { name: 'Chocolate', priceRange: [20, 500], costMultiplier: 0.5 },
    { name: 'Juice', priceRange: [60, 200], costMultiplier: 0.62 },
    { name: 'Chips', priceRange: [20, 100], costMultiplier: 0.48 },
    { name: 'Cereals', priceRange: [199, 599], costMultiplier: 0.58 },
    { name: 'Pasta', priceRange: [99, 299], costMultiplier: 0.55 }
  ],
  'Home & Kitchen': [
    { name: 'Mixer Grinder', priceRange: [2999, 7999], costMultiplier: 0.65 },
    { name: 'Electric Kettle', priceRange: [799, 2499], costMultiplier: 0.6 },
    { name: 'Dinner Set', priceRange: [1499, 4999], costMultiplier: 0.58 },
    { name: 'Cookware Set', priceRange: [1999, 8999], costMultiplier: 0.62 },
    { name: 'Knife Set', priceRange: [499, 2499], costMultiplier: 0.52 },
    { name: 'Storage Containers', priceRange: [299, 1499], costMultiplier: 0.48 },
    { name: 'Pressure Cooker', priceRange: [1499, 4999], costMultiplier: 0.6 },
    { name: 'Toaster', priceRange: [999, 3499], costMultiplier: 0.58 },
    { name: 'Blender', priceRange: [1499, 5999], costMultiplier: 0.62 },
    { name: 'Water Filter', priceRange: [2999, 14999], costMultiplier: 0.65 }
  ],
  'Sports & Fitness': [
    { name: 'Yoga Mat', priceRange: [499, 1999], costMultiplier: 0.55 },
    { name: 'Dumbbells', priceRange: [799, 4999], costMultiplier: 0.6 },
    { name: 'Resistance Bands', priceRange: [299, 999], costMultiplier: 0.48 },
    { name: 'Cricket Bat', priceRange: [1499, 7999], costMultiplier: 0.62 },
    { name: 'Football', priceRange: [399, 1999], costMultiplier: 0.5 },
    { name: 'Badminton Racket', priceRange: [699, 3999], costMultiplier: 0.58 },
    { name: 'Gym Gloves', priceRange: [299, 999], costMultiplier: 0.48 },
    { name: 'Water Bottle', priceRange: [199, 999], costMultiplier: 0.45 },
    { name: 'Skipping Rope', priceRange: [149, 599], costMultiplier: 0.42 },
    { name: 'Tennis Ball', priceRange: [49, 299], costMultiplier: 0.4 }
  ],
  'Books & Stationery': [
    { name: 'Notebook', priceRange: [50, 200], costMultiplier: 0.5 },
    { name: 'Pen Set', priceRange: [100, 500], costMultiplier: 0.48 },
    { name: 'Novel', priceRange: [199, 699], costMultiplier: 0.6 },
    { name: 'Textbook', priceRange: [299, 1499], costMultiplier: 0.65 },
    { name: 'Art Supplies', priceRange: [499, 2499], costMultiplier: 0.55 },
    { name: 'Calculator', priceRange: [299, 1999], costMultiplier: 0.52 },
    { name: 'Backpack', priceRange: [699, 3999], costMultiplier: 0.58 },
    { name: 'Pencil Box', priceRange: [99, 499], costMultiplier: 0.45 },
    { name: 'Eraser Pack', priceRange: [20, 100], costMultiplier: 0.4 },
    { name: 'Ruler Set', priceRange: [30, 199], costMultiplier: 0.42 }
  ],
  'Beauty & Personal Care': [
    { name: 'Shampoo', priceRange: [199, 699], costMultiplier: 0.55 },
    { name: 'Face Cream', priceRange: [299, 1499], costMultiplier: 0.58 },
    { name: 'Perfume', priceRange: [499, 4999], costMultiplier: 0.6 },
    { name: 'Lip Balm', priceRange: [99, 399], costMultiplier: 0.48 },
    { name: 'Hair Oil', priceRange: [149, 599], costMultiplier: 0.52 },
    { name: 'Face Wash', priceRange: [199, 799], costMultiplier: 0.55 },
    { name: 'Body Lotion', priceRange: [249, 999], costMultiplier: 0.56 },
    { name: 'Deodorant', priceRange: [199, 599], costMultiplier: 0.5 },
    { name: 'Nail Polish', priceRange: [99, 499], costMultiplier: 0.45 },
    { name: 'Hair Dryer', priceRange: [799, 3999], costMultiplier: 0.62 }
  ],
  'Toys & Games': [
    { name: 'Board Game', priceRange: [499, 2999], costMultiplier: 0.55 },
    { name: 'Puzzle', priceRange: [299, 1499], costMultiplier: 0.5 },
    { name: 'Action Figure', priceRange: [399, 1999], costMultiplier: 0.52 },
    { name: 'Doll', priceRange: [499, 2499], costMultiplier: 0.54 },
    { name: 'Remote Control Car', priceRange: [999, 4999], costMultiplier: 0.6 },
    { name: 'LEGO Set', priceRange: [799, 5999], costMultiplier: 0.62 },
    { name: 'Soft Toy', priceRange: [299, 1499], costMultiplier: 0.48 },
    { name: 'Card Game', priceRange: [199, 999], costMultiplier: 0.5 },
    { name: 'Building Blocks', priceRange: [499, 2499], costMultiplier: 0.52 },
    { name: 'Toy Kitchen Set', priceRange: [999, 3999], costMultiplier: 0.58 }
  ],
  'Furniture': [
    { name: 'Office Chair', priceRange: [2999, 14999], costMultiplier: 0.65 },
    { name: 'Study Table', priceRange: [3999, 19999], costMultiplier: 0.68 },
    { name: 'Bookshelf', priceRange: [2499, 12999], costMultiplier: 0.62 },
    { name: 'Bean Bag', priceRange: [1499, 6999], costMultiplier: 0.58 },
    { name: 'Shoe Rack', priceRange: [999, 4999], costMultiplier: 0.55 },
    { name: 'Wardrobe', priceRange: [9999, 49999], costMultiplier: 0.7 },
    { name: 'Bedside Table', priceRange: [1999, 7999], costMultiplier: 0.6 },
    { name: 'TV Unit', priceRange: [4999, 24999], costMultiplier: 0.65 },
    { name: 'Coffee Table', priceRange: [2999, 14999], costMultiplier: 0.62 },
    { name: 'Dining Chair', priceRange: [1999, 9999], costMultiplier: 0.6 }
  ],
  'Automotive': [
    { name: 'Car Vacuum Cleaner', priceRange: [1299, 4999], costMultiplier: 0.6 },
    { name: 'Phone Holder', priceRange: [199, 999], costMultiplier: 0.45 },
    { name: 'Car Air Freshener', priceRange: [99, 499], costMultiplier: 0.4 },
    { name: 'Seat Covers', priceRange: [999, 4999], costMultiplier: 0.55 },
    { name: 'Floor Mats', priceRange: [699, 2999], costMultiplier: 0.52 },
    { name: 'Dash Cam', priceRange: [2999, 14999], costMultiplier: 0.65 },
    { name: 'Tire Inflator', priceRange: [1499, 5999], costMultiplier: 0.58 },
    { name: 'Cleaning Kit', priceRange: [499, 1999], costMultiplier: 0.5 },
    { name: 'Sunshade', priceRange: [299, 1499], costMultiplier: 0.48 },
    { name: 'Toolkit', priceRange: [999, 4999], costMultiplier: 0.55 }
  ]
};

const COMPANY_ID = 'demo-company-1';

// Seeding functions
async function seedProducts(): Promise<any[]> {
  console.log('🌱 Seeding products...');
  const products: any[] = [];

  for (const [category, templates] of Object.entries(PRODUCT_TEMPLATES)) {
    for (const template of templates) {
      const variations = randomInt(2, 3); // 2-3 variations per product

      for (let i = 0; i < variations; i++) {
        const variation = i === 0 ? '' : ` (${['Premium', 'Standard', 'Economy', 'Pro', 'Lite'][i]})`;
        const price = randomFloat(template.priceRange[0], template.priceRange[1]);
        const cost = price * template.costMultiplier;
        const stock = randomInt(10, 200);
        const barcode = `BAR${randomInt(100000000, 999999999)}`;
        const sku = `SKU-${category.substring(0, 3).toUpperCase()}-${randomInt(1000, 9999)}`;

        const product: InsertProduct = {
          id: `PROD-${Date.now()}-${randomInt(1000, 9999)}`,
          companyId: COMPANY_ID,
          name: `${template.name}${variation}`,
          description: `High-quality ${template.name.toLowerCase()} from ${category} category`,
          price: price.toFixed(2),
          cost: cost.toFixed(2),
          stock,
          category,
          barcode,
          sku,
          unit: 'pcs',
          mrp: (price * 1.15).toFixed(2), // MRP is 15% above selling price
          isActive: true,
        };

        await storage.createProduct(product);
        products.push(product);
      }
    }
  }

  console.log(`✅ Created ${products.length} products`);
  return products;
}

async function seedCustomers(): Promise<any[]> {
  console.log('🌱 Seeding customers...');
  const customers: any[] = [];

  for (let i = 0; i < 80; i++) {
    const firstName = randomElement(FIRST_NAMES);
    const lastName = randomElement(LAST_NAMES);
    const fullName = `${firstName} ${lastName}`;
    const location = randomElement(CITIES);

    const customer: InsertCustomer = {
      id: `CUST-${Date.now()}-${randomInt(1000, 9999)}`,
      companyId: COMPANY_ID,
      name: fullName,
      email: generateEmail(fullName),
      phone: generatePhoneNumber(),
      address: `${randomInt(1, 999)}, ${randomElement(STREETS)}`,
      city: location.name,
      state: location.state,
      zipCode: String(randomInt(100000, 999999)),
      country: 'India',
      notes: Math.random() > 0.7 ? `Regular customer since ${randomInt(2020, 2024)}` : null,
      totalSpent: '0',
      visitCount: 0,
      lastVisit: null,
      gst: Math.random() > 0.8 ? `GST${randomInt(10, 35)}ABC${randomInt(1000, 9999)}` : null,
      loyaltyPoints: randomInt(0, 500),
      isActive: true,
    };

    await storage.createCustomer(customer);
    customers.push(customer);
  }

  console.log(`✅ Created ${customers.length} customers`);
  return customers;
}

async function seedEmployees(): Promise<any[]> {
  console.log('🌱 Seeding employees...');
  const employees: any[] = [];

  const roles: Array<{ position: string; count: number; salaryRange: [number, number] }> = [
    { position: 'admin', count: 3, salaryRange: [50000, 80000] },
    { position: 'manager', count: 8, salaryRange: [35000, 55000] },
    { position: 'cashier', count: 40, salaryRange: [18000, 30000] },
  ];

  let empNumber = 1;
  for (const role of roles) {
    for (let i = 0; i < role.count; i++) {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const fullName = `${firstName} ${lastName}`;
      const salary = randomInt(role.salaryRange[0], role.salaryRange[1]);

      const employee: InsertEmployee = {
        id: `EMP-${Date.now()}-${randomInt(1000, 9999)}`,
        companyId: COMPANY_ID,
        employeeId: `EMP${String(empNumber).padStart(3, '0')}`,
        name: fullName,
        email: generateEmail(fullName),
        phone: generatePhoneNumber(),
        position: role.position,
        salary: String(salary),
        hireDate: randomDate(new Date(2020, 0, 1), new Date()),
        isActive: true,
      };

      await storage.createEmployee(employee);
      employees.push(employee);
      empNumber++;
    }
  }

  console.log(`✅ Created ${employees.length} employees (3 admins, 8 managers, 40 cashiers)`);
  return employees;
}

async function seedTransactions(products: any[], customers: any[], employees: any[]): Promise<any[]> {
  console.log('🌱 Seeding transactions...');
  const transactions: any[] = [];

  // Generate transactions for the last 6 months
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  const endDate = new Date();

  const paymentMethods = ['cash', 'card', 'upi', 'wallet'];

  for (let i = 0; i < 250; i++) {
    const txDate = randomDate(startDate, endDate);
    txDate.setHours(randomInt(10, 20)); // Peak hours: 10 AM - 8 PM
    txDate.setMinutes(randomInt(0, 59));
    txDate.setSeconds(randomInt(0, 59));

    // Random number of items per transaction (1-7)
    const itemCount = randomInt(1, 7);
    const items: any[] = [];
    let subtotal = 0;

    for (let j = 0; j < itemCount; j++) {
      const product = randomElement(products);
      const quantity = randomInt(1, 5);
      const price = parseFloat(product.price);
      const total = price * quantity;

      items.push({
        productId: product.id,
        name: product.name,
        quantity,
        price,
        total
      });

      subtotal += total;
    }

    // Calculate discount, tax, and total
    const discountPercent = Math.random() > 0.7 ? randomInt(5, 15) : 0;
    const discount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.18; // 18% GST
    const total = taxableAmount + tax;

    const customer = randomElement(customers);
    const employee = randomElement(employees);
    const paymentMethod = randomElement(paymentMethods);

    const transaction: InsertTransaction = {
      id: `TXN-${Date.now()}-${randomInt(10000, 99999)}`,
      companyId: COMPANY_ID,
      customerId: customer.id,
      employeeId: employee.id,
      items: JSON.stringify(items),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discount.toFixed(2),
      total: total.toFixed(2),
      paymentMethod,
      status: 'completed',
      customerName: customer.name,
      employeeName: employee.name,
    };

    await storage.createTransaction(transaction);
    transactions.push(transaction);

    // Update customer stats
    const existingCustomer = await storage.getCustomer(customer.id);
    if (existingCustomer) {
      const currentTotalSpent = parseFloat(existingCustomer.totalSpent || '0');
      await storage.updateCustomer(customer.id, {
        totalSpent: (currentTotalSpent + total).toFixed(2),
        visitCount: (existingCustomer.visitCount || 0) + 1,
        lastVisit: txDate,
      });
    }
  }

  console.log(`✅ Created ${transactions.length} transactions over 6 months`);
  return transactions;
}

async function generateAnalyticsSummary(products: any[], customers: any[], employees: any[], transactions: any[]) {
  console.log('\n📊 ANALYTICS SUMMARY\n');
  console.log('='.repeat(60));

  // Transaction statistics
  const totalRevenue = transactions.reduce((sum, tx) => sum + parseFloat(tx.total), 0);
  const totalDiscount = transactions.reduce((sum, tx) => sum + parseFloat(tx.discount), 0);
  const totalTax = transactions.reduce((sum, tx) => sum + parseFloat(tx.tax), 0);

  console.log('\n💰 TRANSACTION STATISTICS:');
  console.log(`Total Transactions: ${transactions.length}`);
  console.log(`Total Revenue: ₹${totalRevenue.toFixed(2)}`);
  console.log(`Total Discount Given: ₹${totalDiscount.toFixed(2)}`);
  console.log(`Total Tax Collected: ₹${totalTax.toFixed(2)}`);
  console.log(`Average Transaction Value: ₹${(totalRevenue / transactions.length).toFixed(2)}`);

  // Payment method breakdown
  const paymentBreakdown: Record<string, number> = {};
  transactions.forEach(tx => {
    paymentBreakdown[tx.paymentMethod] = (paymentBreakdown[tx.paymentMethod] || 0) + 1;
  });

  console.log('\n💳 PAYMENT METHOD BREAKDOWN:');
  Object.entries(paymentBreakdown).forEach(([method, count]) => {
    const percentage = ((count / transactions.length) * 100).toFixed(1);
    console.log(`${method.toUpperCase()}: ${count} transactions (${percentage}%)`);
  });

  // Top 5 products by revenue
  const productRevenue: Record<string, { name: string; revenue: number; quantity: number }> = {};
  transactions.forEach(tx => {
    const items = JSON.parse(tx.items);
    items.forEach((item: any) => {
      if (!productRevenue[item.productId]) {
        productRevenue[item.productId] = { name: item.name, revenue: 0, quantity: 0 };
      }
      productRevenue[item.productId].revenue += item.total;
      productRevenue[item.productId].quantity += item.quantity;
    });
  });

  const topProducts = Object.entries(productRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  console.log('\n🏆 TOP 5 PRODUCTS BY REVENUE:');
  topProducts.forEach(([id, data], index) => {
    console.log(`${index + 1}. ${data.name}`);
    console.log(`   Revenue: ₹${data.revenue.toFixed(2)} | Qty Sold: ${data.quantity}`);
  });

  // Category revenue breakdown
  const categoryRevenue: Record<string, number> = {};
  transactions.forEach(tx => {
    const items = JSON.parse(tx.items);
    items.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        categoryRevenue[product.category] = (categoryRevenue[product.category] || 0) + item.total;
      }
    });
  });

  console.log('\n📦 CATEGORY REVENUE BREAKDOWN:');
  Object.entries(categoryRevenue)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, revenue]) => {
      const percentage = ((revenue / totalRevenue) * 100).toFixed(1);
      console.log(`${category}: ₹${revenue.toFixed(2)} (${percentage}%)`);
    });

  // Customer statistics
  console.log('\n👥 CUSTOMER STATISTICS:');
  console.log(`Total Customers: ${customers.length}`);

  const customersWithPurchases = await Promise.all(
    customers.map(async (c: any) => {
      const customer = await storage.getCustomer(c.id);
      return customer;
    })
  );

  const activeCustomers = customersWithPurchases.filter(c => c && parseFloat(c.totalSpent || '0') > 0);
  console.log(`Active Customers: ${activeCustomers.length}`);

  if (activeCustomers.length > 0) {
    const avgSpent = activeCustomers.reduce((sum, c) => sum + parseFloat(c!.totalSpent || '0'), 0) / activeCustomers.length;
    console.log(`Average Customer Lifetime Value: ₹${avgSpent.toFixed(2)}`);
  }

  // Employee statistics
  console.log('\n👤 EMPLOYEE STATISTICS:');
  console.log(`Total Employees: ${employees.length}`);
  console.log(`Admins: ${employees.filter(e => e.position === 'admin').length}`);
  console.log(`Managers: ${employees.filter(e => e.position === 'manager').length}`);
  console.log(`Cashiers: ${employees.filter(e => e.position === 'cashier').length}`);

  console.log('\n' + '='.repeat(60));
  console.log('✅ Sample data generation and analysis complete!\n');
}

// Main seeding function
export async function seedComprehensiveData() {
  try {
    console.log('\n🌱 Starting comprehensive data seeding...\n');

    const products = await seedProducts();
    const customers = await seedCustomers();
    const employees = await seedEmployees();
    const transactions = await seedTransactions(products, customers, employees);

    await generateAnalyticsSummary(products, customers, employees, transactions);

    console.log('🎉 All sample data has been seeded successfully!');
    console.log('📝 You can now test the application with realistic data.');
  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
    throw error;
  }
}

// Run if executed directly
seedComprehensiveData()
  .then(() => {
    console.log('\n✅ Seeding script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding script failed:', error);
    process.exit(1);
  });
