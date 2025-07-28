import { Product, Transaction, Customer, Employee } from './types';

// Local storage keys
const PRODUCTS_KEY = 'pos_products';
const TRANSACTIONS_KEY = 'pos_transactions';
const CUSTOMERS_KEY = 'pos_customers';
const EMPLOYEES_KEY = 'pos_employees';

// Products storage
export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored).map((p: any) => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt)
  })) : [];
};

export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const saveProduct = (product: Product): void => {
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === product.id);
  if (existingIndex >= 0) {
    products[existingIndex] = product;
  } else {
    products.push(product);
  }
  saveProducts(products);
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  products.push(product);
  saveProducts(products);
};

export const updateProduct = (id: string, updatedProduct: Partial<Product>): void => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct, updatedAt: new Date() };
    saveProducts(products);
  }
};

export const deleteProduct = (id: string): void => {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
};

// Transactions storage
export const getTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  return stored ? JSON.parse(stored).map((t: any) => ({ ...t, timestamp: new Date(t.timestamp) })) : [];
};

export const saveTransaction = (transaction: Transaction): void => {
  const transactions = getTransactions();
  transactions.push(transaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
};

// Customers storage
export const getCustomers = (): Customer[] => {
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  return stored ? JSON.parse(stored).map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    lastVisit: c.lastVisit ? new Date(c.lastVisit) : undefined
  })) : [];
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
};

export const saveCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const existingIndex = customers.findIndex(c => c.id === customer.id);
  if (existingIndex >= 0) {
    customers[existingIndex] = customer;
  } else {
    customers.push(customer);
  }
  saveCustomers(customers);
};

export const addCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  customers.push(customer);
  saveCustomers(customers);
};

export const updateCustomer = (id: string, updates: Partial<Customer>): void => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...updates, updatedAt: new Date() };
    saveCustomers(customers);
  }
};

export const deleteCustomer = (id: string): void => {
  const customers = getCustomers().filter(c => c.id !== id);
  saveCustomers(customers);
};

// Employees storage
export const getEmployees = (): Employee[] => {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  return stored ? JSON.parse(stored).map((e: any) => ({
    ...e,
    createdAt: new Date(e.createdAt),
    updatedAt: new Date(e.updatedAt)
  })) : [];
};

export const saveEmployees = (employees: Employee[]): void => {
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = (employee: Employee): void => {
  const employees = getEmployees();
  employees.push(employee);
  saveEmployees(employees);
};

export const updateEmployee = (id: string, updates: Partial<Employee>): void => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates, updatedAt: new Date() };
    saveEmployees(employees);
  }
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees().filter(e => e.id !== id);
  saveEmployees(employees);
};

// Initialize with sample data
export const initializeSampleData = (): void => {
  // Initialize default settings if they don't exist
  if (!localStorage.getItem('company_settings')) {
    const defaultCompanySettings: CompanySettings = {
      name: "Ace-Bill",
      address: "123 Business Street, City, State 12345",
      phone: "+1 (555) 123-4567",
      email: "contact@acebill.com",
      website: "www.acebill.com",
      taxId: "TAX123456789"
    };
    localStorage.setItem('company_settings', JSON.stringify(defaultCompanySettings));
  }

  if (!localStorage.getItem('print_settings')) {
    const defaultPrintSettings: PrintTemplateSettings = {
      header: "Thank you for your business!",
      footer: "Please keep this receipt for your records.",
      showLogo: true,
      showTaxBreakdown: true,
      showCustomerInfo: true,
      paperSize: 'thermal',
      fontSize: 12,
      includeBarcode: true
    };
    localStorage.setItem('print_settings', JSON.stringify(defaultPrintSettings));
  }
  
  // Products
  if (getProducts().length === 0) {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Coffee - Americano',
        price: 3.50,
        cost: 1.20,
        sku: 'COFFEE-AME',
        barcode: '1234567890123',
        category: 'Beverages',
        stock: 100,
        minStock: 20,
        description: 'Classic americano coffee',
        supplier: 'Coffee Co.',
        taxRate: 0.08,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Croissant',
        price: 2.75,
        cost: 0.90,
        sku: 'BAKED-CROIS',
        barcode: '1234567890124',
        category: 'Bakery',
        stock: 25,
        minStock: 10,
        description: 'Fresh baked croissant',
        supplier: 'Bakery Inc.',
        taxRate: 0.08,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Sandwich - Club',
        price: 8.50,
        cost: 3.20,
        sku: 'SAND-CLUB',
        barcode: '1234567890125',
        category: 'Food',
        stock: 15,
        minStock: 5,
        description: 'Classic club sandwich',
        supplier: 'Fresh Foods',
        taxRate: 0.08,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    saveProducts(sampleProducts);
  }

  // Employees
  if (getEmployees().length === 0) {
    const sampleEmployees: Employee[] = [
      {
        id: 'EMP001',
        name: 'John Admin',
        email: 'john@pos.com',
        phone: '+1-555-0100',
        role: 'admin' as 'admin',
        permissions: {
          canProcessSales: true,
          canManageProducts: true,
          canManageCustomers: true,
          canViewReports: true,
          canManageEmployees: true,
          canProcessRefunds: true,
          canApplyDiscounts: true,
          canVoidTransactions: true
        },
        hourlyRate: 25.00,
        isActive: true,
        pin: '2005',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'EMP002',
        name: 'Sarah Cashier',
        email: 'sarah@pos.com',
        phone: '+1-555-0101',
        role: 'cashier' as 'cashier',
        permissions: {
          canProcessSales: true,
          canManageProducts: false,
          canManageCustomers: true,
          canViewReports: false,
          canManageEmployees: false,
          canProcessRefunds: false,
          canApplyDiscounts: true,
          canVoidTransactions: false
        },
        hourlyRate: 15.00,
        isActive: true,
        pin: '1234',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    saveEmployees(sampleEmployees);
  }

  // Customers
  if (getCustomers().length === 0) {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@email.com',
        phone: '+1-555-0200',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zipCode: '12345'
        },
        loyaltyPoints: 150,
        totalSpent: 245.50,
        visits: 12,
        lastVisit: new Date(),
        notes: 'Regular customer, prefers decaf',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    saveCustomers(sampleCustomers);
  }
};

// Company and Print Settings Utilities
export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logo?: string;
}

export interface PrintTemplateSettings {
  header: string;
  footer: string;
  showLogo: boolean;
  showTaxBreakdown: boolean;
  showCustomerInfo: boolean;
  paperSize: 'a4' | 'thermal';
  fontSize: number;
  includeBarcode: boolean;
}

export const getCompanySettings = (): CompanySettings => {
  const saved = localStorage.getItem('company_settings');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default settings
  return {
    name: "Ace-Bill",
    address: "123 Business Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "contact@acebill.com",
    website: "www.acebill.com",
    taxId: "TAX123456789"
  };
};

export const getPrintSettings = (): PrintTemplateSettings => {
  const saved = localStorage.getItem('print_settings');
  if (saved) {
    return JSON.parse(saved);
  }
  // Default settings
  return {
    header: "Thank you for your business!",
    footer: "Please keep this receipt for your records.",
    showLogo: true,
    showTaxBreakdown: true,
    showCustomerInfo: true,
    paperSize: 'thermal',
    fontSize: 12,
    includeBarcode: true
  };
};