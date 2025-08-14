import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Building2, Receipt, Printer, Bell, Info, FileText } from "lucide-react";
import { getEmployeeIdSettings, setEmployeeIdSettings } from "@/lib/storage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface CompanySettings {
  name: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  email: string;
  phone: string;
  taxId: string; // PAN No.
  gstin: string;
  taxationMethod: string;
  currency: string;
  logo?: string;
}

interface PrintTemplateSettings {
  header: string;
  footer: string;
  showLogo: boolean;
  showTaxBreakdown: boolean;
  showCustomerInfo: boolean;
  paperSize: 'a4' | 'thermal';
  fontSize: number;
  includeBarcode: boolean;
}

interface NotificationSettings {
  lowStockAlerts: boolean;
  dailyReports: boolean;
  transactionAlerts: boolean;
  emailNotifications: boolean;
}

interface GeneralSettings {
  currency: string;
  timezone: string;
  dateFormat: string;
  autoBackup: boolean;
  sessionTimeout: number;
}

interface InvoiceTemplateSettings {
  defaultTemplate: number;
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultNotes: string;
  showLogo: boolean;
  showTaxBreakdown: boolean;
  showCustomerInfo: boolean;
  autoGenerateInvoiceNumber: boolean;
  invoiceNumberPrefix: string;
  includeTerms: boolean;
  termsText: string;
  includePaymentInstructions: boolean;
  paymentInstructions: string;
}

const Settings = () => {
  const { toast } = useToast();
  const { adminAuth, employee } = useAuth();
  const navigate = useNavigate();
  
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: "Ace-Bill",
    address: "123 Business Street, City, State 12345",
    city: "",
    state: "Tamil Nadu",
    pinCode: "",
    country: "India",
    email: "contact@acebill.com",
    phone: "",
    taxId: "TAX123456789",
    gstin: "",
    taxationMethod: "Not Applicable",
    currency: "Indian Rupee",
    logo: undefined
  });

  const [printSettings, setPrintSettings] = useState<PrintTemplateSettings>({
    header: "Thank you for your business!",
    footer: "Please keep this receipt for your records.",
    showLogo: true,
    showTaxBreakdown: true,
    showCustomerInfo: true,
    paperSize: 'thermal',
    fontSize: 12,
    includeBarcode: true
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    lowStockAlerts: true,
    dailyReports: false,
    transactionAlerts: true,
    emailNotifications: false
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    currency: "INR",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    autoBackup: true,
    sessionTimeout: 60
  });

  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceTemplateSettings>({
    defaultTemplate: 1,
    defaultCurrency: "INR",
    defaultTaxRate: 18,
    defaultNotes: "Thank you for your business!",
    showLogo: true,
    showTaxBreakdown: true,
    showCustomerInfo: true,
    autoGenerateInvoiceNumber: true,
    invoiceNumberPrefix: "INV",
    includeTerms: false,
    termsText: "Payment is due within 30 days. Late payments may incur additional charges.",
    includePaymentInstructions: false,
    paymentInstructions: "Please make payment to the account details provided above."
  });

  const [companyErrors, setCompanyErrors] = useState<string[]>([]);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [empIdPrefix, setEmpIdPrefix] = useState("EMP");
  const [empIdDigits, setEmpIdDigits] = useState(3);
  const [empIdNext, setEmpIdNext] = useState(1);

  useEffect(() => {
    // Guard: super admin/company platform admin should not access company settings
    if (adminAuth.isAuthenticated) {
      navigate('/admin/settings', { replace: true });
      return;
    }
    // Only company owners and admin employees can access settings
    if (employee && (employee.position?.toLowerCase() !== 'admin')) {
      navigate('/unauthorized', { replace: true });
      return;
    }
    // Load settings from localStorage
    const savedCompany = localStorage.getItem('company_settings');
    const savedPrint = localStorage.getItem('print_settings');
    const savedNotifications = localStorage.getItem('notification_settings');
    const savedGeneral = localStorage.getItem('general_settings');
    const savedInvoice = localStorage.getItem('invoice_settings');

    if (savedCompany) setCompanySettings(JSON.parse(savedCompany));
    if (savedPrint) setPrintSettings(JSON.parse(savedPrint));
    if (savedNotifications) setNotificationSettings(JSON.parse(savedNotifications));
    if (savedGeneral) setGeneralSettings(JSON.parse(savedGeneral));
    if (savedInvoice) setInvoiceSettings(JSON.parse(savedInvoice));

    // Load employee ID settings from backend/local
    (async () => {
      const s = await getEmployeeIdSettings();
      setEmpIdPrefix(s.prefix);
      setEmpIdDigits(s.digits);
      setEmpIdNext(s.next);
    })();
  }, []);

  const saveCompanySettings = () => {
    setIsSavingCompany(true);
    try {
      // Debug: log the city value
      console.log('City value:', companySettings.city);
      // Validation
      const errors = [];
      if (!(companySettings.name || '').trim()) errors.push("Company Name is required");
      if (!(companySettings.city || '').trim()) errors.push("City is required");
      if (!(companySettings.state || '').trim()) errors.push("State is required");
      if (!(companySettings.phone || '').trim()) errors.push("Phone is required");
      setCompanyErrors(errors);
      if (errors.length > 0) {
        toast({
          title: "Please fill all required fields",
          description: errors.join(", "),
          variant: "destructive"
        });
        setIsSavingCompany(false);
        return;
      }
      localStorage.setItem('company_settings', JSON.stringify(companySettings));
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
      toast({
        title: "Saved successfully!",
        description: "Your company information has been updated.",
        variant: "default"
      });
    } catch (err) {
      toast({
        title: "Failed to save settings",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsSavingCompany(false);
    }
  };

  const savePrintSettings = () => {
    localStorage.setItem('print_settings', JSON.stringify(printSettings));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
    toast({
      title: "Print template saved",
      description: "Your receipt template has been updated successfully.",
    });
  };

  const saveNotificationSettings = () => {
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings));
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const saveGeneralSettings = () => {
    localStorage.setItem('general_settings', JSON.stringify(generalSettings));
    toast({
      title: "General settings saved",
      description: "Your general preferences have been updated.",
    });
  };

  const saveInvoiceSettings = () => {
    localStorage.setItem('invoice_settings', JSON.stringify(invoiceSettings));
    window.dispatchEvent(new CustomEvent('settingsUpdated'));
    toast({
      title: "Invoice settings saved",
      description: "Your invoice template preferences have been updated.",
    });
  };

  // 1. Add state and handler for logo upload and delete
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySettings((prev) => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDelete = () => {
    setCompanySettings((prev) => ({ ...prev, logo: undefined }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Building2 className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="print">Print Template</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your business details that appear on receipts and reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Section: Company Details */}
              <h3 className="font-semibold text-lg mb-2">Company Details</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="company-name"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">Address</Label>
                    <Textarea
                      id="company-address"
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-city">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="company-city"
                        value={companySettings.city}
                        onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-state">State <span className="text-red-500">*</span></Label>
                      <select
                        id="company-state"
                        className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                        value={companySettings.state}
                        onChange={(e) => setCompanySettings({...companySettings, state: e.target.value})}
                        required
                      >
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-pincode">Pin Code</Label>
                      <Input
                        id="company-pincode"
                        value={companySettings.pinCode}
                        onChange={(e) => setCompanySettings({...companySettings, pinCode: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-country">Country</Label>
                      <Input
                        id="company-country"
                        value={companySettings.country}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone <span className="text-red-500">*</span></Label>
                    <Input
                      id="company-phone"
                      value={companySettings.phone}
                      onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                {/* Section: Other Details & Logo */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-2">Other Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="company-pan">PAN No. <Info className="inline w-4 h-4 ml-1" /><span className="sr-only">Permanent Account Number for tax purposes.</span></Label>
                    <Input
                      id="company-pan"
                      value={companySettings.taxId}
                      onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-gstin">GSTIN <Info className="inline w-4 h-4 ml-1" /><span className="sr-only">Goods and Services Tax Identification Number.</span></Label>
                    <Input
                      id="company-gstin"
                      value={companySettings.gstin}
                      onChange={(e) => setCompanySettings({...companySettings, gstin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-taxation">Taxation Method <Info className="inline w-4 h-4 ml-1" /><span className="sr-only">Choose the applicable taxation method for your business.</span></Label>
                    <select
                      id="company-taxation"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      value={companySettings.taxationMethod}
                      onChange={(e) => setCompanySettings({...companySettings, taxationMethod: e.target.value})}
                    >
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Regular">Regular</option>
                      <option value="Composition">Composition</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-currency">Currency</Label>
                    <select
                      id="company-currency"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      value={companySettings.currency}
                      onChange={(e) => setCompanySettings({...companySettings, currency: e.target.value})}
                    >
                      <option value="Indian Rupee">Indian Rupee (₹)</option>
                    </select>
                  </div>
                  {/* Section: Company Logo */}
                  <h3 className="font-semibold text-lg mb-2">Company Logo</h3>
                  <div className="space-y-2">
                    <div className="flex flex-col items-center border rounded-md p-4 bg-muted/50">
                      {companySettings.logo ? (
                        <>
                          <img src={companySettings.logo} alt="Company Logo" className="w-32 h-32 object-contain mb-2 border bg-white" />
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleLogoDelete} className="text-red-500 border-red-300 hover:bg-red-50">
                              <span role="img" aria-label="Delete">🗑️</span> Delete
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <span role="img" aria-label="Upload">⬆️</span>
                            <span>Upload Logo</span>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={saveCompanySettings} className="w-32" disabled={isSavingCompany}>
                  <span role="img" aria-label="Save">💾</span> {isSavingCompany ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employee Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee ID Settings</CardTitle>
              <CardDescription>Customize how new Employee IDs are generated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emp-prefix">Prefix</Label>
                  <Input id="emp-prefix" value={empIdPrefix} onChange={(e) => setEmpIdPrefix(e.target.value.toUpperCase())} />
                </div>
                <div>
                  <Label htmlFor="emp-digits">Digits</Label>
                  <Input id="emp-digits" type="number" min={2} max={6} value={empIdDigits} onChange={(e) => setEmpIdDigits(Math.max(2, Math.min(6, parseInt(e.target.value||"3"))))} />
                </div>
                <div>
                  <Label htmlFor="emp-next">Next Number</Label>
                  <Input id="emp-next" type="number" min={1} value={empIdNext} onChange={(e) => setEmpIdNext(Math.max(1, parseInt(e.target.value||"1")))} />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Preview: {empIdPrefix}{String(empIdNext).padStart(empIdDigits, '0')}</div>
              <Button onClick={async () => {
                await setEmployeeIdSettings({ prefix: empIdPrefix, digits: empIdDigits, next: empIdNext });
                toast({ title: "Employee ID settings saved" });
              }}>Save Employee ID Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="print" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Print Template Settings
              </CardTitle>
              <CardDescription>
                Customize how your receipts and invoices look when printed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="header-text">Header Text</Label>
                  <Input
                    id="header-text"
                    value={printSettings.header}
                    onChange={(e) => setPrintSettings({...printSettings, header: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                    id="footer-text"
                    value={printSettings.footer}
                    onChange={(e) => setPrintSettings({...printSettings, footer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paper-size">Paper Size</Label>
                  <select
                    id="paper-size"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    value={printSettings.paperSize}
                    onChange={(e) => setPrintSettings({...printSettings, paperSize: e.target.value as 'a4' | 'thermal'})}
                  >
                    <option value="thermal">Thermal (80mm)</option>
                    <option value="a4">A4 Paper</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size</Label>
                  <Input
                    id="font-size"
                    type="number"
                    min="8"
                    max="20"
                    value={printSettings.fontSize}
                    onChange={(e) => setPrintSettings({...printSettings, fontSize: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="font-medium">Display Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo">Show Company Logo</Label>
                    <Switch
                      id="show-logo"
                      checked={printSettings.showLogo}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, showLogo: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tax">Show Tax Breakdown</Label>
                    <Switch
                      id="show-tax"
                      checked={printSettings.showTaxBreakdown}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, showTaxBreakdown: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-customer">Show Customer Info</Label>
                    <Switch
                      id="show-customer"
                      checked={printSettings.showCustomerInfo}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, showCustomerInfo: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-barcode">Include Barcode</Label>
                    <Switch
                      id="include-barcode"
                      checked={printSettings.includeBarcode}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, includeBarcode: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={savePrintSettings}>
                <Printer className="h-4 w-4 mr-2" />
                Save Print Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Template Settings
              </CardTitle>
              <CardDescription>
                Customize your invoice templates and default settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Template Selection */}
              <div className="space-y-4">
                <h4 className="font-medium">Default Template</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((templateNum) => (
                    <div
                      key={templateNum}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        invoiceSettings.defaultTemplate === templateNum
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setInvoiceSettings({...invoiceSettings, defaultTemplate: templateNum})}
                    >
                      <div className="text-center">
                        <div className="w-full h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <span className="text-sm font-medium">Template {templateNum}</span>
                        </div>
                        <span className="text-sm">Template {templateNum}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Default Settings */}
              <div className="space-y-4">
                <h4 className="font-medium">Default Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <select
                      id="default-currency"
                      className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                      value={invoiceSettings.defaultCurrency}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultCurrency: e.target.value})}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
                    <Input
                      id="default-tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoiceSettings.defaultTaxRate}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultTaxRate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
                    <Input
                      id="invoice-prefix"
                      value={invoiceSettings.invoiceNumberPrefix}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, invoiceNumberPrefix: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-notes">Default Notes</Label>
                    <Textarea
                      id="default-notes"
                      value={invoiceSettings.defaultNotes}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, defaultNotes: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Display Options</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-logo-invoice">Show Company Logo</Label>
                    <Switch
                      id="show-logo-invoice"
                      checked={invoiceSettings.showLogo}
                      onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, showLogo: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-tax-breakdown">Show Tax Breakdown</Label>
                    <Switch
                      id="show-tax-breakdown"
                      checked={invoiceSettings.showTaxBreakdown}
                      onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, showTaxBreakdown: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-customer-info">Show Customer Info</Label>
                    <Switch
                      id="show-customer-info"
                      checked={invoiceSettings.showCustomerInfo}
                      onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, showCustomerInfo: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-generate-number">Auto Generate Invoice Number</Label>
                    <Switch
                      id="auto-generate-number"
                      checked={invoiceSettings.autoGenerateInvoiceNumber}
                      onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, autoGenerateInvoiceNumber: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Terms and Conditions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-terms">Include Terms & Conditions</Label>
                    <p className="text-sm text-muted-foreground">Add terms and conditions to your invoices</p>
                  </div>
                  <Switch
                    id="include-terms"
                    checked={invoiceSettings.includeTerms}
                    onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, includeTerms: checked})}
                  />
                </div>
                {invoiceSettings.includeTerms && (
                  <div className="space-y-2">
                    <Label htmlFor="terms-text">Terms & Conditions Text</Label>
                    <Textarea
                      id="terms-text"
                      value={invoiceSettings.termsText}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, termsText: e.target.value})}
                      rows={3}
                      placeholder="Enter your terms and conditions..."
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Payment Instructions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="include-payment">Include Payment Instructions</Label>
                    <p className="text-sm text-muted-foreground">Add payment instructions to your invoices</p>
                  </div>
                  <Switch
                    id="include-payment"
                    checked={invoiceSettings.includePaymentInstructions}
                    onCheckedChange={(checked) => setInvoiceSettings({...invoiceSettings, includePaymentInstructions: checked})}
                  />
                </div>
                {invoiceSettings.includePaymentInstructions && (
                  <div className="space-y-2">
                    <Label htmlFor="payment-instructions">Payment Instructions</Label>
                    <Textarea
                      id="payment-instructions"
                      value={invoiceSettings.paymentInstructions}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, paymentInstructions: e.target.value})}
                      rows={3}
                      placeholder="Enter payment instructions..."
                    />
                  </div>
                )}
              </div>

              <Button onClick={saveInvoiceSettings} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Save Invoice Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="low-stock">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when products are running low</p>
                  </div>
                  <Switch
                    id="low-stock"
                    checked={notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, lowStockAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="daily-reports">Daily Reports</Label>
                    <p className="text-sm text-muted-foreground">Receive daily sales summary reports</p>
                  </div>
                  <Switch
                    id="daily-reports"
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, dailyReports: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="transaction-alerts">Transaction Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get alerts for large transactions</p>
                  </div>
                  <Switch
                    id="transaction-alerts"
                    checked={notificationSettings.transactionAlerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, transactionAlerts: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications to your email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                  />
                </div>
              </div>
              
              <Button onClick={saveNotificationSettings}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select
                    id="timezone"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({...generalSettings, timezone: e.target.value})}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    className="w-full p-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({...generalSettings, dateFormat: e.target.value})}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    min="15"
                    max="480"
                    value={generalSettings.sessionTimeout}
                    onChange={(e) => setGeneralSettings({...generalSettings, sessionTimeout: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                </div>
                <Switch
                  id="auto-backup"
                  checked={generalSettings.autoBackup}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoBackup: checked})}
                />
              </div>
              
              <Button onClick={saveGeneralSettings}>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;