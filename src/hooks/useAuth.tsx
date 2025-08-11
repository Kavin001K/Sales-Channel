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
      
      // Demo company credentials
      const demoCompanies = [
        {
          id: 'defaultcompany',
          name: 'Default Company',
          email: 'admin@defaultcompany.com',
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

      const company = demoCompanies.find(c => c.email === credentials.email);

      if (company) {
        // Only set company, don't set employee yet
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
      
      // Demo employee credentials
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

      const employee = demoEmployees.find(e => e.employeeId === credentials.employeeId);

      if (employee) {
        // Now fully authenticated with both company and employee
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
  
  const loginAdmin = async (credentials: AdminLoginCredentials): Promise<'super_admin' | 'admin' | 'sales' | 'support' | 'technical' | 'marketing' | 'finance' | 'hr' | null> => {
    try {
      setAdminAuth(prev => ({ ...prev, loading: true }));
      
      // Demo admin credentials
      const demoAdmins = [
        {
          id: 'superadmin',
          username: 'superadmin',
          email: 'superadmin@pos.com',
          role: 'super_admin',
          name: 'Super Administrator',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'admin',
          username: 'admin',
          email: 'admin@pos.com',
          role: 'admin',
          name: 'Company Administrator',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Demo employees of the software company (admin company)
      const demoAdminCompanyEmployees = [
        {
          id: 'support1',
          username: 'support',
          email: 'support@pos.com',
          role: 'support' as const,
          name: 'Support Specialist',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sales1',
          username: 'sales',
          email: 'sales@pos.com',
          role: 'sales' as const,
          name: 'Sales Executive',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'tech1',
          username: 'technical',
          email: 'technical@pos.com',
          role: 'technical' as const,
          name: 'Technical Engineer',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const matchedUser = [...demoAdmins, ...demoAdminCompanyEmployees].find(u => 
        u.username === credentials.username || u.email === credentials.username
      );

      if (matchedUser) {
        const adminUser: AdminUser = {
          id: matchedUser.id,
          username: matchedUser.username,
          email: matchedUser.email,
          role: matchedUser.role as 'super_admin' | 'admin' | 'support' | 'sales' | 'technical' | 'marketing' | 'finance' | 'hr',
          permissions: ['manage_companies', 'manage_subscriptions', 'view_analytics', 'manage_employees'],
          isActive: matchedUser.isActive,
          lastLogin: new Date(),
          createdAt: matchedUser.createdAt,
          updatedAt: matchedUser.updatedAt
        };

        const newState: AdminAuthState = {
          isAuthenticated: true,
          adminUser,
          loading: false
        };
        
        setAdminAuth(newState);
        saveAdminAuthState(newState);
        return adminUser.role;
      } else {
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