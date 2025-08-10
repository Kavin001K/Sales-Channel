import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Transaction } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getProducts, initializeSampleData, saveTransaction } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Zap, X, CreditCard, DollarSign, Keyboard, Printer, Calculator } from 'lucide-react';
import { toast } from 'sonner';

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
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
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
    initializeSampleData();
    const loadedProducts = getProducts();
    setProducts(loadedProducts);
    setFilteredProducts(loadedProducts);
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

  const handleTransactionComplete = (transaction: Transaction) => {
    saveTransaction(transaction);
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
    
    // Redirect to acebusiness.shop sales page after successful bill completion
    setTimeout(() => {
      window.location.href = 'https://acebusiness.shop/sales';
    }, 1500); // 1.5 second delay to allow printing to complete
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 w-full max-w-md shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Complete Transaction</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base dark:text-white">Total Amount:</span>
                <span className="font-bold text-sm sm:text-base dark:text-white">₹{cart.getTotal().toFixed(2)}</span>
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
                      companyId: '',
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