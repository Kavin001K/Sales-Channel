export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  sku?: string;
  barcode?: string;
  category: string;
  stock: number;
  minStock: number;
  description?: string;
  image?: string;
  supplier?: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Extended fields for comprehensive product management
  type?: string;
  group?: string;
  brand?: string;
  itemCode?: string;
  printName?: string;
  unit?: string;
  openingStockValue?: number;
  minSalePrice?: number;
  mrp?: number;
  hsn?: string;
  saleDiscount?: number;
  printDescription?: string;
  oneClickSale?: string;
  enableTracking?: string;
  printSerial?: string;
  notForSale?: string;
  productType?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  note?: string;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'check' | 'split' | 'wallet';
  paymentDetails?: {
    cashAmount?: number;
    cardAmount?: number;
    checkAmount?: number;
    change?: number;
  };
  timestamp: Date;
  customerId?: string;
  customerName?: string;
  employeeId?: string;
  employeeName?: string;
  receipt?: string;
  notes?: string;
  status: 'completed' | 'refunded' | 'voided';
  refundReason?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  gst?: string;
  loyaltyPoints: number;
  totalSpent: number;
  visits: number;
  lastVisit?: Date;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'cashier';
  permissions: {
    canProcessSales: boolean;
    canManageProducts: boolean;
    canManageCustomers: boolean;
    canViewReports: boolean;
    canManageEmployees: boolean;
    canProcessRefunds: boolean;
    canApplyDiscounts: boolean;
    canVoidTransactions: boolean;
  };
  hourlyRate?: number;
  isActive: boolean;
  pin: string; // 4-digit PIN for login
  createdAt: Date;
  updatedAt: Date;
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