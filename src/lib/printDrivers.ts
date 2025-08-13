import { Transaction } from './types';
import { getCompanySettings, getPrintSettings } from './storage';

export interface PrintOptions {
  paperSize: 'thermal' | 'a4';
  copies: number;
  autocut: boolean;
  cashdraw: boolean;
}

export class ThermalPrintDriver {
  private static instance: ThermalPrintDriver;
  
  static getInstance(): ThermalPrintDriver {
    if (!ThermalPrintDriver.instance) {
      ThermalPrintDriver.instance = new ThermalPrintDriver();
    }
    return ThermalPrintDriver.instance;
  }

  // ESC/POS Commands for thermal printers
  private commands = {
    INIT: '\x1B\x40',           // Initialize printer
    CUT: '\x1D\x56\x41',        // Cut paper
    CASH_DRAWER: '\x1B\x70\x00\x19\xFA', // Open cash drawer
    ALIGN_CENTER: '\x1B\x61\x01',
    ALIGN_LEFT: '\x1B\x61\x00',
    ALIGN_RIGHT: '\x1B\x61\x02',
    BOLD_ON: '\x1B\x45\x01',
    BOLD_OFF: '\x1B\x45\x00',
    UNDERLINE_ON: '\x1B\x2D\x01',
    UNDERLINE_OFF: '\x1B\x2D\x00',
    DOUBLE_HEIGHT: '\x1B\x21\x10',
    DOUBLE_WIDTH: '\x1B\x21\x20',
    NORMAL_SIZE: '\x1B\x21\x00',
    LINE_FEED: '\x0A',
  };

  async print(transaction: Transaction, options: Partial<PrintOptions> = {}): Promise<boolean> {
    const defaultOptions: PrintOptions = {
      paperSize: 'thermal',
      copies: 1,
      autocut: true,
      cashdraw: true
    };
    
    const printOptions = { ...defaultOptions, ...options };
    
    if (printOptions.paperSize === 'thermal') {
      return this.printThermal(transaction, printOptions);
    } else {
      return this.printA4(transaction, printOptions);
    }
  }

  private async printThermal(transaction: Transaction, options: PrintOptions): Promise<boolean> {
    try {
      // Only use web printing (browser print dialog)
      return this.printViaWeb(transaction, options);
    } catch (error) {
      console.error('Thermal printing failed:', error);
      return false;
    }
  }

  private async printViaWeb(transaction: Transaction, options: PrintOptions): Promise<boolean> {
    console.log('[PrintDriver] printViaWeb called', { transaction, options });
    const printWindow = window.open('', '_blank');
    if (!printWindow) return false;

    const companySettings = getCompanySettings();
    const printSettings = getPrintSettings();

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
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
              // Print multiple copies if specified
              for (let i = 0; i < ${options.copies}; i++) {
                setTimeout(() => {
                  window.print();
                }, i * 1000);
              }
              setTimeout(() => window.close(), 2000);
            }
          </script>
        </body>
      </html>
    `;
    console.log('[PrintDriver] Generated receipt HTML:', receiptHTML);
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    console.log('[PrintDriver] Receipt HTML written to print window.');
    return true;
  }

  private async printA4(transaction: Transaction, options: PrintOptions): Promise<boolean> {
    // A4 printing logic for standard printers
    const printWindow = window.open('', '_blank');
    if (!printWindow) return false;

    const companySettings = getCompanySettings();
    const printSettings = getPrintSettings();

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${transaction.id}</title>
          <style>
            * {
              color: #000 !important;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', serif;
              max-width: 210mm;
              margin: 0 auto;
              padding: 15mm;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #000;
            }
            .company-details {
              font-size: 11px;
              color: #000;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
              font-size: 11px;
            }
            .invoice-details h3 {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #000;
              border-bottom: 1px solid #000;
              padding-bottom: 2px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 15px;
              font-size: 11px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #000;
              padding: 6px;
              text-align: left;
              color: #000;
            }
            .items-table th {
              background-color: #f0f0f0;
              font-weight: bold;
              color: #000;
            }
            .items-table td {
              vertical-align: top;
            }
            .total-section {
              margin-left: auto;
              width: 250px;
              border: 2px solid #000;
              padding: 10px;
              background: #f9f9f9;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
              font-size: 11px;
            }
            .total-final {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .payment-info {
              margin-top: 10px;
              padding: 8px;
              border: 1px solid #000;
              background: #f0f0f0;
              font-size: 11px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #000;
              font-size: 10px;
              border-top: 1px solid #000;
              padding-top: 10px;
            }
            .sku {
              font-size: 9px;
              color: #333;
              font-style: italic;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10mm; 
                font-size: 12px !important;
                color: #000 !important;
                background: white !important;
              }
              @page { 
                margin: 10mm; 
                size: A4;
              }
              * {
                color: #000 !important;
              }
              .total-section {
                background: #f9f9f9 !important;
                border: 2px solid #000 !important;
              }
              .payment-info {
                background: #f0f0f0 !important;
                border: 1px solid #000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companySettings.name}</div>
            <div class="company-details">${companySettings.address}</div>
            <div class="company-details">Phone: ${companySettings.phone} | Email: ${companySettings.email}</div>
            ${companySettings.taxId ? `<div class="company-details">GST: ${companySettings.taxId}</div>` : ''}
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>INVOICE DETAILS</h3>
              <div><strong>Invoice #:</strong> ${transaction.id}</div>
              <div><strong>Date:</strong> ${new Date(transaction.timestamp).toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            </div>
            <div>
              <h3>CUSTOMER DETAILS</h3>
              ${transaction.customerName ? `<div><strong>Name:</strong> ${transaction.customerName}</div>` : ''}
              <div><strong>Payment Method:</strong> ${transaction.paymentMethod.toUpperCase()}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.product.name}</strong>
                    ${item.product.sku ? `<br><span class="sku">SKU: ${item.product.sku}</span>` : ''}
                  </td>
                  <td>${item.quantity}</td>
                  <td>₹${item.product.price.toFixed(2)}</td>
                  <td><strong>₹${(item.product.price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${transaction.subtotal.toFixed(2)}</span>
            </div>
            ${transaction.tax > 0 ? `
              <div class="total-row">
                <span>GST (18%):</span>
                <span>₹${transaction.tax.toFixed(2)}</span>
              </div>
            ` : ''}
            ${transaction.discount > 0 ? `
              <div class="total-row">
                <span>Discount:</span>
                <span>-₹${transaction.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row total-final">
              <span>TOTAL AMOUNT:</span>
              <span>₹${transaction.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div><strong>Payment Details:</strong></div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div>Cash Received: ₹${transaction.paymentDetails.cashAmount.toFixed(2)}</div>
              ${transaction.paymentDetails.change ? `<div>Change: ₹${transaction.paymentDetails.change.toFixed(2)}</div>` : ''}
            ` : ''}
            ${transaction.paymentMethod === 'card' && transaction.receipt ? `
              <div>Transaction ID: ${transaction.receipt}</div>
            ` : ''}
          </div>
          
          <div class="footer">
            <div><strong>${printSettings.header || 'Thank you for your business!'}</strong></div>
            <div>${printSettings.footer || 'Please visit again'}</div>
            <div style="margin-top: 5px;">Generated by Sales Channel PoS System</div>
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

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    return true;
  }

  // Test printer connection
  async testPrint(): Promise<boolean> {
    try {
      const testTransaction: Transaction = {
        id: 'TEST-' + Date.now(),
        items: [{
          product: {
            id: 'test',
            name: 'Test Item',
            price: 1.00,
            cost: 0.50,
            sku: 'TEST001',
            category: 'Test',
            stock: 999,
            minStock: 1,
            taxRate: 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          quantity: 1
        }],
        subtotal: 1.00,
        tax: 0,
        discount: 0,
        total: 1.00,
        paymentMethod: 'cash',
        paymentDetails: {
          cashAmount: 1.00,
          change: 0
        },
        timestamp: new Date(),
        status: 'completed'
      };

      return await this.print(testTransaction, { copies: 1, autocut: false, cashdraw: false });
    } catch (error) {
      console.error('Test print failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const printDriver = ThermalPrintDriver.getInstance();