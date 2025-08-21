import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, User, ArrowLeft, Eye, EyeOff, AlertTriangle, Building2 } from 'lucide-react';

export default function EmployeeLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  
  const { company, employee, loginEmployee, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Security: Check for lockout
  useEffect(() => {
    const savedLockout = localStorage.getItem('employee_login_lockout');
    if (savedLockout) {
      const lockoutData = JSON.parse(savedLockout);
      const now = new Date();
      const lockoutEnd = new Date(lockoutData.endTime);
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        setLockoutTime(lockoutEnd);
      } else {
        localStorage.removeItem('employee_login_lockout');
        setIsLocked(false);
        setLoginAttempts(0);
      }
    }
  }, []);

  // Security: Redirect if no company is logged in
  useEffect(() => {
    if (!company) {
      navigate('/login');
    }
  }, [company, navigate]);

  // Security: Redirect if already logged in as employee
  useEffect(() => {
    if (employee) {
      navigate('/dashboard');
    }
  }, [employee, navigate]);

  // Security: Input validation
  const validateEmployeeId = (employeeId: string): boolean => {
    return employeeId.length >= 3 && /^[A-Z0-9]+$/.test(employeeId);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Security: Rate limiting
  const handleRateLimit = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      const lockoutEnd = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      setIsLocked(true);
      setLockoutTime(lockoutEnd);
      localStorage.setItem('employee_login_lockout', JSON.stringify({
        endTime: lockoutEnd.toISOString(),
        attempts: newAttempts
      }));
    }
  };

  const resetRateLimit = () => {
    setLoginAttempts(0);
    setIsLocked(false);
    setLockoutTime(null);
    localStorage.removeItem('employee_login_lockout');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.');
      return;
    }

    // Security: Input validation
    if (!validateEmployeeId(employeeId)) {
      setError('Employee ID must be at least 3 characters and contain only uppercase letters and numbers');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await loginEmployee({ employeeId, password });
      
      if (success) {
        resetRateLimit();
        navigate('/dashboard');
      } else {
        handleRateLimit();
        setError('Invalid employee ID or password');
      }
    } catch (err) {
      handleRateLimit();
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCompanyLogin = () => {
    logout();
    navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Employee Login</CardTitle>
          <CardDescription>
            {company ? (
              <>
                Welcome to <span className="font-semibold">{company.name}</span>
              </>
            ) : (
              'Please log in to continue'
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {company && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Building2 className="h-5 w-5 text-blue-600" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">{company.name}</p>
                <p className="text-blue-700">{company.email}</p>
              </div>
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="Enter your employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                disabled={isLoading || isLocked}
                required
                className="transition-all focus:ring-2 focus:ring-green-500"
                autoComplete="username"
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
                  className="pr-10 transition-all focus:ring-2 focus:ring-green-500"
                  autoComplete="current-password"
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
            <p>Demo Employee Credentials:</p>
            <p className="font-mono text-xs">EMP001 / emp123</p>
            <p className="font-mono text-xs">EMP002 / emp123</p>
            <p className="font-mono text-xs">EMP003 / emp123</p>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBackToCompanyLogin}
              className="w-full"
              disabled={isLoading || isLocked}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Company Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
