import React from 'react';
import { PrintableBill } from '@/components/PrintableBill';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { printDriver } from '@/lib/printDrivers';
import { toast } from 'sonner';

export default function BillTestPage() {
  // Sample transaction data for testing
  const sampleTransaction: Transaction = {
    id: 'TXN-' + Date.now(),
    items: [
      {
        product: {
          id: 'prod1',
          name: 'Premium Coffee',
          price: 120.00,
          cost: 60.00,
          sku: 'COFF001',
          category: 'Beverages',
          stock: 50,
          minStock: 5,
          taxRate: 18,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 2
      },
      {
        product: {
          id: 'prod2',
          name: 'Chocolate Cake',
          price: 85.50,
          cost: 40.00,
          sku: 'CAKE002',
          category: 'Desserts',
          stock: 20,
          minStock: 3,
          taxRate: 18,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 1
      },
      {
        product: {
          id: 'prod3',
          name: 'Sandwich Combo',
          price: 150.00,
          cost: 75.00,
          sku: 'SAND003',
          category: 'Food',
          stock: 30,
          minStock: 8,
          taxRate: 18,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: 1
      }
    ],
    subtotal: 475.50,
    tax: 85.59,
    discount: 25.00,
    total: 536.09,
    paymentMethod: 'cash',
    paymentDetails: {
      cashAmount: 600.00,
      change: 63.91
    },
    timestamp: new Date(),
    customerName: 'John Doe',
    customerPhone: '+91 98765 43210',
    status: 'completed'
  };

  const cardTransaction: Transaction = {
    ...sampleTransaction,
    id: 'CARD-' + Date.now(),
    paymentMethod: 'card',
    paymentDetails: {
      cardAmount: 536.09
    },
    receipt: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()
  };

  const handleTestPrint = async (transaction: Transaction) => {
    try {
      const success = await printDriver.print(transaction, { 
        paperSize: 'thermal',
        copies: 1,
        autocut: true,
        cashdraw: false
      });
      
      if (success) {
        toast.success('Print job sent successfully!');
      } else {
        toast.error('Print failed. Please check your printer settings.');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Print error occurred');
    }
  };

  const handleTestA4Print = async (transaction: Transaction) => {
    try {
      const success = await printDriver.print(transaction, { 
        paperSize: 'a4',
        copies: 1,
        autocut: false,
        cashdraw: false
      });
      
      if (success) {
        toast.success('A4 print job sent successfully!');
      } else {
        toast.error('A4 print failed. Please check your printer settings.');
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Print error occurred');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Printable Bill Test Page</h1>
        <p className="text-gray-600">Test and preview the improved printable bill functionality</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cash Transaction Bill</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestPrint(sampleTransaction)}
                  size="sm"
                  variant="outline"
                >
                  Test Print
                </Button>
                <Button 
                  onClick={() => handleTestA4Print(sampleTransaction)}
                  size="sm"
                  variant="outline"
                >
                  A4 Print
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrintableBill 
              transaction={sampleTransaction} 
              showPreview={true}
            />
          </CardContent>
        </Card>

        {/* Card Transaction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Card Transaction Bill</span>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestPrint(cardTransaction)}
                  size="sm"
                  variant="outline"
                >
                  Test Print
                </Button>
                <Button 
                  onClick={() => handleTestA4Print(cardTransaction)}
                  size="sm"
                  variant="outline"
                >
                  A4 Print
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PrintableBill 
              transaction={cardTransaction} 
              showPreview={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Improved Bill Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Thermal Receipt (80mm)</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ <strong>Dark, bold text</strong> for better readability</li>
                <li>✅ <strong>Optimized layout</strong> for 80mm thermal paper</li>
                <li>✅ <strong>Compact design</strong> to minimize paper usage</li>
                <li>✅ <strong>Professional formatting</strong> with clear sections</li>
                <li>✅ <strong>Print-ready</strong> with proper margins</li>
                <li>✅ <strong>GST compliant</strong> with tax breakdown</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">A4 Invoice</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ <strong>Professional layout</strong> for standard printers</li>
                <li>✅ <strong>Detailed item breakdown</strong> with SKU information</li>
                <li>✅ <strong>Company branding</strong> with logo and details</li>
                <li>✅ <strong>Payment details</strong> clearly displayed</li>
                <li>✅ <strong>Tax calculations</strong> properly formatted</li>
                <li>✅ <strong>Print-optimized</strong> for A4 paper</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">For Thermal Printers (PoS Receipts):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "Test Print" to print a sample receipt</li>
                <li>Ensure your thermal printer is set to 80mm paper width</li>
                <li>The receipt will automatically format for thermal paper</li>
                <li>Text is optimized for dark, clear printing</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Standard Printers (A4):</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Click "A4 Print" to print a detailed invoice</li>
                <li>Use standard A4 paper in your printer</li>
                <li>The invoice includes detailed item information</li>
                <li>Professional layout suitable for business records</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Preview and Download:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Use the "Preview" button to see how the bill will look</li>
                <li>Use the "Download" button to save as HTML file</li>
                <li>Test different transaction types (cash/card)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
