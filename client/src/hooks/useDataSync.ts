import { useState, useEffect, useCallback } from 'react';
import { dataSyncService } from '@/lib/data-sync';
import { Product, Customer, Transaction, Employee } from '@/lib/types';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useDataSync = () => {
  const { company } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Sync all data for the company
  const syncAllData = useCallback(async () => {
    if (!company?.id) return;

    setIsLoading(true);
    setSyncStatus('syncing');

    try {
      console.log('Starting full data sync for company:', company.id);
      const data = await dataSyncService.syncAllData(company.id);
      
      setProducts(data.products);
      setCustomers(data.customers);
      setTransactions(data.transactions);
      setEmployees(data.employees);
      
      setLastSync(new Date());
      setSyncStatus('idle');
      
      console.log('Full data sync completed successfully');
      toast({
        title: "Sync Complete",
        description: `Synced ${data.products.length} products, ${data.customers.length} customers, ${data.transactions.length} transactions`,
      });
    } catch (error) {
      console.error('Error during full data sync:', error);
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Failed to sync data from server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [company?.id]);

  // Individual data sync functions
  const syncProducts = useCallback(async () => {
    if (!company?.id) return;

    try {
      const data = await dataSyncService.syncProducts(company.id);
      setProducts(data);
      console.log('Products synced:', data.length);
    } catch (error) {
      console.error('Error syncing products:', error);
      toast({
        title: "Products Sync Failed",
        description: "Failed to sync products from server",
        variant: "destructive",
      });
    }
  }, [company?.id]);

  const syncCustomers = useCallback(async () => {
    if (!company?.id) return;

    try {
      const data = await dataSyncService.syncCustomers(company.id);
      setCustomers(data);
      console.log('Customers synced:', data.length);
    } catch (error) {
      console.error('Error syncing customers:', error);
      toast({
        title: "Customers Sync Failed",
        description: "Failed to sync customers from server",
        variant: "destructive",
      });
    }
  }, [company?.id]);

  const syncTransactions = useCallback(async () => {
    if (!company?.id) return;

    try {
      const data = await dataSyncService.syncTransactions(company.id);
      setTransactions(data);
      console.log('Transactions synced:', data.length);
    } catch (error) {
      console.error('Error syncing transactions:', error);
      toast({
        title: "Transactions Sync Failed",
        description: "Failed to sync transactions from server",
        variant: "destructive",
      });
    }
  }, [company?.id]);

  const syncEmployees = useCallback(async () => {
    if (!company?.id) return;

    try {
      const data = await dataSyncService.syncEmployees(company.id);
      setEmployees(data);
      console.log('Employees synced:', data.length);
    } catch (error) {
      console.error('Error syncing employees:', error);
      toast({
        title: "Employees Sync Failed",
        description: "Failed to sync employees from server",
        variant: "destructive",
      });
    }
  }, [company?.id]);

  // Product operations
  const saveProduct = useCallback(async (product: Product): Promise<Product> => {
    try {
      const savedProduct = await dataSyncService.saveProduct(product);
      setProducts(prev => [...prev, savedProduct]);
      toast({
        title: "Product Saved",
        description: `${product.name} has been saved to server`,
      });
      return savedProduct;
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save product to server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      const updatedProduct = await dataSyncService.updateProduct(id, updates);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast({
        title: "Product Updated",
        description: "Product has been updated on server",
      });
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update product on server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    try {
      await dataSyncService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Product Deleted",
        description: "Product has been deleted from server",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete product from server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  // Customer operations
  const saveCustomer = useCallback(async (customer: Customer): Promise<Customer> => {
    try {
      const savedCustomer = await dataSyncService.saveCustomer(customer);
      setCustomers(prev => [...prev, savedCustomer]);
      toast({
        title: "Customer Saved",
        description: `${customer.name} has been saved to server`,
      });
      return savedCustomer;
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save customer to server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
      const updatedCustomer = await dataSyncService.updateCustomer(id, updates);
      setCustomers(prev => prev.map(c => c.id === id ? updatedCustomer : c));
      toast({
        title: "Customer Updated",
        description: "Customer has been updated on server",
      });
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update customer on server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string): Promise<void> => {
    try {
      await dataSyncService.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Customer Deleted",
        description: "Customer has been deleted from server",
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete customer from server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  // Transaction operations
  const saveTransaction = useCallback(async (transaction: Transaction): Promise<Transaction> => {
    try {
      const savedTransaction = await dataSyncService.saveTransaction(transaction);
      setTransactions(prev => [savedTransaction, ...prev]);
      
      // Update products (stock levels changed)
      await syncProducts();
      
      // Update customers (stats changed)
      await syncCustomers();
      
      toast({
        title: "Transaction Saved",
        description: "Transaction has been saved to server",
      });
      return savedTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save transaction to server",
        variant: "destructive",
      });
      throw error;
    }
  }, [syncProducts, syncCustomers]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
    try {
      const updatedTransaction = await dataSyncService.updateTransaction(id, updates);
      setTransactions(prev => prev.map(t => t.id === id ? updatedTransaction : t));
      toast({
        title: "Transaction Updated",
        description: "Transaction has been updated on server",
      });
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update transaction on server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    try {
      await dataSyncService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // Update products (stock levels restored)
      await syncProducts();
      
      // Update customers (stats updated)
      await syncCustomers();
      
      toast({
        title: "Transaction Deleted",
        description: "Transaction has been deleted from server",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete transaction from server",
        variant: "destructive",
      });
      throw error;
    }
  }, [syncProducts, syncCustomers]);

  // Employee operations
  const saveEmployee = useCallback(async (employee: Employee): Promise<void> => {
    try {
      await dataSyncService.saveEmployee(employee);
      setEmployees(prev => [...prev, employee]);
      toast({
        title: "Employee Saved",
        description: `${employee.name} has been saved to server`,
      });
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save employee to server",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  // Stock management
  const updateProductStock = useCallback(async (productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> => {
    try {
      await dataSyncService.updateProductStock(productId, quantity, operation);
      await syncProducts(); // Refresh products to get updated stock
      toast({
        title: "Stock Updated",
        description: `Product stock has been ${operation}ed on server`,
      });
    } catch (error) {
      console.error('Error updating product stock:', error);
      toast({
        title: "Stock Update Failed",
        description: "Failed to update product stock on server",
        variant: "destructive",
      });
      throw error;
    }
  }, [syncProducts]);

  // Customer statistics
  const updateCustomerStats = useCallback(async (customerId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> => {
    try {
      await dataSyncService.updateCustomerStats(customerId, amount, operation);
      await syncCustomers(); // Refresh customers to get updated stats
      toast({
        title: "Customer Stats Updated",
        description: "Customer statistics have been updated on server",
      });
    } catch (error) {
      console.error('Error updating customer stats:', error);
      toast({
        title: "Stats Update Failed",
        description: "Failed to update customer statistics on server",
        variant: "destructive",
      });
      throw error;
    }
  }, [syncCustomers]);

  // Health check
  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const isHealthy = await dataSyncService.healthCheck();
      if (!isHealthy) {
        toast({
          title: "Server Unavailable",
          description: "Cannot connect to server. Some features may be limited.",
          variant: "destructive",
        });
      }
      return isHealthy;
    } catch (error) {
      console.error('Server health check failed:', error);
      toast({
        title: "Server Unavailable",
        description: "Cannot connect to server. Some features may be limited.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Listen for data refresh events
  useEffect(() => {
    const handleDataRefresh = (event: CustomEvent) => {
      const { dataType } = event.detail;
      console.log('Data refresh event received:', dataType);
      
      switch (dataType) {
        case 'products':
          syncProducts();
          break;
        case 'customers':
          syncCustomers();
          break;
        case 'transactions':
          syncTransactions();
          break;
        case 'employees':
          syncEmployees();
          break;
      }
    };

    window.addEventListener('dataRefreshed', handleDataRefresh as EventListener);
    
    return () => {
      window.removeEventListener('dataRefreshed', handleDataRefresh as EventListener);
    };
  }, [syncProducts, syncCustomers, syncTransactions, syncEmployees]);

  // Initial sync when company changes
  useEffect(() => {
    if (company?.id) {
      syncAllData();
    }
  }, [company?.id, syncAllData]);

  return {
    // Data
    products,
    customers,
    transactions,
    employees,
    
    // Loading states
    isLoading,
    syncStatus,
    lastSync,
    
    // Sync functions
    syncAllData,
    syncProducts,
    syncCustomers,
    syncTransactions,
    syncEmployees,
    
    // Product operations
    saveProduct,
    updateProduct,
    deleteProduct,
    
    // Customer operations
    saveCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Transaction operations
    saveTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Employee operations
    saveEmployee,
    
    // Stock and stats
    updateProductStock,
    updateCustomerStats,
    
    // Health check
    checkServerHealth,
  };
};
