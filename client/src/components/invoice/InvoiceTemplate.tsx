import React from 'react';
import { Invoice, CompanyInfo, getCurrencySymbol } from '@/lib/invoice-utils';

interface InvoiceTemplateProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
  settings?: Record<string, unknown>;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ 
  invoice, 
  companyInfo, 
  settings = {} 
}) => {
  const currencySymbol = getCurrencySymbol(invoice.currency);
  
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" style={{ minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-4">
          {companyInfo.logo && settings.showLogo !== false && (
            <img 
              src={companyInfo.logo} 
              alt="Company Logo" 
              className="w-16 h-16 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{companyInfo.name}</h1>
            <p className="text-gray-600">{companyInfo.address}</p>
            {companyInfo.city && companyInfo.state && (
              <p className="text-gray-600">{companyInfo.city}, {companyInfo.state} {companyInfo.pinCode}</p>
            )}
            <p className="text-gray-600">{companyInfo.country}</p>
            {companyInfo.phone && <p className="text-gray-600">Phone: {companyInfo.phone}</p>}
            {companyInfo.email && <p className="text-gray-600">Email: {companyInfo.email}</p>}
            {companyInfo.gstin && <p className="text-gray-600">GSTIN: {companyInfo.gstin}</p>}
            {companyInfo.taxId && <p className="text-gray-600">PAN: {companyInfo.taxId}</p>}
          </div>
        </div>
        
        <div className="text-right">
          <h2 className="text-4xl font-bold text-blue-600 mb-2">INVOICE</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Invoice #:</span> {invoice.number}</p>
            <p><span className="font-semibold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
            <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><span className="font-semibold">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {invoice.status.toUpperCase()}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      {settings.showCustomerInfo !== false && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold">{invoice.customer.name}</p>
              {invoice.customer.address && <p className="text-gray-600">{invoice.customer.address}</p>}
              {invoice.customer.phone && <p className="text-gray-600">Phone: {invoice.customer.phone}</p>}
              {invoice.customer.email && <p className="text-gray-600">Email: {invoice.customer.email}</p>}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ship To:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="font-semibold">{invoice.customer.name}</p>
              {invoice.customer.address && <p className="text-gray-600">{invoice.customer.address}</p>}
              {invoice.customer.phone && <p className="text-gray-600">Phone: {invoice.customer.phone}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Unit Price</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{currencySymbol}{item.unitPrice.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{currencySymbol}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Subtotal:</span>
              <span>{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
            </div>
            {settings.showTaxBreakdown !== false && (
              <div className="flex justify-between">
                <span className="font-semibold">Tax ({invoice.taxRate}%):</span>
                <span>{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{currencySymbol}{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-gray-700">{invoice.notes}</p>
          </div>
        </div>
      )}

      {/* Terms and Payment Instructions */}
      <div className="grid grid-cols-2 gap-8">
        {settings.includeTerms && settings.termsText && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms & Conditions:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 text-sm">{settings.termsText}</p>
            </div>
          </div>
        )}
        
        {settings.includePaymentInstructions && settings.paymentInstructions && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Instructions:</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700 text-sm">{settings.paymentInstructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-gray-600">
        <p>Thank you for your business!</p>
        <p className="text-sm mt-2">This is a computer generated invoice</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;