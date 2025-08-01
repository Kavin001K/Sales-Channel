import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, Company, Employee, LoginCredentials, EmployeeLoginCredentials } from '../lib/types';
import { databaseService } from '../lib/database';

interface AuthContextType extends AuthState {
  loginCompany: (credentials: LoginCredentials) => Promise<boolean>;
  loginEmployee: (credentials: EmployeeLoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => void;
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

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedAuth = localStorage.getItem('auth_state');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          setAuthState({
            ...parsed,
            loading: false
          });
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    loadAuthState();
  }, []);

  // Save authentication state to localStorage
  const saveAuthState = (state: AuthState) => {
    try {
      localStorage.setItem('auth_state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  };

  const loginCompany = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const company = await databaseService.authenticateCompany(credentials);
      
      if (company) {
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
      
      const employee = await databaseService.authenticateEmployee(
        authState.company.id, 
        credentials
      );
      
      if (employee) {
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

  const refreshAuth = () => {
    // This could be used to refresh tokens or validate current session
    // For now, we'll just reload from localStorage
    const savedAuth = localStorage.getItem('auth_state');
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
  };

  const value: AuthContextType = {
    ...authState,
    loginCompany,
    loginEmployee,
    logout,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 