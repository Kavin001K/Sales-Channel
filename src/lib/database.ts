import { Product, Transaction, Customer, Employee, Company, LoginCredentials, EmployeeLoginCredentials } from './types';

// Browser-compatible database service
class DatabaseService {
  private isBrowser = typeof window !== 'undefined';

  // Authentication methods
  async authenticateCompany(credentials: LoginCredentials): Promise<Company | null> {
    if (!this.isBrowser) {
      throw new Error('Authentication not available in server environment');
    }

    // For demo purposes, use hardcoded credentials
    const demoCompanies = [
      {
        id: 'comp_001',
        name: 'Tech Solutions Inc',
        email: 'admin@techsolutions.com',
        password: 'admin123',
        phone: '+1-555-0100',
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
        taxId: 'TAX123456789',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'comp_002',
        name: 'Retail Store Plus',
        email: 'admin@retailstore.com',
        password: 'admin123',
        phone: '+1-555-0200',
        address: '456 Retail Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        taxId: 'TAX987654321',
        logoUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const company = demoCompanies.find(c => c.email === credentials.email && c.password === credentials.password);
    return company || null;
  }

  async authenticateEmployee(companyId: string, credentials: EmployeeLoginCredentials): Promise<Employee | null> {
    if (!this.isBrowser) {
      throw new Error('Authentication not available in server environment');
    }

    // For demo purposes, use hardcoded credentials
    const demoEmployees = [
      {
        id: 'emp_001',
        companyId: 'comp_001',
        employeeId: 'EMP001',
        password: 'emp123',
        name: 'Alice Manager',
        email: 'alice.manager@techsolutions.com',
        phone: '+1-555-0201',
        position: 'Store Manager',
        salary: 45000.00,
        hireDate: new Date('2023-01-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp_002',
        companyId: 'comp_001',
        employeeId: 'EMP002',
        password: 'emp123',
        name: 'Bob Sales',
        email: 'bob.sales@techsolutions.com',
        phone: '+1-555-0202',
        position: 'Sales Associate',
        salary: 35000.00,
        hireDate: new Date('2023-02-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp_003',
        companyId: 'comp_002',
        employeeId: 'EMP003',
        password: 'emp123',
        name: 'Carol Cashier',
        email: 'carol.cashier@retailstore.com',
        phone: '+1-555-0203',
        position: 'Cashier',
        salary: 30000.00,
        hireDate: new Date('2023-03-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const employee = demoEmployees.find(e => 
      e.companyId === companyId && 
      e.employeeId === credentials.employeeId && 
      e.password === credentials.password
    );
    return employee || null;
  }

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    if (!this.isBrowser) {
      return [];
    }

    const stored = localStorage.getItem(`products_${companyId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Demo products
    const demoProducts = [
      {
        id: 'prod_001',
        companyId: 'comp_001',
        name: 'Laptop Computer',
        description: 'High-performance laptop for business use',
        price: 1299.99,
        cost: 800.00,
        stock: 15,
        category: 'Electronics',
        barcode: '1234567890123',
        sku: 'LAP001',
        image: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_002',
        companyId: 'comp_001',
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse',
        price: 29.99,
        cost: 15.00,
        stock: 50,
        category: 'Electronics',
        barcode: '1234567890124',
        sku: 'MOU001',
        image: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'prod_003',
        companyId: 'comp_002',
        name: 'Office Chair',
        description: 'Comfortable office chair with lumbar support',
        price: 199.99,
        cost: 120.00,
        stock: 10,
        category: 'Furniture',
        barcode: '1234567890125',
        sku: 'CHA001',
        image: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const companyProducts = demoProducts.filter(p => p.companyId === companyId);
    localStorage.setItem(`products_${companyId}`, JSON.stringify(companyProducts));
    return companyProducts;
  }

  async addProduct(product: Product): Promise<void> {
    if (!this.isBrowser) return;
    
    const products = await this.getProducts(product.companyId);
    products.push(product);
    localStorage.setItem(`products_${product.companyId}`, JSON.stringify(products));
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    if (!this.isBrowser) return;
    
    // This would need to be implemented based on companyId
    console.log('Update product:', id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    if (!this.isBrowser) return;
    
    console.log('Delete product:', id);
  }

  // Customers
  async getCustomers(companyId: string): Promise<Customer[]> {
    if (!this.isBrowser) {
      return [];
    }

    const stored = localStorage.getItem(`customers_${companyId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Demo customers
    const demoCustomers = [
      {
        id: 'cust_001',
        companyId: 'comp_001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
        notes: '',
        totalSpent: 0,
        visitCount: 0,
        lastVisit: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'cust_002',
        companyId: 'comp_001',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0102',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        country: 'USA',
        notes: '',
        totalSpent: 0,
        visitCount: 0,
        lastVisit: undefined,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const companyCustomers = demoCustomers.filter(c => c.companyId === companyId);
    localStorage.setItem(`customers_${companyId}`, JSON.stringify(companyCustomers));
    return companyCustomers;
  }

  async addCustomer(customer: Customer): Promise<void> {
    if (!this.isBrowser) return;
    
    const customers = await this.getCustomers(customer.companyId);
    customers.push(customer);
    localStorage.setItem(`customers_${customer.companyId}`, JSON.stringify(customers));
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    if (!this.isBrowser) return;
    
    console.log('Update customer:', id, updates);
  }

  // Employees
  async getEmployees(companyId: string): Promise<Employee[]> {
    if (!this.isBrowser) {
      return [];
    }

    // Return demo employees for the company
    const demoEmployees = [
      {
        id: 'emp_001',
        companyId: 'comp_001',
        employeeId: 'EMP001',
        name: 'Alice Manager',
        email: 'alice.manager@techsolutions.com',
        phone: '+1-555-0201',
        position: 'Store Manager',
        salary: 45000.00,
        hireDate: new Date('2023-01-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emp_002',
        companyId: 'comp_001',
        employeeId: 'EMP002',
        name: 'Bob Sales',
        email: 'bob.sales@techsolutions.com',
        phone: '+1-555-0202',
        position: 'Sales Associate',
        salary: 35000.00,
        hireDate: new Date('2023-02-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return demoEmployees.filter(e => e.companyId === companyId);
  }

  async addEmployee(employee: Employee): Promise<void> {
    if (!this.isBrowser) return;
    
    console.log('Add employee:', employee);
  }

  // Transactions
  async getTransactions(companyId: string): Promise<Transaction[]> {
    if (!this.isBrowser) {
      return [];
    }

    const stored = localStorage.getItem(`transactions_${companyId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    return [];
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    if (!this.isBrowser) return;
    
    const transactions = await this.getTransactions(transaction.companyId || '');
    transactions.push(transaction);
    localStorage.setItem(`transactions_${transaction.companyId}`, JSON.stringify(transactions));
  }

  // Settings
  async getSettings(companyId: string): Promise<Record<string, string>> {
    if (!this.isBrowser) {
      return {};
    }

    const stored = localStorage.getItem(`settings_${companyId}`);
    if (stored) {
      return JSON.parse(stored);
    }

    // Default settings
    const defaultSettings = {
      companyName: 'Ace Business',
      currency: '₹',
      taxRate: '0',
      receiptHeader: 'Thank you for your purchase!',
      receiptFooter: 'Please visit again!'
    };

    localStorage.setItem(`settings_${companyId}`, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  async updateSettings(companyId: string, settings: Record<string, string>): Promise<void> {
    if (!this.isBrowser) return;
    
    localStorage.setItem(`settings_${companyId}`, JSON.stringify(settings));
  }

  // Reports
  async getSalesReport(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    if (!this.isBrowser) {
      return { total: 0, count: 0 };
    }

    const transactions = await this.getTransactions(companyId);
    const total = transactions.reduce((sum, t) => sum + t.total, 0);
    return { total, count: transactions.length };
  }

  async getTopProducts(companyId: string, limit: number = 10): Promise<any[]> {
    if (!this.isBrowser) {
      return [];
    }

    const transactions = await this.getTransactions(companyId);
    // Simple implementation - in real app would aggregate by product
    return [];
  }

  async getLowStockProducts(companyId: string, threshold: number = 10): Promise<Product[]> {
    if (!this.isBrowser) {
      return [];
    }

    const products = await this.getProducts(companyId);
    return products.filter(p => p.stock <= threshold);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 