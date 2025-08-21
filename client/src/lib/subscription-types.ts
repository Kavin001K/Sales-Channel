export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number; // e.g., 30 for monthly, 365 for yearly
  features: string[];
  tokenLimit: number; // Number of tokens/actions allowed
}

export interface CompanySubscription {
  companyId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  tokensUsed: number;
}

export interface SupportTicket {
  id: string;
  companyId: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}
