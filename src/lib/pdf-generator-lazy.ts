import { Invoice } from './invoice-utils';

/**
 * Lazy-loaded PDF generator wrapper
 * This prevents @react-pdf/renderer from being included in the main bundle
 * Only loads when PDF functionality is actually needed
 */

export interface PDFGeneratorOptions {
  fileName?: string;
  openInNewTab?: boolean;
  download?: boolean;
}

/**
 * Lazy load the PDF generator module
 */
const loadPDFGenerator = async () => {
  const module = await import('./pdf-generator');
  return module;
};

/**
 * Download invoice as PDF (lazy loaded)
 */
export const downloadInvoicePDF = async (
  invoice: Invoice,
  options?: PDFGeneratorOptions
): Promise<void> => {
  const { downloadInvoicePDF: fn } = await loadPDFGenerator();
  return fn(invoice, options);
};

/**
 * Print invoice PDF (lazy loaded)
 */
export const printInvoicePDF = async (invoice: Invoice): Promise<void> => {
  const { printInvoicePDF: fn } = await loadPDFGenerator();
  return fn(invoice);
};

/**
 * Preview invoice PDF (lazy loaded)
 */
export const previewInvoicePDF = async (invoice: Invoice): Promise<string> => {
  const { previewInvoicePDF: fn } = await loadPDFGenerator();
  return fn(invoice);
};

/**
 * Get PDF as base64 (lazy loaded)
 */
export const getInvoicePDFBase64 = async (invoice: Invoice): Promise<string> => {
  const { getInvoicePDFBase64: fn } = await loadPDFGenerator();
  return fn(invoice);
};

/**
 * Email invoice PDF (lazy loaded)
 */
export const emailInvoicePDF = async (
  invoice: Invoice,
  recipientEmail: string
): Promise<void> => {
  const { emailInvoicePDF: fn } = await loadPDFGenerator();
  return fn(invoice, recipientEmail);
};

/**
 * Batch export invoices (lazy loaded)
 */
export const batchExportInvoices = async (
  invoices: Invoice[],
  options?: { format: 'zip' | 'individual' }
): Promise<void> => {
  const { batchExportInvoices: fn } = await loadPDFGenerator();
  return fn(invoices, options);
};

/**
 * Get PDF metadata (lazy loaded)
 */
export const getInvoicePDFMetadata = async (invoice: Invoice) => {
  const { getInvoicePDFMetadata: fn } = await loadPDFGenerator();
  return fn(invoice);
};
