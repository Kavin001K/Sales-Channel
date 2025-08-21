import React from 'react';
import { Transaction } from '@/lib/types';
import { getCompanySettings, getPrintSettings } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Eye, Download } from 'lucide-react';

interface PrintableBillProps {
  transaction: Transaction;
  onPrint?: () => void;
  showPreview?: boolean;
}

export const PrintableBill: React.FC<PrintableBillProps> = ({
  transaction,
  onPrint,
  showPreview = true
}) => {
  const companySettings = getCompanySettings();
  const printSettings = getPrintSettings();

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print behavior
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const receiptHTML = generateReceiptHTML();
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
    }
  };

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${transaction.id}</title>
          <style>
            * { 
              margin: 0; 
              padding: 0; 
              box-sizing: border-box; 
              color: #000 !important;
            }
            body {
              font-family: 'Courier New', monospace;
              width: 80mm;
              margin: 0;
              padding: 5mm;
              font-size: 11px;
              line-height: 1.2;
              background: white;
              color: #000;
              font-weight: 500;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 14px; font-weight: bold; }
            .medium { font-size: 12px; }
            .small { font-size: 10px; }
            .line { 
              border-bottom: 1px solid #000; 
              margin: 3px 0; 
              height: 1px;
              background: #000;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              margin: 2px 0; 
              align-items: center;
            }
            .item-row {
              margin: 3px 0;
              border-bottom: 1px dotted #333;
              padding-bottom: 2px;
            }
            .item-name {
              font-weight: bold;
              margin-bottom: 1px;
            }
            .item-details {
              font-size: 9px;
              color: #333;
              margin-left: 2px;
            }
            .total-section {
              border-top: 2px solid #000;
              margin-top: 5px;
              padding-top: 5px;
            }
            .payment-info {
              background: #f0f0f0;
              padding: 3px;
              margin: 5px 0;
              border: 1px solid #000;
            }
            .footer-text {
              text-align: center;
              margin-top: 8px;
              font-size: 9px;
              color: #333;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            @media print {
              body { 
                margin: 0 !important; 
                padding: 2mm !important; 
                width: 80mm !important;
                font-size: 11px !important;
                color: #000 !important;
                background: white !important;
              }
              @page { 
                margin: 0 !important; 
                size: 80mm auto !important;
              }
              * {
                color: #000 !important;
                background: transparent !important;
              }
              .payment-info {
                background: #f0f0f0 !important;
                border: 1px solid #000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="large">${companySettings.name}</div>
            <div class="small">${companySettings.address}</div>
            <div class="small">Phone: ${companySettings.phone}</div>
            ${companySettings.email ? `<div class="small">Email: ${companySettings.email}</div>` : ''}
            ${companySettings.taxId ? `<div class="small">GST: ${companySettings.taxId}</div>` : ''}
          </div>
          
          <div class="line"></div>
          
          <div class="medium">
            <div class="row">
              <span>Receipt #:</span>
              <span>${transaction.id.slice(-8)}</span>
            </div>
            <div class="row">
              <span>Date:</span>
              <span>${new Date(transaction.timestamp).toLocaleDateString()}</span>
            </div>
            <div class="row">
              <span>Time:</span>
              <span>${new Date(transaction.timestamp).toLocaleTimeString()}</span>
            </div>
            ${transaction.customerName ? `
              <div class="row">
                <span>Customer:</span>
                <span>${transaction.customerName}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="line"></div>
          
          ${transaction.items.map(item => `
            <div class="item-row">
              <div class="item-name">${item.product.name}</div>
              <div class="row">
                <span class="item-details">${item.quantity} x ₹${item.product.price.toFixed(2)}</span>
                <span class="bold">₹${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
          
          <div class="line"></div>
          
          <div class="total-section">
            <div class="row">
              <span class="bold">SUBTOTAL:</span>
              <span class="bold">₹${transaction.subtotal.toFixed(2)}</span>
            </div>
            ${transaction.tax > 0 ? `
              <div class="row">
                <span>GST (18%):</span>
                <span>₹${transaction.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            ${transaction.discount > 0 ? `
              <div class="row">
                <span>Discount:</span>
                <span>-₹${transaction.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="row large">
              <span>TOTAL:</span>
              <span>₹${transaction.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="row">
              <span class="bold">Payment Method:</span>
              <span class="bold">${transaction.paymentMethod.toUpperCase()}</span>
            </div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div class="row">
                <span>Cash Received:</span>
                <span>₹${transaction.paymentDetails.cashAmount.toFixed(2)}</span>
              </div>
              ${transaction.paymentDetails.change ? `
                <div class="row">
                  <span>Change:</span>
                  <span>₹${transaction.paymentDetails.change.toFixed(2)}</span>
                </div>
              ` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'card' && transaction.receipt ? `
              <div class="row">
                <span>Transaction ID:</span>
                <span>${transaction.receipt}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="footer-text">
            <div>Thank you for your business!</div>
            <div>${printSettings.footer || 'Please visit again'}</div>
            <div style="margin-top: 5px;">Generated by Sales Channel PoS</div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `;
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;

    const receiptHTML = generateReceiptHTML();
    previewWindow.document.write(receiptHTML);
    previewWindow.document.close();
  };

  const handleDownload = () => {
    const receiptHTML = generateReceiptHTML();
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!showPreview) {
    return (
      <div className="flex gap-2">
        <Button onClick={handlePrint} size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button onClick={handlePreview} variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button onClick={handleDownload} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Printable Bill</span>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handlePreview} variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-gray-300 p-4 rounded text-xs font-mono" style={{ width: '80mm', minHeight: '200px' }}>
          <div className="text-center">
            <div className="font-bold text-sm">{companySettings.name}</div>
            <div className="text-xs">{companySettings.address}</div>
            <div className="text-xs">Phone: {companySettings.phone}</div>
            {companySettings.email && <div className="text-xs">Email: {companySettings.email}</div>}
            {companySettings.taxId && <div className="text-xs">GST: {companySettings.taxId}</div>}
          </div>
          
          <div className="border-b border-black my-2"></div>
          
          <div className="text-xs">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span>{transaction.id.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(transaction.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{new Date(transaction.timestamp).toLocaleTimeString()}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{transaction.customerName}</span>
              </div>
            )}
          </div>
          
          <div className="border-b border-black my-2"></div>
          
          {transaction.items.map((item, index) => (
            <div key={index} className="mb-2">
              <div className="font-bold">{item.product.name}</div>
              <div className="flex justify-between text-xs">
                <span>{item.quantity} x ₹{item.product.price.toFixed(2)}</span>
                <span className="font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          
          <div className="border-b border-black my-2"></div>
          
          <div className="border-t-2 border-black pt-2">
            <div className="flex justify-between">
              <span className="font-bold">SUBTOTAL:</span>
              <span className="font-bold">₹{transaction.subtotal.toFixed(2)}</span>
            </div>
            {transaction.tax > 0 && (
              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span>₹{transaction.tax.toFixed(2)}</span>
              </div>
            )}
            {transaction.discount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{transaction.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>₹{transaction.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-gray-100 p-2 mt-2 border border-black">
            <div className="flex justify-between">
              <span className="font-bold">Payment Method:</span>
              <span className="font-bold">{transaction.paymentMethod.toUpperCase()}</span>
            </div>
            {transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount && (
              <>
                <div className="flex justify-between">
                  <span>Cash Received:</span>
                  <span>₹{transaction.paymentDetails.cashAmount.toFixed(2)}</span>
                </div>
                {transaction.paymentDetails.change && (
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span>₹{transaction.paymentDetails.change.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            {transaction.paymentMethod === 'card' && transaction.receipt && (
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span>{transaction.receipt}</span>
              </div>
            )}
          </div>
          
          <div className="text-center mt-4 text-xs border-t border-black pt-2">
            <div>Thank you for your business!</div>
            <div>{printSettings.footer || 'Please visit again'}</div>
            <div className="mt-1">Generated by Sales Channel PoS</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-600">
          <p><strong>Features of this printable bill:</strong></p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Optimized for 80mm thermal paper (standard PoS receipt width)</li>
            <li>Dark, bold text for better readability</li>
            <li>Compact layout to minimize paper usage</li>
            <li>Professional formatting with clear sections</li>
            <li>Includes all transaction details and payment information</li>
            <li>Print-ready with proper margins and spacing</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
