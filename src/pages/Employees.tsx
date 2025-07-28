import { useState, useEffect } from 'react';
import { Employee } from '@/lib/types';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, UserCheck, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    pin: '',
    name: '',
    email: '',
    phone: '',
    role: 'cashier' as 'admin' | 'manager' | 'cashier',
    hourlyRate: '',
    permissions: {
      canProcessSales: false,
      canManageProducts: false,
      canManageCustomers: false,
      canViewReports: false,
      canManageEmployees: false,
      canProcessRefunds: false,
      canApplyDiscounts: false,
      canVoidTransactions: false
    }
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    setEmployees(getEmployees());
  };

  const resetForm = () => {
    const newId = `EMP${Date.now()}`;
    const newPin = '';
    setFormData({
      id: newId,
      pin: newPin,
      name: '',
      email: '',
      phone: '',
      role: 'cashier',
      hourlyRate: '',
      permissions: {
        canProcessSales: false,
        canManageProducts: false,
        canManageCustomers: false,
        canViewReports: false,
        canManageEmployees: false,
        canProcessRefunds: false,
        canApplyDiscounts: false,
        canVoidTransactions: false
      }
    });
  };

  const handleRoleChange = (role: 'admin' | 'manager' | 'cashier') => {
    const rolePermissions = {
      admin: {
        canProcessSales: true,
        canManageProducts: true,
        canManageCustomers: true,
        canViewReports: true,
        canManageEmployees: true,
        canProcessRefunds: true,
        canApplyDiscounts: true,
        canVoidTransactions: true
      },
      manager: {
        canProcessSales: true,
        canManageProducts: true,
        canManageCustomers: true,
        canViewReports: true,
        canManageEmployees: false,
        canProcessRefunds: true,
        canApplyDiscounts: true,
        canVoidTransactions: true
      },
      cashier: {
        canProcessSales: true,
        canManageProducts: false,
        canManageCustomers: true,
        canViewReports: false,
        canManageEmployees: false,
        canProcessRefunds: false,
        canApplyDiscounts: true,
        canVoidTransactions: false
      }
    };

    setFormData({
      ...formData,
      role,
      permissions: rolePermissions[role]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.pin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    const employee: Employee = {
      id: formData.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      permissions: formData.permissions,
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      isActive: true,
      pin: formData.pin,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employee);
      toast.success('Employee updated successfully');
    } else {
      addEmployee(employee);
      toast.success('Employee added successfully');
    }

    loadEmployees();
    setIsAddDialogOpen(false);
    setEditingEmployee(null);
    resetForm();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      id: employee.id,
      pin: employee.pin,
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      role: employee.role,
      hourlyRate: employee.hourlyRate?.toString() || '',
      permissions: employee.permissions
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    loadEmployees();
    toast.success('Employee deleted successfully');
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      case 'cashier': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your staff and their permissions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="pin">4-digit PIN *</Label>
                  <Input
                    id="pin"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/[^0-9]/g, '')})}
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate</Label>
                  <Input
                    id="hourlyRate"
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canProcessSales"
                      checked={formData.permissions.canProcessSales}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canProcessSales: !!checked}
                      })}
                    />
                    <Label htmlFor="canProcessSales">Process Sales</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageProducts"
                      checked={formData.permissions.canManageProducts}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canManageProducts: !!checked}
                      })}
                    />
                    <Label htmlFor="canManageProducts">Manage Products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageCustomers"
                      checked={formData.permissions.canManageCustomers}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canManageCustomers: !!checked}
                      })}
                    />
                    <Label htmlFor="canManageCustomers">Manage Customers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canViewReports"
                      checked={formData.permissions.canViewReports}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canViewReports: !!checked}
                      })}
                    />
                    <Label htmlFor="canViewReports">View Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canManageEmployees"
                      checked={formData.permissions.canManageEmployees}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canManageEmployees: !!checked}
                      })}
                    />
                    <Label htmlFor="canManageEmployees">Manage Employees</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canProcessRefunds"
                      checked={formData.permissions.canProcessRefunds}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canProcessRefunds: !!checked}
                      })}
                    />
                    <Label htmlFor="canProcessRefunds">Process Refunds</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canApplyDiscounts"
                      checked={formData.permissions.canApplyDiscounts}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        permissions: {...formData.permissions, canApplyDiscounts: !!checked}
                      })}
                    />
                    <Label htmlFor="canApplyDiscounts">Apply Discounts</Label>
              </div>
                  <div className="flex items-center space-x-2">
                      <Checkbox
                      id="canVoidTransactions"
                      checked={formData.permissions.canVoidTransactions}
                      onCheckedChange={(checked) => setFormData({
                            ...formData,
                        permissions: {...formData.permissions, canVoidTransactions: !!checked}
                      })}
                    />
                    <Label htmlFor="canVoidTransactions">Void Transactions</Label>
                    </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingEmployee(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingEmployee ? 'Update Employee' : 'Add Employee'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Employees
          </CardTitle>
          </CardHeader>
          <CardContent>
          <Input
            placeholder="Search by name, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          </CardContent>
        </Card>

      {/* Employees List */}
        <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </p>
          </CardHeader>
          <CardContent>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No employees found</p>
      </div>
          ) : (
            <div className="grid gap-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-primary" />
      </div>
                      <div>
                        <h3 className="font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                <Badge variant={getRoleBadgeVariant(employee.role)}>
                            {employee.role}
                </Badge>
              {employee.hourlyRate && (
                            <Badge variant="outline">
                              ₹{employee.hourlyRate}/hr
                            </Badge>
                          )}
                          <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                            {employee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                        </div>
                </div>
              </div>
                    <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(employee)}
                >
                        <Edit className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Employee</AlertDialogTitle>
                      <AlertDialogDescription>
                              Are you sure you want to delete {employee.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(employee.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
                  </div>
          </Card>
        ))}
      </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}