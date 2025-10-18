import { useState, useCallback } from 'react';
import Decimal from 'decimal.js';
import { CartItem, Product } from '@/lib/types';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);

      if (existingItem) {
        // Check stock limit before adding more
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          console.warn(`Cannot add more ${product.name}. Stock limit: ${product.stock}`);
          return prevItems;
        }
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      // Check stock for new item
      if (quantity > product.stock) {
        console.warn(`Cannot add ${product.name}. Stock limit: ${product.stock}`);
        return prevItems;
      }

      return [...prevItems, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId) {
          // Check stock limit before updating
          if (quantity > item.product.stock) {
            console.warn(`Cannot set quantity to ${quantity}. Stock limit: ${item.product.stock}`);
            return item; // Keep current quantity
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    if (!Array.isArray(items)) return 0;

    // Use Decimal.js for precise currency calculations
    const total = items.reduce((acc, item) => {
      const price = new Decimal(item.product.price || 0);
      const quantity = new Decimal(item.quantity || 0);
      return acc.plus(price.times(quantity));
    }, new Decimal(0));

    // Return as number with 2 decimal places
    return total.toNumber();
  }, [items]);

  const getItemCount = useCallback(() => {
    return Array.isArray(items) ? items.reduce((count, item) => count + (item.quantity || 0), 0) : 0;
  }, [items]);

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    getItemCount
  };
};