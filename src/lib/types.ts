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