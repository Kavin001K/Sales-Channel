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

  // Security: Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Security: If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Security: Check if user is authenticated
  // For company users, they need both company AND employee to be authenticated
  // For admin users, they just need adminAuth to be authenticated
  const isAuthenticated = (company && employee) || adminAuth.isAuthenticated;

  if (!isAuthenticated) {
    // Security: Redirect to appropriate login page
    const isAdminRoute = location.pathname.startsWith('/admin');
    const redirectPath = isAdminRoute ? '/login' : '/login';
    
    console.warn('Unauthorized access attempt:', {
      path: location.pathname,
      company: !!company,
      employee: !!employee,
      adminAuth: adminAuth.isAuthenticated
    });
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Security: Role-based access control
  if (allowedRoles.length > 0) {
    let userRole: string | null = null;

    if (adminAuth.isAuthenticated && adminAuth.adminUser) {
      userRole = adminAuth.adminUser.role;
    } else if (employee) {
      userRole = employee.position?.toLowerCase() || 'cashier';
    } else if (company) {
      userRole = 'company';
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn('Insufficient permissions:', {
        path: location.pathname,
        userRole,
        allowedRoles,
        company: !!company,
        employee: !!employee,
        adminAuth: adminAuth.isAuthenticated
      });
      
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Security: Log successful access
  console.log('Authorized access granted:', {
    path: location.pathname,
    company: company?.name,
    employee: employee?.name,
    adminUser: adminAuth.adminUser?.username
  });

  return <>{children}</>;
};

// Security: Specific role-based route components
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const CashierOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['cashier', 'manager', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const ManagerOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['manager', 'admin']}>
    {children}
  </ProtectedRoute>
);

export const SoftwareCompanyEmployeeOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'sales', 'support', 'technical', 'marketing', 'finance', 'hr']}>
    {children}
  </ProtectedRoute>
); 