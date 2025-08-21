import { Client } from 'pg';
import bcryptjs from 'bcryptjs';
import { Product, Transaction, Customer, Employee, Company, LoginCredentials, EmployeeLoginCredentials } from './types';
import { config } from './config';

class PostgresDatabaseService {
  private client: Client | null = null;
  private isConnecting = false;

  constructor() {
    // Don't create client immediately, create it when needed
  }

  private async getClient(): Promise<Client> {
    if (this.client && !this.client.ended) {
      return this.client;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      while (this.isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.client && !this.client.ended) {
        return this.client;
      }
    }

    this.isConnecting = true;
    try {
      this.client = new Client({
        connectionString: config.database.url,
        ssl: config.database.ssl ? {
          rejectUnauthorized: false
        } : false
      });
      
      await this.client.connect();
      console.log('PostgreSQL database connected successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async executeQuery<T>(query: string, params: (string | number | boolean | null)[] = []): Promise<T[]> {
    try {
      const client = await this.getClient();
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Safe update method to prevent SQL injection
  private async safeUpdate(table: string, id: string, updates: Record<string, string | number | boolean | null>): Promise<void> {
    try {
      // Validate table name to prevent SQL injection
      const allowedTables = ['products', 'customers', 'employees', 'transactions', 'companies'];
      if (!allowedTables.includes(table)) {
        throw new Error(`Invalid table name: ${table}`);
      }

      // Filter out invalid column names and create safe field mapping
      const validColumns: Record<string, string> = {
        // Products
        name: 'name',
        description: 'description',
        price: 'price',
        cost: 'cost',
        stock: 'stock',
        category: 'category',
        barcode: 'barcode',
        sku: 'sku',
        image: 'image',
        min_stock: 'min_stock',
        unit: 'unit',
        supplier: 'supplier',
        tax_rate: 'tax_rate',
        is_active: 'is_active',
        
        // Customers
        email: 'email',
        phone: 'phone',
        address: 'address',
        city: 'city',
        state: 'state',
        zip_code: 'zip_code',
        country: 'country',
        notes: 'notes',
        total_spent: 'total_spent',
        visit_count: 'visit_count',
        last_visit: 'last_visit',
        
        // Employees
        employee_id: 'employee_id',
        position: 'position',
        salary: 'salary',
        hire_date: 'hire_date',
        
        // Transactions
        customer_id: 'customer_id',
        items: 'items',
        subtotal: 'subtotal',
        tax: 'tax',
        discount: 'discount',
        total: 'total',
        payment_method: 'payment_method',
        status: 'status',
        
        // Companies
        logo_url: 'logo_url',
        tax_id: 'tax_id',
        gstin: 'gstin'
      };

      // Filter updates to only include valid columns
      const validUpdates: Record<string, string | number | boolean | null> = {};
      for (const [key, value] of Object.entries(updates)) {
        if (validColumns[key]) {
          validUpdates[validColumns[key]] = value;
        }
      }

      if (Object.keys(validUpdates).length === 0) {
        console.warn('No valid fields to update');
        return;
      }

      // Build safe query with parameterized values
      const fields = Object.keys(validUpdates).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = Object.values(validUpdates);
      
      await this.executeQuery(`
        UPDATE ${table} 
        SET ${fields}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [id, ...values]);
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  }

  // Authentication methods
  async authenticateCompany(credentials: LoginCredentials): Promise<Company | null> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM companies 
        WHERE email = $1 AND is_active = true
      `, [credentials.email]);

      if (rows.length === 0) {
        return null;
      }

      const company = rows[0];
      const isValidPassword = await bcryptjs.compare(credentials.password, company.password_hash);
      
      if (!isValidPassword) {
        return null;
      }

      return {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        zipCode: company.zip_code,
        country: company.country,
        taxId: company.tax_id,
        logoUrl: company.logo_url,
        isActive: company.is_active,
        createdAt: new Date(company.created_at),
        updatedAt: new Date(company.updated_at)
      };
    } catch (error) {
      console.error('Error authenticating company:', error);
      return null;
    }
  }

  async authenticateEmployee(companyId: string, credentials: EmployeeLoginCredentials): Promise<Employee | null> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM employees 
        WHERE company_id = $1 AND employee_id = $2 AND is_active = true
      `, [companyId, credentials.employeeId]);

      if (rows.length === 0) {
        return null;
      }

      const employee = rows[0];
      const isValidPassword = await bcryptjs.compare(credentials.password, employee.password_hash);
      
      if (!isValidPassword) {
        return null;
      }

      return {
        id: employee.id,
        companyId: employee.company_id,
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        salary: employee.salary,
        hireDate: employee.hire_date ? new Date(employee.hire_date) : undefined,
        isActive: employee.is_active,
        createdAt: new Date(employee.created_at),
        updatedAt: new Date(employee.updated_at)
      };
    } catch (error) {
      console.error('Error authenticating employee:', error);
      return null;
    }
  }

  // Products - Enhanced with better error handling and validation
  async getProducts(companyId: string): Promise<Product[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM products 
        WHERE company_id = $1 AND is_active = true 
        ORDER BY name
      `, [companyId]);
      
      return rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        cost: parseFloat(row.cost),
        stock: row.stock,
        category: row.category,
        barcode: row.barcode,
        sku: row.sku,
        image: row.image,
        minStock: row.min_stock,
        unit: row.unit,
        supplier: row.supplier,
        taxRate: row.tax_rate,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async addProduct(product: Product): Promise<Product> {
    try {
      const productId = product.id || crypto.randomUUID();
      await this.executeQuery(`
        INSERT INTO products (id, company_id, name, description, price, cost, stock, category, barcode, sku, image, min_stock, unit, supplier, tax_rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        productId,
        product.companyId,
        product.name,
        product.description,
        product.price,
        product.cost,
        product.stock,
        product.category,
        product.barcode,
        product.sku,
        product.image,
        product.minStock,
        product.unit,
        product.supplier,
        product.taxRate
      ]);

      // Fetch and return the saved product
      const savedProduct = await this.getProductById(productId);
      console.log('Product saved successfully:', savedProduct);
      return savedProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM products WHERE id = $1 AND is_active = true
      `, [productId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        cost: parseFloat(row.cost),
        stock: row.stock,
        category: row.category,
        barcode: row.barcode,
        sku: row.sku,
        image: row.image,
        minStock: row.min_stock,
        unit: row.unit,
        supplier: row.supplier,
        taxRate: row.tax_rate,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      await this.safeUpdate('products', id, updates);
      
      // Fetch and return the updated product
      const updatedProduct = await this.getProductById(id);
      if (!updatedProduct) {
        throw new Error('Product not found after update');
      }
      
      console.log('Product updated successfully:', updatedProduct);
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.executeQuery(`
        UPDATE products 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);
      console.log('Product deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Customers - Enhanced with better persistence
  async getCustomers(companyId: string): Promise<Customer[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM customers 
        WHERE company_id = $1 AND is_active = true 
        ORDER BY name
      `, [companyId]);
      
      return rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
        gstin: row.gstin,
        loyaltyPoints: row.loyalty_points,
        totalSpent: parseFloat(row.total_spent),
        visitCount: row.visit_count,
        lastVisit: row.last_visit ? new Date(row.last_visit) : undefined,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM customers WHERE id = $1 AND is_active = true
      `, [customerId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
        gstin: row.gstin,
        loyaltyPoints: row.loyalty_points,
        totalSpent: parseFloat(row.total_spent),
        visitCount: row.visit_count,
        lastVisit: row.last_visit ? new Date(row.last_visit) : undefined,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      };
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      return null;
    }
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    try {
      const customerId = customer.id || crypto.randomUUID();
      await this.executeQuery(`
        INSERT INTO customers (id, company_id, name, email, phone, address, city, state, zip_code, country, gstin, loyalty_points, total_spent, visit_count)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        customerId,
        customer.companyId,
        customer.name,
        customer.email,
        customer.phone,
        customer.address,
        customer.city,
        customer.state,
        customer.zipCode,
        customer.country,
        customer.gstin,
        customer.loyaltyPoints,
        customer.totalSpent,
        customer.visitCount
      ]);

      // Fetch and return the saved customer
      const savedCustomer = await this.getCustomerById(customerId);
      console.log('Customer saved successfully:', savedCustomer);
      return savedCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      await this.safeUpdate('customers', id, updates);
      
      // Fetch and return the updated customer
      const updatedCustomer = await this.getCustomerById(id);
      if (!updatedCustomer) {
        throw new Error('Customer not found after update');
      }
      
      console.log('Customer updated successfully:', updatedCustomer);
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await this.executeQuery(`
        UPDATE customers 
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [id]);
      console.log('Customer deleted successfully:', id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Employees
  async getEmployees(companyId: string): Promise<Employee[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM employees 
        WHERE company_id = $1 AND is_active = true 
        ORDER BY name
      `, [companyId]);
      
      return rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        employeeId: row.employee_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        position: row.position,
        salary: row.salary,
        hireDate: row.hire_date ? new Date(row.hire_date) : undefined,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  }

  async addEmployee(employee: Employee): Promise<void> {
    try {
      // If a plain password/PIN is provided on the payload, hash and use it.
      // Fallback to a sensible default for backwards compatibility.
      const plainPassword = (employee as any).pin || (employee as any).password || 'emp123'
      const passwordHash = await bcryptjs.hash(plainPassword, config.security.bcryptRounds);
      await this.executeQuery(`
        INSERT INTO employees (id, company_id, employee_id, password_hash, name, email, phone, position, salary, hire_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        employee.id,
        employee.companyId,
        employee.employeeId,
        passwordHash,
        employee.name,
        employee.email,
        employee.phone,
        employee.position,
        employee.salary,
        employee.hireDate
      ]);
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  }

  // Transactions - Enhanced with better persistence and stock management
  async getTransactions(companyId: string): Promise<Transaction[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT t.*, c.name as customer_name, e.name as employee_name 
        FROM transactions t 
        LEFT JOIN customers c ON t.customer_id = c.id 
        LEFT JOIN employees e ON t.employee_id = e.id 
        WHERE t.company_id = $1
        ORDER BY t.timestamp DESC
      `, [companyId]);
      
      return rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        customerId: row.customer_id,
        employeeId: row.employee_id,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        subtotal: parseFloat(row.subtotal),
        tax: parseFloat(row.tax),
        discount: parseFloat(row.discount),
        total: parseFloat(row.total),
        paymentMethod: row.payment_method,
        paymentDetails: typeof row.payment_details === 'string' ? JSON.parse(row.payment_details) : row.payment_details,
        status: row.status,
        notes: row.notes,
        timestamp: new Date(row.timestamp),
        customerName: row.customer_name,
        employeeName: row.employee_name
      }));
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async getTransactionById(transactionId: string): Promise<Transaction | null> {
    try {
      const rows = await this.executeQuery(`
        SELECT t.*, c.name as customer_name, e.name as employee_name 
        FROM transactions t 
        LEFT JOIN customers c ON t.customer_id = c.id 
        LEFT JOIN employees e ON t.employee_id = e.id 
        WHERE t.id = $1
      `, [transactionId]);
      
      if (rows.length === 0) return null;
      
      const row = rows[0];
      return {
        id: row.id,
        companyId: row.company_id,
        customerId: row.customer_id,
        employeeId: row.employee_id,
        items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
        subtotal: parseFloat(row.subtotal),
        tax: parseFloat(row.tax),
        discount: parseFloat(row.discount),
        total: parseFloat(row.total),
        paymentMethod: row.payment_method,
        paymentDetails: typeof row.payment_details === 'string' ? JSON.parse(row.payment_details) : row.payment_details,
        status: row.status,
        notes: row.notes,
        timestamp: new Date(row.timestamp),
        customerName: row.customer_name,
        employeeName: row.employee_name
      };
    } catch (error) {
      console.error('Error getting transaction by ID:', error);
      return null;
    }
  }

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      const transactionId = transaction.id || crypto.randomUUID();
      
      // Start a transaction to ensure data consistency
      const client = await this.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Insert the transaction
        await this.executeQuery(`
          INSERT INTO transactions (id, company_id, customer_id, employee_id, items, subtotal, tax, discount, total, payment_method, payment_details, status, notes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          transactionId,
          transaction.companyId,
          transaction.customerId,
          transaction.employeeId,
          JSON.stringify(transaction.items),
          transaction.subtotal,
          transaction.tax,
          transaction.discount,
          transaction.total,
          transaction.paymentMethod,
          JSON.stringify(transaction.paymentDetails),
          transaction.status,
          transaction.notes
        ]);

        // Update product stock levels
        if (Array.isArray(transaction.items)) {
          for (const item of transaction.items) {
            await this.executeQuery(`
              UPDATE products 
              SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2 AND company_id = $3
            `, [item.quantity, item.productId, transaction.companyId]);
          }
        }

        // Update customer statistics
        if (transaction.customerId) {
          await this.executeQuery(`
            UPDATE customers 
            SET total_spent = total_spent + $1, 
                visit_count = visit_count + 1,
                last_visit = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [transaction.total, transaction.customerId]);
        }

        await client.query('COMMIT');
        
        // Fetch and return the saved transaction
        const savedTransaction = await this.getTransactionById(transactionId);
        console.log('Transaction saved successfully:', savedTransaction);
        return savedTransaction;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      await this.safeUpdate('transactions', id, updates);
      
      // Fetch and return the updated transaction
      const updatedTransaction = await this.getTransactionById(id);
      if (!updatedTransaction) {
        throw new Error('Transaction not found after update');
      }
      
      console.log('Transaction updated successfully:', updatedTransaction);
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      // Get the transaction first to restore stock
      const transaction = await this.getTransactionById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const client = await this.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Restore product stock levels
        if (Array.isArray(transaction.items)) {
          for (const item of transaction.items) {
            await this.executeQuery(`
              UPDATE products 
              SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2 AND company_id = $3
            `, [item.quantity, item.productId, transaction.companyId]);
          }
        }

        // Update customer statistics (subtract the transaction)
        if (transaction.customerId) {
          await this.executeQuery(`
            UPDATE customers 
            SET total_spent = total_spent - $1, 
                visit_count = GREATEST(visit_count - 1, 0),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [transaction.total, transaction.customerId]);
        }

        // Mark transaction as deleted
        await this.executeQuery(`
          UPDATE transactions 
          SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [id]);

        await client.query('COMMIT');
        console.log('Transaction deleted successfully:', id);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Settings
  async getSettings(companyId: string): Promise<Record<string, string>> {
    try {
      const rows = await this.executeQuery(`
        SELECT key, value FROM settings WHERE company_id = $1
      `, [companyId]);
      const settings: Record<string, string> = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });
      return settings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  async updateSettings(companyId: string, settings: Record<string, string>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await this.executeQuery(`
          INSERT INTO settings (company_id, key, value)
          VALUES ($1, $2, $3)
          ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value
        `, [companyId, key, value]);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Analytics and Reports
  async getSalesReport(companyId: string, startDate?: Date, endDate?: Date): Promise<unknown[]> {
    try {
      let query = `
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as transaction_count,
          SUM(total) as total_sales,
          SUM(tax) as total_tax,
          SUM(discount) as total_discount
        FROM transactions 
        WHERE company_id = $1 AND status = 'completed'
      `;
      
      const params: (string | Date)[] = [companyId];
      if (startDate && endDate) {
        query += ` AND timestamp BETWEEN $2 AND $3`;
        params.push(startDate, endDate);
      }
      
      query += ` GROUP BY DATE(timestamp) ORDER BY date DESC`;
      
      const rows = await this.executeQuery(query, params);
      return rows;
    } catch (error) {
      console.error('Error getting sales report:', error);
      return [];
    }
  }

  async getTopProducts(companyId: string, limit: number = 10): Promise<unknown[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT 
          p.name,
          p.sku,
          COUNT(*) as times_sold,
          SUM(CAST(item->>'quantity' AS INTEGER)) as total_quantity_sold
        FROM transactions t,
        jsonb_array_elements(t.items) as item
        JOIN products p ON item->>'productId' = p.id
        WHERE t.company_id = $1 AND t.status = 'completed'
        GROUP BY p.id, p.name, p.sku
        ORDER BY total_quantity_sold DESC
        LIMIT $2
      `, [companyId, limit]);
      
      return rows;
    } catch (error) {
      console.error('Error getting top products:', error);
      return [];
    }
  }

  async getLowStockProducts(companyId: string, threshold: number = 10): Promise<Product[]> {
    try {
      const rows = await this.executeQuery(`
        SELECT * FROM products 
        WHERE company_id = $1 AND stock <= $2 AND is_active = true
        ORDER BY stock ASC
      `, [companyId, threshold]);
      
      return rows.map(row => ({
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        cost: parseFloat(row.cost),
        stock: row.stock,
        category: row.category,
        barcode: row.barcode,
        sku: row.sku,
        image: row.image,
        isActive: row.is_active,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }));
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  // Stock Management
  async updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const operator = operation === 'add' ? '+' : '-';
      await this.executeQuery(`
        UPDATE products 
        SET stock = stock ${operator} $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [quantity, productId]);
      
      console.log(`Product stock ${operation}ed successfully:`, { productId, quantity, operation });
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Customer Statistics
  async updateCustomerStats(customerId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      const operator = operation === 'add' ? '+' : '-';
      await this.executeQuery(`
        UPDATE customers 
        SET total_spent = total_spent ${operator} $1, 
            visit_count = visit_count ${operator === '+' ? '+' : '-'} 1,
            last_visit = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [amount, customerId]);
      
      console.log(`Customer stats ${operation}ed successfully:`, { customerId, amount, operation });
    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw error;
    }
  }

  // Close connection
  async close(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
      console.log('PostgreSQL database connection closed.');
    }
  }
}

// Export singleton instance
export const postgresDatabaseService = new PostgresDatabaseService();