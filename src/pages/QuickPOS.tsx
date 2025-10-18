import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Product, Transaction, Customer } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { useDataSync } from '@/hooks/useDataSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  DollarSign,
  Package,
  ArrowLeft,
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  X,
  Percent,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/hooks/useAuth';
import { thermalPrinter, ReceiptData } from '@/lib/thermalPrinter';
import PaymentDialog from '@/components/PaymentDialog';

export default function QuickPOS() {
  const { company, employee, loading: authLoading } = useAuth();
  const {
    products,
    customers,
    saveTransaction,
    saveCustomer,
    updateCustomer,
    updateProduct,
    isLoading: isDataLoading
  } = useDataSync();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGST, setCustomerGST] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taxIncluded, setTaxIncluded] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [isCustomerSectionOpen, setIsCustomerSectionOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const cart = useCart();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const exitRequestedRef = useRef(false);
  const { companySettings } = useSettings();
  const { logout } = useAuth();

  // Category management
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Redirect to login if no company
  useEffect(() => {
    if (!company?.id && !authLoading) {
      console.warn('No company found, redirecting to login');
      navigate('/');
    }
  }, [company, authLoading, navigate]);

  // Initialize filtered products
  useEffect(() => {
    if (Array.isArray(products)) {
      setFilteredProducts(products);
    }
  }, [products]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

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

  // Fullscreen management
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

  // Initialize fullscreen on mount
  useEffect(() => {
    ensureFullscreen();

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !exitRequestedRef.current) {
        ensureFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [ensureFullscreen]);

  // Focus search on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Handle ESC key for exit confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        e.preventDefault();
        setShowExitConfirmation(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExitToDashboard = useCallback(async () => {
    exitRequestedRef.current = true;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    navigate('/dashboard');
  }, [navigate]);

  const handleCancelExit = useCallback(() => {
    setShowExitConfirmation(false);
  }, []);

  // Customer search by phone
  const handleCustomerPhoneChange = useCallback(async (phone: string) => {
    setCustomerPhone(phone);

    if (phone.length >= 10 && /^\d+$/.test(phone)) {
      setIsCustomerLoading(true);
      try {
        const existingCustomer = customers.find(c => c.phone === phone);

        if (existingCustomer) {
          setCurrentCustomer(existingCustomer);
          setCustomerName(existingCustomer.name || '');
          setCustomerGST(existingCustomer.gst || '');
          toast.success(`Customer found: ${existingCustomer.name}`);
        } else {
          setCurrentCustomer(null);
          setCustomerName('');
          setCustomerGST('');
        }
      } catch (error) {
        console.error('Error searching for customer:', error);
      } finally {
        setIsCustomerLoading(false);
      }
    } else {
      setCurrentCustomer(null);
      setCustomerName('');
      setCustomerGST('');
    }
  }, [customers]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart.items]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percent') {
      return subtotal * (discount / 100);
    }
    return discount;
  }, [subtotal, discount, discountType]);

  const subtotalAfterDiscount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const tax = useMemo(() => {
    return subtotalAfterDiscount * 0.18;
  }, [subtotalAfterDiscount]);

  const total = useMemo(() => {
    return taxIncluded ? subtotalAfterDiscount : subtotalAfterDiscount + tax;
  }, [subtotalAfterDiscount, tax, taxIncluded]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  // Handle payment
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

  const handlePaymentComplete = useCallback(async (paymentData: { parts: { method: 'cash' | 'card' | 'wallet'; amount: number; txnId?: string; lastDigits?: string }[] }) => {
    setIsProcessing(true);
    setIsPaymentDialogOpen(false);

    try {
      let customer = customers.find(c => c.phone === customerPhone);

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
          visitCount: (customer.visitCount || 0) + 1,
          updatedAt: new Date()
        });
      }

      for (const item of cart.items) {
        const product = products.find(p => p.id === item.product.id);
        if (product) {
          await updateProduct(product.id, {
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      }

      const parts = paymentData.parts || [];
      const cashAmount = parts.filter(p => p.method === 'cash').reduce((s, p) => s + (p.amount || 0), 0);
      const cardAmount = parts.filter(p => p.method === 'card').reduce((s, p) => s + (p.amount || 0), 0);
      const walletAmount = parts.filter(p => p.method === 'wallet').reduce((s, p) => s + (p.amount || 0), 0);

      const transaction: Transaction = {
        id: Date.now().toString(),
        items: cart.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity,
          mrp: item.product.mrp || 0
        })),
        subtotal,
        tax,
        discount: discountAmount,
        total,
        paymentMethod: cashAmount > 0 && (cardAmount > 0 || walletAmount > 0) ? 'split' : (parts[0]?.method || 'cash'),
        status: 'completed',
        customerName,
        timestamp: new Date(),
        companyId: company?.id || '',
        employeeId: employee?.id || '',
        employeeName: employee?.name || '',
        notes: '',
        receipt: '',
        paymentDetails: {
          cashAmount,
          cardAmount,
          walletAmount,
          parts: parts.map(p => ({ method: p.method, amount: p.amount, txnId: p.txnId, lastDigits: p.lastDigits }))
        }
      };

      await saveTransaction(transaction);

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

      await thermalPrinter.printReceipt(receiptData);
      toast.success('Transaction completed successfully!');

      cart.clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setCustomerGST('');
      setCurrentCustomer(null);
      setDiscount(0);
      setIsCustomerSectionOpen(false);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  }, [cart, customerName, customerPhone, customerGST, total, products, company, employee, saveCustomer, updateCustomer, customers, subtotal, tax, discountAmount, companySettings, saveTransaction, updateProduct]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const applyDiscount = useCallback(() => {
    setIsDiscountDialogOpen(false);
    if (discount > 0) {
      toast.success(`Discount of ${discountType === 'percent' ? discount + '%' : '₹' + discount} applied`);
    }
  }, [discount, discountType]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fullscreen Prompt */}
      {needsFullscreenPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Fullscreen Mode Required</h3>
              <p className="text-gray-600 mb-6">
                Press F11 or click below to enter fullscreen for the best POS experience
              </p>
              <div className="flex gap-3">
                <Button onClick={ensureFullscreen} className="flex-1">
                  Enter Fullscreen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Quick POS</h1>
            <Badge variant="outline" className="text-sm">
              <User className="h-3 w-3 mr-1" />
              {employee?.name || 'Cashier'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Products */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                ref={searchRef}
                type="text"
                placeholder="Search products by name, code, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Package className="h-20 w-20 mb-4" />
                <p className="text-lg font-medium">
                  {isDataLoading ? 'Loading products...' : 'No products found'}
                </p>
                <p className="text-sm mt-1">
                  {isDataLoading ? 'Please wait...' : searchQuery || selectedCategory !== 'All' ? 'Try adjusting your filters' : 'Add products to get started'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                    onClick={() => {
                      if (product.stock > 0) {
                        cart.addItem(product);
                        toast.success(`${product.name} added to cart`);
                      } else {
                        toast.error(`${product.name} is out of stock`);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-3 flex items-center justify-center">
                        <Package className="h-12 w-12 text-blue-500" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <div className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</div>
                          {product.mrp && product.mrp > product.price && (
                            <div className="text-xs text-gray-400 line-through">₹{product.mrp.toFixed(2)}</div>
                          )}
                        </div>
                        <Badge variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}>
                          {product.stock > 0 ? product.stock : 'Out'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cart */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart ({cart.items.length})
              </h2>
              {cart.items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cart.clearCart()}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingCart className="h-16 w-16 mb-3" />
                <p className="font-medium">Cart is empty</p>
                <p className="text-sm">Click products to add them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item, index) => (
                  <Card key={index} className="border">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.product.name}</h4>
                          <p className="text-xs text-gray-500">₹{item.product.price.toFixed(2)} each</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cart.removeItem(item.product.id)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cart.updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-bold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-base font-bold">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Customer Section (Collapsible) */}
          <div className="border-t border-gray-200">
            <button
              onClick={() => setIsCustomerSectionOpen(!isCustomerSectionOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Details
              </span>
              {isCustomerSectionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isCustomerSectionOpen && (
              <div className="px-4 pb-4 space-y-3">
                <Input
                  placeholder="Customer Name *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-10"
                />
                <div className="relative">
                  <Input
                    placeholder="Mobile Number"
                    value={customerPhone}
                    onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                    className="h-10"
                    disabled={isCustomerLoading}
                  />
                  {isCustomerLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                <Input
                  placeholder="GST Number (Optional)"
                  value={customerGST}
                  onChange={(e) => setCustomerGST(e.target.value)}
                  className="h-10"
                />
                {currentCustomer && (
                  <div className="bg-green-50 p-3 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visits:</span>
                      <span className="font-bold">{currentCustomer.visitCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent:</span>
                      <span className="font-bold text-green-600">₹{(currentCustomer.totalSpent || 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Totals & Checkout */}
          <div className="border-t-2 border-gray-200 p-4 bg-gray-50">
            {/* Discount Link */}
            {discountAmount === 0 ? (
              <button
                onClick={() => setIsDiscountDialogOpen(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium mb-3 flex items-center gap-1"
              >
                <Percent className="h-4 w-4" />
                + Add Discount
              </button>
            ) : (
              <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  Discount: {discountType === 'percent' ? `${discount}%` : `₹${discount}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDiscount(0);
                    toast.success('Discount removed');
                  }}
                  className="h-6 w-6 p-0 text-blue-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Discount:</span>
                  <span className="font-medium">-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18% GST):</span>
                <span className="font-medium">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <Label htmlFor="tax-inc" className="cursor-pointer text-gray-600">Tax Included:</Label>
                <Switch
                  id="tax-inc"
                  checked={taxIncluded}
                  onCheckedChange={setTaxIncluded}
                />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-xl font-bold">
                <span>TOTAL:</span>
                <span className="text-green-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handlePaymentClick}
              disabled={cart.items.length === 0 || isProcessing || !customerName.trim()}
              className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-5 w-5 mr-2" />
                  PAY NOW ₹{total.toFixed(2)}
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500 mt-2">
              {isDataLoading ? 'Syncing...' : `${products.length} products • ${customers.length} customers`}
            </p>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <Dialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exit POS?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to exit fullscreen and return to the dashboard?
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleCancelExit} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExitToDashboard} className="flex-1">
              Exit to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={discountType === 'percent' ? 'default' : 'outline'}
                onClick={() => setDiscountType('percent')}
                className="flex-1"
              >
                <Percent className="h-4 w-4 mr-2" />
                Percentage
              </Button>
              <Button
                variant={discountType === 'amount' ? 'default' : 'outline'}
                onClick={() => setDiscountType('amount')}
                className="flex-1"
              >
                <IndianRupee className="h-4 w-4 mr-2" />
                Fixed Amount
              </Button>
            </div>
            <div>
              <Label>Enter {discountType === 'percent' ? 'Percentage' : 'Amount'}</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder={discountType === 'percent' ? 'e.g., 10' : 'e.g., 100'}
                className="text-lg font-bold text-center mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsDiscountDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={applyDiscount} className="flex-1">
                Apply Discount
              </Button>
            </div>
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
