import { z } from 'zod';

// Product Validation Schema
export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().positive('Cost must be positive'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  category: z.string().optional(),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  image: z.string().optional(),
  minStock: z.number().int().nonnegative().default(10),
  unit: z.string().default('pcs'),
  supplier: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(18), // Default 18% GST
  isActive: z.boolean().default(true),
});

// Customer Validation Schema
export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('India'),
  gstin: z.string().optional(),
  loyaltyPoints: z.number().int().nonnegative().default(0),
  totalSpent: z.number().nonnegative().default(0),
  visitCount: z.number().int().nonnegative().default(0),
  lastVisit: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Transaction Item Schema
export const TransactionItemSchema = z.object({
  productId: z.string().uuid(),
  name: z.string(),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
  cost: z.number().positive().optional(),
  discount: z.number().nonnegative().default(0),
});

// Transaction Validation Schema
export const TransactionSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  customerId: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
  items: z.array(TransactionItemSchema).min(1, 'At least one item required'),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  total: z.number().positive('Total must be positive'),
  paymentMethod: z.enum(['cash', 'card', 'upi', 'wallet', 'credit']),
  paymentDetails: z.any().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
  notes: z.string().optional(),
  timestamp: z.date().optional(),
});

// Employee Validation Schema
export const EmployeeSchema = z.object({
  id: z.string().uuid().optional(),
  companyId: z.string().uuid(),
  employeeId: z.string().min(1, 'Employee ID required'),
  password: z.string().min(4, 'Password must be at least 4 characters').optional(),
  pin: z.string().regex(/^\d{4,6}$/, 'PIN must be 4-6 digits').optional(),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  position: z.enum(['admin', 'manager', 'cashier', 'sales', 'inventory']),
  salary: z.number().positive('Salary must be positive').optional(),
  hireDate: z.date().optional(),
  isActive: z.boolean().default(true),
});

// Company Registration Schema
export const CompanyRegistrationSchema = z.object({
  name: z.string().min(1, 'Company name required').max(255),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('India'),
  taxId: z.string().optional(),
  gstin: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format').optional(),
  logoUrl: z.string().url().optional(),
});

// Login Credentials Schema
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

// Employee Login Credentials Schema
export const EmployeeLoginCredentialsSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID required'),
  password: z.string().min(1, 'Password/PIN required'),
});

// Settings Schema
export const SettingsSchema = z.record(z.string(), z.string());

// Export TypeScript types inferred from schemas
export type ProductInput = z.infer<typeof ProductSchema>;
export type CustomerInput = z.infer<typeof CustomerSchema>;
export type TransactionInput = z.infer<typeof TransactionSchema>;
export type TransactionItemInput = z.infer<typeof TransactionItemSchema>;
export type EmployeeInput = z.infer<typeof EmployeeSchema>;
export type CompanyRegistrationInput = z.infer<typeof CompanyRegistrationSchema>;
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;
export type EmployeeLoginCredentialsInput = z.infer<typeof EmployeeLoginCredentialsSchema>;
export type SettingsInput = z.infer<typeof SettingsSchema>;

// Partial schemas for updates (all fields optional except ID)
export const ProductUpdateSchema = ProductSchema.partial().required({ id: true });
export const CustomerUpdateSchema = CustomerSchema.partial().required({ id: true });
export const EmployeeUpdateSchema = EmployeeSchema.partial().required({ id: true });
export const TransactionUpdateSchema = TransactionSchema.partial().required({ id: true });

export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
export type CustomerUpdate = z.infer<typeof CustomerUpdateSchema>;
export type EmployeeUpdate = z.infer<typeof EmployeeUpdateSchema>;
export type TransactionUpdate = z.infer<typeof TransactionUpdateSchema>;
