import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, company, employee, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If not authenticated at all, redirect to company login
  if (!isAuthenticated || !company) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If company is authenticated but no employee, redirect to employee login
  if (!employee) {
    return <Navigate to="/employee-login" state={{ from: location }} replace />;
  }

  // Both company and employee are authenticated, render the protected content
  return <>{children}</>;
} 