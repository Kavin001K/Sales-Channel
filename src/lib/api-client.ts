// API Client for making HTTP requests to the backend
// This replaces direct database access in the browser

import { Product, Customer, Transaction, Employee } from './types';

class APIClient {
  private baseURL = '';  // Empty string to use relative URLs

  // Products
  async getProducts(companyId: string): Promise<Product[]> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  }

  async addProduct(product: Product): Promise<Product> {
    const response = await fetch(`${this.baseURL}/api/companies/${product.companyId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!response.ok) throw new Error('Failed to add product');
    return response.json();
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const companyId = (updates as any).companyId || '';
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  }

  async deleteProduct(id: string, companyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/products/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete product');
  }

  // Customers
  async getCustomers(companyId: string): Promise<Customer[]> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/customers`);
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  }

  async addCustomer(customer: Customer): Promise<Customer> {
    const response = await fetch(`${this.baseURL}/api/companies/${customer.companyId}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    if (!response.ok) throw new Error('Failed to add customer');
    return response.json();
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const companyId = (updates as any).companyId || '';
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update customer');
    return response.json();
  }

  async deleteCustomer(id: string, companyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/customers/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete customer');
  }

  // Transactions
  async getTransactions(companyId: string): Promise<Transaction[]> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  }

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    const response = await fetch(`${this.baseURL}/api/companies/${transaction.companyId}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    if (!response.ok) throw new Error('Failed to add transaction');
    return response.json();
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const companyId = (updates as any).companyId || '';
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  }

  async deleteTransaction(id: string, companyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/transactions/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
  }

  // Employees
  async getEmployees(companyId: string): Promise<Employee[]> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/employees`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  }

  async addEmployee(employee: Employee): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${employee.companyId}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    if (!response.ok) throw new Error('Failed to add employee');
  }

  // Stock Management
  async updateProductStock(productId: string, quantity: number, operation: 'add' | 'subtract', companyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, operation })
    });
    if (!response.ok) throw new Error('Failed to update product stock');
  }

  // Customer Statistics
  async updateCustomerStats(customerId: string, amount: number, operation: 'add' | 'subtract', companyId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/companies/${companyId}/customers/${customerId}/stats`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, operation })
    });
    if (!response.ok) throw new Error('Failed to update customer stats');
  }
}

export const apiClient = new APIClient();
