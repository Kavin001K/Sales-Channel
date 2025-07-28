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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', monospace;
              width: 300px;
              margin: 0;
              padding: 0;
              font-size: 12px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 16px; }
            .small { font-size: 10px; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            @media print {
              body { margin: 0 !important; padding: 0 !important; }
              @page { margin: 0 !important; size: 80mm auto; }
            }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="large bold">${companySettings.name}</div>
            <div class="small">${companySettings.address}</div>
            <div class="small">Phone: ${companySettings.phone}</div>
            ${companySettings.email ? `<div class="small">Email: ${companySettings.email}</div>` : ''}
          </div>
          
          <div class="line"></div>
          
          <div>
            <div>Receipt: ${transaction.id.slice(-8)}</div>
            <div>Date: ${new Date(transaction.timestamp).toLocaleDateString()}</div>
            <div>Time: ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            ${transaction.customerName ? `<div>Customer: ${transaction.customerName}</div>` : ''}
          </div>
          
          <div class="line"></div>
          
          ${transaction.items.map(item => `
            <div class="row">
              <span>${item.product.name}</span>
              <span>₹${(item.product.price * item.quantity).toFixed(2)}</span>
            </div>
            <div class="small" style="color: #666;">
              ${item.quantity} x ₹${item.product.price.toFixed(2)}
            </div>
          `).join('')}
          
          <div class="line"></div>
          
          <div class="row bold">
            <span>TOTAL:</span>
            <span>₹${transaction.total.toFixed(2)}</span>
          </div>
          
          <div class="line"></div>
          
          <div>
            <div>Payment: ${transaction.paymentMethod.toUpperCase()}</div>
            ${transaction.paymentMethod === 'cash' && transaction.paymentDetails?.cashAmount ? `
              <div>Cash: ₹${transaction.paymentDetails.cashAmount.toFixed(2)}</div>
              ${transaction.paymentDetails.change ? `<div>Change: ₹${transaction.paymentDetails.change.toFixed(2)}</div>` : ''}
            ` : ''}
          </div>
          
          <div class="center small" style="margin-top: 20px;">
            <div>${printSettings.footer}</div>
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
            body {
              font-family: Arial, sans-serif;
              max-width: 210mm;
              margin: 0 auto;
              padding: 20px;
              font-size: 14px;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .items-table th,
            .items-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .total-section {
              margin-left: auto;
              width: 300px;
              border-top: 2px solid #000;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .total-final {
              font-weight: bold;
              font-size: 16px;
              border-top: 1px solid #000;
              padding-top: 5px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 15px; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companySettings.name}</div>
            <div>${companySettings.address}</div>
            <div>Phone: ${companySettings.phone} | Email: ${companySettings.email}</div>
            ${companySettings.taxId ? `<div>Tax ID: ${companySettings.taxId}</div>` : ''}
          </div>
          
          <div class="invoice-details">
            <div>
              <h3>Invoice Details</h3>
              <div><strong>Invoice #:</strong> ${transaction.id}</div>
              <div><strong>Date:</strong> ${new Date(transaction.timestamp).toLocaleDateString()}</div>
              <div><strong>Time:</strong> ${new Date(transaction.timestamp).toLocaleTimeString()}</div>
            </div>
            <div>
              <h3>Customer Details</h3>
              ${transaction.customerName ? `<div><strong>Name:</strong> ${transaction.customerName}</div>` : ''}
              <div><strong>Payment:</strong> ${transaction.paymentMethod.toUpperCase()}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>${item.product.name}<br><small>${item.product.sku || ''}</small></td>
                  <td>${item.quantity}</td>
                  <td>₹${item.product.price.toFixed(2)}</td>
                  <td>₹${(item.product.price * item.quantity).toFixed(2)}</td>
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
                <span>Tax:</span>
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
              <span>Total Amount:</span>
              <span>₹${transaction.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div>${printSettings.header}</div>
            <div>${printSettings.footer}</div>
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