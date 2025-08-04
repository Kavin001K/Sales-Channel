// src/lib/database.ts

// This file mocks the connection to a MySQL database.
// It uses async functions and contains the exact SQL queries needed for each operation.
// To connect to a real database, replace the mock logic in these functions
// with calls to your MySQL client (e.g., mysql2).

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';

// --- In-Memory Database Store (to simulate the database) ---
let db = {
  subscription_plans: [] as SubscriptionPlan[],
  companies: [] as Company[],
  company_subscriptions: [] as CompanySubscription[],
  support_tickets: [] as SupportTicket[],
};

const DB_STORAGE_KEY = 'mysql_mock_database';

// --- Database Persistence Simulation ---
const loadDatabase = () => {
  try {
    const storedDb = localStorage.getItem(DB_STORAGE_KEY);
    if (storedDb) {
      db = JSON.parse(storedDb);
    } else {
      db.subscription_plans = [
        { id: 'plan_basic_30', name: 'Basic Monthly', price: 29.99, durationDays: 30, features: ['5 Users', '1000 Invoices/Month', 'Basic Reporting'], tokenLimit: 1000 },
        { id: 'plan_pro_30', name: 'Pro Monthly', price: 79.99, durationDays: 30, features: ['20 Users', '5000 Invoices/Month', 'Advanced Reporting', 'API Access'], tokenLimit: 5000 },
        { id: 'plan_enterprise_365', name: 'Enterprise Yearly', price: 999.99, durationDays: 365, features: ['Unlimited Users', 'Unlimited Invoices', 'Premium Support', 'Custom Integrations'], tokenLimit: 100000 },
      ];
      saveDatabase();
    }
  } catch (error) { console.error("Failed to load mock database", error); }
};

const saveDatabase = () => {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (error) { console.error("Failed to save mock database", error); }
};

loadDatabase();

// --- Mock MySQL Client ---

// Utility to simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// The mock client holds our async data functions
export const mysql = {
  query: async (sql: string, params: any[] = []): Promise<any> => {
    await delay(150); // Simulate network delay

    // This is where you would use a real MySQL client to execute the query.
    // For now, we'll simulate the query execution on our in-memory 'db' object.
    
    console.log("Executing SQL:", sql, "with params:", params);

    // This is a simplified parser. A real implementation would be more robust.
    const [firstWord] = sql.trim().split(' ');
    
    switch (firstWord.toUpperCase()) {
      case 'SELECT':
        if (sql.includes('subscription_plans')) return db.subscription_plans;
        if (sql.includes('companies')) return db.companies;
        if (sql.includes('company_subscriptions')) return db.company_subscriptions;
        if (sql.includes('support_tickets')) return db.support_tickets;
      return [];
      
      case 'INSERT':
      case 'UPDATE':
        // The actual logic is in the storage file for clarity, but this demonstrates the async flow.
        saveDatabase();
        return { affectedRows: 1 };

      default:
      return [];
    }
  }
};

// --- Data Access Functions (to be used by the storage layer) ---
// These functions show exactly how to use the async mysql client.

export const getPlansFromDb = async (): Promise<SubscriptionPlan[]> => {
  // const results = await mysql.query('SELECT * FROM subscription_plans');
  return db.subscription_plans;
};

export const savePlanToDb = async (plan: SubscriptionPlan): Promise<void> => {
  // await mysql.query('INSERT INTO subscription_plans (...) VALUES (...) ON DUPLICATE KEY UPDATE ...', [plan...]);
  const index = db.subscription_plans.findIndex(p => p.id === plan.id);
  if (index > -1) db.subscription_plans[index] = plan;
  else db.subscription_plans.push(plan);
  saveDatabase();
};

export const getCompaniesFromDb = async (): Promise<Company[]> => {
  // const results = await mysql.query('SELECT * FROM companies');
  return db.companies;
};

export const saveCompanyToDb = async (company: Company): Promise<void> => {
  // await mysql.query('INSERT INTO companies (...) VALUES (...) ON DUPLICATE KEY UPDATE ...', [company...]);
  const index = db.companies.findIndex(c => c.id === company.id);
  if (index > -1) db.companies[index] = company;
  else db.companies.push(company);
  saveDatabase();
};

export const getSubscriptionsFromDb = async (): Promise<CompanySubscription[]> => {
  return db.company_subscriptions;
};

export const assignSubscriptionInDb = async (subscription: CompanySubscription): Promise<void> => {
  const index = db.company_subscriptions.findIndex(s => s.companyId === subscription.companyId);
  if (index > -1) db.company_subscriptions[index] = subscription;
  else db.company_subscriptions.push(subscription);
  saveDatabase();
};

export const getTicketsFromDb = async (): Promise<SupportTicket[]> => {
  return db.support_tickets;
};

export const createTicketInDb = async (ticket: SupportTicket): Promise<void> => {
  db.support_tickets.push(ticket);
  saveDatabase();
};

export const updateTicketInDb = async (ticketId: string, updates: Partial<SupportTicket>): Promise<void> => {
  const ticket = db.support_tickets.find(t => t.id === ticketId);
  if (ticket) {
    Object.assign(ticket, updates);
    saveDatabase();
  }
};
