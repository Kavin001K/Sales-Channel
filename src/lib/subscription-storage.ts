// src/lib/subscription-storage.ts

// This file is the central API for managing subscription-related data.
// It uses the async database functions from database.ts and provides
// a clean, high-level interface for the UI components.

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';
import { subscriptionPlanService, companyService, supportTicketService } from './database';

// --- Subscription Plans ---
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return await subscriptionPlanService.getAll();
};
export const saveSubscriptionPlan = async (plan: SubscriptionPlan): Promise<void> => {
  await subscriptionPlanService.add(plan);
};

// --- Companies ---
export const getSubscribedCompanies = async (): Promise<Company[]> => {
  return await companyService.getAll();
};
export const saveSubscribedCompany = async (company: Company): Promise<void> => {
  await companyService.add(company);
};

// --- Company Subscriptions ---
export const getCompanySubscriptions = async (): Promise<CompanySubscription[]> => {
  // This would need to be implemented in the database service
  return [];
};
export const getSubscriptionByCompany = async (companyId: string): Promise<CompanySubscription | undefined> => {
  // This would need to be implemented in the database service
  return undefined;
};
export const assignSubscriptionToCompany = async (companyId: string, planId: string): Promise<void> => {
  const plans = await subscriptionPlanService.getAll();
  const plan = plans.find(p => p.id === planId);
  if (!plan) throw new Error('Subscription plan not found');

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

  // This would need to be implemented in the database service
  console.log('Assigning subscription:', newSubscription);
};

// --- Support Tickets ---
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  return await supportTicketService.getAll();
};
export const getTicketsByCompany = async (companyId: string): Promise<SupportTicket[]> => {
  const tickets = await supportTicketService.getAll();
  return tickets.filter(t => t.companyId === companyId);
};
export const createSupportTicket = async (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<SupportTicket> => {
  const newTicket: SupportTicket = {
    ...ticketData,
    id: `TICKET_${Date.now()}`,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await supportTicketService.add(newTicket);
  return newTicket;
};
export const updateSupportTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed'): Promise<void> => {
  await supportTicketService.update(ticketId, { status, updatedAt: new Date() });
};
