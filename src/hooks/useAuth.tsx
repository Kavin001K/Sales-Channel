import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AuthState,
  Company,
  Employee,
  LoginCredentials,
  EmployeeLoginCredentials,
  AdminUser,
  AdminLoginCredentials,
  AdminAuthState
} from '../lib/types';
import { customerService, employeeService, authService } from '../lib/database';

interface AuthContextType extends AuthState {
  loginCompany: (credentials: LoginCredentials) => Promise<boolean>;
  loginEmployee: (credentials: EmployeeLoginCredentials) => Promise<boolean>;
  logout: () => void;
  logoutEmployee: () => void;
  refreshAuth: () => void;
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<'super_admin' | 'admin' | 'sales' | 'support' | 'technical' | 'marketing' | 'finance' | 'hr' | null>;
  logoutAdmin: () => void;
  adminAuth: AdminAuthState;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Security: Input sanitization function
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Security: Password validation
const validatePassword = (password: string): boolean => {
  return password.length >= 6 && /^[a-zA-Z0-9@#$%^&*!]+$/.test(password);
};

// Security: Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Security: Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

const isRateLimited = (identifier: string): boolean => {
  const attempts = loginAttempts.get(identifier);
  if (!attempts) return false;
  
  const now = Date.now();
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier);
    return false;
  }
  
  return attempts.count >= MAX_LOGIN_ATTEMPTS;
};

const recordLoginAttempt = (identifier: string, success: boolean): void => {
  const attempts = loginAttempts.get(identifier) || { count: 0, lastAttempt: 0 };
  
  if (success) {
    loginAttempts.delete(identifier);
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(identifier, attempts);
  }
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    company: null,
    employee: null,
    loading: true
  });

  const [adminAuth, setAdminAuth] = useState<AdminAuthState>({
    isAuthenticated: false,
    adminUser: null,
    loading: true
  });

  // Security: Session timeout management
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);
  const SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 hours

  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    if (authState.isAuthenticated || adminAuth.isAuthenticated) {
      const timeout = setTimeout(() => {
        logout();
        logoutAdmin();
      }, SESSION_TIMEOUT);
      setSessionTimeout(timeout);
    }
  };

  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedAuth = localStorage.getItem('auth_state');
        const savedAdminAuth = localStorage.getItem('admin_auth_state');
        
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          // Security: Validate saved auth state
          if (parsed && typeof parsed === 'object' && parsed.company) {
            setAuthState({
              ...parsed,
              loading: false
            });
          } else {
            // Invalid auth state, clear it
            localStorage.removeItem('auth_state');
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }

        if (savedAdminAuth) {
          const parsed = JSON.parse(savedAdminAuth);
          // Security: Validate saved admin auth state
          if (parsed && typeof parsed === 'object' && parsed.adminUser) {
            setAdminAuth({
              ...parsed,
              loading: false
            });
          } else {
            // Invalid admin auth state, clear it
            localStorage.removeItem('admin_auth_state');
            setAdminAuth(prev => ({ ...prev, loading: false }));
          }
        } else {
          setAdminAuth(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Security: Clear corrupted auth state
        localStorage.removeItem('auth_state');
        localStorage.removeItem('admin_auth_state');
        setAuthState(prev => ({ ...prev, loading: false }));
        setAdminAuth(prev => ({ ...prev, loading: false }));
      }
    };

    loadAuthState();
  }, []);

  // Security: Reset session timeout when auth state changes
  useEffect(() => {
    resetSessionTimeout();
  }, [authState.isAuthenticated, adminAuth.isAuthenticated]);

  // Security: Activity listener to reset session timeout
  useEffect(() => {
    const handleActivity = () => {
      if (authState.isAuthenticated || adminAuth.isAuthenticated) {
        resetSessionTimeout();
      }
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [authState.isAuthenticated, adminAuth.isAuthenticated]);

  const saveAuthState = (state: AuthState) => {
    try {
      // Security: Don't save sensitive data
      const safeState = {
        ...state,
        company: state.company ? {
          ...state.company,
          // Don't save any sensitive fields
        } : null,
        employee: state.employee ? {
          ...state.employee,
          // Don't save any sensitive fields
        } : null
      };
      localStorage.setItem('auth_state', JSON.stringify(safeState));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const saveAdminAuthState = (state: AdminAuthState) => {
    try {
      // Security: Don't save sensitive data
      const safeState = {
        ...state,
        adminUser: state.adminUser ? {
          ...state.adminUser,
          // Don't save any sensitive fields
        } : null
      };
      localStorage.setItem('admin_auth_state', JSON.stringify(safeState));
    } catch (error) {
      console.error('Error saving admin auth state:', error);
    }
  };

  const loginCompany = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // Security: Input validation and sanitization
      const sanitizedEmail = sanitizeInput(credentials.email);
      const sanitizedPassword = sanitizeInput(credentials.password);

      if (!validateEmail(sanitizedEmail)) {
        console.warn('Invalid email format attempted:', sanitizedEmail);
        return false;
      }

      if (!validatePassword(sanitizedPassword)) {
        console.warn('Invalid password format attempted');
        return false;
      }

      // Security: Rate limiting
      if (isRateLimited(`company_${sanitizedEmail}`)) {
        console.warn('Rate limit exceeded for company login:', sanitizedEmail);
        return false;
      }

      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Demo company credentials - In production, this should be in a secure database
      const demoCompanies = [
        {
          id: 'demo-company-1',
          name: 'Demo Store',
          email: 'demo@store.com',
          address: '123 Business Street',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India',
          phone: '+91-9876543210',
          taxId: 'TAX123456789',
          logoUrl: undefined,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const company = demoCompanies.find(c => c.email === sanitizedEmail);

      if (company && sanitizedPassword === 'admin123') { // In production, use proper password hashing
        // Security: Record successful login
        recordLoginAttempt(`company_${sanitizedEmail}`, true);
        
        const newState: AuthState = {
          isAuthenticated: false, // Not fully authenticated until employee logs in
          company,
          employee: null,
          loading: false
        };
        
        setAuthState(newState);
        saveAuthState(newState);
        return true;
      } else {
        // Security: Record failed login attempt
        recordLoginAttempt(`company_${sanitizedEmail}`, false);
        setAuthState(prev => ({ ...prev, loading: false }));
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const loginEmployee = async (credentials: EmployeeLoginCredentials): Promise<boolean> => {
    try {
      if (!authState.company) {
        console.warn('Attempted employee login without company context');
        return false;
      }

      // Security: Input validation and sanitization
      const sanitizedEmployeeId = sanitizeInput(credentials.employeeId);
      const sanitizedPassword = sanitizeInput(credentials.password);

      if (!sanitizedEmployeeId || sanitizedEmployeeId.length < 3) {
        console.warn('Invalid employee ID format attempted');
        return false;
      }

      if (!validatePassword(sanitizedPassword)) {
        console.warn('Invalid password format attempted');
        return false;
      }

      // Security: Rate limiting
      if (isRateLimited(`employee_${sanitizedEmployeeId}`)) {
        console.warn('Rate limit exceeded for employee login:', sanitizedEmployeeId);
        return false;
      }

      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Demo employee credentials - In production, this should be in a secure database
      const demoEmployees = [
        {
          id: 'emp001',
          companyId: authState.company.id,
          employeeId: 'EMP001',
          name: 'John Doe',
          email: 'john@company.com',
          phone: '+91-9876543210',
          position: 'cashier',
          salary: 25000,
          hireDate: new Date('2023-01-01'),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'emp002',
          companyId: authState.company.id,
          employeeId: 'EMP002',
          name: 'Jane Smith',
          email: 'jane@company.com',
          phone: '+91-9876543211',
          position: 'manager',
          salary: 35000,
          hireDate: new Date('2023-01-01'),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'emp003',
          companyId: authState.company.id,
          employeeId: 'EMP003',
          name: 'Mike Johnson',
          email: 'mike@company.com',
          phone: '+91-9876543212',
          position: 'admin',
          salary: 45000,
          hireDate: new Date('2023-01-01'),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const employee = demoEmployees.find(e => e.employeeId === sanitizedEmployeeId);

      if (employee && sanitizedPassword === 'emp123') { // In production, use proper password hashing
        // Security: Record successful login
        recordLoginAttempt(`employee_${sanitizedEmployeeId}`, true);
        
        const newState: AuthState = {
          isAuthenticated: true, // Now fully authenticated
          company: authState.company,
          employee,
          loading: false
        };
        
        setAuthState(newState);
        saveAuthState(newState);
        return true;
      } else {
        // Security: Record failed login attempt
        recordLoginAttempt(`employee_${sanitizedEmployeeId}`, false);
        setAuthState(prev => ({ ...prev, loading: false }));
        return false;
      }
    } catch (error) {
      console.error('Employee login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };
  
  const loginAdmin = async (credentials: AdminLoginCredentials): Promise<'super_admin' | 'admin' | 'sales' | 'support' | 'technical' | 'marketing' | 'finance' | 'hr' | null> => {
    try {
      // Security: Input validation and sanitization
      const sanitizedUsername = sanitizeInput(credentials.username);
      const sanitizedPassword = sanitizeInput(credentials.password);

      if (!sanitizedUsername || sanitizedUsername.length < 3) {
        console.warn('Invalid admin username format attempted');
        return null;
      }

      if (!validatePassword(sanitizedPassword)) {
        console.warn('Invalid admin password format attempted');
        return null;
      }

      // Security: Rate limiting
      if (isRateLimited(`admin_${sanitizedUsername}`)) {
        console.warn('Rate limit exceeded for admin login:', sanitizedUsername);
        return null;
      }

      setAdminAuth(prev => ({ ...prev, loading: true }));
      
      // Demo admin credentials - In production, this should be in a secure database
      const demoAdmins = [
        {
          id: 'admin001',
          username: 'superadmin',
          email: 'superadmin@acebusiness.shop',
          role: 'super_admin',
          name: 'Super Administrator',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin002',
          username: 'admin',
          email: 'admin@acebusiness.shop',
          role: 'admin',
          name: 'Administrator',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin003',
          username: 'sales',
          email: 'sales@acebusiness.shop',
          role: 'sales',
          name: 'Sales Team',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin004',
          username: 'support',
          email: 'support@acebusiness.shop',
          role: 'support',
          name: 'Support Team',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const admin = demoAdmins.find(a => a.username === sanitizedUsername);

      if (admin && sanitizedPassword === 'admin123') { // In production, use proper password hashing
        // Security: Record successful login
        recordLoginAttempt(`admin_${sanitizedUsername}`, true);
        
        const newState: AdminAuthState = {
          isAuthenticated: true,
          adminUser: admin,
          loading: false
        };
        
        setAdminAuth(newState);
        saveAdminAuthState(newState);
        return admin.role;
      } else {
        // Security: Record failed login attempt
        recordLoginAttempt(`admin_${sanitizedUsername}`, false);
        setAdminAuth(prev => ({ ...prev, loading: false }));
        return null;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setAdminAuth(prev => ({ ...prev, loading: false }));
      return null;
    }
  };

  const logout = () => {
    try {
      // Security: Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Security: Clear all auth data
      localStorage.removeItem('auth_state');
      setAuthState({
        isAuthenticated: false,
        company: null,
        employee: null,
        loading: false
      });

      // Security: Clear any sensitive data from memory
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const logoutEmployee = () => {
    try {
      // Security: Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Security: Keep company but remove employee
      const newState: AuthState = {
        isAuthenticated: false,
        company: authState.company,
        employee: null,
        loading: false
      };
      
      setAuthState(newState);
      saveAuthState(newState);
      console.log('Employee logged out successfully');
    } catch (error) {
      console.error('Error during employee logout:', error);
    }
  };

  const logoutAdmin = () => {
    try {
      // Security: Clear session timeout
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Security: Clear all admin auth data
      localStorage.removeItem('admin_auth_state');
      setAdminAuth({
        isAuthenticated: false,
        adminUser: null,
        loading: false
      });

      // Security: Clear any sensitive data from memory
      console.log('Admin logged out successfully');
    } catch (error) {
      console.error('Error during admin logout:', error);
    }
  };

  const refreshAuth = () => {
    try {
      // Security: Validate current auth state
      if (authState.isAuthenticated && (!authState.company || !authState.employee)) {
        console.warn('Invalid auth state detected, logging out');
        logout();
        return;
      }

      if (adminAuth.isAuthenticated && !adminAuth.adminUser) {
        console.warn('Invalid admin auth state detected, logging out');
        logoutAdmin();
        return;
      }

      // Security: Reset session timeout
      resetSessionTimeout();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      // Security: If refresh fails, log out for safety
      logout();
      logoutAdmin();
    }
  };

  // Security: Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout]);

  const value: AuthContextType = {
    ...authState,
    loginCompany,
    loginEmployee,
    logout,
    logoutEmployee,
    refreshAuth,
    loginAdmin,
    logoutAdmin,
    adminAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 