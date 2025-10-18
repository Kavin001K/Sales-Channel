import { pgTable, text, serial, integer, boolean, timestamp, decimal, json, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company table for businesses using the POS system
export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  taxId: text("tax_id"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("companies_email_idx").on(table.email),
}));

// Employee table for company staff
export const employees = pgTable("employees", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  employeeId: text("employee_id").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  position: text("position"),
  salary: decimal("salary"),
  hireDate: timestamp("hire_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  companyIdx: index("employees_company_idx").on(table.companyId),
  employeeIdIdx: index("employees_employee_id_idx").on(table.companyId, table.employeeId),
}));

// Product table for inventory management
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price").notNull(),
  cost: decimal("cost").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category"),
  barcode: text("barcode"),
  sku: text("sku"),
  image: text("image"),
  unit: text("unit"),
  mrp: decimal("mrp"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  companyIdx: index("products_company_idx").on(table.companyId),
  categoryIdx: index("products_category_idx").on(table.category),
  barcodeIdx: index("products_barcode_idx").on(table.barcode),
  skuIdx: index("products_sku_idx").on(table.sku),
}));

// Customer table for CRM
export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  notes: text("notes"),
  totalSpent: decimal("total_spent").notNull().default('0'),
  visitCount: integer("visit_count").notNull().default(0),
  lastVisit: timestamp("last_visit"),
  gst: text("gst"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  companyIdx: index("customers_company_idx").on(table.companyId),
  phoneIdx: index("customers_phone_idx").on(table.phone),
  emailIdx: index("customers_email_idx").on(table.email),
}));

// Transaction table for sales records
export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  customerId: text("customer_id")
    .references(() => customers.id, { onDelete: 'set null' }),
  employeeId: text("employee_id")
    .references(() => employees.id, { onDelete: 'set null' }),
  items: json("items").notNull(), // Array of transaction items
  subtotal: decimal("subtotal").notNull(),
  tax: decimal("tax").notNull().default('0'),
  discount: decimal("discount").notNull().default('0'),
  total: decimal("total").notNull(),
  paymentMethod: text("payment_method"),
  paymentDetails: json("payment_details"), // Payment specific data
  status: text("status").notNull().default('completed'), // 'pending', 'completed', 'cancelled', 'refunded'
  notes: text("notes"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  customerName: text("customer_name"),
  employeeName: text("employee_name"),
  receipt: text("receipt"),
}, (table) => ({
  companyIdx: index("transactions_company_idx").on(table.companyId),
  customerIdx: index("transactions_customer_idx").on(table.customerId),
  employeeIdx: index("transactions_employee_idx").on(table.employeeId),
  timestampIdx: index("transactions_timestamp_idx").on(table.timestamp),
  statusIdx: index("transactions_status_idx").on(table.status),
}));

// Legacy user table for backwards compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schema definitions for validation
export const insertCompanySchema = createInsertSchema(companies);
export const insertEmployeeSchema = createInsertSchema(employees);
export const insertProductSchema = createInsertSchema(products);
export const insertCustomerSchema = createInsertSchema(customers);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Type exports
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
