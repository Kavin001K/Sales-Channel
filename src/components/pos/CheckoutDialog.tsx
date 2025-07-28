import { useState, useEffect } from 'react';
import { CartItem, Transaction, Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, User, Phone, Printer } from 'lucide-react';
import { getCustomers, saveCustomer } from '@/lib/storage';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { printDriver } from '@/lib/printDrivers';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onComplete: (transaction: Transaction) => void;
}

export const CheckoutDialog = ({
  isOpen,
  onClose,
  items,
  total,
  onComplete
}: CheckoutDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cardTransactionId, setCardTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const { companySettings, printSettings, refreshSettings } = useSettings();
  const navigate = useNavigate();

  // Auto-fetch customer details when phone number is entered
  useEffect(() => {
    if (customerPhone.length === 10) {
      const customers = getCustomers();
      const foundCustomer = customers.find(c => c.phone === customerPhone);
      if (foundCustomer) {
        setCustomer(foundCustomer);
        setCustomerName(foundCustomer.name);
      } else {
        setCustomer(null);
      }
    } else {
      setCustomer(null);
    }
  }, [customerPhone]);

  const printInvoice = async (transaction: Transaction) => {
    await printDriver.print(transaction, { paperSize: printSettings.paperSize });
  };

  const handleComplete = async () => {
    // Validation
    if (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) {
      return;
    }
    if (paymentMethod === 'card' && (!cardTransactionId || cardTransactionId.length < 4)) {
      return;
    }

    setIsProcessing(true);
    
    // Create or update customer if phone number provided
    let customerId = customer?.id;
    if (customerPhone && customerName) {
      if (!customer) {
        const newCustomer: Customer = {
          id: Date.now().toString(),
          name: customerName,
          phone: customerPhone,
          loyaltyPoints: 0,
          totalSpent: total,
          visits: 1,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        saveCustomer(newCustomer);
        customerId = newCustomer.id;
      } else {
        // Update existing customer
        const updatedCustomer = {
          ...customer,
          totalSpent: customer.totalSpent + total,
          visits: customer.visits + 1,
          updatedAt: new Date()
        };
        saveCustomer(updatedCustomer);
      }
    }
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const cashAmountPaid = paymentMethod === 'cash' ? parseFloat(cashAmount) : 0;
    const change = paymentMethod === 'cash' ? cashAmountPaid - total : 0;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      items,
      subtotal: total,
      tax: 0,
      discount: 0,
      total,
      paymentMethod,
      paymentDetails: {
        ...(paymentMethod === 'cash' && {
          cashAmount: cashAmountPaid,
          change: change > 0 ? change : 0
        }),
        ...(paymentMethod === 'card' && {
          cardAmount: total
        })
      },
      timestamp: new Date(),
      customerId,
      customerName: customerName || undefined,
      receipt: paymentMethod === 'card' ? cardTransactionId : undefined,
      status: 'completed'
    };
    
    onComplete(transaction);
    setLastTransaction(transaction);
    
    // Print invoice
    await printInvoice(transaction);
    
    setIsProcessing(false);
    
    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCashAmount('');
    setCardTransactionId('');
    setPaymentMethod('cash');
    setCustomer(null);
    onClose();
  };

  const cashAmountFloat = parseFloat(cashAmount) || 0;
  const change = paymentMethod === 'cash' && cashAmountFloat > total ? cashAmountFloat - total : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none flex items-center justify-center bg-white">
        <div className="w-full max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete the transaction
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-2">
              <h4 className="font-medium">Order Summary</h4>
              <div className="space-y-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name} x{item.quantity}</span>
                    <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer-phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Customer Phone Number
                </Label>
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
                {customer && (
                  <div className="text-sm text-green-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Existing customer found: {customer.name}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  disabled={!!customer}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Cash
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Card
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label htmlFor="cash-amount">Cash Amount Received</Label>
                <Input
                  id="cash-amount"
                  type="number"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="Enter amount received"
                />
                {change > 0 && (
                  <div className="text-sm text-green-600">
                    Change to return: ₹{change.toFixed(2)}
                  </div>
                )}
                {cashAmountFloat > 0 && cashAmountFloat < total && (
                  <div className="text-sm text-red-600">
                    Insufficient amount. Need ₹{(total - cashAmountFloat).toFixed(2)} more.
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-2">
                <Label htmlFor="transaction-id">Last 4 digits of Transaction ID</Label>
                <Input
                  id="transaction-id"
                  value={cardTransactionId}
                  onChange={(e) => setCardTransactionId(e.target.value)}
                  placeholder="Enter last 4 digits"
                  maxLength={4}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleComplete} 
                disabled={
                  isProcessing || 
                  (paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)) ||
                  (paymentMethod === 'card' && (!cardTransactionId || cardTransactionId.length < 4))
                } 
                className="flex-1"
              >
                <Printer className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Complete & Print'}
              </Button>
              {lastTransaction && (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await printDriver.print(lastTransaction, { paperSize: printSettings.paperSize });
                  }}
                  className="flex-1"
                >
                  Download PDF
                </Button>
              )}
            </div>
            
            {/* Debug: Test Settings */}
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={() => navigate('/create-invoice')}>
                Generate Invoice
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};