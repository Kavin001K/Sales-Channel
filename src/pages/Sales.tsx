import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Transaction } from '@/lib/types';
import { useCart } from '@/hooks/useCart';
import { getProducts, initializeSampleData, saveTransaction } from '@/lib/storage';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartSidebar } from '@/components/pos/CartSidebar';
import { CheckoutDialog } from '@/components/pos/CheckoutDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, Zap, X } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([]);
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

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

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
    setProducts(getProducts());
  }, []);

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
  };

  // Enhanced search logic
  const filteredProducts = products.filter(product => {
    const matchesName = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBarcode = barcodeQuery && product.barcode ? product.barcode.includes(barcodeQuery) : true;
    const matchesSKU = skuQuery && product.sku ? product.sku.toLowerCase().includes(skuQuery.toLowerCase()) : true;
    // If barcode or SKU query is present, prioritize those
    if (barcodeQuery) return matchesBarcode;
    if (skuQuery) return matchesSKU;
    return matchesName;
  });

  // Helper: MoUs that allow decimals (weight/volume)
  const DECIMAL_MOUS = ['KGS', 'GMS', 'LTR', 'MLT', 'TON', 'SQM', 'SQF', 'MTR', 'CMS', 'CCM', 'CBM'];
  const isDecimalMoU = (mou: string) => DECIMAL_MOUS.includes(mou.toUpperCase());

  // Helper: MoUs with sub-units
  const MOU_SUBUNITS = {
    KGS: { label: 'kg', sub: 'gm', factor: 1000 },
    LTR: { label: 'ltr', sub: 'ml', factor: 1000 },
    MTR: { label: 'mtr', sub: 'cm', factor: 100 },
    // Add more as needed
  };

  const [mainQty, setMainQty] = useState('');
  const [subQty, setSubQty] = useState('');

  // Add quantity/unit input to each product card in the Quick Sale grid
  const handleQuickSaleProductClick = (product: Product) => {
    const isDecimal = isDecimalMoU(product.unit || '');
    return (
      <div
        key={product.id}
        className="bg-white rounded shadow hover:shadow-lg p-4 flex flex-col border border-gray-200 transition"
      >
        <div className="font-bold text-lg mb-1">{product.name}</div>
        <div className="text-xs text-gray-500 mb-2">{product.category}</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-bold text-blue-700">₹{product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-500">Stock: {product.stock}</span>
        </div>
        <div className="text-xs text-gray-500 mb-2">SKU: {product.sku || '-'}</div>
        <div className="text-xs text-gray-500 mb-2">Barcode: {product.barcode || '-'}</div>
        <div className="text-xs text-gray-500 mb-2">Unit: {product.unit || 'PCS'}</div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min={isDecimal ? '0.01' : '1'}
            step={isDecimal ? '0.01' : '1'}
            value={qtyInputs[product.id] || '1'}
            onChange={e => setQtyInputs(inputs => ({ ...inputs, [product.id]: e.target.value }))}
            className="border rounded px-2 py-1 w-20 text-right"
          />
          <span className="text-xs">{product.unit || 'pcs'}</span>
          <Button
            size="sm"
            onClick={() => {
              const qty = isDecimal ? parseFloat(qtyInputs[product.id] || '1') : parseInt(qtyInputs[product.id] || '1');
              if (!qty || qty <= 0) return;
              cart.addItem({ ...product, unit: product.unit || 'PCS' }, qty);
              setQtyInputs(inputs => ({ ...inputs, [product.id]: '1' }));
            }}
          >Add</Button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isMoUDialogOpen && MOU_SUBUNITS[selectedMoU]) {
      setMainQty('');
      setSubQty('');
    }
  }, [isMoUDialogOpen, selectedMoU]);

  const handleMoUDialogKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsMoUDialogOpen(false);
    if (e.key === 'Enter') {
      let qty = 0;
      if (MOU_SUBUNITS[selectedMoU.toUpperCase()]) {
        qty = (parseFloat(mainQty) || 0) + (parseFloat(subQty) || 0) / MOU_SUBUNITS[selectedMoU.toUpperCase()].factor;
      } else {
        qty = isDecimalMoU(selectedMoU) ? parseFloat(mouValue) : parseInt(mouValue);
      }
      if (qty > 0) {
        cart.addItem({ ...selectedProduct!, unit: selectedMoU }, qty);
        setIsMoUDialogOpen(false);
      }
    }
  };

  // Add remove handler
  const handleRemoveCartItem = (idx: number) => {
    cart.removeItem(idx);
  };

  const availableStock = selectedProduct ? selectedProduct.stock : 0;

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-wide">Ace-Bill Sales Terminal</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 text-lg h-12"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Scan or enter barcode..."
                  value={barcodeQuery}
                  onChange={(e) => setBarcodeQuery(e.target.value)}
                  className="w-48 text-lg h-12"
                  autoFocus
                />
                <Input
                  placeholder="Enter SKU / Serial Number..."
                  value={skuQuery}
                  onChange={(e) => setSkuQuery(e.target.value)}
                  className="w-48 text-lg h-12"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {/* Removed Quick Sale button */}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <ProductGrid
            products={filteredProducts}
            onProductSelect={handleProductSelect}
            searchQuery={searchQuery}
          />
        </div>

        {/* Cart Sidebar */}
        <CartSidebar
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={handleRemoveCartItem}
          onCheckout={handleCheckout}
          onClearCart={cart.clearCart}
          total={cart.getTotal()}
          itemCount={cart.getItemCount()}
        />
      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart.items}
        total={cart.getTotal()}
        onComplete={handleTransactionComplete}
      />
      {isQtyDialogOpen && qtyDialogProduct && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-8 min-w-[350px] relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl" onClick={() => setIsQtyDialogOpen(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-2">{qtyDialogProduct.name}</h2>
            <div className="mb-2 text-sm text-gray-500">{qtyDialogProduct.category}</div>
            <div className="mb-2">Price: <span className="font-bold">₹{qtyDialogProduct.price.toFixed(2)}</span> per {qtyDialogProduct.unit || 'PCS'}</div>
            <div className="mb-2">Stock: {qtyDialogProduct.stock}</div>
            <div className="mb-4">{qtyDialogProduct.description}</div>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor="qty-input" className="font-medium">Quantity</label>
                    <input
                id="qty-input"
                              type="number"
                min={isDecimalUnit(qtyDialogProduct.unit || '') ? '0.01' : '1'}
                step={isDecimalUnit(qtyDialogProduct.unit || '') ? '0.01' : '1'}
                value={qtyDialogQty}
                onChange={e => setQtyDialogQty(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleQtyDialogConfirm(); }}
                className="border rounded px-2 py-1 w-24 text-right"
                      autoFocus
                    />
              <span className="text-xs">{qtyDialogProduct.unit || 'PCS'}</span>
            </div>
            {qtyDialogError && <div className="text-xs text-red-600 mb-2">{qtyDialogError}</div>}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 rounded" onClick={() => setIsQtyDialogOpen(false)}>Cancel</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded" onClick={handleQtyDialogConfirm}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}