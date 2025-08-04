export interface Product {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  category?: string;
  barcode?: string;
  sku?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
  totalSpent: number;
  visitCount: number;
  lastVisit?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  companyId: string;
  employeeId: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  salary?: number;
  hireDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  taxId?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  customerId?: string;
  employeeId?: string;
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  timestamp: Date;
  customerName?: string;
  employeeName?: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  company: Company | null;
  employee: Employee | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface EmployeeLoginCredentials {
  employeeId: string;
  password: string;
}

export interface SalesReport {
  date: string;
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  topProducts: {
    product: Product;
    quantity: number;
    revenue: number;
  }[];
  paymentMethods: {
    cash: number;
    card: number;
    check: number;
  };
  hourlyBreakdown: {
    hour: number;
    sales: number;
    transactions: number;
  }[];
}

export interface InventoryAlert {
  product: Product;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock';
}

// Admin System Types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'support' | 'sales';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftwareCompanyEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  department: 'sales' | 'support' | 'technical' | 'marketing' | 'finance' | 'hr';
  position: string;
  managerId?: string;
  salary?: number;
  hireDate: Date;
  isActive: boolean;
  avatar?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminLoginCredentials {
  username: string;
  password: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  loading: boolean;
}

// CRM Types for Software Company
export interface Lead {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  source: 'website' | 'referral' | 'cold_call' | 'social_media' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  assignedTo?: string;
  estimatedValue?: number;
  notes?: string;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Opportunity {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  value: number;
  probability: number; // 0-100
  stage: 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  expectedCloseDate?: Date;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'proposal' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  relatedTo?: {
    type: 'lead' | 'opportunity' | 'company';
    id: string;
  };
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task_completed';
  title: string;
  description?: string;
  performedBy: string;
  relatedTo?: {
    type: 'lead' | 'opportunity' | 'company' | 'employee';
    id: string;
  };
  timestamp: Date;
  duration?: number; // in minutes
  outcome?: string;
}

// Extended Company interface for admin management
export interface CompanyWithSubscription extends Company {
  subscriptionPlan: 'basic' | 'professional' | 'enterprise';
  subscriptionStatus: 'active' | 'suspended' | 'cancelled' | 'expired';
  monthlyFee: number;
  employees: number;
  lastLogin?: Date;
  billingInfo?: {
    nextPaymentDate: Date;
    lastPaymentDate?: Date;
    paymentMethod?: string;
    outstandingAmount?: number;
  };
  usage?: {
    storageUsed: number;
    storageLimit: number;
    transactionsThisMonth: number;
    activeUsers: number;
  };
  owner?: {
    name: string;
    email: string;
    phone?: string;
  };
}