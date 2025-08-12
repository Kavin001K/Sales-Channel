import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Star,
  Edit,
  Trash2,
  Plus,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getCustomers, updateCustomer, saveCustomer } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';

interface CustomerSearchProps {
  onCustomerSelect?: (customer: any) => void;
}

export default function CustomerSearch({ onCustomerSelect }: CustomerSearchProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { company } = useAuth();

  // Load customers
  const loadCustomers = async () => {
    if (!company?.id) return;
    
    setLoading(true);
    try {
      const customersData = await getCustomers(company.id);
      setCustomers(customersData);
      setFilteredCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [company?.id]);

  // Filter customers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => 
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.gst?.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  }, [customers, searchQuery]);

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
    toast.success(`Selected customer: ${customer.name}`);
  };

  // Handle customer deletion
  const handleCustomerDelete = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      // Soft delete by setting isActive to false
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        await updateCustomer(customerId, { ...customer, isActive: false });
        toast.success('Customer deleted successfully');
        loadCustomers(); // Reload customers
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  // Handle customer edit
  const handleCustomerEdit = async (customer: any) => {
    // For now, just show a toast - you can implement a proper edit dialog later
    toast.info(`Edit functionality for ${customer.name} - Coming soon!`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Database
          </CardTitle>
          <CardDescription>
            Search and manage your customer information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by name, phone, email, or GST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <Badge variant="secondary">
              {filteredCustomers.length} customers found
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadCustomers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Customer List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                <p className="text-gray-500 mt-2">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No customers found</p>
                {searchQuery && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCustomer?.id === customer.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{customer.name}</h4>
                          {!customer.isActive && (
                            <Badge variant="destructive" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                          
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <span>{customer.email}</span>
                            </div>
                          )}
                          
                          {customer.gst && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">GST:</span>
                              <span>{customer.gst}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Visits: {customer.visitCount || 0}</span>
                            </div>
                            
                            {customer.loyaltyPoints > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>Points: {customer.loyaltyPoints}</span>
                              </div>
                            )}
                            
                            {customer.totalSpent > 0 && (
                              <div className="font-medium text-green-600">
                                ₹{customer.totalSpent.toFixed(2)} spent
                              </div>
                            )}
                          </div>
                          
                          {customer.lastVisit && (
                            <div className="text-xs text-gray-500">
                              Last visit: {new Date(customer.lastVisit).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomerEdit(customer);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCustomerDelete(customer.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Quick Stats */}
          {customers.length > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {customers.filter(c => c.isActive).length}
                </div>
                <div className="text-xs text-gray-500">Active Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Total Revenue</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
