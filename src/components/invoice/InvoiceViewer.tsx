import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Invoice, getCompanyInfo, getInvoiceSettings } from '@/lib/invoice-utils';
import InvoiceTemplate from './InvoiceTemplate';
import { Download, Printer, X, Eye } from 'lucide-react';

interface InvoiceViewerProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice, isOpen, onClose }) => {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  const companyInfo = getCompanyInfo();
  const settings = getInvoiceSettings();

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Please allow popups to print invoices",
          variant: "destructive"
        });
        return;
      }

      // Get the invoice template HTML
      const invoiceElement = document.getElementById('invoice-template');
      if (!invoiceElement) {
        toast({
          title: "Error",
          description: "Invoice template not found",
          variant: "destructive"
        });
        return;
      }

      // Write the HTML to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoice.number}</title>
            <style>
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
              body { font-family: Arial, sans-serif; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>
            ${invoiceElement.outerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
      
      toast({
        title: "Success",
        description: "Print dialog opened"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print invoice",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleDownload = async () => {
    try {
      // For now, we'll create a simple text version
      // In a real implementation, you'd use a PDF library like jsPDF
      const content = `
INVOICE

Invoice #: ${invoice.number}
Date: ${new Date(invoice.date).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

From: ${companyInfo.name}
${companyInfo.address}
${companyInfo.city}, ${companyInfo.state} ${companyInfo.pinCode}

To: ${invoice.customer.name}
${invoice.customer.address}
${invoice.customer.phone}

Items:
${invoice.items.map(item => 
  `${item.name} - ${item.quantity} x ${item.unitPrice} = ${item.total}`
).join('\n')}

Subtotal: ${invoice.subtotal}
Tax (${invoice.taxRate}%): ${invoice.taxAmount}
Total: ${invoice.total}

Notes: ${invoice.notes}
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Invoice downloaded"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Invoice {invoice.number}</DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? 'Printing...' : 'Print'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div id="invoice-template">
            <InvoiceTemplate 
              invoice={invoice} 
              companyInfo={companyInfo} 
              settings={settings}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceViewer;
