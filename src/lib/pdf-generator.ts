import { pdf } from '@react-pdf/renderer';
import { PDFInvoiceTemplate } from '@/components/pdf/PDFInvoiceTemplate';
import { Invoice, CompanyInfo, getCompanyInfo, getInvoiceSettings } from './invoice-utils';
import React from 'react';

/**
 * Modern PDF Generator using @react-pdf/renderer
 * Replaces the old html2canvas + jsPDF approach
 */

export interface PDFGeneratorOptions {
  fileName?: string;
  openInNewTab?: boolean;
  download?: boolean;
}

/**
 * Generate PDF blob from invoice data
 */
export const generateInvoicePDF = async (
  invoice: Invoice,
  companyInfo?: CompanyInfo,
  settings?: Record<string, any>
): Promise<Blob> => {
  const company = companyInfo || getCompanyInfo();
  const invoiceSettings = settings || getInvoiceSettings();

  const document = React.createElement(PDFInvoiceTemplate, {
    invoice,
    companyInfo: company,
    settings: invoiceSettings,
  });

  const blob = await pdf(document).toBlob();
  return blob;
};

/**
 * Download invoice as PDF
 */
export const downloadInvoicePDF = async (
  invoice: Invoice,
  options: PDFGeneratorOptions = {}
): Promise<void> => {
  try {
    const blob = await generateInvoicePDF(invoice);

    // Generate filename
    const fileName = options.fileName || generateFileName(invoice);

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download invoice PDF:', error);
    throw new Error('Failed to generate PDF for download');
  }
};

/**
 * Open invoice PDF in new tab for printing
 */
export const printInvoicePDF = async (invoice: Invoice): Promise<void> => {
  try {
    const blob = await generateInvoicePDF(invoice);
    const url = URL.createObjectURL(blob);

    // Open in new window
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        // Clean up after printing
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      };
    } else {
      throw new Error('Failed to open print window. Please check your popup blocker.');
    }
  } catch (error) {
    console.error('Failed to print invoice PDF:', error);
    throw new Error('Failed to generate PDF for printing');
  }
};

/**
 * Get PDF as base64 string (useful for email attachments)
 */
export const getInvoicePDFBase64 = async (invoice: Invoice): Promise<string> => {
  try {
    const blob = await generateInvoicePDF(invoice);
    return await blobToBase64(blob);
  } catch (error) {
    console.error('Failed to convert PDF to base64:', error);
    throw new Error('Failed to generate PDF as base64');
  }
};

/**
 * Email invoice PDF (requires backend integration)
 */
export const emailInvoicePDF = async (
  invoice: Invoice,
  recipientEmail: string
): Promise<void> => {
  try {
    const pdfBase64 = await getInvoicePDFBase64(invoice);

    // Send to backend for email delivery
    const response = await fetch('/api/invoices/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        recipientEmail,
        pdfBase64,
        invoiceNumber: invoice.number,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send invoice email');
    }
  } catch (error) {
    console.error('Failed to email invoice:', error);
    throw new Error('Failed to email invoice PDF');
  }
};

/**
 * Preview invoice PDF (returns blob URL for iframe)
 */
export const previewInvoicePDF = async (invoice: Invoice): Promise<string> => {
  try {
    const blob = await generateInvoicePDF(invoice);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to preview invoice PDF:', error);
    throw new Error('Failed to generate PDF preview');
  }
};

// Helper functions

function generateFileName(invoice: Invoice): string {
  const date = new Date(invoice.date).toISOString().split('T')[0];
  const number = invoice.number.replace(/[^a-zA-Z0-9]/g, '_');
  return `Invoice_${number}_${date}.pdf`;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64String = base64.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Batch export multiple invoices as PDFs
 */
export const batchExportInvoices = async (
  invoices: Invoice[],
  options: { format: 'zip' | 'individual' } = { format: 'individual' }
): Promise<void> => {
  try {
    if (options.format === 'individual') {
      // Download each invoice separately
      for (const invoice of invoices) {
        await downloadInvoicePDF(invoice);
        // Small delay to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      // TODO: Implement ZIP packaging (requires jszip library)
      throw new Error('ZIP export not yet implemented');
    }
  } catch (error) {
    console.error('Failed to batch export invoices:', error);
    throw new Error('Failed to batch export invoices');
  }
};

/**
 * Get PDF metadata for display
 */
export const getInvoicePDFMetadata = (invoice: Invoice) => {
  const fileName = generateFileName(invoice);
  return {
    fileName,
    fileSize: 'Calculating...', // Actual size after generation
    invoiceNumber: invoice.number,
    customer: invoice.customer.name,
    amount: invoice.total,
    currency: invoice.currency,
    date: invoice.date,
  };
};
