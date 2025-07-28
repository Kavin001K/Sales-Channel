import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Customer } from '@/lib/types';
import { saveProduct, saveCustomer } from '@/lib/storage';

interface ExcelImportProps {
  type: 'products' | 'customers';
  onImportComplete?: () => void;
}

export const ExcelImport = ({ type, onImportComplete }: ExcelImportProps) => {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResults(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      let success = 0;
      const errors: string[] = [];

      const UOM_OPTIONS = [
        'UNT', 'TON', 'TBS', 'SQY', 'SQM', 'SQF', 'SET', 'ROL', 'QTL', 'PCS', 'PAC', 'NOS', 'MTR', 'MLT', 'KLR', 'KGS', 'GMS', 'DOZ', 'CTN', 'CMS', 'CCM', 'CBM', 'CAN', 'BUN', 'BTL', 'BOX', 'BKL', 'BDL', 'BAL', 'BAG'
      ];
      const YN_OPTIONS = ['Y', 'N'];
      const TYPE_OPTIONS = ['Product', 'Service'];

      if (type === 'products') {
        for (const [rowNum, row] of jsonData.entries()) {
          // Trim all string fields
          Object.keys(row).forEach(key => {
            if (typeof row[key] === 'string') row[key] = row[key].trim();
          });
          // Enforce required fields
          const requiredFields = [
            'Type* (Product / Service)', 'Group* (Max. 50 Chars)', 'Brand* (Max. 50 Chars)',
            'Product Name* (Max. 50 Chars)', 'Sale Price* (Max. 10 Chars) (Numeric)', 'Unit (Max. 10 Chars)'
          ];
          let missing = requiredFields.filter(f => !row[f] || row[f] === '');
          if (missing.length) {
            errors.push(`Row ${rowNum + 2}: Missing required fields: ${missing.join(', ')}`);
            continue;
          }
          // Validate Type
          if (!TYPE_OPTIONS.includes(row['Type* (Product / Service)'])) {
            errors.push(`Row ${rowNum + 2}: Invalid Type (must be Product or Service)`);
            continue;
          }
          // Validate Unit
          if (!UOM_OPTIONS.includes(row['Unit (Max. 10 Chars)'])) {
            errors.push(`Row ${rowNum + 2}: Invalid Unit (must be one of ${UOM_OPTIONS.join(', ')})`);
            continue;
          }
          // Validate all Y/N columns, default to 'N' if missing
          for (const col of [
            'Print Description (Y/N)', 'One Click Sale (Y/N)', 'Enable Tracking (Y/N)', 'Print Serial (Y/N)', 'Not For Sale (Y/N)'
          ]) {
            if (!row[col]) row[col] = 'N';
            if (!YN_OPTIONS.includes(row[col])) {
              errors.push(`Row ${rowNum + 2}: Invalid value for ${col} (must be Y or N)`);
              continue;
            }
          }
            const product: Product = {
              id: Date.now().toString() + Math.random().toString(36),
            type: row['Type* (Product / Service)'] || '',
            group: row['Group* (Max. 50 Chars)'] || '',
            brand: row['Brand* (Max. 50 Chars)'] || '',
            itemCode: row['Item Code (Max. 50 Chars)'] || '',
            name: row['Product Name* (Max. 50 Chars)'] || '',
            printName: row['Print Name (Max. 50 Chars)'] || '',
            unit: row['Unit (Max. 10 Chars)'] || '',
            stock: parseInt(row['Opening Stock (Max. 5 Chars) (Numeric)'] || '0'),
            openingStockValue: parseFloat(row['Opening Stock Value (Max. 10 Chars) (Numeric)'] || '0'),
            cost: parseFloat(row['Purchase Price* (Max. 10 Chars) (Numeric)'] || '0'),
            price: parseFloat(row['Sale Price* (Max. 10 Chars) (Numeric)'] || '0'),
            minSalePrice: parseFloat(row['Min. Sale Price (Max. 10 Chars) (Numeric)'] || '0'),
            mrp: parseFloat(row['M.R.P. (Max. 10 Chars) (Numeric)'] || '0'),
            hsn: row['HSN/SAC (Max. 8 Chars) (Numeric)'] || '',
            taxRate: parseFloat(row['GST Rate (%)* (Max. 5 Chars) (Numeric)'] || '0'),
            saleDiscount: parseFloat(row['Sale Discount (%) (Max. 5 Chars) (Numeric)'] || '0'),
            minStock: parseInt(row['Reorder Level (Max. 5 Chars) (Numeric)'] || '0'),
            description: row['Description (Max. 250 Chars)'] || '',
            printDescription: row['Print Description (Y/N)'] || '',
            oneClickSale: row['One Click Sale (Y/N)'] || '',
            enableTracking: row['Enable Tracking (Y/N)'] || '',
            printSerial: row['Print Serial (Y/N)'] || '',
            notForSale: row['Not For Sale (Y/N)'] || '',
            productType: row['Product Type (General/Apparel/Footwear)'] || '',
            category: row['Category'] || '',
              isActive: true,
              createdAt: new Date(),
            updatedAt: new Date(),
            };
            if (product.name && product.price > 0) {
              saveProduct(product);
              success++;
            } else {
            errors.push(`Row ${rowNum + 2}: Missing name or invalid price`);
          }
        }
      } else if (type === 'customers') {
        // Load all existing customers to check for duplicates
        const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
        for (const row of jsonData) {
          try {
            // Trim all string fields
            Object.keys(row).forEach(key => {
              if (typeof row[key] === 'string') row[key] = row[key].trim();
            });
            const phone = (row as any).phone || (row as any).Phone || '';
            const email = (row as any).email || (row as any).Email || '';
            // Check for duplicate phone or email
            if (existingCustomers.some((c: any) => c.phone === phone && phone !== '' || c.email === email && email !== '')) {
              errors.push(`Duplicate customer with phone/email: ${phone || email}`);
              continue;
            }
            const customer: Customer = {
              id: Date.now().toString() + Math.random().toString(36),
              name: (row as any).name || (row as any).Name || '',
              email: email,
              phone: phone,
              address: {
                street: (row as any).street || (row as any).Street || '',
                city: (row as any).city || (row as any).City || '',
                state: (row as any).state || (row as any).State || '',
                zipCode: (row as any).zipCode || (row as any).ZipCode || ''
              },
              loyaltyPoints: parseInt((row as any).loyaltyPoints || (row as any).LoyaltyPoints || '0'),
              totalSpent: parseFloat((row as any).totalSpent || (row as any).TotalSpent || '0'),
              visits: parseInt((row as any).visits || (row as any).Visits || '0'),
              notes: (row as any).notes || (row as any).Notes || '',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            if (customer.name && (customer.phone || customer.email)) {
              saveCustomer(customer);
              success++;
            } else {
              errors.push(`Row ${success + errors.length + 1}: Missing name or contact info`);
            }
          } catch (error) {
            errors.push(`Row ${success + errors.length + 1}: ${error}`);
          }
        }
      }

      setResults({ success, errors });
      toast.success(`Successfully imported ${success} ${type}`);
      onImportComplete?.();
    } catch (error) {
      toast.error('Failed to process Excel file');
      setResults({ success: 0, errors: ['Failed to read Excel file'] });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const downloadTemplate = () => {
    let templateData: any[] = [];
    
    // UOM dropdown list
    const UOM_OPTIONS = [
      'UNT', 'TON', 'TBS', 'SQY', 'SQM', 'SQF', 'SET', 'ROL', 'QTL', 'PCS', 'PAC', 'NOS', 'MTR', 'MLT', 'KLR', 'KGS', 'GMS', 'DOZ', 'CTN', 'CMS', 'CCM', 'CBM', 'CAN', 'BUN', 'BTL', 'BOX', 'BKL', 'BDL', 'BAL', 'BAG'
    ];

    // Product template: all required and validated columns, correct order and names
    const productTemplate = [{
      'Type* (Product / Service)': 'Product',
      'Group* (Max. 50 Chars)': 'General',
      'Brand* (Max. 50 Chars)': 'BrandX',
      'Item Code (Max. 50 Chars)': 'ITEM001',
      'Product Name* (Max. 50 Chars)': 'Sample Product',
      'Print Name (Max. 50 Chars)': 'Sample Product',
      'Unit (Max. 10 Chars)': 'PCS',
      'Opening Stock (Max. 5 Chars) (Numeric)': 100,
      'Opening Stock Value (Max. 10 Chars) (Numeric)': 1000,
      'Purchase Price* (Max. 10 Chars) (Numeric)': 50.00,
      'Sale Price* (Max. 10 Chars) (Numeric)': 99.99,
      'Min. Sale Price (Max. 10 Chars) (Numeric)': 80,
      'M.R.P. (Max. 10 Chars) (Numeric)': 120,
      'HSN/SAC (Max. 8 Chars) (Numeric)': '1234',
      'GST Rate (%)* (Max. 5 Chars) (Numeric)': 18,
      'Sale Discount (%) (Max. 5 Chars) (Numeric)': 5,
      'Reorder Level (Max. 5 Chars) (Numeric)': 10,
      'Description (Max. 250 Chars)': 'Sample product description',
      'Print Description (Y/N)': 'Y',
      'One Click Sale (Y/N)': 'N',
      'Enable Tracking (Y/N)': 'Y',
      'Print Serial (Y/N)': 'N',
      'Not For Sale (Y/N)': 'N',
      'Product Type (General/Apparel/Footwear)': 'General',
      'Category': 'Beverages'
    }];

    // Customer template: all fields used in import logic, correct names
    const customerTemplate = [{
        Name: 'John Doe',
      Email: 'john@example.com',
        Phone: '9876543210',
        Street: '123 Main St',
        City: 'Mumbai',
        State: 'Maharashtra',
      ZipCode: '400001',
      LoyaltyPoints: 0,
      TotalSpent: 0,
      Visits: 0,
      Notes: 'VIP customer'
    }];

    if (type === 'products') {
      templateData = productTemplate;
    } else {
      templateData = customerTemplate;
    }

    const ws = XLSX.utils.json_to_sheet(templateData);

    // Add data validation (dropdown) for UoM column in product template
    if (type === 'products') {
      // Find the column letter for 'Unit (Max. 10 Chars)'
      const headers = Object.keys(productTemplate[0]);
      const uomColIdx = headers.indexOf('Unit (Max. 10 Chars)');
      if (uomColIdx !== -1) {
        // Excel columns are A, B, C, ...
        const colLetter = String.fromCharCode(65 + uomColIdx);
        // Data validation for rows 2-100 (enough for most imports)
        for (let i = 2; i <= 100; i++) {
          ws[`${colLetter}${i}`] = ws[`${colLetter}${i}`] || {};
          ws['!dataValidation'] = ws['!dataValidation'] || [];
          ws['!dataValidation'].push({
            sqref: `${colLetter}${i}`,
            type: 'list',
            allowBlank: false,
            formula1: '"' + UOM_OPTIONS.join(',') + '"'
          });
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_template.xlsx`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Import {type === 'products' ? 'Products' : 'Customers'} from Excel
        </CardTitle>
        <CardDescription>
          Upload an Excel file to bulk import {type}. Download the template below for the correct format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            Download Template
          </Button>
        </div>

        <div>
          <Label htmlFor="excel-file">Choose Excel File</Label>
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={uploading}
            className="mt-1"
          />
        </div>

        {uploading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="w-4 h-4 animate-spin" />
            Processing file...
          </div>
        )}

        {results && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Successfully imported: {results.success} items
            </div>
            
            {results.errors.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" />
                  Errors: {results.errors.length}
                </div>
                <div className="max-h-32 overflow-y-auto text-sm text-muted-foreground">
                  {results.errors.map((error, index) => (
                    <div key={index}>• {error}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};