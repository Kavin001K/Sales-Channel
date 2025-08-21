// src/lib/subscription-storage.ts

// This file is the central API for managing subscription-related data.
// It uses the async database functions from database.ts and provides
// a clean, high-level interface for the UI components.

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';
import { subscriptionPlanService, companyService, supportTicketService } from './database';

// --- Subscription Plans ---
export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    const plans = await subscriptionPlanService.getPlans();
    return Array.isArray(plans) ? plans : [];
  } catch (error) {
    console.error('Error getting subscription plans:', error);
    return [];
  }
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
  try {
    // Fallback to local list from companyService for demo
    const companies = await companyService.getAll();
    const plans = await subscriptionPlanService.getPlans();
    
    // Ensure we have arrays
    const companiesArray = Array.isArray(companies) ? companies : [];
    const plansArray = Array.isArray(plans) ? plans : [];
    
    // Map companies to a synthetic active subscription if planId exists in company meta (optional)
    return companiesArray
      .filter((c: any) => c.subscriptionPlanId)
      .map((c: any) => ({
        companyId: c.id,
        planId: c.subscriptionPlanId,
        startDate: c.subscriptionStart || new Date(),
        endDate: c.subscriptionEnd || new Date(Date.now() + 30*24*3600*1000),
        status: 'active',
        tokensUsed: 0
      }));
  } catch (error) {
    console.error('Error getting company subscriptions:', error);
    return [];
  }
};
export const getSubscriptionByCompany = async (companyId: string): Promise<CompanySubscription | undefined> => {
  try {
    // Try subscription service if available in future; otherwise infer from company record
    const companies = await companyService.getAll();
    const companiesArray = Array.isArray(companies) ? companies : [];
    const c: any = companiesArray.find((x: any) => x.id === companyId);
    if (!c || !c.subscriptionPlanId) return undefined;
    return {
      companyId: c.id,
      planId: c.subscriptionPlanId,
      startDate: c.subscriptionStart || new Date(),
      endDate: c.subscriptionEnd || new Date(Date.now() + 30*24*3600*1000),
      status: 'active',
      tokensUsed: 0
    };
  } catch (error) {
    console.error('Error getting subscription by company:', error);
    return undefined;
  }
};
export const assignSubscriptionToCompany = async (companyId: string, planId: string): Promise<void> => {
  try {
    const plans = await subscriptionPlanService.getPlans();
    const plansArray = Array.isArray(plans) ? plans : [];
    const plan = plansArray.find(p => p.id === planId);
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
  } catch (error) {
    console.error('Error assigning subscription to company:', error);
    throw error;
  }
};

// --- Support Tickets ---
export const getSupportTickets = async (): Promise<SupportTicket[]> => {
  try {
    const tickets = await supportTicketService.getTickets();
    return Array.isArray(tickets) ? tickets : [];
  } catch (error) {
    console.error('Error getting support tickets:', error);
    return [];
  }
};
export const getTicketsByCompany = async (companyId: string): Promise<SupportTicket[]> => {
  try {
    const tickets = await supportTicketService.getTickets();
    if (!Array.isArray(tickets)) {
      console.warn('getTicketsByCompany: tickets is not an array:', tickets);
      return [];
    }
    return tickets.filter(t => t.companyId === companyId);
  } catch (error) {
    console.error('Error getting tickets by company:', error);
    return [];
  }
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
