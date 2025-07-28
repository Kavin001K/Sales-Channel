import { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product, qty: number) => void;
  searchQuery?: string;
}

// Add a function to determine if a unit is decimal-based
const DECIMAL_UNITS = ['KGS', 'GMS', 'LTR', 'MLT', 'TON', 'SQM', 'SQF', 'MTR', 'CMS', 'CCM', 'CBM'];
const isDecimalUnit = (unit: string) => DECIMAL_UNITS.includes((unit || '').toUpperCase());

export const ProductGrid = ({ products, onProductSelect, searchQuery = '' }: ProductGridProps) => {
  const [weights, setWeights] = useState<{ [productId: string]: number }>({});

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredProducts.map((product) => {
        const unit = product.unit || 'PCS';
        const isDecimal = isDecimalUnit(unit);
        const qty = weights[product.id] || 1;
        const priceForQty = product.price * qty;
        return (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-primary">
                  ₹{priceForQty.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`qty-${product.id}`}>Quantity ({unit}):</Label>
                <Input
                  id={`qty-${product.id}`}
                  type="number"
                  min={isDecimal ? '0.01' : '1'}
                  step={isDecimal ? '0.01' : '1'}
                  value={qty}
                  onChange={e => {
                    const val = isDecimal ? parseFloat(e.target.value) : parseInt(e.target.value);
                    setWeights(w => ({ ...w, [product.id]: isNaN(val) ? 0 : val }));
                  }}
                  className="w-24"
                />
              </div>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              <Button
                onClick={() => onProductSelect(product, qty)}
                className="w-full"
                disabled={product.stock <= 0 || qty <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};