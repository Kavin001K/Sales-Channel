import { CartItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

interface CartSidebarProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  total: number;
  itemCount: number;
}

export const CartSidebar = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onClearCart,
  total,
  itemCount
}: CartSidebarProps) => {
  return (
    <div className="w-96 bg-card border-l border-border h-full flex flex-col">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Cart
          {itemCount > 0 && (
            <Badge variant="secondary">{itemCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Your cart is empty</p>
            <p className="text-sm">Add products to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.product.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        onUpdateQuantity(item.product.id, value);
                      }}
                      className="w-16 text-center h-8"
                      min="1"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                    <div className="text-right">
                      <p className="font-medium">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ₹{item.product.price.toFixed(2)} each
                      </p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {items.length > 0 && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">
              ₹{total.toFixed(2)}
            </span>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Button onClick={onCheckout} className="w-full" size="lg">
              Checkout
            </Button>
            <Button onClick={onClearCart} variant="outline" className="w-full">
              Clear Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};