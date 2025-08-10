import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { company, employee, adminAuth, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  const isAuthenticated = company || employee || adminAuth.isAuthenticated;
  
  if (!isAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For dashboard and POS routes, require both company and employee login
  const isDashboardRoute = location.pathname === '/dashboard' || 
                          location.pathname === '/sales' || 
                          location.pathname === '/quickpos' || 
                          location.pathname === '/pos' ||
                          location.pathname === '/products' ||
                          location.pathname === '/customers' ||
                          location.pathname === '/employees' ||
                          location.pathname === '/transactions' ||
                          location.pathname === '/reports';

  if (isDashboardRoute && company && !employee) {
    // If company is logged in but no employee, redirect to employee login
    return <Navigate to="/employee-login" replace />;
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Determine user role
  const getUserRole = () => {
    if (adminAuth.isAuthenticated && adminAuth.adminUser) {
      return adminAuth.adminUser.role;
    }
    if (employee) {
      return employee.position?.toLowerCase() || 'cashier';
    }
    if (company) {
      return 'company';
    }
    return null;
  };

  const userRole = getUserRole();

  // Check if user has required role
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirect to unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Helper components for specific roles
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const CompanyOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['company']}>
    {children}
  </ProtectedRoute>
);

export const EmployeeOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
    {children}
  </ProtectedRoute>
);

export const ManagerOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'manager']}>
    {children}
  </ProtectedRoute>
);

export const CashierOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'manager', 'cashier']}>
    {children}
  </ProtectedRoute>
);

export const SoftwareCompanyEmployeeOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['sales', 'support', 'technical', 'marketing', 'finance', 'hr']}>
    {children}
  </ProtectedRoute>
); 