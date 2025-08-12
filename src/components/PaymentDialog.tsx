import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Save, 
  Printer, 
  Calculator,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Smartphone
} from 'lucide-react';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: (paymentData: PaymentData) => void;
  billAmount: number;
  customerName: string;
}

interface PaymentData {
  paymentMethod: 'cash' | 'card' | 'wallet';
  amount: number;
  transactionId?: string;
  lastDigits?: string;
  tenderedAmount?: number;
  change?: number;
}

export default function PaymentDialog({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  billAmount, 
  customerName 
}: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [lastDigits, setLastDigits] = useState('');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [activeTab, setActiveTab] = useState('payment1');

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setTransactionId('');
      setLastDigits('');
      setTenderedAmount('');
      setActiveTab('payment1');
    }
  }, [isOpen]);

  // Calculate change for cash payments
  const change = paymentMethod === 'cash' && tenderedAmount 
    ? parseFloat(tenderedAmount) - billAmount 
    : 0;

  // Handle numeric keypad input
  const handleKeypadInput = (value: string) => {
    if (value === 'CLR') {
      if (paymentMethod === 'cash') {
        setTenderedAmount('');
      } else {
        setAmount('');
      }
      return;
    }

    if (value === 'BACKSPACE') {
      if (paymentMethod === 'cash') {
        setTenderedAmount(prev => prev.slice(0, -1));
      } else {
        setAmount(prev => prev.slice(0, -1));
      }
      return;
    }

    if (value === '.') {
      const currentValue = paymentMethod === 'cash' ? tenderedAmount : amount;
      if (!currentValue.includes('.')) {
        if (paymentMethod === 'cash') {
          setTenderedAmount(prev => prev + '.');
        } else {
          setAmount(prev => prev + '.');
        }
      }
      return;
    }

    // Handle quick amount buttons
    if (['2000', '500', '200', '100'].includes(value)) {
      if (paymentMethod === 'cash') {
        setTenderedAmount(value);
      } else {
        setAmount(value);
      }
      return;
    }

    // Regular number input
    if (paymentMethod === 'cash') {
      setTenderedAmount(prev => prev + value);
    } else {
      setAmount(prev => prev + value);
    }
  };

  // Handle payment completion
  const handlePaymentComplete = (print: boolean = false) => {
    const paymentData: PaymentData = {
      paymentMethod,
      amount: paymentMethod === 'cash' ? billAmount : parseFloat(amount) || 0,
      transactionId: transactionId || undefined,
      lastDigits: lastDigits || undefined,
      tenderedAmount: paymentMethod === 'cash' ? parseFloat(tenderedAmount) || 0 : undefined,
      change: paymentMethod === 'cash' ? change : undefined
    };

    onPaymentComplete(paymentData);
    
    if (print) {
      // Trigger print functionality
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  // Validate payment
  const isValidPayment = () => {
    if (paymentMethod === 'cash') {
      return parseFloat(tenderedAmount) >= billAmount;
    } else {
      return parseFloat(amount) > 0 && parseFloat(amount) <= billAmount;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Payment</DialogTitle>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Left Panel - Payment Details */}
          <div className="flex-1 p-6 border-r border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="payment1" className="text-sm font-medium">Payment 1</TabsTrigger>
                <TabsTrigger value="payment2" className="text-sm font-medium">Payment 2</TabsTrigger>
              </TabsList>

              <TabsContent value="payment1" className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Mode</Label>
                  <Select value={paymentMethod} onValueChange={(value: 'cash' | 'card' | 'wallet') => setPaymentMethod(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash" className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>Cash</span>
                      </SelectItem>
                      <SelectItem value="card" className="flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Card Payment</span>
                      </SelectItem>
                      <SelectItem value="wallet" className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile Wallet</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Transaction ID */}
                  {paymentMethod !== 'cash' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Txn. ID</Label>
                      <Input
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter transaction ID"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Last 5 Digits for Card */}
                  {paymentMethod === 'card' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last 5 Digits</Label>
                      <Input
                        value={lastDigits}
                        onChange={(e) => setLastDigits(e.target.value)}
                        placeholder="Enter last 5 digits"
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Amount Input */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {paymentMethod === 'cash' ? 'Tendered' : 'Amount'}
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <Input
                        value={paymentMethod === 'cash' ? tenderedAmount : amount}
                        onChange={(e) => {
                          if (paymentMethod === 'cash') {
                            setTenderedAmount(e.target.value);
                          } else {
                            setAmount(e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        className="pl-8 text-lg font-medium"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Transaction Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bill Amount:</span>
                    <span className="font-semibold">₹{billAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-green-600">
                      ₹{paymentMethod === 'cash' ? (parseFloat(tenderedAmount) || 0).toFixed(2) : (parseFloat(amount) || 0).toFixed(2)}
                    </span>
                  </div>
                  {paymentMethod === 'cash' && change > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Change:</span>
                      <span className="font-semibold text-blue-600">₹{change.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={() => handlePaymentComplete(false)}
                    disabled={!isValidPayment()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                  <Button
                    onClick={() => handlePaymentComplete(true)}
                    disabled={!isValidPayment()}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Save n Print</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="payment2" className="text-center py-8">
                <p className="text-gray-500">Split payment functionality coming soon...</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Numeric Keypad */}
          <div className="w-80 p-6 bg-gray-50">
            <div className="grid grid-cols-4 gap-3">
              {/* Quick Amount Buttons */}
              <Button
                onClick={() => handleKeypadInput('2000')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                2000
              </Button>
              <Button
                onClick={() => handleKeypadInput('500')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                500
              </Button>
              <Button
                onClick={() => handleKeypadInput('200')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                200
              </Button>
              <Button
                onClick={() => handleKeypadInput('100')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                100
              </Button>

              {/* Numeric Keypad */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <Button
                  key={num}
                  onClick={() => handleKeypadInput(num.toString())}
                  className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
                >
                  {num}
                </Button>
              ))}

              {/* Special Buttons */}
              <Button
                onClick={() => handleKeypadInput('BACKSPACE')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => handleKeypadInput('0')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
              >
                0
              </Button>
              <Button
                onClick={() => handleKeypadInput('.')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg"
              >
                .
              </Button>
              <Button
                onClick={() => handleKeypadInput('CLR')}
                className="h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                CLR
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="bg-gray-100 px-6 py-3 flex justify-between items-center border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Calculator className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">Balance:</span>
            <span className="font-semibold text-gray-800">
              ₹{paymentMethod === 'cash' ? change.toFixed(2) : (billAmount - (parseFloat(amount) || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
