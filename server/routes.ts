import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  ProductSchema,
  CustomerSchema,
  TransactionSchema,
  EmployeeSchema,
  LoginCredentialsSchema,
  EmployeeLoginCredentialsSchema,
} from "../shared/validation";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/company/login', async (req, res) => {
    try {
      // Validate input with Zod
      const credentials = LoginCredentialsSchema.parse(req.body);

      // For demo purposes, use hardcoded credentials
      // In production, this should validate against actual company data
      if (credentials.email === 'demo@store.com' && credentials.password === 'password') {
        const company = await storage.getCompanyByEmail(credentials.email);
        if (company) {
          return res.json({ success: true, company });
        }
      }

      return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      console.error('Company login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/employee/login', async (req, res) => {
    try {
      // Validate input with Zod
      const credentials = EmployeeLoginCredentialsSchema.parse(req.body);

      // For demo purposes, use hardcoded credentials
      // In production, this should validate against actual employee data
      if (credentials.employeeId === 'EMP001' && credentials.password === 'password') {
        const employee = await storage.getEmployeeByEmployeeId('demo-company-1', credentials.employeeId);
        if (employee) {
          return res.json({ success: true, employee });
        }
      }

      return res.status(401).json({ error: 'Invalid employee ID or password' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
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

      // Validate product data with Zod
      const productData = ProductSchema.parse({ ...req.body, companyId });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
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

      // Validate customer data with Zod
      const customerData = CustomerSchema.parse({ ...req.body, companyId });

      const customer = await storage.createCustomer(customerData);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
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

      // Validate transaction data with Zod
      const transactionData = TransactionSchema.parse({ ...req.body, companyId });

      const transaction = await storage.createTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
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
