import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Product, Transaction, CartItem } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getProducts, initializeSampleData, saveTransaction, updateProduct, getCustomers, saveCustomer, updateCustomer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard, 
  DollarSign, 
  Keyboard,
  Printer,
  Calculator,
  X,
  Package,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';

export default function QuickPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardTransactionId, setCardTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [customerGST, setCustomerGST] = useState('');
  const [invoiceType, setInvoiceType] = useState<'bill' | 'tax'>('bill');
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  
  // Add state for the quantity dialog
  const [isQtyDialogOpen, setIsQtyDialogOpen] = useState(false);
  const [qtyDialogProduct, setQtyDialogProduct] = useState<Product | null>(null);
  const [qtyDialogQty, setQtyDialogQty] = useState('1');
  const [qtyDialogError, setQtyDialogError] = useState('');
  
  // Add sub-unit logic for the quantity dialog
  const [mainQty, setMainQty] = useState('');
  const [subQty, setSubQty] = useState('');
  
  const cart = useCart();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const exitRequestedRef = useRef(false);
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);
  const { companySettings, printSettings } = useSettings();
  const { logout, company, employee } = useAuth();

  // Add state for search type and invoice type
  const [searchType, setSearchType] = useState<'serial' | 'code' | 'name'>('name');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fullscreen helper that falls back to a user prompt
  const ensureFullscreen = useCallback(async () => {
    if (!document.fullscreenEnabled) return;
    if (document.fullscreenElement) return;
    try {
      await document.documentElement.requestFullscreen();
      setNeedsFullscreenPrompt(false);
    } catch (err) {
      setNeedsFullscreenPrompt(true);
    }
  }, []);

  // Function to determine if a unit is decimal-based
  const DECIMAL_UNITS = ['KGS', 'GMS', 'LTR', 'MLT', 'TON', 'SQM', 'SQF', 'MTR', 'CMS', 'CCM', 'CBM'];
  const isDecimalUnit = (unit: string) => DECIMAL_UNITS.includes((unit || '').toUpperCase());

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeSampleData();
        const loadedProducts = await getProducts();
        const productsArray = Array.isArray(loadedProducts) ? loadedProducts : [];
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setFilteredProducts([]);
      }
    };
    
    loadData();
  }, []);

  // Enhanced search with barcode support
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(products);
      return;
    }
    // Enhanced keyword/fuzzy search
    const words = query.split(/\s+/).filter(Boolean);
    const filtered = products.filter(product => {
      const fields = [
        product.name?.toLowerCase() || '',
        product.category?.toLowerCase() || '',
        product.sku?.toLowerCase() || '',
        product.barcode?.toLowerCase() || ''
      ];
      // All words must be found in any field
      return words.every(word => fields.some(field => field.includes(word)));
    });
    setFilteredProducts(filtered);
    // Auto-select if exact barcode match
    if (query.length >= 8) {
      const exactMatch = products.find(p => p.barcode === query);
      if (exactMatch && exactMatch.stock > 0) {
        handleQuickAdd(exactMatch);
        setSearchQuery('');
      }
    }
  }, [searchQuery, products, handleQuickAdd]);

  // Auto-fetch customer by phone
  useEffect(() => {
    const fetchCustomer = async () => {
    if (customerPhone.length >= 6) {
        try {
          const customers = await getCustomers();
          const customersArray = Array.isArray(customers) ? customers : [];
          const found = customersArray.find(c => c.phone === customerPhone);
      if (found) {
        setCustomerName(found.name);
        setCustomerGST(found.gst || '');
      }
        } catch (error) {
          console.error('Error loading customers:', error);
    }
      }
    };
    
    fetchCustomer();
  }, [customerPhone]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with F2
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      
      // Show shortcuts with F1
      if (e.key === 'F1') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      // ESC to close dialogs
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update dialog open logic
  useEffect(() => {
    if (isQtyDialogOpen && qtyDialogProduct) {
      setMainQty('');
      setSubQty('');
      setQtyDialogQty('1');
      setQtyDialogError('');
    }
  }, [isQtyDialogOpen, qtyDialogProduct]);

  const handleQuickAdd = useCallback((product: Product) => {
    if (product.stock > 0) {
      cart.addItem(product);
      // Brief success indication
      toast.success(`${product.name} added`, { duration: 1000 });
    } else {
      toast.error('Out of stock');
    }
  }, [cart]);

  // Refactor product selection to open the dialog
  const handleProductSelect = (product: Product) => {
    setQtyDialogProduct(product);
    setQtyDialogQty('1');
    setQtyDialogError('');
    setIsQtyDialogOpen(true);
  };

  // Update handleQtyDialogConfirm
  const handleQtyDialogConfirm = () => {
    if (!qtyDialogProduct) return;
    const unit = qtyDialogProduct.unit || 'PCS';
    const qty = isDecimalUnit(unit) ? parseFloat(qtyDialogQty) : parseInt(qtyDialogQty);
    if (!qty || qty <= 0 || (isDecimalUnit(unit) ? isNaN(qty) : !Number.isInteger(qty))) {
      setQtyDialogError('invalid');
      return;
    }
    cart.addItem({ ...qtyDialogProduct, unit }, qty);
    setIsQtyDialogOpen(false);
  };

  const handlePrint = (transaction: Transaction) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: auto !important; }
            body {
              font-family: 'Courier New', monospace;
              width: ${printSettings.paperSize === 'thermal' ? '300px' : '210mm'};
              margin: 0 auto;
              padding: 10px 0 0 0;
              font-size: ${printSettings.fontSize}px;
              line-height: 1.3;
              background: #fff;
              color: #000;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; color: #000; }
            .store-name { font-size: ${printSettings.fontSize + 4}px; font-weight: bold; color: #000; letter-spacing: 1px; }
            .company-detail { font-weight: bold; color: #000; white-space: pre-line; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
            th { font-weight: bold; background: #fff; }
            .amount, .total-bold { font-weight: bold; }
            .total-row td { border-top: 2px solid #000; font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: ${printSettings.fontSize - 2}px; color: #000; font-weight: bold; }
            @media print {
              html, body { height: auto !important; }
              body { margin: 0; padding: 0; background: #fff; color: #000; }
              .no-print { display: none; }
              .footer { margin-bottom: 0; color: #000; font-weight: bold; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">${companySettings.name}</div>
            <div class="company-detail">${(companySettings.address || '').replace(/\n/g, '<br/>')}</div>
            <div class="company-detail">Phone: ${companySettings.phone}</div>
            ${companySettings.email ? `<div class="company-detail">Email: ${companySettings.email}</div>` : ''}
          </div>
          <div style="margin: 10px 0 10px 0; color: #000; font-weight: bold; text-align: left;">
            <div>Receipt #: ${transaction.id.slice(-8)}</div>
            <div>Date: ${new Date(transaction.timestamp).toLocaleDateString()}</div>
            <div>Time: ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            ${transaction.customerName ? `<div>Customer: ${transaction.customerName}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:32px">S.No</th>
                <th>PARTICULARS</th>
                <th style="width:40px">QTY</th>
                <th style="width:70px">RATE<br/>M.R.P.</th>
                <th style="width:70px">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>
                    ₹${item.product.price.toFixed(2)}
                    ${item.product.mrp ? `<br/><span style='font-size:${printSettings.fontSize - 2}px'>UNT ₹${item.product.mrp.toFixed(2)}</span>` : ''}
                  </td>
                  <td class="amount">₹${(item.product.price * item.quantity).toFixed(2)}</td>
                </tr>
            `).join('')}
            </tbody>
          </table>
          <div style="border-top: 2px solid #000; margin: 8px 0;"></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Qty : ${transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span>Sub Total <span style="font-weight: bold;">₹${transaction.subtotal.toFixed(2)}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Round Off</span>
            <span>₹${(Math.round(transaction.total) - transaction.total).toFixed(2)}</span>
          </div>
          <div class="total-row" style="font-size: ${printSettings.fontSize + 2}px; margin-top: 8px;">
            <table style="width:100%; border:none;">
              <tr>
                <td style="border:none; text-align:right; font-weight:bold;">TOTAL</td>
                <td style="border:none; text-align:right; font-weight:bold;">₹ ${Math.round(transaction.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Savings</span>
            <span>₹${(transaction.items.reduce((sum, item) => sum + ((item.product.mrp || 0) - item.product.price) * item.quantity, 0)).toFixed(2)}</span>
          </div>
          <div style="margin: 10px 0; color: #000; font-weight: bold;">
            <div><strong>Payment:</strong> ${transaction.paymentMethod === 'cash' ? 'Cash' : transaction.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Mobile Wallet'}</div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div>Cash: ₹${transaction.paymentDetails.cashAmount.toFixed(2)}</div>
              ${transaction.paymentDetails.change ? `<div>Change: ₹${transaction.paymentDetails.change.toFixed(2)}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'card' && transaction.paymentDetails?.cardAmount ? `
              <div>Card: ₹${transaction.paymentDetails.cardAmount.toFixed(2)}</div>
              ${transaction.receipt ? `<div>Txn ID: ${transaction.receipt}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'wallet' ? `<div>Wallet Payment</div>` : ''}
          </div>
          <div class="footer">
            <div>Thank you Visit Again!</div>
            <div>For Business Support Contact ${companySettings.phone}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
        window.location.href = 'https://acebusiness.shop/quickpos';
      }, 1000);
    };
  };

  // On bill generation, if customer not found, create new customer
  const handleTransactionComplete = async (skipPrint = false) => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < cart.getTotal())) {
      toast.error('Insufficient cash amount');
      return;
    }
    if (paymentMethod === 'card' && (!cardTransactionId || cardTransactionId.length < 4)) {
      toast.error('Please enter transaction ID');
      return;
    }

    setIsProcessing(true);

    let customerId = '';
    const customers = await getCustomers();
    const customersArray = Array.isArray(customers) ? customers : [];
    let customer = customersArray.find(c => c.phone === customerPhone);
    if (!customer) {
      customer = {
        id: Date.now().toString() + Math.random().toString(36),
        name: customerName,
        phone: customerPhone,
        gst: customerGST,
        loyaltyPoints: 0,
        totalSpent: 0,
        visits: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await saveCustomer(customer);
    } else {
      // Update GST if changed
      if (invoiceType === 'tax' && customerGST && customer.gst !== customerGST) {
        await updateCustomer(customer.id, { gst: customerGST });
      }
    }
    customerId = customer.id;

    const cashAmountPaid = paymentMethod === 'cash' ? parseFloat(cashAmount) : 0;
    const change = paymentMethod === 'cash' ? Math.max(0, cashAmountPaid - cart.getTotal()) : 0;

    const transaction: Transaction = {
      id: Date.now().toString(),
      companyId: company?.id || '',
      customerId: customerId,
      employeeId: employee?.id,
      items: cart.items.map(ci => ({
        productId: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        total: ci.product.price * ci.quantity
      })),
      subtotal: cart.getTotal(),
      tax: 0,
      discount: 0,
      total: cart.getTotal(),
      paymentMethod,
      paymentDetails: {
        ...(paymentMethod === 'cash' && {
          cashAmount: cashAmountPaid,
          change
        }),
        ...(paymentMethod === 'card' && {
          cardAmount: cart.getTotal()
        })
      },
      timestamp: new Date(),
      customerName: customerName || undefined,
      employeeName: employee?.name,
      receipt: paymentMethod === 'card' ? cardTransactionId : undefined,
      status: 'completed'
    };

    // Update product stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.items.find(item => item.product.id === product.id);
      if (cartItem) {
        const newStock = Math.max(0, product.stock - cartItem.quantity);
        updateProduct(product.id, { stock: newStock });
        return { ...product, stock: newStock };
      }
      return product;
    });
    setProducts(updatedProducts);

    saveTransaction(transaction);
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { height: auto !important; }
            body {
              font-family: 'Courier New', monospace;
              width: ${printSettings.paperSize === 'thermal' ? '300px' : '210mm'};
              margin: 0 auto;
              padding: 10px 0 0 0;
              font-size: ${printSettings.fontSize}px;
              line-height: 1.3;
              background: #fff;
              color: #000;
            }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; color: #000; }
            .store-name { font-size: ${printSettings.fontSize + 4}px; font-weight: bold; color: #000; letter-spacing: 1px; }
            .company-detail { font-weight: bold; color: #000; white-space: pre-line; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; }
            th { font-weight: bold; background: #fff; }
            .amount, .total-bold { font-weight: bold; }
            .total-row td { border-top: 2px solid #000; font-weight: bold; }
            .footer { text-align: center; margin-top: 15px; font-size: ${printSettings.fontSize - 2}px; color: #000; font-weight: bold; }
            @media print {
              html, body { height: auto !important; }
              body { margin: 0; padding: 0; background: #fff; color: #000; }
              .no-print { display: none; }
              .footer { margin-bottom: 0; color: #000; font-weight: bold; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="store-name">${companySettings.name}</div>
            <div class="company-detail">${(companySettings.address || '').replace(/\n/g, '<br/>')}</div>
            <div class="company-detail">Phone: ${companySettings.phone}</div>
            ${companySettings.email ? `<div class="company-detail">Email: ${companySettings.email}</div>` : ''}
          </div>
          <div style="margin: 10px 0 10px 0; color: #000; font-weight: bold; text-align: left;">
            <div>Receipt #: ${transaction.id.slice(-8)}</div>
            <div>Date: ${new Date(transaction.timestamp).toLocaleDateString()}</div>
            <div>Time: ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            ${employee?.name ? `<div>Cashier: ${employee.name}</div>` : ''}
            ${transaction.customerName ? `<div>Customer: ${transaction.customerName}</div>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th style="width:32px">S.No</th>
                <th>PARTICULARS</th>
                <th style="width:40px">QTY</th>
                <th style="width:70px">RATE<br/>M.R.P.</th>
                <th style="width:70px">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${item.product.name}</td>
                  <td>${item.quantity}</td>
                  <td>
                    ₹${item.product.price.toFixed(2)}
                    ${item.product.mrp ? `<br/><span style='font-size:${printSettings.fontSize - 2}px'>UNT ₹${item.product.mrp.toFixed(2)}</span>` : ''}
                  </td>
                  <td class="amount">₹${(item.product.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="border-top: 2px solid #000; margin: 8px 0;"></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Qty : ${transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
            <span>Sub Total <span style="font-weight: bold;">₹${transaction.subtotal.toFixed(2)}</span></span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Round Off</span>
            <span>₹${(Math.round(transaction.total) - transaction.total).toFixed(2)}</span>
          </div>
          <div class="total-row" style="font-size: ${printSettings.fontSize + 2}px; margin-top: 8px;">
            <table style="width:100%; border:none;">
              <tr>
                <td style="border:none; text-align:right; font-weight:bold;">TOTAL</td>
                <td style="border:none; text-align:right; font-weight:bold;">₹ ${Math.round(transaction.total).toFixed(2)}</td>
              </tr>
            </table>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>Total Savings</span>
            <span>₹${(transaction.items.reduce((sum, item) => sum + ((item.product.mrp || 0) - item.product.price) * item.quantity, 0)).toFixed(2)}</span>
          </div>
          <div style="margin: 10px 0; color: #000; font-weight: bold;">
            <div><strong>Payment:</strong> ${transaction.paymentMethod === 'cash' ? 'Cash' : transaction.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Mobile Wallet'}</div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div>Cash: ₹${transaction.paymentDetails.cashAmount.toFixed(2)}</div>
              ${transaction.paymentDetails.change ? `<div>Change: ₹${transaction.paymentDetails.change.toFixed(2)}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'card' && transaction.paymentDetails?.cardAmount ? `
              <div>Card: ₹${transaction.paymentDetails.cardAmount.toFixed(2)}</div>
              ${transaction.receipt ? `<div>Txn ID: ${transaction.receipt}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'wallet' ? `<div>Wallet Payment</div>` : ''}
          </div>
          <div class="footer">
            <div>${printSettings.header}</div>
            <div>${printSettings.footer}</div>
          </div>
        </body>
      </html>
    `;
    if (!skipPrint) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.onload = function() {
          printWindow.print();
          setTimeout(() => {
            try { printWindow.close(); } catch {}
            setTimeout(() => { void ensureFullscreen(); }, 50);
          }, 300);
        };
      }
    }
    cart.clearCart();
    
    toast.success('Transaction completed successfully!');
    
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCashAmount('');
    setCardTransactionId('');
    setPaymentMethod('cash');
    setIsProcessing(false);
    
    // Focus back to search and ensure fullscreen
    setTimeout(() => searchRef.current?.focus(), 120);
    setTimeout(() => { void ensureFullscreen(); }, 120);
  };

  const cashAmountFloat = parseFloat(cashAmount) || 0;
  const change = paymentMethod === 'cash' && cashAmountFloat > cart.getTotal() ? cashAmountFloat - cart.getTotal() : 0;

  // On 'Generate Bill', open payment dialog
  const handleGenerateBill = () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsPaymentDialogOpen(true);
  };

  // 1. Add state for selected category
  const [selectedCategory, setSelectedCategory] = useState('All');

  // 2. Get unique categories from products
  const categories = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return ['All'];
    }
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);

  // 3. Filter products by selected category
  const displayedProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  // Enter fullscreen on mount; lock scroll; ESC exits to dashboard
  useEffect(() => {
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    void ensureFullscreen();

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        exitRequestedRef.current = true;
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [ensureFullscreen, navigate]);

  // Track fullscreen state and immediately re-request unless ESC used
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        if (exitRequestedRef.current) {
          exitRequestedRef.current = false;
        } else {
          void ensureFullscreen();
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [ensureFullscreen]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {(!isFullscreen && needsFullscreenPrompt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-lg p-6 max-w-md w-[90%] text-center shadow-xl">
            <h2 className="text-xl font-bold mb-2">Enter Fullscreen POS</h2>
            <p className="text-sm text-gray-600 mb-4">Your browser blocked automatic fullscreen. Click the button below to continue billing.</p>
            <button
              className="px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
              onClick={() => void ensureFullscreen()}
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}
      {/* Top Bar - Fully Compact */}
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 border-b px-4 py-2 flex-shrink-0">
        {/* Logo/Company Name */}
        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">ACE-PoS</div>

        {/* Search Radio Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={searchType === 'serial'} onChange={() => setSearchType('serial')} />
            <span className={`text-sm dark:text-gray-300 ${searchType === 'serial' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''}`}>Serial No.</span>
            </label>
          <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={searchType === 'code'} onChange={() => setSearchType('code')} />
            <span className={`text-sm dark:text-gray-300 ${searchType === 'code' ? 'text-blue-700 dark:text-blue-400 font-bold' : ''}`}>Item Code</span>
            </label>
          <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={searchType === 'name'} onChange={() => setSearchType('name')} />
            <span className={`text-sm dark:text-gray-300 ${searchType === 'name' ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>Item Name</span>
            </label>
          </div>

        {/* Search Input */}
        <div className="flex-1 flex justify-start">
          <div className="flex items-center w-full max-w-lg">
            <input
              ref={searchRef}
              className="border rounded-l px-3 py-2 w-full text-base focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Search by Item Name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="bg-blue-700 text-white px-3 py-2 rounded-r">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bill/Tax Invoice & Date/Time */}
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded text-sm ${invoiceType === 'bill' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setInvoiceType('bill')}
            >
              Bill
            </button>
            <button
              className={`px-4 py-2 rounded text-sm ${invoiceType === 'tax' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setInvoiceType('tax')}
            >
              Tax Invoice
            </button>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500 dark:text-gray-400">{currentTime.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            <div className="text-lg font-mono font-bold dark:text-white">{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>
                  </div>
      {/* Main Content - No Scroll */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Category Sidebar */}
        <div className="bg-blue-800 text-white w-48 flex-shrink-0 overflow-y-auto">
          <div className="font-bold text-base mb-3 tracking-widest text-center p-3 border-b border-blue-700">CATEGORY</div>
          <div className="p-3">
            {categories.map(category => (
              <button
                key={category}
                className={`w-full text-left px-3 py-2 mb-2 transition font-medium text-sm rounded ${selectedCategory === category ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="p-4 mt-auto border-t border-blue-700">
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 text-white hover:bg-red-600 rounded transition-colors text-base"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded shadow text-left">
            <thead>
              <tr className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                <th className="px-4 py-3 text-sm font-semibold">Item Name</th>
                <th className="px-4 py-3 text-sm font-semibold hidden sm:table-cell">Tag</th>
                <th className="px-4 py-3 text-sm font-semibold">Sale Price</th>
                <th className="px-4 py-3 text-sm font-semibold hidden md:table-cell">MRP</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-gray-400 py-8">No products found.</td></tr>
              ) : (
                displayedProducts.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
                    onClick={() => handleProductSelect(product)}
                  >
                    <td className="px-4 py-3 font-semibold text-sm dark:text-white">
                      <div className="truncate" title={product.name}>
                        {product.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{product.sku || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-sm hidden sm:table-cell dark:text-white truncate">{product.sku || '-'}</td>
                    <td className="px-4 py-3 text-sm dark:text-white">₹{product.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm hidden md:table-cell dark:text-white">{product.mrp ? `₹${product.mrp.toFixed(2)}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Cart/Invoice Panel */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col flex-shrink-0">
          <div className="p-3 border-b dark:border-gray-700">
            <div className="flex gap-3">
              <input
                className="border rounded px-3 py-2 flex-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Mobile No."
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
              <input
                className="border rounded px-3 py-2 flex-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Client Name"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto">
            <table className="w-full text-sm dark:text-white">
              <thead>
                <tr className="border-b dark:border-gray-600">
                  <th className="text-left font-semibold">Item</th>
                  <th className="text-center font-semibold">Qty</th>
                  <th className="text-right font-semibold">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No items</td></tr>
                ) : cart.items.map((item, idx) => (
                  <tr key={item.product.id} className="border-b dark:border-gray-600">
                    <td className="py-2 truncate" title={item.product.name}>{item.product.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-right">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                    <td className="py-2 text-center">
                      <button onClick={() => cart.removeItem(item.product.id)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t dark:border-gray-700 space-y-3 pb-24 md:pb-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Total</span>
              <span className="font-bold">₹{cart.getTotal().toFixed(2)}</span>
                  </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} /> Cash</label>
              <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} /> Card</label>
              <label className="flex items-center gap-2"><input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} /> Wallet</label>
              </div>
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-lg" 
              onClick={handleGenerateBill}
              disabled={cart.items.length === 0}
            >
              Generate Bill
            </button>
              </div>
            </div>
      </div>

      {/* Sticky mobile checkout bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40">
        <div className="mx-3 mb-3 shadow-lg rounded-lg overflow-hidden">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-3 flex items-center justify-between">
            <div className="text-sm font-semibold dark:text-white">Total: ₹{cart.getTotal().toFixed(2)}</div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded disabled:opacity-50"
              onClick={handleGenerateBill}
              disabled={cart.items.length === 0}
            >
              Generate Bill
            </button>
              </div>
              </div>
            </div>

      {/* Quantity Dialog - Responsive */}
      {isQtyDialogOpen && qtyDialogProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setIsQtyDialogOpen(false)}>&times;</button>
            <h2 className="text-lg sm:text-xl font-bold mb-2 dark:text-white">{qtyDialogProduct.name}</h2>
            <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold">Unit:</span> {qtyDialogProduct.unit || 'PCS'}
                </div>
            {qtyDialogProduct.description && (
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">{qtyDialogProduct.description}</div>
            )}
            <input
                  type="number"
              className="border rounded px-3 sm:px-4 py-2 w-full mb-4 text-sm sm:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={qtyDialogQty}
              onChange={e => setQtyDialogQty(e.target.value)}
              min={isDecimalUnit(qtyDialogProduct.unit || 'PCS') ? '0.001' : '1'}
              step={isDecimalUnit(qtyDialogProduct.unit || 'PCS') ? '0.001' : '1'}
                  autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleQtyDialogConfirm(); }}
            />
            {qtyDialogError && (
              <div className="text-red-600 dark:text-red-400 mb-2 text-sm">
                {isDecimalUnit(qtyDialogProduct.unit || 'PCS')
                  ? 'Enter a valid decimal quantity (e.g., 1.25)'
                  : 'Enter a valid whole number quantity (e.g., 2)'}
                  </div>
                )}
            <div className="flex gap-2 sm:gap-4">
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded text-sm sm:text-base dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" onClick={() => setIsQtyDialogOpen(false)}>Cancel</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm sm:text-base" onClick={handleQtyDialogConfirm}>Add to Cart</button>
            </div>
          </div>
              </div>
            )}

      {/* Payment Dialog - Properly Aligned */}
      {isPaymentDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative flex flex-col lg:flex-row gap-6">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setIsPaymentDialogOpen(false)}>&times;</button>
            <div className="flex-1 min-w-[260px]">
              <h2 className="text-xl font-bold mb-4">{paymentMethod === 'cash' ? 'Cash Payment' : paymentMethod === 'card' ? 'Card Payment' : 'Wallet Payment'}</h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 text-base">Bill Amount</label>
                <input type="text" className="border rounded px-3 py-2 w-full bg-gray-100 text-base" value={`₹${cart.getTotal().toFixed(2)}`} readOnly />
              </div>
              {paymentMethod === 'cash' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-base">Tendered <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-right text-lg"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      onKeyDown={e => { if (e.key === 'Enter') { handleTransactionComplete(); setIsPaymentDialogOpen(false); } }}
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-base">Change Due</label>
                    <input type="text" className="border rounded px-3 py-2 w-full bg-gray-100 text-right text-base" value={`₹${Math.max(0, (parseFloat(cashAmount) || 0) - cart.getTotal()).toFixed(2)}`} readOnly />
                    <div className="text-sm text-gray-500 mt-2">Net Amount Received : ₹{Math.min(cart.getTotal(), parseFloat(cashAmount) || 0).toFixed(2)}</div>
                  </div>
                </>
              )}
            {paymentMethod === 'card' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-base">Amount <span className="text-red-600">*</span></label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-right text-lg"
                      value={cashAmount}
                      onChange={e => setCashAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      onKeyDown={e => { if (e.key === 'Enter') { handleTransactionComplete(); setIsPaymentDialogOpen(false); } }}
                      autoFocus
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-base">Txn. ID</label>
                    <input
                      type="text"
                      className="border rounded px-3 py-2 w-full text-base"
                  value={cardTransactionId}
                      onChange={e => setCardTransactionId(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { handleTransactionComplete(); setIsPaymentDialogOpen(false); } }}
                    />
                  </div>
                </>
              )}
              {paymentMethod === 'wallet' && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2 text-base">Amount <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    className="border rounded px-3 py-2 w-full text-right text-lg"
                    value={cashAmount}
                    onChange={e => setCashAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    onKeyDown={e => { if (e.key === 'Enter') { handleTransactionComplete(); setIsPaymentDialogOpen(false); } }}
                  autoFocus
                />
              </div>
            )}
              <div className="flex gap-4 mt-6">
                <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded text-base" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</button>
                <button className="flex-1 bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded flex items-center justify-center gap-3 text-base" onClick={() => { handleTransactionComplete(); setIsPaymentDialogOpen(false); }}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17v-2a4 4 0 0 1 4-4h10"/><path d="M17 17v-2a4 4 0 0 0-4-4H3"/><circle cx="12" cy="7" r="4"/></svg>
                  Save n Print
                </button>
              </div>
            </div>
            {/* Numeric Keypad - Properly Aligned */}
            <div className="flex flex-col gap-3 items-center justify-center">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[2000, 500, 200, 100, 1,2,3,4,5,6,7,8,9,0,'.','CLR'].map((key, idx) => (
                  <button
                    key={idx}
                    className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-base ${key==='CLR' ? 'col-span-2 bg-red-600 hover:bg-red-700' : ''}`}
                    style={{gridColumn: key==='CLR' ? 'span 2 / span 2' : undefined}}
                    onClick={() => {
                      if(key==='CLR') setCashAmount('');
                      else if(typeof key==='number' || key==='.') setCashAmount(cashAmount + key.toString());
                      else setCashAmount((parseFloat(cashAmount||'0') + parseFloat(key)).toString());
                    }}
                  >{key}</button>
                ))}
            </div>
          </div>
            </div>
          </div>
      )}
    </div>
  );
}