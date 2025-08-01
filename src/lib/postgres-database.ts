import { Client } from 'pg';
import bcrypt from 'bcrypt';
import { Product, Transaction, Customer, Employee, Company, LoginCredentials, EmployeeLoginCredentials } from './types';

const connectionString = 'postgresql://neondb_owner:npg_u9wzkM2ArXbo@ep-polished-dew-ael3uza7-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

class PostgresDatabaseService {
  private client: Client;

  constructor() {
    this.client = new Client({
      connectionString: connectionString,
    });
  }

  private async connect() {
    if (!this.client.connected) {
      await this.client.connect();
    }
  }

  // Authentication methods
  async authenticateCompany(credentials: LoginCredentials): Promise<Company | null> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM companies 
      WHERE email = $1 AND is_active = true
    `, [credentials.email]);

    if (result.rows.length === 0) {
      return null;
    }

    const company = result.rows[0];
    const isValidPassword = await bcrypt.compare(credentials.password, company.password_hash);
    
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
  }

  async authenticateEmployee(companyId: string, credentials: EmployeeLoginCredentials): Promise<Employee | null> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM employees 
      WHERE company_id = $1 AND employee_id = $2 AND is_active = true
    `, [companyId, credentials.employeeId]);

    if (result.rows.length === 0) {
      return null;
    }

    const employee = result.rows[0];
    const isValidPassword = await bcrypt.compare(credentials.password, employee.password_hash);
    
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
  }

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM products 
      WHERE company_id = $1 AND is_active = true 
      ORDER BY name
    `, [companyId]);
    
    return result.rows.map(row => ({
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
  }

  async addProduct(product: Product): Promise<void> {
    await this.connect();
    await this.client.query(`
      INSERT INTO products (id, company_id, name, description, price, cost, stock, category, barcode, sku, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      product.id,
      product.companyId,
      product.name,
      product.description,
      product.price,
      product.cost,
      product.stock,
      product.category,
      product.barcode,
      product.sku,
      product.image
    ]);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await this.connect();
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    await this.client.query(`
      UPDATE products 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id, ...values]);
  }

  async deleteProduct(id: string): Promise<void> {
    await this.connect();
    await this.client.query(`
      UPDATE products 
      SET is_active = false 
      WHERE id = $1
    `, [id]);
  }

  // Customers
  async getCustomers(companyId: string): Promise<Customer[]> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM customers 
      WHERE company_id = $1 AND is_active = true 
      ORDER BY name
    `, [companyId]);
    
    return result.rows.map(row => ({
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
      notes: row.notes,
      totalSpent: parseFloat(row.total_spent),
      visitCount: row.visit_count,
      lastVisit: row.last_visit ? new Date(row.last_visit) : undefined,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async addCustomer(customer: Customer): Promise<void> {
    await this.connect();
    await this.client.query(`
      INSERT INTO customers (id, company_id, name, email, phone, address, city, state, zip_code, country, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      customer.id,
      customer.companyId,
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.city,
      customer.state,
      customer.zipCode,
      customer.country,
      customer.notes
    ]);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    await this.connect();
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    
    await this.client.query(`
      UPDATE customers 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id, ...values]);
  }

  // Employees
  async getEmployees(companyId: string): Promise<Employee[]> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM employees 
      WHERE company_id = $1 AND is_active = true 
      ORDER BY name
    `, [companyId]);
    
    return result.rows.map(row => ({
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
  }

  async addEmployee(employee: Employee): Promise<void> {
    await this.connect();
    const passwordHash = await bcrypt.hash('emp123', 10); // Default password
    await this.client.query(`
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
  }

  // Transactions
  async getTransactions(companyId: string): Promise<Transaction[]> {
    await this.connect();
    const result = await this.client.query(`
      SELECT t.*, c.name as customer_name, e.name as employee_name 
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      LEFT JOIN employees e ON t.employee_id = e.id 
      WHERE t.company_id = $1
      ORDER BY t.timestamp DESC
    `, [companyId]);
    
    return result.rows.map(row => ({
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
      status: row.status,
      notes: row.notes,
      timestamp: new Date(row.timestamp),
      customerName: row.customer_name,
      employeeName: row.employee_name
    }));
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    await this.connect();
    await this.client.query(`
      INSERT INTO transactions (id, company_id, customer_id, employee_id, items, subtotal, tax, discount, total, payment_method, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      transaction.id,
      transaction.companyId,
      transaction.customerId,
      transaction.employeeId,
      JSON.stringify(transaction.items),
      transaction.subtotal,
      transaction.tax,
      transaction.discount,
      transaction.total,
      transaction.paymentMethod,
      transaction.notes
    ]);
  }

  // Settings
  async getSettings(companyId: string): Promise<Record<string, string>> {
    await this.connect();
    const result = await this.client.query(`
      SELECT key, value FROM settings WHERE company_id = $1
    `, [companyId]);
    const settings: Record<string, string> = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    return settings;
  }

  async updateSettings(companyId: string, settings: Record<string, string>): Promise<void> {
    await this.connect();
    for (const [key, value] of Object.entries(settings)) {
      await this.client.query(`
        INSERT INTO settings (company_id, key, value)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, key) DO UPDATE SET value = EXCLUDED.value
      `, [companyId, key, value]);
    }
  }

  // Analytics and Reports
  async getSalesReport(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    await this.connect();
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
    
    const params: any[] = [companyId];
    if (startDate && endDate) {
      query += ` AND timestamp BETWEEN $2 AND $3`;
      params.push(startDate, endDate);
    }
    
    query += ` GROUP BY DATE(timestamp) ORDER BY date DESC`;
    
    const result = await this.client.query(query, params);
    return result.rows;
  }

  async getTopProducts(companyId: string, limit: number = 10): Promise<any[]> {
    await this.connect();
    const result = await this.client.query(`
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
    
    return result.rows;
  }

  async getLowStockProducts(companyId: string, threshold: number = 10): Promise<Product[]> {
    await this.connect();
    const result = await this.client.query(`
      SELECT * FROM products 
      WHERE company_id = $1 AND stock <= $2 AND is_active = true
      ORDER BY stock ASC
    `, [companyId, threshold]);
    
    return result.rows.map(row => ({
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
  }

  // Close connection
  async close(): Promise<void> {
    if (this.client.connected) {
      await this.client.end();
    }
  }
}

// Export singleton instance
export const postgresDatabaseService = new PostgresDatabaseService(); 