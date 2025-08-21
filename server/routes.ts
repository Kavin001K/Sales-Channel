import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/company/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // For demo purposes, use hardcoded credentials
      // In production, this should validate against actual company data
      if (email === 'demo@store.com' && password === 'password') {
        const company = await storage.getCompanyByEmail(email);
        if (company) {
          return res.json({ success: true, company });
        }
      }
      
      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
      console.error('Company login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/employee/login', async (req, res) => {
    try {
      const { employeeId, password } = req.body;
      
      if (!employeeId || !password) {
        return res.status(400).json({ error: 'Employee ID and password are required' });
      }

      // For demo purposes, use hardcoded credentials
      // In production, this should validate against actual employee data
      if (employeeId === 'EMP001' && password === 'password') {
        const employee = await storage.getEmployeeByEmployeeId('demo-company-1', employeeId);
        if (employee) {
          return res.json({ success: true, employee });
        }
      }
      
      return res.status(401).json({ error: 'Invalid employee ID or password' });
    } catch (error) {
      console.error('Employee login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      // For demo purposes, use hardcoded admin credentials
      if (username === 'admin' && password === 'password') {
        const adminUser = {
          id: 'admin-1',
          username: 'admin',
          role: 'admin',
          name: 'System Administrator'
        };
        return res.json({ success: true, adminUser });
      }
      
      return res.status(401).json({ error: 'Invalid username or password' });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Product routes
  app.get('/api/companies/:companyId/products', async (req, res) => {
    try {
      const { companyId } = req.params;
      const products = await storage.getProductsByCompany(companyId);
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/products', async (req, res) => {
    try {
      const { companyId } = req.params;
      const productData = { ...req.body, companyId };
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Customer routes
  app.get('/api/companies/:companyId/customers', async (req, res) => {
    try {
      const { companyId } = req.params;
      const customers = await storage.getCustomersByCompany(companyId);
      res.json(customers);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/customers', async (req, res) => {
    try {
      const { companyId } = req.params;
      const customerData = { ...req.body, companyId };
      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Employee routes
  app.get('/api/companies/:companyId/employees', async (req, res) => {
    try {
      const { companyId } = req.params;
      const employees = await storage.getEmployeesByCompany(companyId);
      res.json(employees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Transaction routes
  app.get('/api/companies/:companyId/transactions', async (req, res) => {
    try {
      const { companyId } = req.params;
      const transactions = await storage.getTransactionsByCompany(companyId);
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/transactions', async (req, res) => {
    try {
      const { companyId } = req.params;
      const transactionData = { ...req.body, companyId };
      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
