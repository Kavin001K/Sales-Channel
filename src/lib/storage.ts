import { Product, Transaction, Customer, Employee } from './types';
import { 
  productService, 
  customerService, 
  employeeService, 
  transactionService,
  settingsService,
  companyService,
  subscriptionPlanService,
  supportTicketService,
  authService
} from './database';

// User authentication
export const createUser = (userData: any): Promise<any> => authService.createUser(userData);
export const authenticateUser = (email: string, password: string): Promise<any> => authService.authenticateUser(email, password);
export const getUserById = (id: string): Promise<any> => authService.getUserById(id);
export const updateUser = (id: string, updates: any): Promise<any> => authService.updateUser(id, updates);
export const getAllUsers = (companyId?: string): Promise<any[]> => authService.getAllUsers(companyId);

// Products storage
export const getProducts = (companyId?: string): Promise<Product[]> => productService.getAll(companyId);
export const addProduct = (product: Product): Promise<Product> => productService.add(product);
export const updateProduct = (id: string, updatedProduct: Partial<Product>): Promise<Product> => productService.update(id, updatedProduct);
export const deleteProduct = (id: string): Promise<void> => productService.delete(id);

// Transactions storage
export const getTransactions = (companyId?: string): Promise<Transaction[]> => transactionService.getAll(companyId);
export const saveTransaction = (transaction: Transaction): Promise<Transaction> => transactionService.add(transaction);
export const updateTransaction = (id: string, updates: Partial<Transaction>): Promise<Transaction> => transactionService.update(id, updates);

// Customers storage
export const getCustomers = (companyId?: string): Promise<Customer[]> => customerService.getAll(companyId);
export const addCustomer = (customer: Customer): Promise<Customer> => customerService.add(customer);
export const updateCustomer = (id: string, updates: Partial<Customer>): Promise<Customer> => customerService.update(id, updates);
export const deleteCustomer = (id: string): Promise<void> => customerService.delete(id);
export const saveCustomer = (customer: Customer): Promise<Customer> => {
    if (customer.id && customer.id.startsWith('local_')) {
        return customerService.add(customer);
    }
    return customerService.update(customer.id, customer);
};

// Employees storage
export const getEmployees = (companyId?: string): Promise<Employee[]> => employeeService.getAll(companyId);
export const addEmployee = (employee: Employee): Promise<Employee> => employeeService.add(employee);
export const updateEmployee = (id: string, updates: Partial<Employee>): Promise<Employee> => employeeService.update(id, updates);
export const deleteEmployee = (id: string): Promise<void> => employeeService.delete(id);

// Companies storage
export const getCompanies = (): Promise<any[]> => companyService.getAll();
export const addCompany = (company: any): Promise<any> => companyService.add(company);
export const updateCompany = (id: string, updates: any): Promise<any> => companyService.update(id, updates);
export const deleteCompany = (id: string): Promise<void> => companyService.delete(id);

// Subscription management
export const getSubscriptionPlans = (): Promise<any[]> => subscriptionPlanService.getPlans();
export const getCompanySubscription = (companyId: string): Promise<any> => subscriptionPlanService.getCompanySubscription(companyId);
export const createSubscription = (subscription: any): Promise<any> => subscriptionPlanService.createSubscription(subscription);

// Support tickets
export const getSupportTickets = (companyId?: string): Promise<any[]> => supportTicketService.getTickets(companyId);
export const createSupportTicket = (ticket: any): Promise<any> => supportTicketService.createTicket(ticket);

// Settings
export const getSettings = (): Promise<any> => settingsService.getAll();
export const updateSettings = (settings: any): Promise<any> => settingsService.update(settings);

// Employee ID settings helpers
export interface EmployeeIdSettings { prefix: string; digits: number; next: number; }
export const getEmployeeIdSettings = async (): Promise<EmployeeIdSettings> => {
  const settings = await getSettings();
  const prefix = settings.employee_id_prefix || 'EMP';
  const digits = parseInt(settings.employee_id_digits, 10) || 3;
  const next = parseInt(settings.employee_id_next, 10) || 1;
  return { prefix, digits, next };
};

export const setEmployeeIdSettings = async (updates: Partial<EmployeeIdSettings>): Promise<EmployeeIdSettings> => {
  const current = await getEmployeeIdSettings();
  const merged: EmployeeIdSettings = { ...current, ...updates } as EmployeeIdSettings;
  await updateSettings({
    employee_id_prefix: merged.prefix,
    employee_id_digits: String(merged.digits),
    employee_id_next: String(merged.next),
  });
  return merged;
};

export const generateNextEmployeeId = async (): Promise<string> => {
  const { prefix, digits, next } = await getEmployeeIdSettings();
  const id = `${prefix}${String(next).padStart(digits, '0')}`;
  await updateSettings({ employee_id_next: String(next + 1) });
  return id;
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

export const getCompanySettings = async (): Promise<CompanySettings> => {
  const settings = await getSettings();
  return {
    name: settings.company_name || "Ace-Bill",
    address: settings.company_address || "123 Business Street, City, State 12345",
    phone: settings.company_phone || "+1 (555) 123-4567",
    email: settings.company_email || "contact@acebill.com",
    website: settings.company_website || "www.acebill.com",
    taxId: settings.company_taxId || "TAX123456789"
  };
};

export const getPrintSettings = async (): Promise<PrintTemplateSettings> => {
    const settings = await getSettings();
    return {
        header: settings.print_header || "Thank you for your business!",
        footer: settings.print_footer || "Please keep this receipt for your records.",
        showLogo: settings.print_showLogo === 'true',
        showTaxBreakdown: settings.print_showTaxBreakdown === 'true',
        showCustomerInfo: settings.print_showCustomerInfo === 'true',
        paperSize: settings.print_paperSize || 'thermal',
        fontSize: parseInt(settings.print_fontSize, 10) || 12,
        includeBarcode: settings.print_includeBarcode === 'true'
    };
};

export const initializeSampleData = async () => {
    const products = await getProducts();
    if (products.length === 0) {
        const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
             {
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
      },
      {
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
      },
      {
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
      }
        ];
        for (const p of sampleProducts) {
            await addProduct(p as Product);
        }
    }
     const employees = await getEmployees();
    if (employees.length === 0) {
        const sampleEmployees: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'John Admin',
        email: 'john@pos.com',
        phone: '+1-555-0100',
        role: 'admin',
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
      },
      {
        name: 'Sarah Cashier',
        email: 'sarah@pos.com',
        phone: '+1-555-0101',
        role: 'cashier',
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
      }
        ];
         for (const e of sampleEmployees) {
            await addEmployee(e as Employee);
        }
    }

    const customers = await getCustomers();
    if (customers.length === 0) {
        const sampleCustomers: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>[] = [
            {
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
      }
        ];
        for (const c of sampleCustomers) {
            await addCustomer(c as Customer);
        }
    }
};

// Save or update a product (for Excel import compatibility)
export const saveProduct = async (product: Product): Promise<Product> => {
  if (product.id) {
    return updateProduct(product.id, product);
  }
  return addProduct(product);
};