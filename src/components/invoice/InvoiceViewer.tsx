import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Invoice, getCompanyInfo, getInvoiceSettings } from '@/lib/invoice-utils';
import { downloadInvoicePDF, printInvoicePDF } from '@/lib/pdf-generator';
import { useNavigate } from 'react-router-dom';
import InvoiceTemplate from './InvoiceTemplate';
import { Download, Printer, X, Eye, Mail, ExternalLink } from 'lucide-react';

interface InvoiceViewerProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ invoice, isOpen, onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const companyInfo = getCompanyInfo();
  const settings = getInvoiceSettings();

  /**
   * Print invoice using new PDF system
   */
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await printInvoicePDF(invoice);
      toast({
        title: "Success",
        description: "Print dialog opened"
      });
    } catch (error: any) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to print invoice",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  /**
   * Download invoice as PDF using new system
   */
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadInvoicePDF(invoice);
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully"
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to download invoice",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Open dedicated print page in new tab
   */
  const handleOpenPrintPage = () => {
    navigate(`/print/invoice/${invoice.id}`);
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
                onClick={handleOpenPrintPage}
                title="Open in print-optimized page"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Print Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={isPrinting}
                title="Quick print (PDF)"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? 'Printing...' : 'Print PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download as PDF"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
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
