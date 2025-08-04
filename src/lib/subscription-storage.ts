// src/lib/subscription-storage.ts

// This file is the central API for managing subscription-related data.
// It uses the async database functions from database.ts and provides
// a clean, high-level interface for the UI components.

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';
import * as db from './database';

// --- Subscription Plans ---
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return await db.getPlansFromDb();
};
export const saveSubscriptionPlan = async (plan: SubscriptionPlan): Promise<void> => {
  await db.savePlanToDb(plan);
};

// --- Companies ---
export const getSubscribedCompanies = async (): Promise<Company[]> => {
  return await db.getCompaniesFromDb();
};
export const saveSubscribedCompany = async (company: Company): Promise<void> => {
  await db.saveCompanyToDb(company);
};

// --- Company Subscriptions ---
export const getCompanySubscriptions = async (): Promise<CompanySubscription[]> => {
  return await db.getSubscriptionsFromDb();
};
export const getSubscriptionByCompany = async (companyId: string): Promise<CompanySubscription | undefined> => {
  const subscriptions = await db.getSubscriptionsFromDb();
  return subscriptions.find(sub => sub.companyId === companyId);
};
export const assignSubscriptionToCompany = async (companyId: string, planId: string): Promise<void> => {
  const plans = await db.getPlansFromDb();
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

  await db.assignSubscriptionInDb(newSubscription);
};

// --- Support Tickets ---
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  return await db.getTicketsFromDb();
};
export const getTicketsByCompany = async (companyId: string): Promise<SupportTicket[]> => {
  const tickets = await db.getTicketsFromDb();
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
  await db.createTicketInDb(newTicket);
  return newTicket;
};
export const updateSupportTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed'): Promise<void> => {
  await db.updateTicketInDb(ticketId, { status, updatedAt: new Date() });
};
