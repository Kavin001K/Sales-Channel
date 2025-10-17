import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCRM from "./pages/AdminCRM";
import CompanyDetails from "./pages/CompanyDetails";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Sales from "./pages/Sales";
import QuickPOS from "./pages/QuickPOS";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import SubscriptionAdminDashboard from "./pages/SubscriptionAdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import CompanyDashboard from "./pages/CompanyDashboard";
import AdminCompanyDashboard from "./pages/AdminCompanyDashboard";
import SupportCenter from "./pages/SupportCenter";
import BillTestPage from "./pages/BillTestPage";
import Invoices from "./pages/Invoices";
import { useEffect } from 'react';
import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { 
  ProtectedRoute, 
  AdminOnly, 
  CompanyOnly, 
  EmployeeOnly, 
  ManagerOnly, 
  CashierOnly, 
  SoftwareCompanyEmployeeOnly 
} from './components/ProtectedRoute';
import CompanyLogin from './pages/CompanyLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import './App.css';
import OfflineBadge from '@/components/OfflineBadge';

function AppRoutes() {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  useEffect(() => {
    // Note: Sample data initialization is now handled by the data sync system
    // when components load and authenticate
    
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Check if we're on a login page
  const isLoginPage = location.pathname === '/login' || location.pathname === '/employee-login';
  
  return (
    <div className="min-h-screen flex w-full">
      {/* Only show AppSidebar if not in fullscreen on /quickpos and not on login pages */}
      {!(isFullscreen && location.pathname === '/quickpos') && !isLoginPage && <AppSidebar />}
      <div className="flex-1 flex flex-col">
        {!isLoginPage && (
          <header className="h-12 flex items-center border-b px-4">
            <SidebarTrigger />
          </header>
        )}
        <main className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<CompanyLogin />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <AdminOnly>
                  <AdminDashboard />
                </AdminOnly>
              } />
              <Route path="/admin/settings" element={
                <AdminOnly>
                  <AdminSettings />
                </AdminOnly>
              } />
              
              <Route path="/admin/crm" element={
                <SoftwareCompanyEmployeeOnly>
                  <AdminCRM />
                </SoftwareCompanyEmployeeOnly>
              } />
              
              <Route path="/admin/company/:companyId" element={
                <AdminOnly>
                  <CompanyDetails />
                </AdminOnly>
              } />
              
              <Route path="/admin/subscriptions" element={
                <AdminOnly>
                  <SubscriptionAdminDashboard />
                </AdminOnly>
              } />
              
              {/* Admin Company Employee routes */}
              <Route path="/admin/company-dashboard" element={
                <SoftwareCompanyEmployeeOnly>
                  <AdminCompanyDashboard />
                </SoftwareCompanyEmployeeOnly>
              } />
              <Route path="/admin/support" element={
                <SoftwareCompanyEmployeeOnly>
                  <SupportCenter />
                </SoftwareCompanyEmployeeOnly>
              } />
              
              {/* Company routes */}
              <Route path="/company/dashboard" element={
                <CompanyOnly>
                  <CompanyDashboard />
                </CompanyOnly>
              } />
              
              {/* POS Operations - Available to company users and employees */}
              <Route path="/sales" element={
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <Sales />
                </ProtectedRoute>
              } />
              
              <Route path="/quickpos" element={
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <QuickPOS />
                </ProtectedRoute>
              } />
              
              <Route path="/pos" element={
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <QuickPOS />
                </ProtectedRoute>
              } />
              
              {/* Inventory Management - Available to company admins and managers */}
              <Route path="/products" element={
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Products />
                </ProtectedRoute>
              } />
              
              {/* Customer Management - Available to company users and software company employees */}
              <Route path="/customers" element={
                <ProtectedRoute allowedRoles={['company', 'admin', 'manager', 'cashier', 'sales', 'support']}>
                  <Customers />
                </ProtectedRoute>
              } />
              
              {/* Employee Management - Available to company admins only */}
              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={['company', 'admin']}>
                  <Employees />
                </ProtectedRoute>
              } />
              
              {/* Transaction History - Available to company users */}
              <Route path="/transactions" element={
                <ProtectedRoute allowedRoles={['company','admin','manager','cashier']}>
                  <Transactions />
                </ProtectedRoute>
              } />
              
              {/* Reports - Available to company admins and managers */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute allowedRoles={['company','admin','manager']}>
                  <Invoices />
                </ProtectedRoute>
              } />
              
              {/* Settings - Available to all authenticated users */}
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Bill Test Page - Available to all authenticated users */}
              <Route path="/bill-test" element={
                <ProtectedRoute>
                  <BillTestPage />
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
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
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
