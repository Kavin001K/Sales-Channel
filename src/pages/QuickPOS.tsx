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
import { Switch } from '@/components/ui/switch';
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
  LogOut,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { thermalPrinter, ReceiptData } from '@/lib/thermalPrinter';
import PaymentDialog from '@/components/PaymentDialog';

export default function QuickPOS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGST, setCustomerGST] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cardTransactionId, setCardTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [taxIncluded, setTaxIncluded] = useState(false);
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
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isReprintDialogOpen, setIsReprintDialogOpen] = useState(false);
  const [reprintCount, setReprintCount] = useState(0);
  const { companySettings, printSettings } = useSettings();
  const { logout, company, employee } = useAuth();

  // Category management
  const [selectedCategory, setSelectedCategory] = useState('All');
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

  // Quick add handler must be defined before effects that depend on it
  const handleQuickAdd = useCallback((product: Product) => {
    if (product.stock > 0) {
      cart.addItem(product);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(`${product.name} is out of stock`);
    }
  }, [cart]);

  // Handle product selection with quantity dialog
  const handleProductSelect = useCallback((product: Product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    if (product.unit && isDecimalUnit(product.unit)) {
      setQtyDialogProduct(product);
      setQtyDialogQty('1');
      setMainQty('');
      setSubQty('');
      setQtyDialogError('');
      setIsQtyDialogOpen(true);
    } else {
      handleQuickAdd(product);
    }
  }, [handleQuickAdd]);

  // Handle quantity dialog confirmation
  const handleQtyConfirm = useCallback(() => {
    if (!qtyDialogProduct) return;

    let finalQty = 1;
    if (qtyDialogProduct.unit && isDecimalUnit(qtyDialogProduct.unit)) {
      const main = parseFloat(mainQty) || 0;
      const sub = parseFloat(subQty) || 0;
      finalQty = main + (sub / 100);
      
      if (finalQty <= 0) {
        setQtyDialogError('Please enter a valid quantity');
        return;
      }
    } else {
      finalQty = parseInt(qtyDialogQty) || 1;
      if (finalQty <= 0) {
        setQtyDialogError('Please enter a valid quantity');
        return;
      }
    }

    cart.addItem(qtyDialogProduct, finalQty);
    toast.success(`${qtyDialogProduct.name} added to cart`);
    setIsQtyDialogOpen(false);
  }, [qtyDialogProduct, qtyDialogQty, mainQty, subQty, cart]);

  // Customer management functions
  const handleCustomerPhoneChange = useCallback(async (phone: string) => {
    setCustomerPhone(phone);
    
    // Only search if phone number is valid (at least 10 digits)
    if (phone.length >= 10 && /^\d+$/.test(phone)) {
      setIsCustomerLoading(true);
      try {
        // Search for existing customer by phone
        const customers = await getCustomers(company?.id || '');
        const existingCustomer = customers.find(c => c.phone === phone);
        
        if (existingCustomer) {
          // Customer found - populate fields
          setCurrentCustomer(existingCustomer);
          setCustomerName(existingCustomer.name || '');
          setCustomerGST(existingCustomer.gst || '');
          toast.success(`Customer found: ${existingCustomer.name}`);
        } else {
          // No customer found - clear current customer
          setCurrentCustomer(null);
          // Keep the name if user has already entered it
          if (!customerName) {
            setCustomerName('');
          }
          setCustomerGST('');
        }
      } catch (error) {
        console.error('Error searching for customer:', error);
        toast.error('Error searching for customer');
      } finally {
        setIsCustomerLoading(false);
      }
    } else {
      // Clear customer if phone is invalid
      setCurrentCustomer(null);
    }
  }, [company?.id, customerName]);

  // Auto-create or update customer when transaction is completed
  const handleCustomerSave = useCallback(async (phone: string, name: string, gst: string = '') => {
    if (!phone || !name || !company?.id) return;

    try {
      const customers = await getCustomers(company.id);
      const existingCustomer = customers.find(c => c.phone === phone);
      
      if (existingCustomer) {
        // Update existing customer
        const updatedCustomer = {
          ...existingCustomer,
          name: name,
          gst: gst,
          visitCount: (existingCustomer.visitCount || 0) + 1,
          lastVisit: new Date()
        };
        
        await updateCustomer(existingCustomer.id, updatedCustomer);
        setCurrentCustomer(updatedCustomer);
        toast.success('Customer updated successfully');
      } else {
        // Create new customer
        const newCustomer = {
          id: `customer_${Date.now()}`,
          companyId: company.id,
          name: name,
          phone: phone,
          gst: gst,
          email: '',
          address: '',
          isActive: true,
          visitCount: 1,
          loyaltyPoints: 0,
          totalSpent: 0,
          lastVisit: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await saveCustomer(newCustomer);
        setCurrentCustomer(newCustomer);
        toast.success('New customer created successfully');
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error saving customer details');
    }
  }, [company?.id]);

  // Initialize data and fullscreen
  useEffect(() => {
    initializeSampleData();
    ensureFullscreen();
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !exitRequestedRef.current) {
        ensureFullscreen();
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [ensureFullscreen]);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      const productsData = await getProducts();
      setProducts(productsData);
      setFilteredProducts(productsData);
    };
    loadProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory]);

  // Focus search on mount and after transaction
  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitRequestedRef.current = true;
        navigate('/dashboard');
      }
      // Add Ctrl+D shortcut for dashboard
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Handle transaction completion
  const handleTransactionComplete = useCallback(async (transaction: Transaction) => {
    try {
      await saveTransaction(transaction);
      setLastTransaction(transaction);
      
      // Auto-save/update customer information
      if (customerPhone && customerName) {
        await handleCustomerSave(customerPhone, customerName, customerGST);
      }
      
      // Prepare receipt data for thermal printer
      const receiptData: ReceiptData = {
        companyName: companySettings?.name || 'ACE Business',
        companyAddress: companySettings?.address || '',
        companyPhone: companySettings?.phone || '',
        companyTaxId: companySettings?.taxId || '',
        receiptNumber: transaction.id,
        date: new Date(transaction.timestamp).toLocaleString(),
        cashierName: employee?.name || 'Unknown',
        customerName: transaction.customerName || 'Walk-in Customer',
        items: transaction.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        paymentDetails: transaction.paymentDetails
      };

      // Print receipt using thermal printer service
      const printSuccess = await thermalPrinter.printReceipt(receiptData);
      
      if (printSuccess) {
        toast.success('Transaction completed and receipt printed successfully!');
      } else {
        toast.success('Transaction completed successfully!');
        toast.warning('Receipt printing failed - check printer connection');
      }
      
      // Clear cart and form
      cart.clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerGST('');
      setCurrentCustomer(null);
      setCashAmount('');
      setCardTransactionId('');
      
      // Re-request fullscreen and focus search
      setTimeout(() => {
        ensureFullscreen();
        if (searchRef.current) {
          searchRef.current.focus();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  }, [cart, ensureFullscreen, companySettings, employee, customerPhone, customerName, customerGST, handleCustomerSave]);

  // Handle reprint
  const handleReprint = useCallback(async () => {
    if (!lastTransaction) return;
    
    const reprintCount = 1; // Simple reprint counter
    
    // Prepare receipt data for thermal printer
    const receiptData: ReceiptData = {
      companyName: companySettings?.name || 'ACE Business',
      companyAddress: companySettings?.address || '',
      companyPhone: companySettings?.phone || '',
      companyTaxId: companySettings?.taxId || '',
      receiptNumber: lastTransaction.id,
      date: new Date(lastTransaction.timestamp).toLocaleString(),
      cashierName: employee?.name || 'Unknown',
      customerName: lastTransaction.customerName || 'Walk-in Customer',
      items: lastTransaction.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal: lastTransaction.subtotal,
      tax: lastTransaction.tax,
      total: lastTransaction.total,
      paymentMethod: lastTransaction.paymentMethod,
      paymentDetails: lastTransaction.paymentDetails,
      isReprint: true,
      reprintCount: reprintCount
    };

    // Print receipt using thermal printer service
    const printSuccess = await thermalPrinter.printReceipt(receiptData);
    
    if (printSuccess) {
      toast.success('Receipt reprinted successfully!');
    } else {
      toast.warning('Reprint failed - check printer connection');
    }
    
    setReprintCount(reprintCount);
    setIsReprintDialogOpen(false);
  }, [lastTransaction, companySettings, employee]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart.items]);

  const tax = useMemo(() => {
    return subtotal * 0.18; // 18% GST
  }, [subtotal]);

  const total = useMemo(() => {
    return taxIncluded ? subtotal : subtotal + tax;
  }, [subtotal, tax, taxIncluded]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  // Handle payment dialog open
  const handlePaymentClick = useCallback(() => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }

    setIsPaymentDialogOpen(true);
  }, [cart.items.length, customerName]);

  // Handle payment completion from dialog
  const handlePaymentComplete = useCallback(async (paymentData: any) => {
    setIsProcessing(true);
    setIsPaymentDialogOpen(false);

    try {
      // Create or update customer
      let customer = await getCustomers().then(customers => 
        customers.find(c => c.phone === customerPhone)
      );

      if (!customer && customerPhone) {
        customer = await saveCustomer({
          id: Date.now().toString(),
          name: customerName,
          phone: customerPhone,
          email: '',
          address: '',
          companyId: company?.id || '',
          gst: customerGST,
          loyaltyPoints: 0,
          totalSpent: 0,
          visits: 0,
          visitCount: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (customer) {
        await updateCustomer(customer.id, {
          ...customer,
          name: customerName,
          gst: customerGST,
          totalSpent: (customer.totalSpent || 0) + total,
          visits: (customer.visits || 0) + 1,
          visitCount: (customer.visitCount || 0) + 1,
          updatedAt: new Date()
        });
      }

      // Update product stock
      for (const item of cart.items) {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          await updateProduct(product.id, {
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      // Create transaction
      const transaction: Transaction = {
        id: Date.now().toString(),
        items: cart.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          receipt: '',
          mrp: item.product.mrp || 0
        })),
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod: paymentData.paymentMethod,
        status: 'completed',
        customerName,
        timestamp: new Date(),
        companyId: company?.id || '',
        employeeId: employee?.id || '',
        employeeName: employee?.name || '',
        notes: '',
        receipt: '',
        paymentDetails: {
          cashAmount: paymentData.paymentMethod === 'cash' ? paymentData.amount : 0,
          change: paymentData.change || 0,
          cardAmount: paymentData.paymentMethod === 'card' ? paymentData.amount : 0
        }
      };

      await handleTransactionComplete(transaction);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  }, [cart, customerName, customerPhone, customerGST, total, products, company, employee, handleTransactionComplete]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fullscreen Prompt Overlay */}
      {needsFullscreenPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl text-center shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-6">
              <h3 className="text-xl font-bold">Fullscreen Required</h3>
            </div>
            <p className="text-gray-600 mb-6 text-lg">Please press F11 or click the fullscreen button to continue with POS operations.</p>
            <p className="text-gray-500 mb-4 text-sm">💡 Tip: Press ESC or Ctrl+D anytime to return to Dashboard</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={ensureFullscreen}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Enter Fullscreen
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-semibold py-3 px-6 transition-all duration-200"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Streamlined with Logo, Search, and Session Info */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-white bg-opacity-20 rounded-lg p-2 mr-3">
            <Package className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">ACE-POS</h1>
        </div>

        {/* Universal Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={searchRef}
              type="text"
              placeholder="Search by Item Name, Code, or Tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg bg-white text-gray-800 border-0 rounded-lg shadow-sm focus:ring-2 focus:ring-white focus:ring-opacity-50"
            />
          </div>
        </div>

        {/* Session Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <User className="h-4 w-4" />
            <span className="font-medium">{employee?.name || 'Cashier'}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <Calendar className="h-4 w-4" />
            <span>{currentTime.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <Clock className="h-4 w-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
            <Label htmlFor="tax-included" className="text-sm font-medium cursor-pointer">Tax Inc.</Label>
            <Switch
              id="tax-included"
              checked={taxIncluded}
              onCheckedChange={setTaxIncluded}
              className="data-[state=checked]:bg-white data-[state=unchecked]:bg-white bg-opacity-30"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 bg-white text-blue-600 hover:bg-gray-100 border-white"
            title="Go to Dashboard (ESC or Ctrl+D)"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-white text-red-600 hover:bg-red-50 border-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs - Horizontal */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="flex space-x-3 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap font-medium transition-all duration-200 ${
                selectedCategory === category 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'hover:bg-blue-50 hover:text-blue-600 border-blue-200'
              }`}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Product Selection (70%) */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-400 hover:scale-105"
                onClick={() => handleProductSelect(product)}
              >
                <CardContent className="p-3 text-center">
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-800">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.sku || product.barcode}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">₹{product.price.toFixed(2)}</span>
                    <Badge variant={product.stock > 0 ? "default" : "destructive"} className="text-xs">
                      {product.stock > 0 ? `${product.stock}` : 'Out'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No products found</p>
            </div>
          )}
        </div>

        {/* Right Panel - Live Bill/Cart (30%) */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Customer Info */}
          <div className="bg-white p-4 border-b border-gray-200">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              Customer Information
              {isCustomerLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              )}
              {currentCustomer && (
                <Badge variant="secondary" className="text-xs">
                  Existing Customer
                </Badge>
              )}
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="text-sm"
                disabled={isCustomerLoading}
              />
              <div className="relative">
                <Input
                  placeholder="Mobile Number"
                  value={customerPhone}
                  onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                  className="text-sm"
                  disabled={isCustomerLoading}
                />
                {currentCustomer && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      Found
                    </Badge>
                  </div>
                )}
              </div>
              <Input
                placeholder="GST Number (Optional)"
                value={customerGST}
                onChange={(e) => setCustomerGST(e.target.value)}
                className="text-sm"
                disabled={isCustomerLoading}
              />
              {currentCustomer && (
                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <div><strong>Visit Count:</strong> {currentCustomer.visitCount || 0}</div>
                  <div><strong>Last Visit:</strong> {currentCustomer.lastVisit ? new Date(currentCustomer.lastVisit).toLocaleDateString() : 'Never'}</div>
                  {currentCustomer.loyaltyPoints > 0 && (
                    <div><strong>Loyalty Points:</strong> {currentCustomer.loyaltyPoints}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold mb-3">Cart Items</h3>
            {cart.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-800">{item.product.name}</h4>
                        <p className="text-xs text-gray-500">₹{item.product.price.toFixed(2)} each</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cart.removeItem(item.product.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-2 py-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cart.updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold w-8 text-center text-gray-800">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                          className="h-6 w-6 p-0 hover:bg-green-50 hover:text-green-600"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="font-bold text-green-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals and Payment */}
          <div className="bg-white p-4 border-t border-gray-200">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18%):</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold text-green-600">
                <span>TOTAL:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <Label className="text-sm font-medium mb-3 block text-gray-700">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'wallet') => setPaymentMethod(value)}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 p-2 rounded-lg border-2 hover:border-blue-300 transition-colors">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="text-sm font-medium cursor-pointer">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-lg border-2 hover:border-blue-300 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="text-sm font-medium cursor-pointer">Card</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Pay Button */}
            <Button
              onClick={handlePaymentClick}
              disabled={cart.items.length === 0 || isProcessing}
              className="w-full py-4 text-lg font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `PAY ₹${total.toFixed(2)}`
              )}
            </Button>

            {/* Reprint Button */}
            {lastTransaction && (
              <Button
                variant="outline"
                onClick={() => setIsReprintDialogOpen(true)}
                className="w-full mt-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                Reprint Last Bill
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Dialog */}
      <Dialog open={isQtyDialogOpen} onOpenChange={setIsQtyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Quantity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {qtyDialogProduct && (
              <div className="text-center">
                <h3 className="font-semibold">{qtyDialogProduct.name}</h3>
                <p className="text-sm text-gray-500">Unit: {qtyDialogProduct.unit}</p>
              </div>
            )}
            
            {qtyDialogProduct?.unit && isDecimalUnit(qtyDialogProduct.unit) ? (
              <div className="space-y-3">
                <div>
                  <Label>Main Unit</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={mainQty}
                    onChange={(e) => setMainQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Sub Unit (cents)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={subQty}
                    onChange={(e) => setSubQty(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={qtyDialogQty}
                  onChange={(e) => setQtyDialogQty(e.target.value)}
                />
              </div>
            )}
            
            {qtyDialogError && (
              <p className="text-red-500 text-sm">{qtyDialogError}</p>
            )}
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsQtyDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleQtyConfirm} className="flex-1">
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reprint Dialog */}
      <Dialog open={isReprintDialogOpen} onOpenChange={setIsReprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reprint Last Bill</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to reprint the last bill?</p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsReprintDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleReprint} className="flex-1">
              Reprint
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onPaymentComplete={handlePaymentComplete}
        billAmount={total}
        customerName={customerName}
      />
    </div>
  );
}