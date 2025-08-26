import React, { memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface EnhancedCartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  total: number;
  isProcessing?: boolean;
}

// Memoized Cart Item Component
const CartItemComponent = memo(({ 
  item, 
  onUpdateQuantity, 
  onRemoveItem,
  deviceType 
}: { 
  item: CartItem; 
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}) => {
  const handleIncrement = () => onUpdateQuantity(item.product.id, item.quantity + 1);
  const handleDecrement = () => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1));
  const handleRemove = () => onRemoveItem(item.product.id);

  const isMobile = deviceType === 'mobile';
  const itemTotal = item.product.price * item.quantity;

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-3 ${isMobile ? 'mb-2' : 'mb-3'}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 mr-2">
          <h4 className={`font-medium text-gray-800 ${isMobile ? 'text-sm' : 'text-base'}`}>
            {item.product.name}
          </h4>
          <p className="text-xs text-gray-500">₹{item.product.price.toFixed(2)} each</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
          data-testid={`button-remove-${item.product.id}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className={`flex items-center bg-gray-50 rounded-lg ${isMobile ? 'px-1 py-1' : 'px-2 py-1'}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrement}
            className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} p-0 hover:bg-red-50 hover:text-red-600 border-none bg-transparent`}
            data-testid={`button-decrement-${item.product.id}`}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-bold ${isMobile ? 'w-6' : 'w-8'} text-center text-gray-800`}>
            {item.quantity}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrement}
            className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} p-0 hover:bg-green-50 hover:text-green-600 border-none bg-transparent`}
            data-testid={`button-increment-${item.product.id}`}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-right">
          <span className={`font-bold text-green-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
            ₹{itemTotal.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

CartItemComponent.displayName = 'CartItemComponent';

export const EnhancedCartSidebar = memo(({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  total,
  isProcessing = false
}: EnhancedCartSidebarProps) => {
  const { deviceInfo } = useDeviceOptimization();
  const isMobile = deviceInfo.type === 'mobile';
  
  // Calculate subtotal, tax, and totals with memoization
  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% tax
    const grandTotal = subtotal + tax;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);
    
    return { subtotal, tax, grandTotal, itemCount };
  }, [items]);

  const isEmpty = items.length === 0;

  return (
    <div className={`bg-gray-50 border-l border-gray-200 flex flex-col ${isMobile ? 'w-full' : 'w-96'}`} data-testid="enhanced-cart-sidebar">
      {/* Header */}
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
            <h3 className={`font-semibold text-gray-800 ${isMobile ? 'text-base' : 'text-lg'}`}>
              Cart
            </h3>
            {calculations.itemCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {calculations.itemCount}
              </Badge>
            )}
          </div>
          
          {!isEmpty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearCart}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
              data-testid="button-clear-cart"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto billing-scroll-container p-4">
        {isEmpty ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} mx-auto mb-4 text-gray-300`} />
            <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium`}>Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-2">Add products to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <CartItemComponent
                key={item.product.id}
                item={item}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
                deviceType={deviceInfo.type}
              />
            ))}
          </div>
        )}
      </div>

      {/* Totals and Checkout */}
      {!isEmpty && (
        <div className="billing-payment-form bg-white border-t border-gray-200">
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{calculations.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (18%):</span>
              <span className="font-medium">₹{calculations.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className={`flex justify-between font-bold text-green-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              <span>TOTAL:</span>
              <span data-testid="cart-total">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onCheckout}
            disabled={isProcessing}
            className={`billing-button w-full font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${isMobile ? 'py-3 text-base' : 'py-4 text-lg'}`}
            data-testid="button-checkout"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Checkout ₹${total.toFixed(2)}`
            )}
          </Button>
        </div>
      )}
    </div>
  );
});

EnhancedCartSidebar.displayName = 'EnhancedCartSidebar';

export default EnhancedCartSidebar;