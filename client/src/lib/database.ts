// src/lib/database.ts
// Mock database services for subscription management
// This file provides the services that subscription-storage.ts expects

import { SubscriptionPlan, CompanySubscription, SupportTicket } from './subscription-types';
import { Company } from './types';

// Mock subscription plan service
export const subscriptionPlanService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    // Return mock subscription plans
    return [
      {
        id: 'basic',
        name: 'Basic Plan',
        price: 29.99,
        durationDays: 30,
        features: ['Basic POS', 'Customer Management', 'Basic Reports'],
        tokenLimit: 1000,
        isActive: true
      },
      {
        id: 'professional',
        name: 'Professional Plan',
        price: 79.99,
        durationDays: 30,
        features: ['Advanced POS', 'Inventory Management', 'Advanced Reports', 'Multi-location'],
        tokenLimit: 5000,
        isActive: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise Plan',
        price: 199.99,
        durationDays: 30,
        features: ['Full POS Suite', 'Advanced Analytics', 'API Access', 'Priority Support'],
        tokenLimit: 10000,
        isActive: true
      }
    ];
  },

  async add(plan: SubscriptionPlan): Promise<void> {
    console.log('Mock: Adding subscription plan:', plan);
    // Mock implementation - would save to database in real app
  },

  async update(id: string, updates: Partial<SubscriptionPlan>): Promise<void> {
    console.log('Mock: Updating subscription plan:', id, updates);
    // Mock implementation - would update database in real app
  },

  async delete(id: string): Promise<void> {
    console.log('Mock: Deleting subscription plan:', id);
    // Mock implementation - would delete from database in real app
  }
};

// Mock company service
export const companyService = {
  async getAll(): Promise<Company[]> {
    // Return mock companies
    return [
      {
        id: 'company1',
        name: 'Demo Company 1',
        email: 'demo1@example.com',
        phone: '+1234567890',
        address: '123 Demo St',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '12345',
        country: 'Demo Country',
        status: 'active',
        subscriptionPlanId: 'basic',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'company2',
        name: 'Demo Company 2',
        email: 'demo2@example.com',
        phone: '+0987654321',
        address: '456 Demo Ave',
        city: 'Demo City',
        state: 'Demo State',
        zipCode: '54321',
        country: 'Demo Country',
        status: 'active',
        subscriptionPlanId: 'professional',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async add(company: Company): Promise<void> {
    console.log('Mock: Adding company:', company);
    // Mock implementation - would save to database in real app
  },

  async update(id: string, updates: Partial<Company>): Promise<void> {
    console.log('Mock: Updating company:', id, updates);
    // Mock implementation - would update database in real app
  },

  async delete(id: string): Promise<void> {
    console.log('Mock: Deleting company:', id);
    // Mock implementation - would delete from database in real app
  }
};

// Mock support ticket service
export const supportTicketService = {
  async getTickets(): Promise<SupportTicket[]> {
    // Return mock support tickets
    return [
      {
        id: 'ticket1',
        companyId: 'company1',
        title: 'Login Issue',
        description: 'Unable to login to the system',
        priority: 'medium',
        status: 'open',
        category: 'technical',
        assignedTo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ticket2',
        companyId: 'company2',
        title: 'Feature Request',
        description: 'Need additional reporting features',
        priority: 'low',
        status: 'in_progress',
        category: 'feature',
        assignedTo: 'support1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  async createTicket(ticket: SupportTicket): Promise<void> {
    console.log('Mock: Creating support ticket:', ticket);
    // Mock implementation - would save to database in real app
  },

  async updateTicket(id: string, updates: Partial<SupportTicket>): Promise<void> {
    console.log('Mock: Updating support ticket:', id, updates);
    // Mock implementation - would update database in real app
  },

  async deleteTicket(id: string): Promise<void> {
    console.log('Mock: Deleting support ticket:', id);
    // Mock implementation - would delete from database in real app
  }
};
