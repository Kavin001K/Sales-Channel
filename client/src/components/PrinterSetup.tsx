import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Printer, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  USB, 
  Wifi, 
  Cable,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { thermalPrinter } from '@/lib/thermalPrinter';

interface PrinterConfig {
  name: string;
  type: 'usb' | 'network' | 'bluetooth' | 'serial';
  connection: string;
  paperWidth: 80 | 58;
  autoCut: boolean;
  testMode: boolean;
}

export default function PrinterSetup() {
  const [config, setConfig] = useState<PrinterConfig>({
    name: 'Thermal Printer',
    type: 'usb',
    connection: '',
    paperWidth: 80,
    autoCut: true,
    testMode: false
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestPrint = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Create test receipt data
      const testReceiptData = {
        companyName: 'ACE Business',
        companyAddress: '123 Main Street, City, State 12345',
        companyPhone: '+91 98765 43210',
        companyTaxId: 'GST123456789',
        receiptNumber: 'TEST-001',
        date: new Date().toLocaleString(),
        cashierName: 'Test Cashier',
        customerName: 'Test Customer',
        items: [
          { name: 'Test Item 1', quantity: 2, price: 100, total: 200 },
          { name: 'Test Item 2', quantity: 1, price: 150, total: 150 }
        ],
        subtotal: 350,
        tax: 63,
        total: 413,
        paymentMethod: 'cash',
        paymentDetails: { cashAmount: 500, change: 87 }
      };

      const success = await thermalPrinter.printReceipt(testReceiptData);
      
      if (success) {
        setTestResult('success');
        toast.success('Test print successful! Printer is working correctly.');
      } else {
        setTestResult('error');
        toast.error('Test print failed. Check printer connection and settings.');
      }
    } catch (error) {
      setTestResult('error');
      toast.error('Test print error: ' + (error as Error).message);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    // Save configuration to localStorage
    localStorage.setItem('printerConfig', JSON.stringify(config));
    toast.success('Printer configuration saved successfully!');
  };

  const handleLoadConfig = () => {
    const saved = localStorage.getItem('printerConfig');
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        setConfig(savedConfig);
        toast.success('Printer configuration loaded!');
      } catch (error) {
        toast.error('Failed to load saved configuration');
      }
    } else {
      toast.info('No saved configuration found');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Thermal Printer Setup</h1>
        <p className="text-gray-600">Configure your thermal printer for optimal receipt printing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Printer Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Printer Configuration
            </CardTitle>
            <CardDescription>
              Set up your thermal printer connection and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="printer-name">Printer Name</Label>
              <Input
                id="printer-name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Enter printer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="printer-type">Connection Type</Label>
              <Select value={config.type} onValueChange={(value: 'usb' | 'network' | 'bluetooth' | 'serial') => setConfig({ ...config, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usb">
                    <div className="flex items-center gap-2">
                      <USB className="h-4 w-4" />
                      USB Connection
                    </div>
                  </SelectItem>
                  <SelectItem value="network">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Network/WiFi
                    </div>
                  </SelectItem>
                  <SelectItem value="bluetooth">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      Bluetooth
                    </div>
                  </SelectItem>
                  <SelectItem value="serial">
                    <div className="flex items-center gap-2">
                      <Cable className="h-4 w-4" />
                      Serial Port
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="connection">Connection Details</Label>
              <Input
                id="connection"
                value={config.connection}
                onChange={(e) => setConfig({ ...config, connection: e.target.value })}
                placeholder={
                  config.type === 'usb' ? 'USB Port (e.g., COM3, /dev/ttyUSB0)' :
                  config.type === 'network' ? 'IP Address (e.g., 192.168.1.100)' :
                  config.type === 'bluetooth' ? 'Bluetooth Address (e.g., 00:11:22:33:44:55)' :
                  'Serial Port (e.g., COM1, /dev/ttyS0)'
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paper-width">Paper Width</Label>
              <Select value={config.paperWidth.toString()} onValueChange={(value) => setConfig({ ...config, paperWidth: parseInt(value) as 80 | 58 })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="80">80mm (Standard)</SelectItem>
                  <SelectItem value="58">58mm (Compact)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-cut">Auto Cut Paper</Label>
                <p className="text-sm text-gray-500">Automatically cut paper after printing</p>
              </div>
              <Switch
                id="auto-cut"
                checked={config.autoCut}
                onCheckedChange={(checked) => setConfig({ ...config, autoCut: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="test-mode">Test Mode</Label>
                <p className="text-sm text-gray-500">Enable detailed logging for troubleshooting</p>
              </div>
              <Switch
                id="test-mode"
                checked={config.testMode}
                onCheckedChange={(checked) => setConfig({ ...config, testMode: checked })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveConfig} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save Configuration
              </Button>
              <Button onClick={handleLoadConfig} variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Printer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Printer
            </CardTitle>
            <CardDescription>
              Test your printer connection and print a sample receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Current Configuration:</h4>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Name:</span> {config.name}</div>
                <div><span className="font-medium">Type:</span> 
                  <Badge variant="secondary" className="ml-2">
                    {config.type.toUpperCase()}
                  </Badge>
                </div>
                <div><span className="font-medium">Connection:</span> {config.connection || 'Not specified'}</div>
                <div><span className="font-medium">Paper Width:</span> {config.paperWidth}mm</div>
                <div><span className="font-medium">Auto Cut:</span> 
                  <Badge variant={config.autoCut ? "default" : "secondary"} className="ml-2">
                    {config.autoCut ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Button 
                onClick={handleTestPrint} 
                disabled={isTesting}
                className="w-full"
                size="lg"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Testing Printer...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Print Test Receipt
                  </>
                )}
              </Button>

              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  testResult === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResult === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {testResult === 'success' 
                      ? 'Test print successful! Printer is working correctly.' 
                      : 'Test print failed. Check printer connection and settings.'
                    }
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-semibold">Troubleshooting Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ensure printer is powered on and connected</li>
                <li>• Check USB cable or network connection</li>
                <li>• Verify printer drivers are installed</li>
                <li>• Make sure paper is loaded correctly</li>
                <li>• Try different connection types if available</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Supported Printers */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Thermal Printers</CardTitle>
          <CardDescription>
            Common thermal printer models that work with this system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { brand: 'Epson', models: ['TM-T20', 'TM-T70', 'TM-T88VI', 'TM-T82'] },
              { brand: 'Star', models: ['TSP100', 'TSP143III', 'TSP700II'] },
              { brand: 'Citizen', models: ['CT-S310II', 'CT-S310III', 'CT-S310'] },
              { brand: 'Bixolon', models: ['SRP-350III', 'SRP-350II', 'SRP-350'] },
              { brand: 'POS-X', models: ['EVO HiSpeed', 'EVO HiSpeed Plus'] },
              { brand: 'Honeywell', models: ['PC42t', 'PC43t', 'PC60t'] }
            ].map((printer) => (
              <div key={printer.brand} className="p-3 border rounded-lg">
                <h4 className="font-semibold text-blue-600">{printer.brand}</h4>
                <ul className="text-sm text-gray-600 mt-1">
                  {printer.models.map((model) => (
                    <li key={model}>• {model}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
