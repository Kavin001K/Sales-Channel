import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { ExcelImport } from '@/components/import/ExcelImport';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    category: '',
    stock: '',
    minStock: '',
    description: '',
    supplier: '',
    taxRate: '0.08',
    type: 'Product',
    group: '',
    brand: '',
    itemCode: '',
    printName: '',
    unit: '',
    openingStockValue: '',
    minSalePrice: '',
    mrp: '',
    hsn: '',
    saleDiscount: '',
    printDescription: 'N',
    oneClickSale: 'N',
    enableTracking: 'N',
    printSerial: 'N',
    notForSale: 'N',
    productType: 'General'
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const productsData = await getProducts();
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      cost: '',
      sku: '',
      barcode: '',
      category: '',
      stock: '',
      minStock: '',
      description: '',
      supplier: '',
      taxRate: '0.08',
      type: 'Product',
      group: '',
      brand: '',
      itemCode: '',
      printName: '',
      unit: '',
      openingStockValue: '',
      minSalePrice: '',
      mrp: '',
      hsn: '',
      saleDiscount: '',
      printDescription: 'N',
      oneClickSale: 'N',
      enableTracking: 'N',
      printSerial: 'N',
      notForSale: 'N',
      productType: 'General'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost) || 0,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      description: formData.description,
      supplier: formData.supplier,
      taxRate: parseFloat(formData.taxRate) || 0,
      isActive: true,
      type: formData.type,
      group: formData.group,
      brand: formData.brand,
      itemCode: formData.itemCode,
      printName: formData.printName,
      unit: formData.unit,
      openingStockValue: parseFloat(formData.openingStockValue) || 0,
      minSalePrice: parseFloat(formData.minSalePrice) || 0,
      mrp: parseFloat(formData.mrp) || 0,
      hsn: formData.hsn,
      saleDiscount: parseFloat(formData.saleDiscount) || 0,
      printDescription: formData.printDescription,
      oneClickSale: formData.oneClickSale,
      enableTracking: formData.enableTracking,
      printSerial: formData.printSerial,
      notForSale: formData.notForSale,
      productType: formData.productType
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully');
      setEditingProduct(null);
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addProduct(newProduct);
      toast.success('Product added successfully');
    }

    loadProducts();
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      cost: product.cost.toString(),
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category,
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      description: product.description || '',
      supplier: product.supplier || '',
      taxRate: product.taxRate.toString(),
      type: product.type || 'Product',
      group: product.group || '',
      brand: product.brand || '',
      itemCode: product.itemCode || '',
      printName: product.printName || '',
      unit: product.unit || '',
      openingStockValue: product.openingStockValue?.toString() || '',
      minSalePrice: product.minSalePrice?.toString() || '',
      mrp: product.mrp?.toString() || '',
      hsn: product.hsn || '',
      saleDiscount: product.saleDiscount?.toString() || '',
      printDescription: product.printDescription || 'N',
      oneClickSale: product.oneClickSale || 'N',
      enableTracking: product.enableTracking || 'N',
      printSerial: product.printSerial || 'N',
      notForSale: product.notForSale || 'N',
      productType: product.productType || 'General'
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    loadProducts();
    toast.success('Product deleted successfully');
  };

  const getCategories = () => {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const UOM_OPTIONS = [
    'UNT', 'TON', 'TBS', 'SQY', 'SQM', 'SQF', 'SET', 'ROL', 'QTL', 'PCS', 'PAC', 'NOS', 'MTR', 'MLT', 'KLR', 'KGS', 'GMS', 'DOZ', 'CTN', 'CMS', 'CCM', 'CBM', 'CAN', 'BUN', 'BTL', 'BOX', 'BKL', 'BDL', 'BAL', 'BAG'
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your inventory and product catalog</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingProduct(null); }} size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-8">
                  {/* Product Details */}
                  <div className="space-y-4 border rounded p-4">
                    <div className="font-bold text-lg mb-2">Product Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="group">Group *</Label><Input id="group" value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})} required /></div>
                      <div><Label htmlFor="brand">Brand *</Label><Input id="brand" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required /></div>
                      <div><Label htmlFor="itemCode">Item Code</Label><Input id="itemCode" value={formData.itemCode} onChange={e => setFormData({...formData, itemCode: e.target.value})} /></div>
                      <div><Label htmlFor="name">Product Name *</Label><Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                      <div><Label htmlFor="printName">Print Name</Label><Input id="printName" value={formData.printName} onChange={e => setFormData({...formData, printName: e.target.value})} /></div>
                </div>
                </div>
                  {/* GST Details */}
                  <div className="space-y-4 border rounded p-4">
                    <div className="font-bold text-lg mb-2">GST Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="hsn">HSN / SAC Code</Label><Input id="hsn" value={formData.hsn} onChange={e => setFormData({...formData, hsn: e.target.value})} /></div>
                      <div><Label>GST Rates *</Label>
                        <div className="flex gap-2">
                          <Input placeholder="CGST" className="w-20" value={formData.taxRate} onChange={e => setFormData({...formData, taxRate: e.target.value})} required />
                          <span className="self-center">%</span>
                          <Input placeholder="SGST" className="w-20" />
                          <span className="self-center">%</span>
                          <Input placeholder="IGST" className="w-20" />
                          <span className="self-center">%</span>
                </div>
                </div>
                </div>
                </div>
                  {/* Stock and Unit Details */}
                  <div className="space-y-4 border rounded p-4">
                    <div className="font-bold text-lg mb-2">Stock and Unit Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="unit">UoM *</Label>
                        <Select
                          value={UOM_OPTIONS.includes(formData.unit) ? formData.unit : UOM_OPTIONS[0]}
                          onValueChange={e => setFormData({...formData, unit: e})}
                          required
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select UoM" />
                          </SelectTrigger>
                          <SelectContent>
                            {UOM_OPTIONS.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                </div>
                      <div><Label htmlFor="stock">Opening Stock</Label><Input id="stock" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} /></div>
                      <div><Label htmlFor="openingStockValue">Opening Stock Value</Label><Input id="openingStockValue" value={formData.openingStockValue} onChange={e => setFormData({...formData, openingStockValue: e.target.value})} /></div>
                </div>
                </div>
                  {/* Price Details */}
                  <div className="space-y-4 border rounded p-4">
                    <div className="font-bold text-lg mb-2">Price Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="cost">Purchase Price *</Label><Input id="cost" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} required /></div>
                      <div><Label htmlFor="price">Sale Price *</Label><Input id="price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required /></div>
                      <div><Label htmlFor="minSalePrice">Min. Sale Price</Label><Input id="minSalePrice" value={formData.minSalePrice} onChange={e => setFormData({...formData, minSalePrice: e.target.value})} /></div>
                      <div><Label htmlFor="mrp">M.R.P.</Label><Input id="mrp" value={formData.mrp} onChange={e => setFormData({...formData, mrp: e.target.value})} /></div>
                </div>
                </div>
                  {/* Other Details */}
                  <div className="space-y-4 border rounded p-4">
                    <div className="font-bold text-lg mb-2">Other Details</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label htmlFor="saleDiscount">Sale Discount</Label><Input id="saleDiscount" value={formData.saleDiscount} onChange={e => setFormData({...formData, saleDiscount: e.target.value})} /></div>
                      <div><Label htmlFor="minStock">Reorder Level</Label><Input id="minStock" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} /></div>
                      <div><Label htmlFor="productType">Product Type</Label><Input id="productType" value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})} /></div>
                      <div><Label htmlFor="sku">Serial No.</Label><Input id="sku" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} /></div>
                </div>
                </div>
                  {/* Product Description */}
                  <div className="space-y-4 border rounded p-4 col-span-2">
                    <div className="font-bold text-lg mb-2">Product Description</div>
                  <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} maxLength={250} />
                </div>
                  {/* Product Settings */}
                  <div className="space-y-4 border rounded p-4 col-span-2">
                    <div className="font-bold text-lg mb-2">Product Settings</div>
                    <div className="flex gap-4 flex-wrap">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={formData.printDescription === 'Y'} onChange={e => setFormData({...formData, printDescription: e.target.checked ? 'Y' : 'N'})} /> Print Description</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={formData.printSerial === 'Y'} onChange={e => setFormData({...formData, printSerial: e.target.checked ? 'Y' : 'N'})} /> Print Serial No</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={formData.oneClickSale === 'Y'} onChange={e => setFormData({...formData, oneClickSale: e.target.checked ? 'Y' : 'N'})} /> One Click Sale</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={formData.enableTracking === 'Y'} onChange={e => setFormData({...formData, enableTracking: e.target.checked ? 'Y' : 'N'})} /> Enable Tracking</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={formData.notForSale === 'Y'} onChange={e => setFormData({...formData, notForSale: e.target.checked ? 'Y' : 'N'})} /> Not For Sale</label>
                </div>
                </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button type="submit">{editingProduct ? 'Update' : 'Add'} Product</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="products" className="text-xs sm:text-sm py-2">Product List</TabsTrigger>
          <TabsTrigger value="import" className="text-xs sm:text-sm py-2">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Import from Excel</span>
            <span className="sm:hidden">Import</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          <ExcelImport 
            type="products" 
            onImportComplete={() => {
              setProducts(getProducts());
              toast.success('Products imported successfully!');
            }} 
          />
        </TabsContent>

        <TabsContent value="products" className="space-y-4 sm:space-y-6">
          {/* Stats Cards - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Products</CardTitle>
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Low Stock Items</CardTitle>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
                <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                  ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-sm sm:text-base"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base sm:text-lg">{product.name}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant={product.stock <= product.minStock ? 'destructive' : 'secondary'} className="text-xs">
                      {product.stock <= product.minStock ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Stock: {product.stock}
                    </span>
                  </div>
                  
                  {product.sku && (
                    <p className="text-xs sm:text-sm text-muted-foreground">SKU: {product.sku}</p>
                  )}
                  
                  {product.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="flex-1 text-xs sm:text-sm"
                    >
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(product.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}