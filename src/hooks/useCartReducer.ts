import { useReducer, useCallback, useMemo } from 'react';
import { CartItem, Product } from '@/lib/types';
import Decimal from 'decimal.js';

// Configure Decimal.js for currency calculations (2 decimal places)
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });

interface CartState {
  items: CartItem[];
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  customerId?: string;
  employeeId?: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_DISCOUNT_PERCENT'; payload: number }
  | { type: 'SET_DISCOUNT_AMOUNT'; payload: number }
  | { type: 'SET_TAX_PERCENT'; payload: number }
  | { type: 'SET_CUSTOMER'; payload: string | undefined }
  | { type: 'SET_EMPLOYEE'; payload: string | undefined }
  | { type: 'APPLY_LOYALTY_DISCOUNT'; payload: number };

const initialState: CartState = {
  items: [],
  discountPercent: 0,
  discountAmount: 0,
  taxPercent: 18, // Default 18% GST
  customerId: undefined,
  employeeId: undefined,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id
      );

      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        // Stock validation
        if (newQuantity > product.stock) {
          console.warn(`Cannot add more ${product.name}. Stock limit: ${product.stock}`);
          return state;
        }

        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
        };

        return { ...state, items: newItems };
      } else {
        // New item
        if (quantity > product.stock) {
          console.warn(`Cannot add ${product.name}. Stock limit: ${product.stock}`);
          return state;
        }

        return {
          ...state,
          items: [...state.items, { product, quantity }],
        };
      }
    }

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }

      const newItems = state.items.map(item => {
        if (item.product.id === productId) {
          // Stock validation
          if (quantity > item.product.stock) {
            console.warn(`Cannot set quantity to ${quantity}. Stock limit: ${item.product.stock}`);
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });

      return { ...state, items: newItems };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== action.payload.productId),
      };
    }

    case 'CLEAR_CART': {
      return { ...initialState, taxPercent: state.taxPercent };
    }

    case 'SET_DISCOUNT_PERCENT': {
      return {
        ...state,
        discountPercent: Math.max(0, Math.min(100, action.payload)),
        discountAmount: 0, // Clear fixed discount when setting percentage
      };
    }

    case 'SET_DISCOUNT_AMOUNT': {
      return {
        ...state,
        discountAmount: Math.max(0, action.payload),
        discountPercent: 0, // Clear percentage when setting fixed amount
      };
    }

    case 'SET_TAX_PERCENT': {
      return {
        ...state,
        taxPercent: Math.max(0, Math.min(100, action.payload)),
      };
    }

    case 'SET_CUSTOMER': {
      return { ...state, customerId: action.payload };
    }

    case 'SET_EMPLOYEE': {
      return { ...state, employeeId: action.payload };
    }

    case 'APPLY_LOYALTY_DISCOUNT': {
      // Apply loyalty discount as percentage
      return {
        ...state,
        discountPercent: action.payload,
        discountAmount: 0,
      };
    }

    default:
      return state;
  }
}

export function useCartReducer() {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Actions
  const addItem = useCallback((product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const setDiscountPercent = useCallback((percent: number) => {
    dispatch({ type: 'SET_DISCOUNT_PERCENT', payload: percent });
  }, []);

  const setDiscountAmount = useCallback((amount: number) => {
    dispatch({ type: 'SET_DISCOUNT_AMOUNT', payload: amount });
  }, []);

  const setTaxPercent = useCallback((percent: number) => {
    dispatch({ type: 'SET_TAX_PERCENT', payload: percent });
  }, []);

  const setCustomer = useCallback((customerId: string | undefined) => {
    dispatch({ type: 'SET_CUSTOMER', payload: customerId });
  }, []);

  const setEmployee = useCallback((employeeId: string | undefined) => {
    dispatch({ type: 'SET_EMPLOYEE', payload: employeeId });
  }, []);

  const applyLoyaltyDiscount = useCallback((discountPercent: number) => {
    dispatch({ type: 'APPLY_LOYALTY_DISCOUNT', payload: discountPercent });
  }, []);

  // Calculations using Decimal.js for precision
  const calculations = useMemo(() => {
    // Subtotal (before discounts and tax)
    const subtotal = state.items.reduce((total, item) => {
      const itemTotal = new Decimal(item.product.price).times(item.quantity);
      return total.plus(itemTotal);
    }, new Decimal(0));

    // Discount calculation
    let discountValue = new Decimal(0);
    if (state.discountPercent > 0) {
      discountValue = subtotal.times(state.discountPercent).dividedBy(100);
    } else if (state.discountAmount > 0) {
      discountValue = new Decimal(state.discountAmount);
    }

    // Subtotal after discount
    const subtotalAfterDiscount = subtotal.minus(discountValue);

    // Tax calculation
    const taxValue = subtotalAfterDiscount.times(state.taxPercent).dividedBy(100);

    // Total
    const total = subtotalAfterDiscount.plus(taxValue);

    // Item count
    const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

    return {
      subtotal: subtotal.toDecimalPlaces(2).toNumber(),
      discount: discountValue.toDecimalPlaces(2).toNumber(),
      subtotalAfterDiscount: subtotalAfterDiscount.toDecimalPlaces(2).toNumber(),
      tax: taxValue.toDecimalPlaces(2).toNumber(),
      total: total.toDecimalPlaces(2).toNumber(),
      itemCount,
    };
  }, [state.items, state.discountPercent, state.discountAmount, state.taxPercent]);

  return {
    // State
    items: state.items,
    discountPercent: state.discountPercent,
    discountAmount: state.discountAmount,
    taxPercent: state.taxPercent,
    customerId: state.customerId,
    employeeId: state.employeeId,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setDiscountPercent,
    setDiscountAmount,
    setTaxPercent,
    setCustomer,
    setEmployee,
    applyLoyaltyDiscount,

    // Calculated values
    ...calculations,
  };
}
