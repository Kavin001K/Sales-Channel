export interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  template: number;
  currency: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  email: string;
  phone: string;
  taxId: string;
  gstin: string;
  logo?: string;
}

export const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
};

export const generateInvoiceNumber = (prefix: string = 'INV') => {
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${timestamp}`;
};

export const formatCurrency = (amount: number, currency: string = 'INR') => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'INR': return '₹';
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return '₹';
  }
};

export const getCompanyInfo = (): CompanyInfo => {
  const savedCompany = localStorage.getItem('company_settings');
  if (savedCompany) {
    const companySettings = JSON.parse(savedCompany);
    return {
      name: companySettings.name || 'Your Company',
      address: companySettings.address || '',
      city: companySettings.city || '',
      state: companySettings.state || '',
      pinCode: companySettings.pinCode || '',
      country: companySettings.country || 'India',
      email: companySettings.email || '',
      phone: companySettings.phone || '',
      taxId: companySettings.taxId || '',
      gstin: companySettings.gstin || '',
      logo: companySettings.logo
    };
  }
  return {
    name: 'Your Company',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
    email: '',
    phone: '',
    taxId: '',
    gstin: ''
  };
};

export const getInvoiceSettings = () => {
  const savedSettings = localStorage.getItem('invoice_settings');
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    defaultTemplate: 1,
    defaultCurrency: "INR",
    defaultTaxRate: 18,
    defaultNotes: "Thank you for your business!",
    showLogo: true,
    showTaxBreakdown: true,
    showCustomerInfo: true,
    autoGenerateInvoiceNumber: true,
    invoiceNumberPrefix: "INV",
    includeTerms: false,
    termsText: "Payment is due within 30 days. Late payments may incur additional charges.",
    includePaymentInstructions: false,
    paymentInstructions: "Please make payment to the account details provided above."
  };
};

export const saveInvoice = (invoice: Invoice) => {
  const savedInvoices = localStorage.getItem('invoices');
  const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
  const updatedInvoices = [invoice, ...invoices];
  localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  return updatedInvoices;
};

export const getInvoices = (): Invoice[] => {
  const savedInvoices = localStorage.getItem('invoices');
  return savedInvoices ? JSON.parse(savedInvoices) : [];
};

export const updateInvoice = (updatedInvoice: Invoice) => {
  const invoices = getInvoices();
  const updatedInvoices = invoices.map(invoice => 
    invoice.id === updatedInvoice.id ? updatedInvoice : invoice
  );
  localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  return updatedInvoices;
};

export const deleteInvoice = (id: string) => {
  const invoices = getInvoices();
  const updatedInvoices = invoices.filter(invoice => invoice.id !== id);
  localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  return updatedInvoices;
};

export const getInvoiceStats = (invoices: Invoice[]) => {
  return {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    draft: invoices.filter(i => i.status === 'draft').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
    pendingAmount: invoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0)
  };
};
