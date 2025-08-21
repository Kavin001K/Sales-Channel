import { 
  users, companies, employees, products, customers, transactions,
  type User, type InsertUser,
  type Company, type InsertCompany,
  type Employee, type InsertEmployee, 
  type Product, type InsertProduct,
  type Customer, type InsertCustomer,
  type Transaction, type InsertTransaction
} from "@shared/schema";

export interface IStorage {
  // Legacy user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Company methods
  getCompany(id: string): Promise<Company | undefined>;
  getCompanyByEmail(email: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  
  // Employee methods  
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(companyId: string, employeeId: string): Promise<Employee | undefined>;
  getEmployeesByCompany(companyId: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByCompany(companyId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomersByCompany(companyId: string): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Transaction methods
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByCompany(companyId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<string, Company>;
  private employees: Map<string, Employee>;
  private products: Map<string, Product>;
  private customers: Map<string, Customer>;
  private transactions: Map<string, Transaction>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.employees = new Map();
    this.products = new Map();
    this.customers = new Map();
    this.transactions = new Map();
    this.currentId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create a demo company
    const demoCompany: Company = {
      id: 'demo-company-1',
      name: 'Demo Store',
      email: 'demo@store.com',
      phone: '+1234567890',
      address: '123 Demo Street',
      city: 'Demo City',
      state: 'Demo State',
      zipCode: '12345',
      country: 'Demo Country',
      taxId: 'DEMO123',
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(demoCompany.id, demoCompany);

    // Create a demo employee
    const demoEmployee: Employee = {
      id: 'demo-employee-1',
      companyId: 'demo-company-1',
      employeeId: 'EMP001',
      name: 'Demo Employee',
      email: 'employee@demo.com',
      phone: '+1234567891',
      position: 'manager',
      salary: '50000',
      hireDate: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.set(demoEmployee.id, demoEmployee);

    // Create some demo products
    const demoProducts: Product[] = [
      {
        id: 'product-1',
        companyId: 'demo-company-1',
        name: 'Sample Product 1',
        description: 'A demo product for testing',
        price: '19.99',
        cost: '10.00',
        stock: 100,
        category: 'Demo',
        barcode: '1234567890',
        sku: 'DEMO001',
        image: null,
        unit: 'pcs',
        mrp: '25.00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'product-2',
        companyId: 'demo-company-1',
        name: 'Sample Product 2',
        description: 'Another demo product',
        price: '29.99',
        cost: '15.00',
        stock: 50,
        category: 'Demo',
        barcode: '1234567891',
        sku: 'DEMO002',
        image: null,
        unit: 'pcs',
        mrp: '35.00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    demoProducts.forEach(product => this.products.set(product.id, product));

    // Create a demo customer
    const demoCustomer: Customer = {
      id: 'customer-1',
      companyId: 'demo-company-1',
      name: 'Demo Customer',
      email: 'customer@demo.com',
      phone: '+1234567892',
      address: '456 Customer Street',
      city: 'Customer City',
      state: 'Customer State',
      zipCode: '54321',
      country: 'Demo Country',
      notes: 'A demo customer for testing',
      totalSpent: '0',
      visitCount: 0,
      lastVisit: null,
      gst: null,
      loyaltyPoints: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(demoCustomer.id, demoCustomer);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Company methods
  async getCompany(id: string): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByEmail(email: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(company => company.email === email);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const company: Company = {
      ...insertCompany,
      phone: insertCompany.phone ?? null,
      address: insertCompany.address ?? null,
      city: insertCompany.city ?? null,
      state: insertCompany.state ?? null,
      zipCode: insertCompany.zipCode ?? null,
      country: insertCompany.country ?? null,
      taxId: insertCompany.taxId ?? null,
      logoUrl: insertCompany.logoUrl ?? null,
      isActive: insertCompany.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(company.id, company);
    return company;
  }

  async updateCompany(id: string, updateData: Partial<InsertCompany>): Promise<Company | undefined> {
    const existing = this.companies.get(id);
    if (!existing) return undefined;
    
    const updated: Company = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.companies.set(id, updated);
    return updated;
  }

  // Employee methods
  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByEmployeeId(companyId: string, employeeId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(
      emp => emp.companyId === companyId && emp.employeeId === employeeId
    );
  }

  async getEmployeesByCompany(companyId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.companyId === companyId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const employee: Employee = {
      ...insertEmployee,
      email: insertEmployee.email ?? null,
      phone: insertEmployee.phone ?? null,
      position: insertEmployee.position ?? null,
      salary: insertEmployee.salary ?? null,
      hireDate: insertEmployee.hireDate ?? null,
      isActive: insertEmployee.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.employees.set(employee.id, employee);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.employees.set(id, updated);
    return updated;
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCompany(companyId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.companyId === companyId);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      description: insertProduct.description ?? null,
      stock: insertProduct.stock ?? 0,
      category: insertProduct.category ?? null,
      barcode: insertProduct.barcode ?? null,
      sku: insertProduct.sku ?? null,
      image: insertProduct.image ?? null,
      unit: insertProduct.unit ?? null,
      mrp: insertProduct.mrp ?? null,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomersByCompany(companyId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter(customer => customer.companyId === companyId);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const customer: Customer = {
      ...insertCustomer,
      email: insertCustomer.email ?? null,
      phone: insertCustomer.phone ?? null,
      address: insertCustomer.address ?? null,
      city: insertCustomer.city ?? null,
      state: insertCustomer.state ?? null,
      zipCode: insertCustomer.zipCode ?? null,
      country: insertCustomer.country ?? null,
      notes: insertCustomer.notes ?? null,
      totalSpent: insertCustomer.totalSpent ?? '0',
      visitCount: insertCustomer.visitCount ?? 0,
      lastVisit: insertCustomer.lastVisit ?? null,
      gst: insertCustomer.gst ?? null,
      loyaltyPoints: insertCustomer.loyaltyPoints ?? 0,
      isActive: insertCustomer.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  async updateCustomer(id: string, updateData: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existing = this.customers.get(id);
    if (!existing) return undefined;
    
    const updated: Customer = {
      ...existing,
      ...updateData,
      updatedAt: new Date()
    };
    this.customers.set(id, updated);
    return updated;
  }

  // Transaction methods
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByCompany(companyId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(transaction => transaction.companyId === companyId);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...insertTransaction,
      customerId: insertTransaction.customerId ?? null,
      employeeId: insertTransaction.employeeId ?? null,
      tax: insertTransaction.tax ?? '0',
      discount: insertTransaction.discount ?? '0',
      paymentMethod: insertTransaction.paymentMethod ?? null,
      paymentDetails: insertTransaction.paymentDetails ?? null,
      status: insertTransaction.status ?? 'completed',
      notes: insertTransaction.notes ?? null,
      customerName: insertTransaction.customerName ?? null,
      employeeName: insertTransaction.employeeName ?? null,
      receipt: insertTransaction.receipt ?? null,
      timestamp: new Date()
    };
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
