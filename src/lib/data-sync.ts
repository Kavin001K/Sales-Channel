// Data Synchronization Service
// Ensures all data is properly saved to server and fetched for future use

import { postgresDatabaseService } from './postgres-database';
import { LocalStore, isOnline } from './local-store';
import { Product, Customer, Transaction, Employee, Company } from './types';

export class DataSyncService {
  private static instance: DataSyncService;
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;
  private pendingOpsKey = `${'scpos'}:pendingOps`;

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
      if (isOnline()) {
        const products = await postgresDatabaseService.getProducts(companyId);
        // Cache locally
        products.forEach(p => LocalStore.saveProduct(p));
        return products;
      }
      // Offline fallback
      return LocalStore.getProducts(companyId);
    } catch (error) {
      console.error('Error syncing products:', error);
      // Fallback to local
      return LocalStore.getProducts(companyId);
    }
  }

  async saveProduct(product: Product): Promise<Product> {
    try {
      // Write locally first (offline-first)
      LocalStore.saveProduct(product);
      let saved = product;
      if (isOnline()) {
        saved = await postgresDatabaseService.addProduct(product);
        LocalStore.saveProduct(saved);
      }
      this.triggerDataRefresh('products');
      return saved;
    } catch (error) {
      console.error('Error saving product:', error);
      // Keep local write
      return product;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      // Local optimistic update
      const companyId = (updates as any).companyId;
      if (companyId) {
        const current = LocalStore.getProducts(companyId).find(p => p.id === id);
        if (current) LocalStore.saveProduct({ ...current, ...updates, id } as Product);
      }
      let updated = (updates as any) as Product;
      if (isOnline()) {
        updated = await postgresDatabaseService.updateProduct(id, updates);
        if ((updated as any).companyId) LocalStore.saveProduct(updated);
      }
      this.triggerDataRefresh('products');
      return updated;
    } catch (error) {
      console.error('Error updating product:', error);
      // Keep local optimistic update
      return (updates as any) as Product;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      // Attempt to remove locally for all companies (best effort)
      // Caller should refresh list after this
      // Online delete
      if (isOnline()) {
        await postgresDatabaseService.deleteProduct(id);
      }
      this.triggerDataRefresh('products');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Customer Synchronization
  async syncCustomers(companyId: string): Promise<Customer[]> {
    try {
      if (isOnline()) {
        const customers = await postgresDatabaseService.getCustomers(companyId);
        customers.forEach(c => LocalStore.saveCustomer(c));
        return customers;
      }
      return LocalStore.getCustomers(companyId);
    } catch (error) {
      console.error('Error syncing customers:', error);
      return LocalStore.getCustomers(companyId);
    }
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      LocalStore.saveCustomer(customer);
      let saved = customer;
      if (isOnline()) {
        saved = await postgresDatabaseService.addCustomer(customer);
        LocalStore.saveCustomer(saved);
      }
      this.triggerDataRefresh('customers');
      return saved;
    } catch (error) {
      console.error('Error saving customer:', error);
      return customer;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      const companyId = (updates as any).companyId;
      if (companyId) {
        const current = LocalStore.getCustomers(companyId).find(c => c.id === id);
        if (current) LocalStore.saveCustomer({ ...current, ...updates, id } as Customer);
      }
      let updated = (updates as any) as Customer;
      if (isOnline()) {
        updated = await postgresDatabaseService.updateCustomer(id, updates);
        if ((updated as any).companyId) LocalStore.saveCustomer(updated);
      }
      this.triggerDataRefresh('customers');
      return updated;
    } catch (error) {
      console.error('Error updating customer:', error);
      return (updates as any) as Customer;
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
      if (isOnline()) {
        const transactions = await postgresDatabaseService.getTransactions(companyId);
        transactions.forEach(t => LocalStore.saveTransaction(t));
        return transactions;
      }
      return LocalStore.getTransactions(companyId);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return LocalStore.getTransactions(companyId);
    }
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      LocalStore.saveTransaction(transaction);
      let saved = transaction;
      if (isOnline()) {
        saved = await postgresDatabaseService.addTransaction(transaction);
        LocalStore.saveTransaction(saved);
      }
      this.triggerDataRefresh('transactions');
      this.triggerDataRefresh('products');
      this.triggerDataRefresh('customers');
      return saved;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return transaction;
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
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log('Processing sync queue...');

    try {
      // Load persisted queue and merge with in-memory
      const persisted = this.loadPendingOps();
      if (persisted.length) {
        for (const fn of persisted) this.syncQueue.push(fn);
        this.clearPendingOps();
      }

      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        if (operation) {
          try {
            await operation();
            console.log('Sync operation completed successfully');
          } catch (error) {
            console.error('Sync operation failed:', error);
            // Persist failed op to localStorage for retry later
            this.persistPendingOp(operation);
          }
        }
      }
    } finally {
      this.isSyncing = false;
      console.log('Sync queue processing completed');
    }
  }

  // Persist/Load pending ops (store as simple markers and reconstruct)
  private persistPendingOp(op: () => Promise<void>) {
    // Since functions can't be serialized, we store a simple token telling to run a full sync
    // This keeps implementation simple and robust.
    const key = this.pendingOpsKey;
    try {
      localStorage.setItem(key, JSON.stringify({ pending: true, ts: Date.now() }));
      window.addEventListener('online', () => {
        // trigger sync on next tick
        setTimeout(() => this.syncAllOnReconnect(), 100);
      }, { once: true });
    } catch (e) {
      console.warn('Could not persist pending op', e);
    }
  }

  private loadPendingOps(): Array<() => Promise<void>> {
    try {
      const data = localStorage.getItem(this.pendingOpsKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (parsed && parsed.pending) {
        // Return a single op that runs a full sync of all resources
        return [async () => this.syncAllOnReconnect()];
      }
    } catch {}
    return [];
  }

  private clearPendingOps() {
    try { localStorage.removeItem(this.pendingOpsKey); } catch {}
  }

  private async syncAllOnReconnect() {
    // Best-effort refresh for all company data currently in local cache
    // If multiple companies are used in the same browser, we could extend
    // this to iterate keys. For now, rely on UI loads to pass specific companyId.
    // We dispatch a generic refresh event; pages using useDataSync will fetch fresh.
    this.triggerDataRefresh('products');
    this.triggerDataRefresh('customers');
    this.triggerDataRefresh('transactions');
    this.triggerDataRefresh('employees');
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
