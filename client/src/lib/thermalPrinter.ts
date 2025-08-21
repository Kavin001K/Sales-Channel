// Thermal Printer Service for ACE-POS
export interface ReceiptData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyTaxId: string;
  receiptNumber: string;
  date: string;
  cashierName: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentDetails?: {
    cashAmount?: number;
    cardAmount?: number;
    walletAmount?: number;
    parts?: Array<{
      method: string;
      amount: number;
      txnId?: string;
      lastDigits?: string;
    }>;
  };
  isReprint?: boolean;
  reprintCount?: number;
}

class ThermalPrinterService {
  // Generate proper thermal printer formatted receipt
  generateReceipt(data: ReceiptData): string {
    let receipt = '';
    
    // Header with company info
    receipt += this.centerText(data.companyName, 48) + '\n';
    receipt += this.centerText(data.companyAddress, 48) + '\n';
    receipt += this.centerText(`Phone: ${data.companyPhone}`, 48) + '\n';
    receipt += this.centerText(`Tax ID: ${data.companyTaxId}`, 48) + '\n';
    
    // Reprint notice if applicable
    if (data.isReprint) {
      receipt += '\n';
      receipt += this.centerText(`*** REPRINT #${data.reprintCount || 1} ***`, 48) + '\n';
      receipt += '\n';
    }
    
    // Receipt details
    receipt += `Receipt #: ${data.receiptNumber}\n`;
    receipt += `Date: ${data.date}\n`;
    receipt += `Cashier: ${data.cashierName}\n`;
    receipt += `Customer: ${data.customerName}\n`;
    
    // Separator line
    receipt += this.generateSeparatorLine();
    
    // Items header
    receipt += this.padRight('Item', 30) + this.padLeft('Qty', 8) + this.padLeft('Price', 10) + '\n';
    receipt += this.generateSeparatorLine();
    
    // Items
    data.items.forEach(item => {
      const itemName = this.truncateText(item.name, 30);
      const quantity = item.quantity.toString();
      const price = `₹${item.price.toFixed(2)}`;
      
      receipt += this.padRight(itemName, 30) + this.padLeft(quantity, 8) + this.padLeft(price, 10) + '\n';
    });
    
    // Separator line
    receipt += this.generateSeparatorLine();
    
    // Totals
    receipt += this.padRight('Subtotal:', 38) + this.padLeft(`₹${data.subtotal.toFixed(2)}`, 10) + '\n';
    receipt += this.padRight('Tax:', 38) + this.padLeft(`₹${data.tax.toFixed(2)}`, 10) + '\n';
    receipt += this.padRight('TOTAL:', 38) + this.padLeft(`₹${data.total.toFixed(2)}`, 10) + '\n';
    
    // Payment method
    receipt += '\n';
    receipt += `Payment Method: ${data.paymentMethod.toUpperCase()}\n`;
    
    // Payment details
    if (data.paymentDetails) {
      const pd = data.paymentDetails;
      if (pd.parts && pd.parts.length > 0) {
        receipt += this.generateSeparatorLine();
        receipt += 'Split Breakdown:\n';
        pd.parts.forEach((p, i) => {
          const label = p.method.toUpperCase();
          const line = `${i + 1}. ${label}` + (p.lastDigits ? ` ****${p.lastDigits}` : '') + (p.txnId ? ` (${p.txnId})` : '');
          receipt += this.padRight(line, 38) + this.padLeft(`₹${p.amount.toFixed(2)}`, 10) + '\n';
        });
      } else {
        if (pd.cashAmount) receipt += `Cash Amount: ₹${pd.cashAmount.toFixed(2)}\n`;
        if (pd.cardAmount) receipt += `Card Amount: ₹${pd.cardAmount.toFixed(2)}\n`;
        if (pd.walletAmount) receipt += `Wallet Amount: ₹${pd.walletAmount.toFixed(2)}\n`;
      }
    }
    
    // Footer
    receipt += '\n';
    receipt += this.centerText('Thank you for your business!', 48) + '\n';
    receipt += '\n';
    
    // Reprint notice at bottom if applicable
    if (data.isReprint) {
      receipt += this.centerText(`*** REPRINT #${data.reprintCount || 1} ***`, 48) + '\n';
      receipt += this.centerText(`Reprint Date: ${new Date().toLocaleString()}`, 48) + '\n';
    }
    
    // Cut paper
    receipt += '\n\n';
    
    return receipt;
  }

  // Generate HTML for web printing (fallback)
  generateHTMLReceipt(data: ReceiptData): string {
    const reprintNotice = data.isReprint ? `*** REPRINT #${data.reprintCount || 1} ***` : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${data.receiptNumber}</title>
        <style>
          @media print {
            body { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              margin: 0; 
              padding: 10px; 
              width: 80mm;
              max-width: 80mm;
            }
            .receipt-container {
              width: 80mm;
              max-width: 80mm;
              margin: 0 auto;
            }
            .header { text-align: center; margin-bottom: 10px; }
            .reprint-notice { 
              color: red; 
              font-weight: bold; 
              text-align: center; 
              margin: 5px 0; 
              font-size: 10px;
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin: 2px 0; 
              font-size: 11px;
            }
            .total { 
              font-weight: bold; 
              border-top: 1px solid #000; 
              padding-top: 5px; 
              margin-top: 10px; 
              text-align: right;
            }
            .footer { text-align: center; margin-top: 10px; font-size: 10px; }
            .separator { 
              border-top: 1px dashed #000; 
              margin: 5px 0; 
              height: 1px; 
            }
          }
          body { 
            font-family: 'Courier New', monospace; 
            font-size: 12px; 
            margin: 0; 
            padding: 10px; 
            width: 80mm;
            max-width: 80mm;
          }
          .receipt-container {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
          }
          .header { text-align: center; margin-bottom: 10px; }
          .reprint-notice { 
            color: red; 
            font-weight: bold; 
            text-align: center; 
            margin: 5px 0; 
            font-size: 10px;
          }
          .item { 
            display: flex; 
            justify-content: space-between; 
            margin: 2px 0; 
            font-size: 11px;
          }
          .total { 
            font-weight: bold; 
            border-top: 1px solid #000; 
            padding-top: 5px; 
            margin-top: 10px; 
            text-align: right;
          }
          .footer { text-align: center; margin-top: 10px; font-size: 10px; }
          .separator { 
            border-top: 1px dashed #000; 
            margin: 5px 0; 
            height: 1px; 
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${data.isReprint ? `<div class="reprint-notice">${reprintNotice}</div>` : ''}
          <div class="header">
            <h2 style="margin: 0; font-size: 14px;">${data.companyName}</h2>
            <p style="margin: 2px 0; font-size: 10px;">${data.companyAddress}</p>
            <p style="margin: 2px 0; font-size: 10px;">Phone: ${data.companyPhone}</p>
            <p style="margin: 2px 0; font-size: 10px;">Tax ID: ${data.companyTaxId}</p>
          </div>
          ${data.isReprint ? `<div class="reprint-notice">${reprintNotice}</div>` : ''}
          
          <div class="separator"></div>
          
          <div style="font-size: 10px; margin: 5px 0;">
            <div><strong>Receipt #:</strong> ${data.receiptNumber}</div>
            <div><strong>Date:</strong> ${data.date}</div>
            <div><strong>Cashier:</strong> ${data.cashierName}</div>
            <div><strong>Customer:</strong> ${data.customerName}</div>
            ${data.isReprint ? `<div><strong>Reprint Date:</strong> ${new Date().toLocaleString()}</div>` : ''}
          </div>
          
          <div class="separator"></div>
          
          ${data.items.map(item => `
            <div class="item">
              <span>${item.name}</span>
              <span>${item.quantity} x ₹${item.price.toFixed(2)}</span>
              <span>₹${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div class="separator"></div>
          
          <div class="total">
            <div class="item">
              <span>Subtotal:</span>
              <span>₹${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="item">
              <span>Tax:</span>
              <span>₹${data.tax.toFixed(2)}</span>
            </div>
            <div class="item" style="font-size: 14px;">
              <span>TOTAL:</span>
              <span>₹${data.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="margin: 10px 0; font-size: 11px;">
            <div><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</div>
            ${data.paymentDetails ? `
              ${data.paymentDetails.parts && data.paymentDetails.parts.length ? `
                <div style="margin-top:6px;"><strong>Split Breakdown:</strong></div>
                ${data.paymentDetails.parts.map((p, i) => `
                  <div style="display:flex;justify-content:space-between;">
                    <span>${i+1}. ${p.method.toUpperCase()}${p.lastDigits ? ` ****${p.lastDigits}` : ''}${p.txnId ? ` (${p.txnId})` : ''}</span>
                    <span>₹${p.amount.toFixed(2)}</span>
                  </div>
                `).join('')}
              ` : `
                ${data.paymentDetails.cashAmount ? `<div>Cash Amount: ₹${data.paymentDetails.cashAmount.toFixed(2)}</div>` : ''}
                ${data.paymentDetails.cardAmount ? `<div>Card Amount: ₹${data.paymentDetails.cardAmount.toFixed(2)}</div>` : ''}
                ${data.paymentDetails.walletAmount ? `<div>Wallet Amount: ₹${data.paymentDetails.walletAmount.toFixed(2)}</div>` : ''}
              `}
            ` : ''}
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            ${data.isReprint ? `<p>Reprint #${data.reprintCount || 1} - ${new Date().toLocaleString()}</p>` : ''}
          </div>
          
          ${data.isReprint ? `<div class="reprint-notice">${reprintNotice}</div>` : ''}
        </div>
      </body>
      </html>
    `;
  }

  // Print receipt using proper thermal printer
  async printReceipt(data: ReceiptData): Promise<boolean> {
    try {
      // Try to use thermal printer driver if available
      if (this.isThermalPrinterAvailable()) {
        return await this.printWithThermalDriver(data);
      } else {
        return await this.printWithWebAPI(data);
      }
    } catch (error) {
      console.error('Print error:', error);
      // Fallback to web printing
      return await this.printWithWebAPI(data);
    }
  }

  // Check if thermal printer driver is available
  private isThermalPrinterAvailable(): boolean {
    // Check for Electron API
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return true;
    }
    
    // Check for WebUSB API
    if (navigator.usb) {
      return true;
    }
    
    // Check for Web Serial API
    if (navigator.serial) {
      return true;
    }
    
    return false;
  }

  // Print using thermal printer driver
  private async printWithThermalDriver(data: ReceiptData): Promise<boolean> {
    try {
      const escposData = this.generateReceipt(data);
      
      // Try Electron API first
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        return await (window as any).electronAPI.printReceipt(escposData);
      }
      
      // Try WebUSB API
      if (navigator.usb) {
        return await this.printWithWebUSB(escposData);
      }
      
      // Try Web Serial API
      if (navigator.serial) {
        return await this.printWithWebSerial(escposData);
      }
      
      return false;
    } catch (error) {
      console.error('Thermal printer error:', error);
      return false;
    }
  }

  // Print using WebUSB API
  private async printWithWebUSB(escposData: string): Promise<boolean> {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { vendorId: 0x0483 }, // STMicroelectronics
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0416 }, // WinChipHead
          { vendorId: 0x0525 }, // PLX Technology
        ]
      });
      
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      
      const encoder = new TextEncoder();
      const data = encoder.encode(escposData);
      
      await device.transferOut(1, data);
      await device.close();
      return true;
    } catch (error) {
      console.error('WebUSB print error:', error);
      return false;
    }
  }

  // Print using Web Serial API
  private async printWithWebSerial(escposData: string): Promise<boolean> {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      
      const encoder = new TextEncoder();
      const data = encoder.encode(escposData);
      
      const writer = port.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      
      await port.close();
      return true;
    } catch (error) {
      console.error('Web Serial print error:', error);
      return false;
    }
  }

  // Print using web browser API (fallback)
  private async printWithWebAPI(data: ReceiptData): Promise<boolean> {
    return new Promise((resolve) => {
      const html = this.generateHTMLReceipt(data);
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            resolve(true);
          }, 1000);
        };
        
        setTimeout(() => {
          if (!printWindow.closed) {
            printWindow.print();
            setTimeout(() => {
              printWindow.close();
              resolve(true);
            }, 1000);
          }
        }, 500);
      } else {
        resolve(false);
      }
    });
  }

  // Utility functions
  private generateSeparatorLine(): string {
    return '-'.repeat(48) + '\n';
  }

  private padRight(text: string, width: number): string {
    return text.padEnd(width, ' ');
  }

  private padLeft(text: string, width: number): string {
    return text.padStart(width, ' ');
  }

  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;
    return ' '.repeat(leftPadding) + text + ' '.repeat(rightPadding);
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }
}

// Export singleton instance
export const thermalPrinter = new ThermalPrinterService();
export default ThermalPrinterService;
