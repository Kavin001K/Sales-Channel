import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types'; // Assuming Company type is defined in types.ts

// --- Mock Data Initialization ---
const initialPlans: SubscriptionPlan[] = [
  { id: 'plan_basic_30', name: 'Basic Monthly', price: 29.99, durationDays: 30, features: ['5 Users', '1000 Invoices/Month', 'Basic Reporting'], tokenLimit: 1000 },
  { id: 'plan_pro_30', name: 'Pro Monthly', price: 79.99, durationDays: 30, features: ['20 Users', '5000 Invoices/Month', 'Advanced Reporting', 'API Access'], tokenLimit: 5000 },
  { id: 'plan_enterprise_365', name: 'Enterprise Yearly', price: 999.99, durationDays: 365, features: ['Unlimited Users', 'Unlimited Invoices', 'Premium Support', 'Custom Integrations'], tokenLimit: 100000 },
];

const initialCompanies: Company[] = [
  // This can be expanded or fetched from existing company storage
];

const initialSubscriptions: CompanySubscription[] = [];
const initialTickets: SupportTicket[] = [];

// --- Local Storage Abstraction ---
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T) => {
  try {
    const item = JSON.stringify(value);
    localStorage.setItem(key, item);
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// --- API Functions ---

// Subscription Plans
export const getSubscriptionPlans = (): SubscriptionPlan[] => getFromStorage('subscription_plans', initialPlans);
export const saveSubscriptionPlan = (plan: SubscriptionPlan): void => {
  const plans = getSubscriptionPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  if (index > -1) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  saveToStorage('subscription_plans', plans);
};

// Companies (assuming basic company management for this module)
export const getSubscribedCompanies = (): Company[] => getFromStorage('subscribed_companies', initialCompanies);
export const saveSubscribedCompany = (company: Company): void => {
  const companies = getSubscribedCompanies();
  const index = companies.findIndex(c => c.id === company.id);
  if (index > -1) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  saveToStorage('subscribed_companies', companies);
};


// Company Subscriptions
export const getCompanySubscriptions = (): CompanySubscription[] => getFromStorage('company_subscriptions', initialSubscriptions);
export const getSubscriptionByCompany = (companyId: string): CompanySubscription | undefined => {
  return getCompanySubscriptions().find(sub => sub.companyId === companyId);
};
export const assignSubscriptionToCompany = (companyId: string, planId: string): void => {
  const plans = getSubscriptionPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) throw new Error('Subscription plan not found');

  const subscriptions = getCompanySubscriptions();
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + plan.durationDays);

  const newSubscription: CompanySubscription = {
    companyId,
    planId,
    startDate: now,
    endDate,
    status: 'active',
    tokensUsed: 0,
  };

  const existingSubIndex = subscriptions.findIndex(s => s.companyId === companyId);
  if (existingSubIndex > -1) {
    subscriptions[existingSubIndex] = newSubscription;
  } else {
    subscriptions.push(newSubscription);
  }
  saveToStorage('company_subscriptions', subscriptions);
};

// Support Tickets
export const getSupportTickets = (): SupportTicket[] => getFromStorage('support_tickets', initialTickets);
export const getTicketsByCompany = (companyId: string): SupportTicket[] => {
  return getSupportTickets().filter(t => t.companyId === companyId);
};
export const createSupportTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): SupportTicket => {
  const tickets = getSupportTickets();
  const newTicket: SupportTicket = {
    ...ticketData,
    id: `TICKET_${Date.now()}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  tickets.push(newTicket);
  saveToStorage('support_tickets', tickets);
  return newTicket;
};
export const updateSupportTicketStatus = (ticketId: string, status: 'open' | 'in_progress' | 'closed'): void => {
  const tickets = getSupportTickets();
  const ticket = tickets.find(t => t.id === ticketId);
  if (ticket) {
    ticket.status = status;
    ticket.updatedAt = new Date();
    saveToStorage('support_tickets', tickets);
  }
};
