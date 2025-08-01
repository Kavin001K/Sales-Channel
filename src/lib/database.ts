import { Product, Transaction, Customer, Employee, Company, LoginCredentials, EmployeeLoginCredentials } from './types';
import { postgresDatabaseService } from './postgres-database';

// Database service class that uses PostgreSQL
class DatabaseService {
  // Authentication methods
  async authenticateCompany(credentials: LoginCredentials): Promise<Company | null> {
    return await postgresDatabaseService.authenticateCompany(credentials);
  }

  async authenticateEmployee(companyId: string, credentials: EmployeeLoginCredentials): Promise<Employee | null> {
    return await postgresDatabaseService.authenticateEmployee(companyId, credentials);
  }

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    return await postgresDatabaseService.getProducts(companyId);
  }

  async addProduct(product: Product): Promise<void> {
    await postgresDatabaseService.addProduct(product);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await postgresDatabaseService.updateProduct(id, updates);
  }

  async deleteProduct(id: string): Promise<void> {
    await postgresDatabaseService.deleteProduct(id);
  }

  // Customers
  async getCustomers(companyId: string): Promise<Customer[]> {
    return await postgresDatabaseService.getCustomers(companyId);
  }

  async addCustomer(customer: Customer): Promise<void> {
    await postgresDatabaseService.addCustomer(customer);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<void> {
    await postgresDatabaseService.updateCustomer(id, updates);
  }

  // Employees
  async getEmployees(companyId: string): Promise<Employee[]> {
    return await postgresDatabaseService.getEmployees(companyId);
  }

  async addEmployee(employee: Employee): Promise<void> {
    await postgresDatabaseService.addEmployee(employee);
  }

  // Transactions
  async getTransactions(companyId: string): Promise<Transaction[]> {
    return await postgresDatabaseService.getTransactions(companyId);
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    await postgresDatabaseService.addTransaction(transaction);
  }

  // Settings
  async getSettings(companyId: string): Promise<Record<string, string>> {
    return await postgresDatabaseService.getSettings(companyId);
  }

  async updateSettings(companyId: string, settings: Record<string, string>): Promise<void> {
    await postgresDatabaseService.updateSettings(companyId, settings);
  }

  // Analytics and Reports
  async getSalesReport(companyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    return await postgresDatabaseService.getSalesReport(companyId, startDate, endDate);
  }

  async getTopProducts(companyId: string, limit: number = 10): Promise<any[]> {
    return await postgresDatabaseService.getTopProducts(companyId, limit);
  }

  async getLowStockProducts(companyId: string, threshold: number = 10): Promise<Product[]> {
    return await postgresDatabaseService.getLowStockProducts(companyId, threshold);
  }

  // Utility methods
  isElectron(): boolean {
    return false; // Now using PostgreSQL for both web and desktop
  }

  getPlatform(): string {
    return 'postgresql';
  }

  // Close connection when needed
  async close(): Promise<void> {
    await postgresDatabaseService.close();
  }
}

// Export singleton instance
export const databaseService = new DatabaseService(); 