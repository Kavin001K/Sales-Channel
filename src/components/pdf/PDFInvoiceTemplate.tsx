import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice, CompanyInfo } from '@/lib/invoice-utils';

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 10,
  },
  companyInfo: {
    flexDirection: 'row',
    gap: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  companyDetails: {
    flexDirection: 'column',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    textAlign: 'right',
  },
  invoiceDetails: {
    textAlign: 'right',
    marginTop: 5,
  },
  invoiceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusBadge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 3,
  },
  statusPaid: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  statusSent: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusOverdue: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  statusDraft: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  customerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  customerBox: {
    width: '48%',
  },
  customerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  customerDetails: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
  },
  customerName: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  customerText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#D1D5DB',
    padding: 8,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  colItem: {
    width: '25%',
  },
  colDescription: {
    width: '30%',
  },
  colQty: {
    width: '15%',
    textAlign: 'right',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTotal: {
    width: '15%',
    textAlign: 'right',
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  totalRowFinal: {
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    paddingTop: 8,
    marginTop: 5,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalFinalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalFinalValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  notesSection: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  notesBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  termsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  termsBox: {
    width: '48%',
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  termsText: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  footerNote: {
    fontSize: 8,
    color: '#9CA3AF',
    marginTop: 5,
  },
});

interface PDFInvoiceTemplateProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  settings?: Record<string, any>;
}

export const PDFInvoiceTemplate: React.FC<PDFInvoiceTemplateProps> = ({
  invoice,
  companyInfo,
  settings = {},
}) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'INR': return '₹';
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '₹';
    }
  };

  const currencySymbol = getCurrencySymbol(invoice.currency);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return [styles.statusBadge, styles.statusPaid];
      case 'sent':
        return [styles.statusBadge, styles.statusSent];
      case 'overdue':
        return [styles.statusBadge, styles.statusOverdue];
      default:
        return [styles.statusBadge, styles.statusDraft];
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {companyInfo.logo && settings.showLogo !== false && (
              <Image src={companyInfo.logo} style={styles.logo} />
            )}
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>{companyInfo.name}</Text>
              <Text style={styles.companyText}>{companyInfo.address}</Text>
              {companyInfo.city && companyInfo.state && (
                <Text style={styles.companyText}>
                  {companyInfo.city}, {companyInfo.state} {companyInfo.pinCode}
                </Text>
              )}
              <Text style={styles.companyText}>{companyInfo.country}</Text>
              {companyInfo.phone && (
                <Text style={styles.companyText}>Phone: {companyInfo.phone}</Text>
              )}
              {companyInfo.email && (
                <Text style={styles.companyText}>Email: {companyInfo.email}</Text>
              )}
              {companyInfo.gstin && (
                <Text style={styles.companyText}>GSTIN: {companyInfo.gstin}</Text>
              )}
              {companyInfo.taxId && (
                <Text style={styles.companyText}>PAN: {companyInfo.taxId}</Text>
              )}
            </View>
          </View>

          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={styles.invoiceDetails}>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.label}>Invoice #:</Text>
                <Text>{invoice.number}</Text>
              </View>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.label}>Date:</Text>
                <Text>{new Date(invoice.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.label}>Due Date:</Text>
                <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
              </View>
              <View style={styles.invoiceDetailRow}>
                <Text style={styles.label}>Status:</Text>
                <View style={getStatusStyle(invoice.status)}>
                  <Text>{invoice.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        {settings.showCustomerInfo !== false && (
          <View style={styles.customerSection}>
            <View style={styles.customerBox}>
              <Text style={styles.customerTitle}>Bill To:</Text>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{invoice.customer.name}</Text>
                {invoice.customer.address && (
                  <Text style={styles.customerText}>{invoice.customer.address}</Text>
                )}
                {invoice.customer.phone && (
                  <Text style={styles.customerText}>Phone: {invoice.customer.phone}</Text>
                )}
                {invoice.customer.email && (
                  <Text style={styles.customerText}>Email: {invoice.customer.email}</Text>
                )}
              </View>
            </View>

            <View style={styles.customerBox}>
              <Text style={styles.customerTitle}>Ship To:</Text>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{invoice.customer.name}</Text>
                {invoice.customer.address && (
                  <Text style={styles.customerText}>{invoice.customer.address}</Text>
                )}
                {invoice.customer.phone && (
                  <Text style={styles.customerText}>Phone: {invoice.customer.phone}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
            >
              <Text style={styles.colItem}>{item.name}</Text>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>
                {currencySymbol}
                {item.unitPrice.toFixed(2)}
              </Text>
              <Text style={styles.colTotal}>
                {currencySymbol}
                {item.total.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text>
                {currencySymbol}
                {invoice.subtotal.toFixed(2)}
              </Text>
            </View>
            {settings.showTaxBreakdown !== false && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
                <Text>
                  {currencySymbol}
                  {invoice.taxAmount.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.totalRowFinal]}>
              <Text style={styles.totalFinalLabel}>Total:</Text>
              <Text style={styles.totalFinalValue}>
                {currencySymbol}
                {invoice.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          </View>
        )}

        {/* Terms and Payment Instructions */}
        {(settings.includeTerms || settings.includePaymentInstructions) && (
          <View style={styles.termsSection}>
            {settings.includeTerms && settings.termsText && (
              <View style={styles.termsBox}>
                <Text style={styles.termsTitle}>Terms & Conditions:</Text>
                <View style={styles.termsText}>
                  <Text>{settings.termsText}</Text>
                </View>
              </View>
            )}

            {settings.includePaymentInstructions && settings.paymentInstructions && (
              <View style={styles.termsBox}>
                <Text style={styles.termsTitle}>Payment Instructions:</Text>
                <View style={styles.termsText}>
                  <Text>{settings.paymentInstructions}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerNote}>This is a computer generated invoice</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFInvoiceTemplate;
