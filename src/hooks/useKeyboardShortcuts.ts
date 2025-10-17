import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Command key on Mac
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: Allow Escape key to blur input fields
      if (event.key === 'Escape') {
        target.blur();
        event.preventDefault();
      }
      return;
    }

    for (const shortcut of shortcutsRef.current) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// POS-specific keyboard shortcuts hook
export function usePOSKeyboardShortcuts({
  onSearch,
  onCheckout,
  onClearCart,
  onFocusFirstProduct,
  onToggleCustomerDialog,
}: {
  onSearch: () => void;
  onCheckout: () => void;
  onClearCart: () => void;
  onFocusFirstProduct: () => void;
  onToggleCustomerDialog: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'f',
      meta: true, // Cmd+F on Mac, Ctrl+F on Windows
      description: 'Focus search',
      action: onSearch,
    },
    {
      key: 'f',
      ctrl: true,
      description: 'Focus search (Windows)',
      action: onSearch,
    },
    {
      key: 'Enter',
      meta: true,
      description: 'Checkout',
      action: onCheckout,
    },
    {
      key: 'Enter',
      ctrl: true,
      description: 'Checkout (Windows)',
      action: onCheckout,
    },
    {
      key: 'Delete',
      shift: true,
      description: 'Clear cart',
      action: onClearCart,
    },
    {
      key: 'Backspace',
      shift: true,
      description: 'Clear cart (Mac)',
      action: onClearCart,
    },
    {
      key: 'p',
      description: 'Focus first product',
      action: onFocusFirstProduct,
    },
    {
      key: 'c',
      description: 'Select customer',
      action: onToggleCustomerDialog,
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

// Barcode scanner hook
export function useBarcodeScanner(onScan: (barcode: string) => void, enabled: boolean = true) {
  const barcodeBufferRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Barcode scanners type very fast and end with Enter
      const target = event.target as HTMLElement;

      // Don't capture if user is typing in an input
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Enter') {
        // Barcode complete
        if (barcodeBufferRef.current.length > 0) {
          onScan(barcodeBufferRef.current);
          barcodeBufferRef.current = '';
        }
      } else if (event.key.length === 1) {
        // Single character (alphanumeric)
        barcodeBufferRef.current += event.key;

        // Clear buffer after 100ms of inactivity
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          barcodeBufferRef.current = '';
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, onScan]);
}
