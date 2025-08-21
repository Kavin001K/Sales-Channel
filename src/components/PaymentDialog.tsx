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

export interface PaymentPart {
  method: 'cash' | 'card' | 'wallet';
  amount: number;            // numeric input for this part
  txnId?: string;            // non-cash
  lastDigits?: string;       // card only
}

export interface PaymentData {
  parts: PaymentPart[];
}

export default function PaymentDialog({ 
  isOpen, 
  onClose, 
  onPaymentComplete, 
  billAmount, 
  customerName 
}: PaymentDialogProps) {
  const [activeTab, setActiveTab] = useState('payment1');
  const [parts, setParts] = useState<PaymentPart[]>([
    { method: 'cash', amount: 0 },
    { method: 'card', amount: 0 }
  ]);
  // txnId/lastDigits are stored directly on parts[index]

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setParts([{ method: 'cash', amount: 0 }, { method: 'card', amount: 0 }]);
      setActiveTab('payment1');
    }
  }, [isOpen]);

  const totalPaid = parts.reduce((s, p) => s + (isNaN(p.amount) ? 0 : p.amount), 0);
  const remaining = Math.max(0, billAmount - totalPaid);

  const updatePart = (index: number, updated: PaymentPart) => {
    setParts(prev => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  // Handle numeric keypad input for current tab
  const handleKeypadInput = (value: string) => {
    const idx = activeTab === 'payment1' ? 0 : 1;
    const current = parts[idx] || { method: 'cash', amount: 0 };
    let str = (current.amount ?? 0).toString();
    if (str === '0') str = '';

    if (value === 'CLR') {
      updatePart(idx, { ...current, amount: 0 });
      return;
    }
    if (value === 'BACKSPACE') {
      const next = str.slice(0, -1);
      updatePart(idx, { ...current, amount: parseFloat(next || '0') });
      return;
    }
    if (value === '.') {
      if (!str.includes('.')) {
        const next = (str || '') + '.';
        updatePart(idx, { ...current, amount: parseFloat(next || '0') });
      }
      return;
    }
    if (['2000', '500', '200', '100'].includes(value)) {
      updatePart(idx, { ...current, amount: parseFloat(value) });
      return;
    }
    const next = (str || '') + value;
    updatePart(idx, { ...current, amount: parseFloat(next) });
  };

  // Handle payment completion
  const handlePaymentComplete = (print: boolean = false) => {
    const paymentData: PaymentData = { parts };
    onPaymentComplete(paymentData);
    
    if (print) {
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  const isValidPayment = () => totalPaid >= billAmount - 0.01;

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
                <TabsTrigger value="payment1" className="text-sm font-medium">Payment A</TabsTrigger>
                <TabsTrigger value="payment2" className="text-sm font-medium">Payment B</TabsTrigger>
              </TabsList>

              <TabsContent value="payment1" className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Mode</Label>
                  <Select value={parts[0]?.method || 'cash'} onValueChange={(value: 'cash' | 'card' | 'wallet') => updatePart(0, { ...parts[0], method: value })}>
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
                  {parts[0]?.method !== 'cash' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Txn. ID</Label>
                      <Input
                        value={parts[0]?.txnId || ''}
                        onChange={(e) => updatePart(0, { ...parts[0], txnId: e.target.value })}
                        placeholder="Enter transaction ID"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Last 5 Digits for Card */}
                  {parts[0]?.method === 'card' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last 5 Digits</Label>
                      <Input
                        value={parts[0]?.lastDigits || ''}
                        onChange={(e) => updatePart(0, { ...parts[0], lastDigits: e.target.value })}
                        placeholder="Enter last 5 digits"
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Amount Input (keyboard-enabled) */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      {parts[0]?.method === 'cash' ? 'Tendered' : 'Amount'}
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <Input
                        value={(parts[0]?.amount ?? 0).toString()}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, '');
                          updatePart(0, { ...parts[0], amount: parseFloat(v || '0') });
                        }}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-8 text-lg font-medium"
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
                    <span className="text-sm text-gray-600">Paid (all parts):</span>
                    <span className="font-semibold text-green-600">₹{totalPaid.toFixed(2)}</span>
                  </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining:</span>
                    <span className={`font-semibold ${remaining > 0 ? 'text-orange-600' : 'text-blue-600'}`}>₹{remaining.toFixed(2)}</span>
                    </div>
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

              {/* Split payment second part */}
              <TabsContent value="payment2" className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Mode</Label>
                  <Select value={parts[1]?.method || 'card'} onValueChange={(value: 'cash' | 'card' | 'wallet') => updatePart(1, { ...parts[1], method: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                      <SelectItem value="wallet">Mobile Wallet</SelectItem>
                    </SelectContent>
                  </Select>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Amount</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <Input
                        value={(parts[1]?.amount ?? 0).toString()}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9.]/g, '');
                          updatePart(1, { ...parts[1], amount: parseFloat(v || '0') });
                        }}
                        inputMode="decimal"
                        placeholder="0.00"
                        className="pl-8 text-lg font-medium"
                      />
                    </div>
                  </div>

                  {/* Transaction ID for non-cash */}
                  {parts[1]?.method !== 'cash' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Txn. ID</Label>
                      <Input
                        value={parts[1]?.txnId || ''}
                        onChange={(e) => updatePart(1, { ...parts[1], txnId: e.target.value })}
                        placeholder="Enter transaction ID"
                        className="mt-1"
                      />
                    </div>
                  )}

                  {/* Last digits for card */}
                  {parts[1]?.method === 'card' && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last 5 Digits</Label>
                      <Input
                        value={parts[1]?.lastDigits || ''}
                        onChange={(e) => updatePart(1, { ...parts[1], lastDigits: e.target.value })}
                        placeholder="Enter last 5 digits"
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
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
            <span className="text-sm text-gray-600">Remaining:</span>
            <span className={`font-semibold ${remaining > 0 ? 'text-orange-700' : 'text-green-700'}`}>₹{remaining.toFixed(2)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
