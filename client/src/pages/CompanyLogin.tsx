import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Loader2, Building2, Shield, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function CompanyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'company' | 'admin'>('company');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  
  const { loginCompany, loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Security: Check for lockout
  useEffect(() => {
    const savedLockout = localStorage.getItem('login_lockout');
    if (savedLockout) {
      const lockoutData = JSON.parse(savedLockout);
      const now = new Date();
      const lockoutEnd = new Date(lockoutData.endTime);
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('login_lockout');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
  }, []);

  // Security: Input validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateUsername = (username: string): boolean => {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  };

  // Security: Rate limiting
  const handleRateLimit = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      setIsLocked(true);
      setLockoutTime(lockoutEnd);
      localStorage.setItem('login_lockout', JSON.stringify({
        endTime: lockoutEnd.toISOString(),
        attempts: newAttempts
      }));
    }
  };

  const resetRateLimit = () => {
    setLoginAttempts(0);
    setIsLocked(false);
    setLockoutTime(null);
    localStorage.removeItem('login_lockout');
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.');
      return;
    }

    // Security: Input validation
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await loginCompany({ email, password });
      
      if (success) {
        resetRateLimit();
        navigate('/employee-login');
      } else {
        handleRateLimit();
        setError('Invalid email or password');
      }
    } catch (err) {
      handleRateLimit();
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.');
      return;
    }

    // Security: Input validation
    if (!validateUsername(username)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const role = await loginAdmin({ username, password });
      
      if (role) {
        resetRateLimit();
        navigate('/admin');
      } else {
        handleRateLimit();
        setError('Invalid username or password');
      }
    } catch (err) {
      handleRateLimit();
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRemainingLockoutTime = (): string => {
    if (!lockoutTime) return '';
    
    const now = new Date();
    const diff = lockoutTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      resetRateLimit();
      return '';
    }
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={loginMode} onValueChange={(value) => setLoginMode(value as 'company' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4">
              {isLocked && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Account temporarily locked due to too many failed attempts. 
                    Please try again in {getRemainingLockoutTime()}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleCompanySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isLocked}
                    required
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isLocked}
                      required
                      className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading || isLocked}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isLocked}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                <p>Demo Credentials:</p>
                <p className="font-mono text-xs">admin@defaultcompany.com / admin123</p>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              {isLocked && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Account temporarily locked due to too many failed attempts. 
                    Please try again in {getRemainingLockoutTime()}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading || isLocked}
                    required
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Password</Label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || isLocked}
                      required
                      className="pr-10 transition-all focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading || isLocked}
                    >
                      {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || isLocked}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In as Admin'
                  )}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                <p>Demo Admin Credentials:</p>
                <p className="font-mono text-xs">superadmin / admin123</p>
                <p className="font-mono text-xs">admin / admin123</p>
                <p className="font-mono text-xs">sales / admin123</p>
                <p className="font-mono text-xs">support / admin123</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 