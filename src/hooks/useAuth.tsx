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
  loginAdmin: (credentials: AdminLoginCredentials) => Promise<boolean>;
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

  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedAuth = localStorage.getItem('auth_state');
        const savedAdminAuth = localStorage.getItem('admin_auth_state');
        
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          setAuthState({
            ...parsed,
            loading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }

        if (savedAdminAuth) {
          const parsed = JSON.parse(savedAdminAuth);
          setAdminAuth({
            ...parsed,
            loading: false
          });
        } else {
          setAdminAuth(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
        setAdminAuth(prev => ({ ...prev, loading: false }));
      }
    };

    loadAuthState();
  }, []);

  const saveAuthState = (state: AuthState) => {
    try {
      localStorage.setItem('auth_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const saveAdminAuthState = (state: AdminAuthState) => {
    try {
      localStorage.setItem('admin_auth_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving admin auth state:', error);
    }
  };

  const loginCompany = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Get companies from database
      const companies = await customerService.getAll() as unknown as Company[];
      const company = companies.find(c => c.email === credentials.email);

      if (company) {
        // For demo purposes, accept any password for company login
        // In production, you would verify the password hash
        const newState: AuthState = {
          isAuthenticated: true,
          company,
          employee: null,
          loading: false
        };
        
        setAuthState(newState);
        saveAuthState(newState);
        return true;
      } else {
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
        return false;
      }

      setAuthState(prev => ({ ...prev, loading: true }));
      
      const employees = await employeeService.getAll();
      const employee = employees.find(e => e.employeeId === credentials.employeeId);

      if (employee) {
        // For demo purposes, accept any password for employee login
        // In production, you would verify the password hash
        const newState: AuthState = {
          isAuthenticated: true,
          company: authState.company,
          employee,
          loading: false
        };
        
        setAuthState(newState);
        saveAuthState(newState);
        return true;
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return false;
      }
    } catch (error) {
      console.error('Employee login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    }
  };
  
  const loginAdmin = async (credentials: AdminLoginCredentials): Promise<boolean> => {
    try {
      setAdminAuth(prev => ({ ...prev, loading: true }));
      
      // Check against database users
      const users = await authService.getAll();
      const user = users.find(u => 
        (u.email === credentials.username || u.name.toLowerCase().includes(credentials.username.toLowerCase())) &&
        u.role === 'super_admin'
      );

      if (user) {
        // For demo purposes, accept any password for admin login
        // In production, you would verify the password hash
        const adminUser: AdminUser = {
          id: user.id,
          username: user.name,
          email: user.email,
          role: user.role as 'super_admin' | 'admin' | 'support' | 'sales',
          permissions: ['manage_companies', 'manage_subscriptions', 'view_analytics', 'manage_employees'],
          isActive: user.isActive,
          lastLogin: new Date(),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };

        const newState: AdminAuthState = {
          isAuthenticated: true,
          adminUser,
          loading: false
        };
        
        setAdminAuth(newState);
        saveAdminAuthState(newState);
        return true;
      } else {
        setAdminAuth(prev => ({ ...prev, loading: false }));
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setAdminAuth(prev => ({ ...prev, loading: false }));
      return false;
    }
  };

  const logout = () => {
    const newState: AuthState = {
      isAuthenticated: false,
      company: null,
      employee: null,
      loading: false
    };
    
    setAuthState(newState);
    localStorage.removeItem('auth_state');
  };

  const logoutEmployee = () => {
    const newState: AuthState = {
      isAuthenticated: true,
      company: authState.company,
      employee: null,
      loading: false
    };
    
    setAuthState(newState);
    saveAuthState(newState);
  };

  const logoutAdmin = () => {
    const newState: AdminAuthState = {
      isAuthenticated: false,
      adminUser: null,
      loading: false
    };
    
    setAdminAuth(newState);
    localStorage.removeItem('admin_auth_state');
  };

  const refreshAuth = () => {
    const savedAuth = localStorage.getItem('auth_state');
    const savedAdminAuth = localStorage.getItem('admin_auth_state');
    
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthState({
          ...parsed,
          loading: false
        });
      } catch (error) {
        console.error('Error refreshing auth:', error);
        logout();
      }
    }

    if (savedAdminAuth) {
      try {
        const parsed = JSON.parse(savedAdminAuth);
        setAdminAuth({
          ...parsed,
          loading: false
        });
      } catch (error) {
        console.error('Error refreshing admin auth:', error);
        logoutAdmin();
      }
    }
  };

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