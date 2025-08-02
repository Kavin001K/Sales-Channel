import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Transaction } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getProducts, initializeSampleData, saveTransaction } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Zap, X, CreditCard, DollarSign, Keyboard, Printer, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

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

  const DECIMAL_MOUS = ['KGS', 'GMS', 'LTR', 'MLT', 'TON', 'SQM', 'SQF', 'MTR', 'CMS', 'CCM', 'CBM'];
  const isDecimalMoU = (mou: string) => DECIMAL_MOUS.includes(mou.toUpperCase());

  const handleQuickSaleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setSelectedMoU(product.unit || 'PCS');
    setMouValue('');
    setInputErrors({});
    setIsMoUDialogOpen(true);
  };

  const handleMoUDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = parseFloat(mouValue);
      if (!value || value <= 0) {
        setInputErrors({ ...inputErrors, [selectedProduct!.id]: 'Enter a valid quantity' });
        return;
      }
      if (selectedProduct) {
        cart.addItem(selectedProduct, value);
        setIsMoUDialogOpen(false);
        setSelectedProduct(null);
        setMouValue('');
        toast.success(`${selectedProduct.name} added to cart`);
      }
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header - Compact */}
      <header className="bg-blue-800 text-white p-1 sm:p-2 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide">Ace-Bill</h1>
            </div>
            <div className="flex gap-1 sm:gap-2">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'serial'} onChange={() => setSearchType('serial')} />
                <span className={`text-xs sm:text-sm ${searchType === 'serial' ? 'text-blue-200 font-bold' : ''}`}>Serial No.</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'code'} onChange={() => setSearchType('code')} />
                <span className={`text-xs sm:text-sm ${searchType === 'code' ? 'text-blue-200 font-bold' : ''}`}>Item Code</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" checked={searchType === 'name'} onChange={() => setSearchType('name')} />
                <span className={`text-xs sm:text-sm ${searchType === 'name' ? 'text-blue-200 font-bold' : ''}`}>Item Name</span>
              </label>
            </div>
            <div className="flex items-center w-full max-w-xl">
              <input
                className="border rounded-l px-2 sm:px-4 py-1 sm:py-2 w-full text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={`Search by ${searchType === 'serial' ? 'Serial No.' : searchType === 'code' ? 'Item Code' : 'Item Name'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button className="bg-blue-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-r">
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          {/* Bill/Tax Invoice Toggle and Date/Time - Responsive */}
          <div className="flex flex-col items-end min-w-[120px] sm:min-w-[200px]">
            <div className="flex gap-1 sm:gap-2 mb-1 sm:mb-2">
              <button
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-t text-xs sm:text-sm ${invoiceType === 'bill' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setInvoiceType('bill')}
              >
                Bill
              </button>
              <button
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-t text-xs sm:text-sm ${invoiceType === 'tax' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}
                onClick={() => setInvoiceType('tax')}
              >
                Tax Invoice
              </button>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-300">{currentTime.toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <div className="text-sm sm:text-lg font-mono font-bold">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
        {/* Category Sidebar - Compact */}
        <div className="bg-blue-800 text-white w-full lg:w-56 flex flex-col py-2 sm:py-3 px-2 flex-shrink-0 min-h-0 lg:min-h-0">
          <div className="font-bold text-sm sm:text-base mb-2 sm:mb-3 tracking-widest text-center">CATEGORY</div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1 lg:gap-0">
            {categories.map(category => (
              <button
                key={category}
                className={`w-full text-left px-2 sm:px-4 py-2 sm:py-3 mb-1 lg:mb-2 rounded-lg transition font-semibold text-sm sm:text-lg ${selectedCategory === category ? 'bg-white text-blue-800' : 'hover:bg-blue-700'}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Compact */}
        <div className="flex-1 bg-gray-50 p-1 sm:p-2 lg:p-4 overflow-auto min-w-0 min-h-0">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-left">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">Item Name</th>
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm hidden sm:table-cell">Tag</th>
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm">Sale Price</th>
                  <th className="px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm hidden md:table-cell">MRP</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-gray-400 py-8">No products found.</td></tr>
                ) : (
                  displayedProducts.map(product => (
                    <tr
                      key={product.id}
                      className="hover:bg-blue-50 cursor-pointer border-b"
                      onClick={() => handleProductSelect(product, 1)}
                    >
                      <td className="px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm">
                        <div className="max-w-[120px] sm:max-w-none truncate" title={product.name}>
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 sm:hidden">{product.sku || '-'}</div>
                      </td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden sm:table-cell">{product.sku || '-'}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">₹{product.price.toFixed(2)}</td>
                      <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hidden md:table-cell">{product.mrp ? `₹${product.mrp.toFixed(2)}` : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cart/Invoice Panel - Responsive */}
        <div className="w-full lg:w-96 bg-white border-t lg:border-l flex flex-col h-64 lg:h-full flex-shrink-0 min-h-0">
          <div className="p-2 sm:p-4 border-b">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                className="border rounded px-2 py-1 flex-1 text-xs sm:text-sm"
                placeholder="Mobile No."
                value={barcodeQuery}
                onChange={e => setBarcodeQuery(e.target.value)}
              />
              <input
                className="border rounded px-2 py-1 flex-1 text-xs sm:text-sm"
                placeholder="Client Name"
                value={skuQuery}
                onChange={e => setSkuQuery(e.target.value)}
              />
            </div>
          </div>
          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Item Name</th>
                    <th className="text-center">Qty</th>
                    <th className="text-right">Rate</th>
                    <th className="text-right">Amount</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-gray-400 py-8">No items</td></tr>
                  ) : cart.items.map((item, idx) => (
                    <tr key={item.product.id} className="border-b">
                      <td className="max-w-[80px] sm:max-w-none truncate" title={item.product.name}>{item.product.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">₹{item.product.price.toFixed(2)}</td>
                      <td className="text-right">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                      <td className="text-center">
                        <button onClick={() => handleRemoveCartItem(idx)} className="text-red-600 hover:text-red-800"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Bill Summary & Payment */}
          <div className="p-2 sm:p-4 border-t space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Savings</span><span>0.00</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Round Off</span><span>0.00</span>
            </div>
            <div className="flex justify-between text-sm sm:text-lg font-bold">
              <span>Total</span><span>₹{cart.getTotal().toFixed(2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                <input type="radio" name="payment" defaultChecked /> Cash
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
                <input type="radio" name="payment" /> Card
              </label>
              <label className="flex items-center gap-1 cursor-pointer text-xs sm:text-sm">
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
          <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setIsQtyDialogOpen(false)}>&times;</button>
            <h2 className="text-lg sm:text-xl font-bold mb-2">{qtyDialogProduct.name}</h2>
            <div className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">Unit:</span> {qtyDialogProduct.unit || 'PCS'}
            </div>
            {qtyDialogProduct.description && (
              <div className="mb-2 text-xs text-gray-500">{qtyDialogProduct.description}</div>
            )}
            <input
              type="number"
              className="border rounded px-3 sm:px-4 py-2 w-full mb-4 text-sm sm:text-base"
              value={qtyDialogQty}
              onChange={e => setQtyDialogQty(e.target.value)}
              min={isDecimalUnit(qtyDialogProduct.unit || 'PCS') ? '0.001' : '1'}
              step={isDecimalUnit(qtyDialogProduct.unit || 'PCS') ? '0.001' : '1'}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleQtyDialogConfirm(); }}
            />
            {qtyDialogError && (
              <div className="text-red-600 mb-2 text-sm">
                {isDecimalUnit(qtyDialogProduct.unit || 'PCS')
                  ? 'Enter a valid decimal quantity (e.g., 1.25)'
                  : 'Enter a valid whole number quantity (e.g., 2)'}
              </div>
            )}
            <div className="flex gap-2 sm:gap-4">
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded text-sm sm:text-base" onClick={() => setIsQtyDialogOpen(false)}>Cancel</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm sm:text-base" onClick={handleQtyDialogConfirm}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Dialog - Responsive */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-8 w-full max-w-md shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Complete Transaction</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base">Total Amount:</span>
                <span className="font-bold text-sm sm:text-base">₹{cart.getTotal().toFixed(2)}</span>
              </div>
              <div className="flex gap-2 sm:gap-4">
                <button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded text-sm sm:text-base" 
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
                      items: cart.items,
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