import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
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
import { initializeSampleData } from '@/lib/storage';
import { useEffect } from 'react';
import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import CompanyLogin from './pages/CompanyLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import './App.css';

function AppRoutes() {
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  
  useEffect(() => {
    // Initialize sample data on app start
    initializeSampleData();
    
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
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<CompanyLogin />} />
            <Route path="/employee-login" element={<EmployeeLogin />} />
            
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
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/crm" element={
              <ProtectedRoute>
                <AdminCRM />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/company/:companyId" element={
              <ProtectedRoute>
                <CompanyDetails />
              </ProtectedRoute>
            } />
            
            <Route path="/employee-dashboard" element={
              <ProtectedRoute>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            
            <Route path="/customers" element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute>
                <Employees />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } />
            
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } />
            
            <Route path="/pos" element={
              <ProtectedRoute>
                <QuickPOS />
              </ProtectedRoute>
            } />
            
            <Route path="/quickpos" element={
              <ProtectedRoute>
                <QuickPOS />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
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
