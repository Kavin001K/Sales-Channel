import React from 'react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Product, Transaction, Customer } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getProducts, initializeSampleData, saveTransaction, getCustomers, saveCustomer, updateCustomer } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Zap, X, CreditCard, DollarSign, Keyboard, Printer, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [skuQuery, setSkuQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const cart = useCart();
  const [isMoUDialogOpen, setIsMoUDialogOpen] = useState(false);
  const [selectedMoU, setSelectedMoU] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mouValue, setMouValue] = useState('');
  const [qtyInputs, setQtyInputs] = useState<{ [productId: string]: string }>({});
  const [inputErrors, setInputErrors] = useState<{ [productId: string]: string }>({});
  const inputRefs = useRef<{ [productId: string]: HTMLInputElement | null }>({});
  const { company, employee } = useAuth();

  // Customer management state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGST, setCustomerGST] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  // Add state for search type and invoice type
  const [searchType, setSearchType] = useState<'serial' | 'code' | 'name'>('name');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [invoiceType, setInvoiceType] = useState<'bill' | 'tax'>('bill');

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get unique categories from products
  const categories = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return ['All'];
    }
    return ['All', ...Array.from(new Set(products.map(p => p.category)))];
  }, [products]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // ESC key handler for closing MoU Dialog
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setIsMoUDialogOpen(false);
  }, []);
  useEffect(() => {
    if (isMoUDialogOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isMoUDialogOpen, handleEsc]);

  useEffect(() => {
    // Initialize sample data and load products
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
        product.name,
        product.sku,
        product.barcode,
        product.category,
        product.description
      ].map(field => (field || '').toLowerCase());
      
      return words.every(word => 
        fields.some(field => field.includes(word))
      );
    });
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Add a function to determine if a unit is decimal-based
  const DECIMAL_UNITS = ['KGS', 'GMS', 'LTR', 'MLT', 'TON', 'SQM', 'SQF', 'MTR', 'CMS', 'CCM', 'CBM'];
  const isDecimalUnit = (unit: string) => DECIMAL_UNITS.includes((unit || '').toUpperCase());

  // Add state for the quantity dialog
  const [isQtyDialogOpen, setIsQtyDialogOpen] = useState(false);
  const [qtyDialogProduct, setQtyDialogProduct] = useState<Product | null>(null);
  const [qtyDialogQty, setQtyDialogQty] = useState('1');
  const [qtyDialogError, setQtyDialogError] = useState('');

  // Update handleProductSelect to accept product and qty
  const handleProductSelect = (product: Product, qty: number) => {
    setQtyDialogProduct(product);
    setQtyDialogQty(qty.toString());
    setQtyDialogError('');
    setIsQtyDialogOpen(true);
  };

  // Add handler for confirming quantity and adding to cart
  const handleQtyDialogConfirm = () => {
    if (!qtyDialogProduct) return;
    const unit = qtyDialogProduct.unit || 'PCS';
    const isDecimal = isDecimalUnit(unit);
    const qty = isDecimal ? parseFloat(qtyDialogQty) : parseInt(qtyDialogQty);
    if (!qty || qty <= 0) {
      setQtyDialogError('Enter a valid quantity');
      return;
    }
    cart.addItem({ ...qtyDialogProduct, unit }, qty);
    setIsQtyDialogOpen(false);
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

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
          // Clear the name if no customer found
          setCustomerName('');
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
      setCustomerName('');
      setCustomerGST('');
    }
  }, [company?.id]);

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

  const handleTransactionComplete = async (transaction: Transaction) => {
    try {
      console.log('Saving transaction from Sales:', transaction);
      const savedTransaction = await saveTransaction(transaction);
      console.log('Transaction saved successfully from Sales:', savedTransaction);
      
      // Auto-save/update customer information and link transaction to customer
      if (customerPhone && customerName) {
        await handleCustomerSave(customerPhone, customerName, customerGST);
        
        // Update customer's transaction history and spending
        if (currentCustomer) {
          const updatedCustomer = {
            ...currentCustomer,
            totalSpent: (currentCustomer.totalSpent || 0) + transaction.total,
            visitCount: (currentCustomer.visitCount || 0) + 1,
            lastVisit: new Date()
          };
          await updateCustomer(currentCustomer.id, updatedCustomer);
        }
      }
      
      cart.clearCart();
      toast.success('Transaction completed successfully!');
      
      // Update product stock
      const updatedProducts = products.map(product => {
        const cartItem = transaction.items.find(item => item.product.id === product.id);
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity };
        }
        return product;
      });
      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);
      
      // Clear customer form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerGST('');
      setCurrentCustomer(null);
      
      // Stay on the Sales page for continued billing
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    }
  };

  const handleRemoveCartItem = (idx: number) => {
    cart.removeItemByIndex(idx);
  };

  const availableStock = selectedProduct ? selectedProduct.stock : 0;

  // Filter products by selected category
  const displayedProducts = selectedCategory === 'All' 
    ? filteredProducts 
    : filteredProducts.filter(product => product.category === selectedCategory);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header - Compact */}
      <header className="bg-blue-800 text-white p-2 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-7 h-7" />
              <h1 className="text-2xl font-bold tracking-wide">Ace-Bill</h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'serial'} onChange={() => setSearchType('serial')} />
                <span className={`text-xs dark:text-gray-300 ${searchType === 'serial' ? 'text-blue-200 font-bold' : ''}`}>Serial No.</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'code'} onChange={() => setSearchType('code')} />
                <span className={`text-xs dark:text-gray-300 ${searchType === 'code' ? 'text-blue-200 font-bold' : ''}`}>Item Code</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'name'} onChange={() => setSearchType('name')} />
                <span className={`text-xs dark:text-gray-300 ${searchType === 'name' ? 'text-blue-200 font-bold' : ''}`}>Item Name</span>
              </label>
            </div>
            <div className="flex items-center w-full max-w-md">
              <input
                className="border rounded-l px-2 py-1 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder={`Search by ${searchType === 'serial' ? 'Serial No.' : searchType === 'code' ? 'Item Code' : 'Item Name'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="bg-blue-700 text-white px-2 py-1 rounded-r">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Bill/Tax Invoice Toggle and Date/Time - Compact */}
          <div className="flex flex-col items-end min-w-[180px]">
            <div className="flex gap-1 mb-1">
              <button
                className={`px-2 py-1 rounded-t text-xs ${invoiceType === 'bill' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setInvoiceType('bill')}
              >
                Bill
              </button>
              <button
                className={`px-2 py-1 rounded-t text-xs ${invoiceType === 'tax' ? 'bg-blue-700 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setInvoiceType('tax')}
              >
                Tax Invoice
              </button>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-300">{currentTime.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <div className="text-sm font-mono font-bold">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
        {/* Category Sidebar - Compact */}
        <div className="bg-blue-800 text-white w-full lg:w-48 flex flex-col py-2 px-2 flex-shrink-0 min-h-0 lg:min-h-0">
          <div className="font-bold text-base mb-2 tracking-widest text-center">CATEGORY</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-0">
            {categories.map(category => (
              <button
                key={category}
                className={`w-full text-left px-2 py-2 mb-1 rounded transition font-semibold text-sm ${selectedCategory === category ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Compact */}
        <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-2 overflow-auto min-w-0 min-h-0">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow text-left">
              <thead>
                <tr className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                  <th className="px-2 py-2 text-xs font-semibold">Item Name</th>
                  <th className="px-2 py-2 text-xs font-semibold hidden sm:table-cell">Tag</th>
                  <th className="px-2 py-2 text-xs font-semibold">Sale Price</th>
                  <th className="px-2 py-2 text-xs font-semibold hidden md:table-cell">MRP</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No products found.</td></tr>
                ) : (
                  displayedProducts.map(product => (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer border-b dark:border-gray-700"
                      onClick={() => handleProductSelect(product, 1)}
                    >
                      <td className="px-2 py-2 font-semibold text-xs dark:text-white">
                        <div className="max-w-[200px] truncate" title={product.name}>
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{product.sku || '-'}</div>
                      </td>
                      <td className="px-2 py-2 text-xs hidden sm:table-cell dark:text-white">{product.sku || '-'}</td>
                      <td className="px-2 py-2 text-xs dark:text-white">₹{product.price.toFixed(2)}</td>
                      <td className="px-2 py-2 text-xs hidden md:table-cell dark:text-white">-</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart/Invoice Panel - Compact */}
        <div className="w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-l dark:border-gray-700 flex flex-col h-64 lg:h-full flex-shrink-0 min-h-0">
          <div className="p-2 border-b dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 flex-1 text-xs dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Mobile No."
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 flex-1 text-xs dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Client Name"
                value={skuQuery}
                onChange={e => setSkuQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm dark:text-white">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left dark:text-white">Item Name</th>
                    <th className="text-center dark:text-white">Qty</th>
                    <th className="text-right dark:text-white">Rate</th>
                    <th className="text-right dark:text-white">Amount</th>
                    <th className="text-center dark:text-white"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-gray-400 dark:text-gray-500 py-8">No items</td></tr>
                  ) : cart.items.map((item, idx) => (
                    <tr key={item.product.id} className="border-b dark:border-gray-700">
                      <td className="max-w-[80px] sm:max-w-none truncate dark:text-white" title={item.product.name}>{item.product.name}</td>
                      <td className="text-center dark:text-white">{item.quantity}</td>
                      <td className="text-right dark:text-white">₹{item.product.price.toFixed(2)}</td>
                      <td className="text-right dark:text-white">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                      <td className="text-center">
                        <button onClick={() => handleRemoveCartItem(idx)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Bill Summary & Payment */}
          <div className="p-2 sm:p-4 border-t dark:border-gray-700 space-y-2">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Savings</span><span>0.00</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Round Off</span><span>0.00</span>
            </div>
            <div className="flex justify-between text-sm sm:text-lg font-bold dark:text-white">
              <span>Total</span><span>₹{cart.getTotal().toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm dark:text-white">
                <input type="radio" name="payment" defaultChecked /> Cash
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm dark:text-white">
                <input type="radio" name="payment" /> Card
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm dark:text-white">
                <input type="radio" name="payment" /> Wallet
              </label>
            </div>
            <button 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 rounded text-sm sm:text-lg mt-2" 
              onClick={handleCheckout}
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
              <span className="font-semibold">Unit:</span> PCS
            </div>
            {qtyDialogProduct.description && (
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">{qtyDialogProduct.description}</div>
            )}
            <input
              type="number"
              className="border rounded px-3 sm:px-4 py-2 w-full mb-4 text-sm sm:text-base dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={qtyDialogQty}
              onChange={e => setQtyDialogQty(e.target.value)}
              min="1"
              step="1"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleQtyDialogConfirm(); }}
            />
            {qtyDialogError && (
              <div className="text-red-600 dark:text-red-400 mb-2 text-sm">
                Enter a valid whole number quantity (e.g., 2)
              </div>
            )}
            <div className="flex gap-2 sm:gap-4">
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded text-sm sm:text-base dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" onClick={() => setIsQtyDialogOpen(false)}>Cancel</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm sm:text-base" onClick={handleQtyDialogConfirm}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Dialog - Responsive */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Complete Transaction</h2>
            <div className="space-y-4">
              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm dark:text-white">Customer Information</h3>
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
                  <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200 dark:bg-gray-700 dark:text-gray-300">
                    <div><strong>Visit Count:</strong> {currentCustomer.visitCount || 0}</div>
                    <div><strong>Last Visit:</strong> {currentCustomer.lastVisit ? new Date(currentCustomer.lastVisit).toLocaleDateString() : 'Never'}</div>
                    {currentCustomer.loyaltyPoints > 0 && (
                      <div><strong>Loyalty Points:</strong> {currentCustomer.loyaltyPoints}</div>
                    )}
                  </div>
                )}
              </div>

              {/* Transaction Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base dark:text-white">Total Amount:</span>
                  <span className="font-bold text-sm sm:text-base dark:text-white">₹{cart.getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-4">
                <button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded text-sm sm:text-base dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" 
                  onClick={() => setIsCheckoutOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded text-sm sm:text-base" 
                  onClick={() => {
                    // Create transaction and complete
                    const transaction: Transaction = {
                      id: `TXN-${Date.now()}`,
                      companyId: company?.id || '',
                      employeeId: employee?.id,
                      employeeName: employee?.name,
                      customerName: customerName || undefined,
                      customerPhone: customerPhone || undefined,
                      items: cart.items.map(item => ({
                        productId: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        total: item.product.price * item.quantity
                      })),
                      subtotal: cart.getTotal(),
                      tax: 0,
                      discount: 0,
                      total: cart.getTotal(),
                      paymentMethod: 'cash',
                      timestamp: new Date(),
                      status: 'completed'
                    };
                    handleTransactionComplete(transaction);
                    setIsCheckoutOpen(false);
                  }}
                  disabled={!customerName.trim()}
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}