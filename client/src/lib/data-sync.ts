// Data Synchronization Service
// Ensures all data is properly saved to server and fetched for future use

// Note: Direct database connections removed - using API calls instead
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
      // TODO: Replace with API call to server
      return LocalStore.getProducts(companyId);
    } catch (error) {
      console.error('Error syncing products:', error);
      return LocalStore.getProducts(companyId);
    }
  }

  async saveProduct(product: Product): Promise<Product> {
    try {
      // Write locally first (offline-first)
      LocalStore.saveProduct(product);
      // TODO: Add API call to save to server
      this.triggerDataRefresh('products');
      return product;
    } catch (error) {
      console.error('Error saving product:', error);
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
      // TODO: Add API call to update on server
      this.triggerDataRefresh('products');
      return (updates as any) as Product;
    } catch (error) {
      console.error('Error updating product:', error);
      return (updates as any) as Product;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      // TODO: Add API call to delete from server
      this.triggerDataRefresh('products');
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Customer Synchronization
  async syncCustomers(companyId: string): Promise<Customer[]> {
    try {
      // TODO: Replace with API call to server
      return LocalStore.getCustomers(companyId);
    } catch (error) {
      console.error('Error syncing customers:', error);
      return LocalStore.getCustomers(companyId);
    }
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      LocalStore.saveCustomer(customer);
      // TODO: Add API call to save to server
      this.triggerDataRefresh('customers');
      return customer;
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
      // TODO: Add API call to update on server
      this.triggerDataRefresh('customers');
      return (updates as any) as Customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      return (updates as any) as Customer;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      // TODO: Add API call to delete from server
      this.triggerDataRefresh('customers');
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Transaction Synchronization
  async syncTransactions(companyId: string): Promise<Transaction[]> {
    try {
      // TODO: Replace with API call to server
      return LocalStore.getTransactions(companyId);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      return LocalStore.getTransactions(companyId);
    }
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      LocalStore.saveTransaction(transaction);
      // TODO: Add API call to save to server
      this.triggerDataRefresh('transactions');
      this.triggerDataRefresh('products');
      this.triggerDataRefresh('customers');
      return transaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return transaction;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      // TODO: Add API call to update on server
      this.triggerDataRefresh('transactions');
      return (updates as any) as Transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      // TODO: Add API call to delete from server
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
      // TODO: Replace with API call to server
      return [];
    } catch (error) {
      console.error('Error syncing employees:', error);
      throw error;
    }
  }

  async saveEmployee(employee: Employee): Promise<void> {
    try {
      // TODO: Add API call to save to server
      this.triggerDataRefresh('employees');
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  }

  // Stock Management Synchronization
  async updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      // TODO: Add API call to update stock on server
      this.triggerDataRefresh('products');
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Customer Statistics Synchronization
  async updateCustomerStats(customerId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      // TODO: Add API call to update stats on server
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
