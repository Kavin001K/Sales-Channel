import { useEffect, useState, useCallback } from 'react';
import { indexedDBService } from '@/lib/indexed-db';
import type { Product, Customer, Transaction } from '@/lib/types';

export function useOfflineSync(companyId: string) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Listen for online/offline events
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        // Auto-sync when connection restored
        syncNow();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Initial sync if online
    if (navigator.onLine) {
      syncNow();
    }

    // Poll pending count every 5 seconds
    const interval = setInterval(async () => {
      const count = await indexedDBService.getOutboxCount();
      setPendingCount(count);
    }, 5000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [companyId]);

  const syncNow = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      // 1. Process outbox (send pending mutations)
      await indexedDBService.processOutbox();

      // 2. Fetch fresh data from server
      const productsResponse = await fetch(`/api/companies/${companyId}/products`);
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        await indexedDBService.cacheProducts(companyId, products);
      }

      const customersResponse = await fetch(`/api/companies/${companyId}/customers`);
      if (customersResponse.ok) {
        const customers = await customersResponse.json();
        await indexedDBService.cacheCustomers(companyId, customers);
      }

      const transactionsResponse = await fetch(`/api/companies/${companyId}/transactions`);
      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json();
        await indexedDBService.cacheTransactions(companyId, transactions);
      }

      const count = await indexedDBService.getOutboxCount();
      setPendingCount(count);

      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [companyId, isSyncing]);

  // Optimistic create product with rollback
  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const optimisticId = crypto.randomUUID();
    const optimisticProduct: Product = {
      ...product,
      id: optimisticId,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 1. Update UI immediately (optimistic)
    await indexedDBService.addProduct(optimisticProduct);

    try {
      if (isOnline) {
        // 2. Send to server
        const response = await fetch(`/api/companies/${companyId}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const savedProduct = await response.json();

        // 3. Replace optimistic with server version
        await indexedDBService.deleteProduct(optimisticId);
        await indexedDBService.addProduct(savedProduct);

        return savedProduct;
      } else {
        // 4. Queue for later (offline)
        await indexedDBService.addToOutbox({
          type: 'create',
          entity: 'product',
          data: product,
          companyId,
        });

        return optimisticProduct;
      }
    } catch (error) {
      // 5. Rollback optimistic update on error
      await indexedDBService.deleteProduct(optimisticId);
      throw error;
    }
  }, [companyId, isOnline]);

  // Optimistic update product with rollback
  const updateProduct = useCallback(async (productId: string, updates: Partial<Product>) => {
    // Store original for rollback
    const products = await indexedDBService.getProducts(companyId);
    const original = products.find(p => p.id === productId);

    if (!original) {
      throw new Error('Product not found');
    }

    const updatedProduct = { ...original, ...updates, updatedAt: new Date() };

    // 1. Update UI immediately (optimistic)
    await indexedDBService.updateProduct(updatedProduct);

    try {
      if (isOnline) {
        // 2. Send to server
        const response = await fetch(`/api/companies/${companyId}/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const savedProduct = await response.json();
        await indexedDBService.updateProduct(savedProduct);

        return savedProduct;
      } else {
        // 3. Queue for later (offline)
        await indexedDBService.addToOutbox({
          type: 'update',
          entity: 'product',
          data: { id: productId, ...updates },
          companyId,
        });

        return updatedProduct;
      }
    } catch (error) {
      // 4. Rollback to original on error
      await indexedDBService.updateProduct(original);
      throw error;
    }
  }, [companyId, isOnline]);

  // Optimistic delete product with rollback
  const deleteProduct = useCallback(async (productId: string) => {
    // Store original for rollback
    const products = await indexedDBService.getProducts(companyId);
    const original = products.find(p => p.id === productId);

    if (!original) {
      throw new Error('Product not found');
    }

    // 1. Update UI immediately (optimistic)
    await indexedDBService.deleteProduct(productId);

    try {
      if (isOnline) {
        // 2. Send to server
        const response = await fetch(`/api/companies/${companyId}/products/${productId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } else {
        // 3. Queue for later (offline)
        await indexedDBService.addToOutbox({
          type: 'delete',
          entity: 'product',
          data: { id: productId },
          companyId,
        });
      }
    } catch (error) {
      // 4. Rollback (restore) on error
      await indexedDBService.addProduct(original);
      throw error;
    }
  }, [companyId, isOnline]);

  // Similar methods for customers and transactions...
  const createCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const optimisticId = crypto.randomUUID();
    const optimisticCustomer: Customer = {
      ...customer,
      id: optimisticId,
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      loyaltyPoints: customer.loyaltyPoints || 0,
      totalSpent: customer.totalSpent || 0,
      visitCount: customer.visitCount || 0,
      isActive: customer.isActive !== undefined ? customer.isActive : true,
    };

    await indexedDBService.addCustomer(optimisticCustomer);

    try {
      if (isOnline) {
        const response = await fetch(`/api/companies/${companyId}/customers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const savedCustomer = await response.json();
        await indexedDBService.deleteCustomer(optimisticId);
        await indexedDBService.addCustomer(savedCustomer);

        return savedCustomer;
      } else {
        await indexedDBService.addToOutbox({
          type: 'create',
          entity: 'customer',
          data: customer,
          companyId,
        });

        return optimisticCustomer;
      }
    } catch (error) {
      await indexedDBService.deleteCustomer(optimisticId);
      throw error;
    }
  }, [companyId, isOnline]);

  const createTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const optimisticId = crypto.randomUUID();
    const optimisticTransaction: Transaction = {
      ...transaction,
      id: optimisticId,
      companyId,
      timestamp: new Date(),
    };

    await indexedDBService.addTransaction(optimisticTransaction);

    try {
      if (isOnline) {
        const response = await fetch(`/api/companies/${companyId}/transactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const savedTransaction = await response.json();
        // Note: We don't delete the optimistic one for transactions, just update with server version
        await indexedDBService.addTransaction(savedTransaction);

        return savedTransaction;
      } else {
        await indexedDBService.addToOutbox({
          type: 'create',
          entity: 'transaction',
          data: transaction,
          companyId,
        });

        return optimisticTransaction;
      }
    } catch (error) {
      // For transactions, we might not want to delete on error as it could be important data
      console.error('Failed to create transaction:', error);
      throw error;
    }
  }, [companyId, isOnline]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow,
    createProduct,
    updateProduct,
    deleteProduct,
    createCustomer,
    createTransaction,
  };
}
