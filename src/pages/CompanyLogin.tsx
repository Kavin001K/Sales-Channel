import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Loader2, Building2, Shield, User, Eye, EyeOff } from 'lucide-react';

export default function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'company' | 'admin'>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  
  const { loginCompany, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await loginCompany({ email, password });
      
      if (success) {
        navigate('/employee-login');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const role = await loginAdmin({ username, password });
      
      if (role) {
        if (role === 'super_admin' || role === 'admin') {
          navigate('/admin');
        } else {
          // Software company employee roles go to CRM area by default
          navigate('/admin/crm');
        }
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillAdminDemo = (user: 'superadmin' | 'admin' | 'support' | 'sales' | 'technical') => {
    setUsername(user);
    setPassword(user === 'superadmin' ? 'superadmin123' : 'employee123');
    setShowAdminPassword(true);
  };

  const quickLoginAdminDemo = async (user: 'superadmin' | 'admin' | 'support' | 'sales' | 'technical') => {
    setError('');
    setIsLoading(true);
    try {
      const role = await loginAdmin({ username: user, password: user === 'superadmin' ? 'superadmin123' : 'employee123' });
      if (role) {
        if (role === 'super_admin' || role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/admin/crm');
        }
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Login Portal</CardTitle>
          <CardDescription>
            Access your company POS system or admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as 'company' | 'admin')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4 mt-4">
              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Company Email</Label>
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="admin@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="company-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && loginMode === 'company' && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login to Company'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                <p>Demo Company Credentials:</p>
                <p className="font-mono text-xs mt-1">
                  Email: admin@defaultcompany.com<br />
                  Password: company123
                </p>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-username">Admin Username</Label>
                  <Input
                    id="admin-username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="admin-password"
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Enter admin password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                    >
                      {showAdminPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {error && loginMode === 'admin' && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login to Admin Panel'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600 space-y-2">
                <div>
                  <p>Demo Admin Credentials:</p>
                  <p className="font-mono text-xs mt-1">
                    Username: superadmin<br />
                    Password: superadmin123
                  </p>
                </div>
                <div className="pt-2 border-t">
                  <p>Demo Admin Company Employees:</p>
                  <p className="font-mono text-xs mt-1">
                    Username: support<br />
                    Username: sales<br />
                    Username: technical<br />
                    Password: employee123 (any password accepted in demo)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button variant="outline" onClick={() => autofillAdminDemo('superadmin')} disabled={isLoading}>Autofill Super Admin</Button>
                  <Button variant="outline" onClick={() => autofillAdminDemo('admin')} disabled={isLoading}>Autofill Admin</Button>
                  <Button variant="outline" onClick={() => autofillAdminDemo('support')} disabled={isLoading}>Autofill Support</Button>
                  <Button variant="outline" onClick={() => autofillAdminDemo('sales')} disabled={isLoading}>Autofill Sales</Button>
                  <Button variant="outline" onClick={() => autofillAdminDemo('technical')} disabled={isLoading}>Autofill Technical</Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button onClick={() => quickLoginAdminDemo('superadmin')} disabled={isLoading}>{isLoading ? 'Logging in...' : 'Quick Login Super Admin'}</Button>
                  <Button onClick={() => quickLoginAdminDemo('support')} disabled={isLoading}>{isLoading ? 'Logging in...' : 'Quick Login Support'}</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 