import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { Product, Customer, Transaction } from './types';

interface SalesChannelDB extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { 'by-company': string };
  };
  customers: {
    key: string;
    value: Customer;
    indexes: { 'by-company': string };
  };
  transactions: {
    key: string;
    value: Transaction;
    indexes: { 'by-company': string; 'by-date': Date };
  };
  outbox: {
    key: number;
    value: {
      id?: number;
      type: 'create' | 'update' | 'delete';
      entity: 'product' | 'customer' | 'transaction';
      data: any;
      companyId: string;
      timestamp: Date;
      retries: number;
    };
    indexes: { 'by-timestamp': Date; 'by-company': string };
  };
}

class IndexedDBService {
  private db: IDBPDatabase<SalesChannelDB> | null = null;
  private initPromise: Promise<void> | null = null;

  async init() {
    // Prevent multiple initializations
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      this.db = await openDB<SalesChannelDB>('sales-channel-v1', 1, {
        upgrade(db) {
          // Products store
          const products = db.createObjectStore('products', { keyPath: 'id' });
          products.createIndex('by-company', 'companyId');

          // Customers store
          const customers = db.createObjectStore('customers', { keyPath: 'id' });
          customers.createIndex('by-company', 'companyId');

          // Transactions store
          const transactions = db.createObjectStore('transactions', { keyPath: 'id' });
          transactions.createIndex('by-company', 'companyId');
          transactions.createIndex('by-date', 'timestamp');

          // Outbox for offline mutations
          const outbox = db.createObjectStore('outbox', {
            keyPath: 'id',
            autoIncrement: true
          });
          outbox.createIndex('by-timestamp', 'timestamp');
          outbox.createIndex('by-company', 'companyId');
        },
      });

      console.log('✅ IndexedDB initialized');
    })();

    return this.initPromise;
  }

  private ensureDB(): IDBPDatabase<SalesChannelDB> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }
    return this.db;
  }

  // Cache products from server
  async cacheProducts(companyId: string, products: Product[]) {
    const db = this.ensureDB();
    const tx = db.transaction('products', 'readwrite');
    await Promise.all(products.map(p => tx.store.put(p)));
    await tx.done;
    console.log(`✅ Cached ${products.length} products for company ${companyId}`);
  }

  // Get products (works offline)
  async getProducts(companyId: string): Promise<Product[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('products', 'by-company', companyId);
  }

  // Cache customers from server
  async cacheCustomers(companyId: string, customers: Customer[]) {
    const db = this.ensureDB();
    const tx = db.transaction('customers', 'readwrite');
    await Promise.all(customers.map(c => tx.store.put(c)));
    await tx.done;
    console.log(`✅ Cached ${customers.length} customers for company ${companyId}`);
  }

  // Get customers (works offline)
  async getCustomers(companyId: string): Promise<Customer[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('customers', 'by-company', companyId);
  }

  // Cache transactions from server
  async cacheTransactions(companyId: string, transactions: Transaction[]) {
    const db = this.ensureDB();
    const tx = db.transaction('transactions', 'readwrite');
    await Promise.all(transactions.map(t => tx.store.put(t)));
    await tx.done;
    console.log(`✅ Cached ${transactions.length} transactions for company ${companyId}`);
  }

  // Get transactions (works offline)
  async getTransactions(companyId: string): Promise<Transaction[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('transactions', 'by-company', companyId);
  }

  // Add mutation to outbox (for when offline)
  async addToOutbox(mutation: {
    type: 'create' | 'update' | 'delete';
    entity: 'product' | 'customer' | 'transaction';
    data: any;
    companyId: string;
  }) {
    const db = this.ensureDB();

    await db.add('outbox', {
      ...mutation,
      timestamp: new Date(),
      retries: 0,
    });

    console.log('✅ Added to outbox:', mutation);
  }

  // Process outbox when back online
  async processOutbox() {
    const db = this.ensureDB();
    const mutations = await db.getAll('outbox');

    if (mutations.length === 0) {
      console.log('📤 No pending mutations in outbox');
      return {
        success: [],
        failed: [],
        conflicts: [],
        total: 0
      };
    }

    console.log(`📤 Processing ${mutations.length} queued operations...`);

    const results = {
      success: [] as any[],
      failed: [] as any[],
      conflicts: [] as any[],
      total: mutations.length
    };

    for (const mutation of mutations) {
      try {
        const method = mutation.type === 'create' ? 'POST' :
                      mutation.type === 'update' ? 'PUT' : 'DELETE';

        const endpoint = `/api/companies/${mutation.companyId}/${mutation.entity}s`;

        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(mutation.data),
        });

        // Handle conflicts (409)
        if (response.status === 409) {
          const serverData = await response.json();
          results.conflicts.push({
            mutation,
            serverData,
            message: 'Data was modified on server'
          });
          console.warn('⚠️ Conflict detected:', mutation.entity, mutation.data);
          continue; // Keep in outbox for manual resolution
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        // Success! Remove from outbox
        await db.delete('outbox', mutation.id!);
        results.success.push({
          type: mutation.type,
          entity: mutation.entity,
          id: mutation.data.id
        });
        console.log('✅ Synced:', mutation.type, mutation.entity);

      } catch (error) {
        console.error('❌ Sync failed:', mutation, error);

        // Increment retry counter
        mutation.retries += 1;

        if (mutation.retries >= 5) {
          // Give up after 5 retries and mark as failed
          await db.delete('outbox', mutation.id!);
          results.failed.push({
            mutation,
            error: error instanceof Error ? error.message : 'Unknown error',
            retriesExhausted: true
          });
          console.warn('⚠️ Gave up syncing after 5 retries:', mutation);
        } else {
          // Update retry count and keep in outbox
          await db.put('outbox', mutation);
          results.failed.push({
            mutation,
            error: error instanceof Error ? error.message : 'Unknown error',
            willRetry: true,
            retriesRemaining: 5 - mutation.retries
          });
        }
      }
    }

    return results;
  }

  // Get outbox size (show user pending changes)
  async getOutboxCount(): Promise<number> {
    if (!this.db) return 0;
    return await this.db.count('outbox');
  }

  // Clear all cached data (for logout or reset)
  async clearCache() {
    const db = this.ensureDB();
    const tx = db.transaction(['products', 'customers', 'transactions', 'outbox'], 'readwrite');

    await Promise.all([
      tx.objectStore('products').clear(),
      tx.objectStore('customers').clear(),
      tx.objectStore('transactions').clear(),
      tx.objectStore('outbox').clear(),
    ]);

    await tx.done;
    console.log('✅ IndexedDB cache cleared');
  }

  // Add a single product to cache (optimistic update)
  async addProduct(product: Product) {
    const db = this.ensureDB();
    await db.put('products', product);
    console.log('✅ Product added to cache:', product.id);
  }

  // Update a single product in cache
  async updateProduct(product: Product) {
    const db = this.ensureDB();
    await db.put('products', product);
    console.log('✅ Product updated in cache:', product.id);
  }

  // Delete a single product from cache
  async deleteProduct(productId: string) {
    const db = this.ensureDB();
    await db.delete('products', productId);
    console.log('✅ Product deleted from cache:', productId);
  }

  // Add a single customer to cache (optimistic update)
  async addCustomer(customer: Customer) {
    const db = this.ensureDB();
    await db.put('customers', customer);
    console.log('✅ Customer added to cache:', customer.id);
  }

  // Update a single customer in cache
  async updateCustomer(customer: Customer) {
    const db = this.ensureDB();
    await db.put('customers', customer);
    console.log('✅ Customer updated in cache:', customer.id);
  }

  // Delete a single customer from cache
  async deleteCustomer(customerId: string) {
    const db = this.ensureDB();
    await db.delete('customers', customerId);
    console.log('✅ Customer deleted from cache:', customerId);
  }

  // Add a single transaction to cache (optimistic update)
  async addTransaction(transaction: Transaction) {
    const db = this.ensureDB();
    await db.put('transactions', transaction);
    console.log('✅ Transaction added to cache:', transaction.id);
  }
}

export const indexedDBService = new IndexedDBService();
