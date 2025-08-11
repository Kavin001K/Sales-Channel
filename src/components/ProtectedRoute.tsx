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
  // For company users, they need both company AND employee to be authenticated
  // For admin users, they just need adminAuth to be authenticated
  const isAuthenticated = (company && employee) || adminAuth.isAuthenticated;
  
  if (!isAuthenticated) {
    // If company is logged in but no employee, redirect to employee login
    if (company && !employee) {
      return <Navigate to="/employee-login" state={{ from: location }} replace />;
    }
    // Otherwise redirect to main login
    return <Navigate to="/login" state={{ from: location }} replace />;
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