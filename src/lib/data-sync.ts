// Data Synchronization Service
// Ensures all data is properly saved to server and fetched for future use

import { postgresDatabaseService } from './postgres-database';
import { Product, Customer, Transaction, Employee, Company } from './types';

export class DataSyncService {
  private static instance: DataSyncService;
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;

  private constructor() {}

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Product Synchronization
  async syncProducts(companyId: string): Promise<Product[]> {
    try {
      console.log('Syncing products for company:', companyId);
      const products = await postgresDatabaseService.getProducts(companyId);
      console.log('Products synced successfully:', products.length, 'products');
      return products;
    } catch (error) {
      console.error('Error syncing products:', error);
      throw error;
    }
  }

  async saveProduct(product: Product): Promise<Product> {
    try {
      console.log('Saving product to server:', product.name);
      const savedProduct = await postgresDatabaseService.addProduct(product);
      console.log('Product saved successfully:', savedProduct);
      
      // Trigger data refresh event
      this.triggerDataRefresh('products');
      
      return savedProduct;
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      console.log('Updating product on server:', id);
      const updatedProduct = await postgresDatabaseService.updateProduct(id, updates);
      console.log('Product updated successfully:', updatedProduct);
      
      // Trigger data refresh event
      this.triggerDataRefresh('products');
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      console.log('Deleting product from server:', id);
      await postgresDatabaseService.deleteProduct(id);
      console.log('Product deleted successfully:', id);
      
      // Trigger data refresh event
      this.triggerDataRefresh('products');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Customer Synchronization
  async syncCustomers(companyId: string): Promise<Customer[]> {
    try {
      console.log('Syncing customers for company:', companyId);
      const customers = await postgresDatabaseService.getCustomers(companyId);
      console.log('Customers synced successfully:', customers.length, 'customers');
      return customers;
    } catch (error) {
      console.error('Error syncing customers:', error);
      throw error;
    }
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      console.log('Saving customer to server:', customer.name);
      const savedCustomer = await postgresDatabaseService.addCustomer(customer);
      console.log('Customer saved successfully:', savedCustomer);
      
      // Trigger data refresh event
      this.triggerDataRefresh('customers');
      
      return savedCustomer;
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      console.log('Updating customer on server:', id);
      const updatedCustomer = await postgresDatabaseService.updateCustomer(id, updates);
      console.log('Customer updated successfully:', updatedCustomer);
      
      // Trigger data refresh event
      this.triggerDataRefresh('customers');
      
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      console.log('Deleting customer from server:', id);
      await postgresDatabaseService.deleteCustomer(id);
      console.log('Customer deleted successfully:', id);
      
      // Trigger data refresh event
      this.triggerDataRefresh('customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Transaction Synchronization
  async syncTransactions(companyId: string): Promise<Transaction[]> {
    try {
      console.log('Syncing transactions for company:', companyId);
      const transactions = await postgresDatabaseService.getTransactions(companyId);
      console.log('Transactions synced successfully:', transactions.length, 'transactions');
      return transactions;
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      console.log('Saving transaction to server:', transaction.id);
      const savedTransaction = await postgresDatabaseService.addTransaction(transaction);
      console.log('Transaction saved successfully:', savedTransaction);
      
      // Trigger data refresh events
      this.triggerDataRefresh('transactions');
      this.triggerDataRefresh('products'); // Stock levels changed
      this.triggerDataRefresh('customers'); // Customer stats changed
      
      return savedTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      console.log('Updating transaction on server:', id);
      const updatedTransaction = await postgresDatabaseService.updateTransaction(id, updates);
      console.log('Transaction updated successfully:', updatedTransaction);
      
      // Trigger data refresh event
      this.triggerDataRefresh('transactions');
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      console.log('Deleting transaction from server:', id);
      await postgresDatabaseService.deleteTransaction(id);
      console.log('Transaction deleted successfully:', id);
      
      // Trigger data refresh events
      this.triggerDataRefresh('transactions');
      this.triggerDataRefresh('products'); // Stock levels restored
      this.triggerDataRefresh('customers'); // Customer stats updated
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Employee Synchronization
  async syncEmployees(companyId: string): Promise<Employee[]> {
    try {
      console.log('Syncing employees for company:', companyId);
      const employees = await postgresDatabaseService.getEmployees(companyId);
      console.log('Employees synced successfully:', employees.length, 'employees');
      return employees;
    } catch (error) {
      console.error('Error syncing employees:', error);
      throw error;
    }
  }

  async saveEmployee(employee: Employee): Promise<void> {
    try {
      console.log('Saving employee to server:', employee.name);
      await postgresDatabaseService.addEmployee(employee);
      console.log('Employee saved successfully:', employee);
      
      // Trigger data refresh event
      this.triggerDataRefresh('employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  }

  // Stock Management Synchronization
  async updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      console.log('Updating product stock on server:', { productId, quantity, operation });
      await postgresDatabaseService.updateProductStock(productId, quantity, operation);
      console.log('Product stock updated successfully');
      
      // Trigger data refresh event
      this.triggerDataRefresh('products');
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Customer Statistics Synchronization
  async updateCustomerStats(customerId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      console.log('Updating customer stats on server:', { customerId, amount, operation });
      await postgresDatabaseService.updateCustomerStats(customerId, amount, operation);
      console.log('Customer stats updated successfully');
      
      // Trigger data refresh event
      this.triggerDataRefresh('customers');
    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw error;
    }
  }

  // Batch Operations
  async syncAllData(companyId: string): Promise<{
    products: Product[];
    customers: Customer[];
    transactions: Transaction[];
    employees: Employee[];
  }> {
    try {
      console.log('Starting full data sync for company:', companyId);
      
      const [products, customers, transactions, employees] = await Promise.all([
        this.syncProducts(companyId),
        this.syncCustomers(companyId),
        this.syncTransactions(companyId),
        this.syncEmployees(companyId)
      ]);

      console.log('Full data sync completed successfully:', {
        products: products.length,
        customers: customers.length,
        transactions: transactions.length,
        employees: employees.length
      });

      return { products, customers, transactions, employees };
    } catch (error) {
      console.error('Error during full data sync:', error);
      throw error;
    }
  }

  // Event System for Data Refresh
  private triggerDataRefresh(dataType: 'products' | 'customers' | 'transactions' | 'employees'): void {
    const event = new CustomEvent('dataRefreshed', {
      detail: { dataType, timestamp: new Date() }
    });
    window.dispatchEvent(event);
    console.log('Data refresh event triggered:', dataType);
  }

  // Queue Management for Offline Support
  async addToSyncQueue(operation: () => Promise<void>): Promise<void> {
    this.syncQueue.push(operation);
    console.log('Operation added to sync queue. Queue length:', this.syncQueue.length);
    
    if (!this.isSyncing) {
      await this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return;

    this.isSyncing = true;
    console.log('Processing sync queue...');

    try {
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        if (operation) {
          try {
            await operation();
            console.log('Sync operation completed successfully');
          } catch (error) {
            console.error('Sync operation failed:', error);
            // Re-add failed operations to the front of the queue
            this.syncQueue.unshift(operation);
          }
        }
      }
    } finally {
      this.isSyncing = false;
      console.log('Sync queue processing completed');
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await postgresDatabaseService.getProducts('test');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const dataSyncService = DataSyncService.getInstance();
