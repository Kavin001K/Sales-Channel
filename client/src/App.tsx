import { useState, useEffect } from 'react';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, useLocation, Redirect } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminCRM from './pages/AdminCRM';
import CompanyDetails from './pages/CompanyDetails';
import SubscriptionAdminDashboard from './pages/SubscriptionAdminDashboard';
import AdminCompanyDashboard from './pages/AdminCompanyDashboard';
import SupportCenter from './pages/SupportCenter';
import CompanyDashboard from './pages/CompanyDashboard';
import Sales from './pages/Sales';
import QuickPOS from './pages/QuickPOS';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import BillTestPage from './pages/BillTestPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import CompanyLogin from './pages/CompanyLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import Unauthorized from './pages/Unauthorized';
import './App.css';
import OfflineBadge from '@/components/OfflineBadge';

function AppRoutes() {
  const [location] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Check if we're on a login page
  const isLoginPage = location === '/login' || location === '/employee-login';
  
  return (
    <div className="min-h-screen flex w-full">
      {/* Only show AppSidebar if not in fullscreen on /quickpos and not on login pages */}
      {!(isFullscreen && location === '/quickpos') && !isLoginPage && <AppSidebar />}
      <div className="flex-1 flex flex-col">
        {!isLoginPage && (
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
          </header>
        )}
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            {/* Public routes */}
            <Route path="/login" component={CompanyLogin} />
            <Route path="/employee-login" component={EmployeeLogin} />
            <Route path="/unauthorized" component={Unauthorized} />
            
            {/* Protected routes */}
            <Route path="/">
              {() => (
                <ProtectedRoute>
                  <Redirect to="/dashboard" />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/dashboard">
              {() => (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )}
            </Route>
              
            {/* Admin routes */}
            <Route path="/admin">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/admin/settings">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/admin/crm">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCRM />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/admin/company/:companyId">
              {(params) => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <CompanyDetails />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/admin/subscriptions">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <SubscriptionAdminDashboard />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Admin Company Employee routes */}
            <Route path="/admin/company-dashboard">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCompanyDashboard />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/admin/support">
              {() => (
                <ProtectedRoute allowedRoles={['admin']}>
                  <SupportCenter />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Company routes */}
            <Route path="/company/dashboard">
              {() => (
                <ProtectedRoute allowedRoles={['company']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* POS Operations - Available to company users and employees */}
            <Route path="/sales">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <Sales />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/quickpos">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <QuickPOS />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/pos">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <QuickPOS />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Business management - Company, managers and admin only */}
            <Route path="/products">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Products />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/customers">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Customers />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/transactions">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Transactions />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/employees">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Employees />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/reports">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Reports />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/invoices">
              {() => (
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Invoices />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Settings - Available to all authenticated users */}
            <Route path="/settings">
              {() => (
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Bill Test Page - Available to all authenticated users */}
            <Route path="/bill-test">
              {() => (
                <ProtectedRoute>
                  <BillTestPage />
                </ProtectedRoute>
              )}
            </Route>
            
            {/* Catch all */}
            <Route path="*" component={NotFound} />
          </ErrorBoundary>
          <OfflineBadge />
        </main>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const AppWithProviders = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppWithProviders />
    </Router>
  </AuthProvider>
);

export default App;