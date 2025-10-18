import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import {
  ProductSchema,
  CustomerSchema,
  TransactionSchema,
  EmployeeSchema,
  LoginCredentialsSchema,
  EmployeeLoginCredentialsSchema,
} from "../shared/validation";
import { authMiddleware, verifyCompanyAccess, requireAdmin } from "./middleware/auth";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '24h';

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================================================
  // AUTHENTICATION ROUTES (Public)
  // ============================================================================

  app.post('/api/auth/company/login', async (req, res) => {
    try {
      // Validate input with Zod
      const credentials = LoginCredentialsSchema.parse(req.body);

      // Get company by email
      const company = await storage.getCompanyByEmail(credentials.email);

      if (!company) {
        // Use same error message to prevent email enumeration
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password with bcrypt
      const validPassword = await bcrypt.compare(
        credentials.password,
        company.passwordHash
      );

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          companyId: company.id,
          userId: company.id,
          role: 'company'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        company: {
          id: company.id,
          name: company.name,
          email: company.email,
          phone: company.phone,
          address: company.address,
          city: company.city,
          state: company.state,
          zipCode: company.zipCode,
          country: company.country,
          taxId: company.taxId,
          logoUrl: company.logoUrl
        }
      });
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

      // Get employee by employee ID
      // Note: We need companyId to query employee. For now, using demo company.
      const employee = await storage.getEmployeeByEmployeeId('demo-company-1', credentials.employeeId);

      if (!employee) {
        // Use same error message to prevent employee ID enumeration
        return res.status(401).json({ error: 'Invalid employee ID or password' });
      }

      // Verify password with bcrypt
      const validPassword = await bcrypt.compare(
        credentials.password,
        employee.passwordHash
      );

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid employee ID or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          companyId: employee.companyId,
          userId: employee.id,
          role: 'employee',
          employeeId: employee.employeeId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        employee: {
          id: employee.id,
          companyId: employee.companyId,
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          position: employee.position
        }
      });
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

      // TODO: Replace with database lookup and bcrypt verification
      if (username !== 'admin' || password !== 'password') {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          companyId: 'admin',
          userId: 'admin-1',
          role: 'admin'
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        adminUser: {
          id: 'admin-1',
          username: 'admin',
          role: 'admin',
          name: 'System Administrator'
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================================================
  // PRODUCT ROUTES (Protected)
  // ============================================================================

  app.get('/api/companies/:companyId/products', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;
      const products = await storage.getProductsByCompany(companyId);
      res.json(products);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/products', authMiddleware, verifyCompanyAccess, async (req, res) => {
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

  app.put('/api/companies/:companyId/products/:productId', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId, productId } = req.params;

      // Verify product belongs to company
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (existingProduct.companyId !== companyId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const product = await storage.updateProduct(productId, req.body);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================================================
  // CUSTOMER ROUTES (Protected)
  // ============================================================================

  app.get('/api/companies/:companyId/customers', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;
      const customers = await storage.getCustomersByCompany(companyId);
      res.json(customers);
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/customers', authMiddleware, verifyCompanyAccess, async (req, res) => {
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

  app.put('/api/companies/:companyId/customers/:customerId', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId, customerId } = req.params;

      // Verify customer belongs to company
      const existingCustomer = await storage.getCustomer(customerId);
      if (!existingCustomer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      if (existingCustomer.companyId !== companyId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const customer = await storage.updateCustomer(customerId, req.body);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json(customer);
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================================================
  // EMPLOYEE ROUTES (Protected)
  // ============================================================================

  app.get('/api/companies/:companyId/employees', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;
      const employees = await storage.getEmployeesByCompany(companyId);
      res.json(employees);
    } catch (error) {
      console.error('Get employees error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/employees', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;

      // Validate employee data with Zod
      const employeeData = EmployeeSchema.parse({ ...req.body, companyId });

      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      console.error('Create employee error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/companies/:companyId/employees/:employeeId', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId, employeeId } = req.params;

      // Verify employee belongs to company
      const existingEmployee = await storage.getEmployee(employeeId);
      if (!existingEmployee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      if (existingEmployee.companyId !== companyId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const employee = await storage.updateEmployee(employeeId, req.body);
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================================================
  // TRANSACTION ROUTES (Protected)
  // ============================================================================

  app.get('/api/companies/:companyId/transactions', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;
      const transactions = await storage.getTransactionsByCompany(companyId);
      res.json(transactions);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/companies/:companyId/transactions', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId } = req.params;

      // Validate transaction data with Zod
      const transactionData = TransactionSchema.parse({ ...req.body, companyId });

      // TODO: Wrap in database transaction to update inventory atomically
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

  app.get('/api/companies/:companyId/transactions/:transactionId', authMiddleware, verifyCompanyAccess, async (req, res) => {
    try {
      const { companyId, transactionId } = req.params;

      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Verify transaction belongs to company
      if (transaction.companyId !== companyId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // ============================================================================
  // HEALTH CHECK (Public)
  // ============================================================================

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  return httpServer;
}
