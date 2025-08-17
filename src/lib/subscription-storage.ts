// src/lib/subscription-storage.ts

// This file is the central API for managing subscription-related data.
// It uses the async database functions from database.ts and provides
// a clean, high-level interface for the UI components.

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';
import { subscriptionPlanService, companyService, supportTicketService } from './database';

// --- Subscription Plans ---
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  return await subscriptionPlanService.getPlans();
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
  // Fallback to local list from companyService for demo
  const companies = await companyService.getAll();
  const plans = await subscriptionPlanService.getPlans();
  // Map companies to a synthetic active subscription if planId exists in company meta (optional)
  return companies
    .filter((c: any) => c.subscriptionPlanId)
    .map((c: any) => ({
      companyId: c.id,
      planId: c.subscriptionPlanId,
      startDate: c.subscriptionStart || new Date(),
      endDate: c.subscriptionEnd || new Date(Date.now() + 30*24*3600*1000),
      status: 'active',
      tokensUsed: 0
    }));
};
export const getSubscriptionByCompany = async (companyId: string): Promise<CompanySubscription | undefined> => {
  // Try subscription service if available in future; otherwise infer from company record
  const companies = await companyService.getAll();
  const c: any = companies.find((x: any) => x.id === companyId);
  if (!c || !c.subscriptionPlanId) return undefined;
  return {
    companyId: c.id,
    planId: c.subscriptionPlanId,
    startDate: c.subscriptionStart || new Date(),
    endDate: c.subscriptionEnd || new Date(Date.now() + 30*24*3600*1000),
    status: 'active',
    tokensUsed: 0
  };
};
export const assignSubscriptionToCompany = async (companyId: string, planId: string): Promise<void> => {
  const plans = await subscriptionPlanService.getPlans();
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
  // Persist minimal subscription metadata onto company until full service exists
  await companyService.update(companyId, {
    subscriptionPlanId: planId,
    subscriptionStart: now,
    subscriptionEnd: endDate,
  } as any);
};

// --- Support Tickets ---
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  return await supportTicketService.getTickets();
};
export const getTicketsByCompany = async (companyId: string): Promise<SupportTicket[]> => {
  const tickets = await supportTicketService.getTickets();
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
  await supportTicketService.createTicket(newTicket);
  return newTicket;
};
export const updateSupportTicketStatus = async (ticketId: string, status: 'open' | 'in_progress' | 'closed'): Promise<void> => {
  await supportTicketService.updateTicket(ticketId, { status, updatedAt: new Date() });
};
