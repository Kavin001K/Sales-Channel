import React, { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeviceOptimization } from '../../hooks/useDeviceOptimization';
import { measureRenderTime } from '../../utils/performance';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sku?: string;
  barcode?: string;
}

interface MobileBillingLayoutProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  searchQuery: string;
  selectedCategory: string;
}

// Memoized Product Card for performance
const ProductCard = memo(({ product, onSelect }: { 
  product: Product; 
  onSelect: (product: Product) => void; 
}) => {
  const handleSelect = () => onSelect(product);

  return (
    <Card
      className="billing-product-card cursor-pointer touch-friendly billing-animation-optimized"
      onClick={handleSelect}
      data-testid={`product-card-${product.id}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1 mr-2">
            {product.name}
          </h3>
          <Badge 
            variant={product.stock > 0 ? "default" : "destructive"} 
            className="text-xs flex-shrink-0"
          >
            {product.stock > 0 ? `${product.stock}` : 'Out'}
          </Badge>
        </div>
        
        <p className="text-xs text-gray-500 mb-3">
          {product.sku || product.barcode || 'No SKU'}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-green-600">
            ₹{product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-400">
            {product.category}
          </span>
        </div>
      </div>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

// Virtualized Product Grid for large datasets
const VirtualizedProductGrid = memo(({ 
  products, 
  onProductSelect,
  chunkSize = 20 
}: {
  products: Product[];
  onProductSelect: (product: Product) => void;
  chunkSize?: number;
}) => {
  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < products.length; i += chunkSize) {
      result.push(products.slice(i, i + chunkSize));
    }
    return result;
  }, [products, chunkSize]);

  return (
    <div className="billing-product-grid">
      {chunks.map((chunk, chunkIndex) => (
        <div key={chunkIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {chunk.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

VirtualizedProductGrid.displayName = 'VirtualizedProductGrid';

export const MobileBillingLayout = memo(({
  products,
  onProductSelect,
  searchQuery,
  selectedCategory
}: MobileBillingLayoutProps) => {
  const { deviceInfo, optimizations } = useDeviceOptimization();
  const endRenderTimer = measureRenderTime('MobileBillingLayout');

  // Filter products with memoization for performance
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  // Performance optimization based on device
  const shouldUseVirtualization = optimizations.shouldVirtualize && filteredProducts.length > 50;
  
  React.useEffect(() => {
    endRenderTimer();
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="billing-loading text-center py-12 text-gray-500">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">📦</span>
        </div>
        <p className="text-lg font-medium">No products found</p>
        <p className="text-sm text-gray-400 mt-2">
          Try adjusting your search or category filter
        </p>
      </div>
    );
  }

  return (
    <div className="billing-scroll-container p-4">
      {deviceInfo.type === 'mobile' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            📱 Optimized for mobile • {filteredProducts.length} products
          </p>
        </div>
      )}
      
      {shouldUseVirtualization ? (
        <VirtualizedProductGrid
          products={filteredProducts}
          onProductSelect={onProductSelect}
          chunkSize={optimizations.chunkSize}
        />
      ) : (
        <div className="billing-product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
});

MobileBillingLayout.displayName = 'MobileBillingLayout';

export default MobileBillingLayout;