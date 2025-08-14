# Invoice Integration Guide

## Overview

This document outlines the integration of bill and invoice functionality from the Bill folder into the main Sales-Channel application. The integration provides a complete invoice management system with templates, settings, and PDF generation capabilities.

## Features Integrated

### 1. Invoice Management
- **Invoice Creation**: Create invoices with customer details, items, and tax calculations
- **Invoice Templates**: 9 different invoice templates to choose from
- **Invoice Status Tracking**: Track invoices as draft, sent, paid, overdue, or cancelled
- **Invoice Viewer**: View invoices with print and download capabilities

### 2. Settings Integration
- **Invoice Template Settings**: Configure default templates and display options
- **Company Information**: Use company details from settings for invoice headers
- **Tax and Currency Settings**: Configure default tax rates and currency
- **Terms and Conditions**: Add custom terms and payment instructions

### 3. Navigation and Routing
- **Invoice Navigation**: Added "Invoices" to the main navigation menu
- **Role-based Access**: Invoices accessible to company, admin, and manager roles
- **Dashboard Integration**: Invoice statistics displayed on the main dashboard

## Files Created/Modified

### New Files
```
src/pages/Invoices.tsx                    # Main invoice management page
src/lib/invoice-utils.ts                  # Invoice utility functions
src/components/invoice/InvoiceTemplate.tsx # Invoice template component
src/components/invoice/InvoiceViewer.tsx   # Invoice viewer with print/download
```

### Modified Files
```
src/pages/Settings.tsx                    # Added invoice template settings tab
src/components/layout/AppSidebar.tsx      # Added invoice navigation item
src/App.tsx                               # Added invoice route
src/pages/Dashboard.tsx                   # Added invoice statistics
```

## Key Components

### 1. Invoice Management Page (`src/pages/Invoices.tsx`)
- **Features**:
  - Create new invoices with multi-step form
  - View invoice list with search and filtering
  - Invoice statistics dashboard
  - Delete and view invoice actions

- **Form Sections**:
  - Invoice Details (template, currency, customer info)
  - Items (add/remove items with quantity and pricing)
  - Preview (real-time invoice preview)

### 2. Invoice Utilities (`src/lib/invoice-utils.ts`)
- **Functions**:
  - `calculateInvoiceTotals()`: Calculate subtotal, tax, and total
  - `generateInvoiceNumber()`: Generate unique invoice numbers
  - `formatCurrency()`: Format amounts with currency symbols
  - `getCompanyInfo()`: Get company information from settings
  - `getInvoiceSettings()`: Get invoice template settings
  - `saveInvoice()`, `getInvoices()`, `updateInvoice()`, `deleteInvoice()`: CRUD operations
  - `getInvoiceStats()`: Calculate invoice statistics

### 3. Invoice Template (`src/components/invoice/InvoiceTemplate.tsx`)
- **Features**:
  - Professional invoice layout
  - Company logo and information display
  - Customer billing and shipping information
  - Itemized product list with totals
  - Tax breakdown and final totals
  - Notes, terms, and payment instructions
  - Print-friendly styling

### 4. Invoice Viewer (`src/components/invoice/InvoiceViewer.tsx`)
- **Features**:
  - Modal dialog for viewing invoices
  - Print functionality (opens print dialog)
  - Download functionality (text format)
  - Responsive design

### 5. Settings Integration (`src/pages/Settings.tsx`)
- **New Tab**: "Invoice Templates"
- **Settings**:
  - Default template selection (1-9)
  - Default currency and tax rate
  - Display options (logo, tax breakdown, customer info)
  - Terms and conditions text
  - Payment instructions
  - Invoice number prefix

## Data Structure

### Invoice Interface
```typescript
interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  template: number;
  currency: string;
}
```

### Invoice Item Interface
```typescript
interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
```

## Usage Instructions

### Creating an Invoice
1. Navigate to **Invoices** in the main menu
2. Click **Create Invoice** button
3. Fill in the invoice details:
   - Select template and currency
   - Enter customer information
   - Add items with quantities and prices
   - Add notes if needed
4. Preview the invoice
5. Click **Create Invoice** to save

### Managing Invoices
1. View all invoices in the main table
2. Use search and status filters
3. Click **View** to see invoice details
4. Use **Print** or **Download** options
5. **Edit** or **Delete** invoices as needed

### Configuring Invoice Settings
1. Go to **Settings** → **Invoice Templates**
2. Select default template
3. Configure currency, tax rate, and display options
4. Add terms and payment instructions
5. Save settings

## Integration Points

### 1. Company Settings
- Invoice templates use company information from Settings
- Company logo, address, tax details automatically included
- GSTIN and PAN numbers displayed on invoices

### 2. Dashboard Integration
- Invoice statistics shown on main dashboard
- Total invoices, paid, pending counts
- Quick overview of invoice status

### 3. Navigation
- Invoices accessible from main sidebar
- Role-based access control
- Consistent with existing navigation patterns

## Future Enhancements

### 1. PDF Generation
- Integrate jsPDF for proper PDF generation
- Multiple template layouts
- Email integration for sending invoices

### 2. Advanced Features
- Invoice numbering sequences
- Recurring invoices
- Payment tracking
- Invoice reminders

### 3. Template System
- Custom template builder
- Template preview system
- Template import/export

## Technical Notes

### Storage
- Invoices stored in localStorage
- Settings integrated with existing settings system
- Company information from existing settings

### Performance
- Lazy loading of invoice components
- Efficient filtering and search
- Optimized rendering for large invoice lists

### Security
- Role-based access control
- Input validation
- Data sanitization

## Troubleshooting

### Common Issues
1. **Invoice not saving**: Check localStorage permissions
2. **Print not working**: Ensure popup blockers are disabled
3. **Template not loading**: Verify template settings are saved
4. **Company info missing**: Complete company settings first

### Debug Steps
1. Check browser console for errors
2. Verify localStorage data
3. Test with different browsers
4. Check role permissions

## Conclusion

The invoice integration provides a complete billing solution that integrates seamlessly with the existing Sales-Channel application. The modular design allows for easy customization and future enhancements while maintaining consistency with the existing codebase.
