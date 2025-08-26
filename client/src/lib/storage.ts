import { dataSyncService } from './data-sync';
import { Product, Customer, Transaction, Employee } from './types';
import { useAuth } from '@/hooks/useAuth';

// Settings interfaces
export interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  email: string;
  phone: string;
  taxId: string;
  gstin: string;
  taxationMethod: 'gst' | 'vat' | 'none';
  currency: string;
  logo?: string;
}

export interface PrintTemplateSettings {
  template: 'default' | 'modern' | 'classic';
  fontSize: 'small' | 'medium' | 'large';
  showLogo: boolean;
  showQRCode: boolean;
  headerText: string;
  footerText: string;
}

// Enhanced storage service that ensures all data is saved to server
export class EnhancedStorageService {
  private static instance: EnhancedStorageService;

  private constructor() {}

  static getInstance(): EnhancedStorageService {
    if (!EnhancedStorageService.instance) {
      EnhancedStorageService.instance = new EnhancedStorageService();
    }
    return EnhancedStorageService.instance;
  }

  // Product Operations
  async getProducts(companyId: string): Promise<Product[]> {
    try {
      return await dataSyncService.syncProducts(companyId);
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  async saveProduct(product: Product): Promise<Product> {
    try {
      return await dataSyncService.saveProduct(product);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      return await dataSyncService.updateProduct(id, updates);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await dataSyncService.deleteProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Customer Operations
  async getCustomers(companyId: string): Promise<Customer[]> {
    try {
      return await dataSyncService.syncCustomers(companyId);
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  async saveCustomer(customer: Customer): Promise<Customer> {
    try {
      return await dataSyncService.saveCustomer(customer);
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      return await dataSyncService.updateCustomer(id, updates);
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      await dataSyncService.deleteCustomer(id);
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Transaction Operations
  async getTransactions(companyId: string): Promise<Transaction[]> {
    try {
      return await dataSyncService.syncTransactions(companyId);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      return await dataSyncService.saveTransaction(transaction);
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      return await dataSyncService.updateTransaction(id, updates);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    try {
      await dataSyncService.deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Employee Operations
  async getEmployees(companyId: string): Promise<Employee[]> {
    try {
      return await dataSyncService.syncEmployees(companyId);
    } catch (error) {
      console.error('Error getting employees:', error);
      return [];
    }
  }

  async saveEmployee(employee: Employee): Promise<void> {
    try {
      await dataSyncService.saveEmployee(employee);
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  }

  // Stock Management
  async updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      await dataSyncService.updateProductStock(productId, quantity, operation);
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Customer Statistics
  async updateCustomerStats(customerId: string, amount: number, operation: 'add' | 'subtract'): Promise<void> {
    try {
      await dataSyncService.updateCustomerStats(customerId, amount, operation);
    } catch (error) {
      console.error('Error updating customer stats:', error);
      throw error;
    }
  }

  // Batch Operations
  async syncAllData(companyId: string) {
    try {
      return await dataSyncService.syncAllData(companyId);
    } catch (error) {
      console.error('Error syncing all data:', error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    return await dataSyncService.healthCheck();
  }
}

// Export singleton instance
export const enhancedStorageService = EnhancedStorageService.getInstance();

// Legacy functions for backward compatibility
export const getProducts = async (companyId: string): Promise<Product[]> => {
  return await enhancedStorageService.getProducts(companyId);
};

export const saveProduct = async (product: Product): Promise<Product> => {
  return await enhancedStorageService.saveProduct(product);
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<Product> => {
  return await enhancedStorageService.updateProduct(id, updates);
};

export const deleteProduct = async (id: string): Promise<void> => {
  return await enhancedStorageService.deleteProduct(id);
};

export const getCustomers = async (companyId: string): Promise<Customer[]> => {
  return await enhancedStorageService.getCustomers(companyId);
};

export const saveCustomer = async (customer: Customer): Promise<Customer> => {
  return await enhancedStorageService.saveCustomer(customer);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<Customer> => {
  return await enhancedStorageService.updateCustomer(id, updates);
};

export const deleteCustomer = async (id: string): Promise<void> => {
  return await enhancedStorageService.deleteCustomer(id);
};

export const getTransactions = async (companyId: string): Promise<Transaction[]> => {
  return await enhancedStorageService.getTransactions(companyId);
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction> => {
  return await enhancedStorageService.saveTransaction(transaction);
};

export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<Transaction> => {
  return await enhancedStorageService.updateTransaction(id, updates);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  return await enhancedStorageService.deleteTransaction(id);
};

export const getEmployees = async (companyId: string): Promise<Employee[]> => {
  return await enhancedStorageService.getEmployees(companyId);
};

export const saveEmployee = async (employee: Employee): Promise<void> => {
  return await enhancedStorageService.saveEmployee(employee);
};

export const initializeSampleData = async (): Promise<void> => {
  // This is a placeholder function to fix a build error.
  // It is not intended to be used.
  console.warn("initializeSampleData is a deprecated function.");
};

// Settings functions
export const getCompanySettings = (): CompanySettings => {
  try {
    const saved = localStorage.getItem('company_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading company settings:', error);
  }
  
  // Return default settings
  return {
    name: 'ACE Business',
    address: '123 Business Street',
    city: 'Business City',
    state: 'Business State',
    pinCode: '12345',
    country: 'India',
    email: 'info@acebusiness.com',
    phone: '+91 98765 43210',
    taxId: 'GST123456789',
    gstin: 'GST123456789',
    taxationMethod: 'gst',
    currency: 'INR'
  };
};

export const getPrintSettings = (): PrintTemplateSettings => {
  try {
    const saved = localStorage.getItem('print_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading print settings:', error);
  }
  
  // Return default print settings
  return {
    template: 'default',
    fontSize: 'medium',
    showLogo: true,
    showQRCode: true,
    headerText: 'Thank you for your business!',
    footerText: 'Please visit again!'
  };
};

// Employee ID settings functions
export const getEmployeeIdSettings = () => {
  try {
    const saved = localStorage.getItem('employee_id_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading employee ID settings:', error);
  }
  
  return {
    prefix: 'EMP',
    nextNumber: 1,
    format: 'EMP{number}'
  };
};

export const setEmployeeIdSettings = (settings: any) => {
  try {
    localStorage.setItem('employee_id_settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving employee ID settings:', error);
  }
};

// Employee management functions
export const addEmployee = async (employee: Employee): Promise<void> => {
  try {
    // For now, just log the employee data
    console.log('Adding employee:', employee);
    // In a real implementation, this would save to the database
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, employee: Employee): Promise<void> => {
  try {
    // For now, just log the update
    console.log('Updating employee:', id, employee);
    // In a real implementation, this would update the database
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    // For now, just log the deletion
    console.log('Deleting employee:', id);
    // In a real implementation, this would delete from the database
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

export const generateNextEmployeeId = async (): Promise<string> => {
  try {
    const settings = getEmployeeIdSettings();
    const nextId = `${settings.prefix}${String(settings.nextNumber).padStart(3, '0')}`;
    
    // Update the next number
    setEmployeeIdSettings({
      ...settings,
      nextNumber: settings.nextNumber + 1
    });
    
    return nextId;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    return 'EMP001';
  }
};

// Support functions (mock implementations)
export const getSupportTickets = async () => {
  // Mock implementation
  return [];
};

export const createSupportTicket = async (ticket: any) => {
  // Mock implementation
  console.log('Creating support ticket:', ticket);
};

export const sendSupportMessage = async (message: any) => {
  // Mock implementation
  console.log('Sending support message:', message);
};

export const getConversationMessages = async () => {
  // Mock implementation
  return [];
};

// Add missing exports for compatibility
export const addCustomer = saveCustomer;
export const addProduct = saveProduct;