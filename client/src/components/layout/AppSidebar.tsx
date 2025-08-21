import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  UserCheck,
  Receipt,
  TrendingUp,
  Store,
  Settings,
  Shield,
  LogOut,
  MessageSquare,
  FileText
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Define navigation items with role-based access
const allNavigationItems = [
  { title: "Dashboard", url: "/", icon: BarChart3, description: "Overview & Analytics", roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Sales", url: "/sales", icon: ShoppingCart, description: "Process Transactions", roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Quick Sales", url: "/quickpos", icon: ShoppingCart, description: "Quick POS Billing", roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Products", url: "/products", icon: Package, description: "Manage Inventory", roles: ['company', 'admin', 'manager'] },
  { title: "Customers", url: "/customers", icon: Users, description: "Customer Management", roles: ['company', 'admin', 'manager', 'cashier', 'sales', 'support'] },
  { title: "Employees", url: "/employees", icon: UserCheck, description: "Staff Management", roles: ['company', 'admin'] },
  { title: "Invoices", url: "/invoices", icon: FileText, description: "Invoice Management", roles: ['company', 'admin', 'manager'] },
  { title: "Transactions", url: "/transactions", icon: Receipt, description: "Transaction History", roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Reports", url: "/reports", icon: TrendingUp, description: "Sales Analytics", roles: ['company', 'admin', 'manager'] },
  { title: "Admin Company Dashboard", url: "/admin/company-dashboard", icon: Users, description: "Internal Team Workspace", roles: ['sales', 'support', 'technical', 'marketing', 'finance', 'hr'] },
  { title: "Admin Panel", url: "/admin", icon: Shield, description: "System Administration", roles: ['super_admin', 'admin'] },
  { title: "Admin CRM", url: "/admin/crm", icon: Users, description: "Customer Relationship Management", roles: ['sales', 'support', 'admin', 'technical', 'marketing', 'finance', 'hr'] },
  { title: "Subscription Admin", url: "/admin/subscriptions", icon: Shield, description: "Manage Subscriptions", roles: ['super_admin', 'admin'] },
  { title: "Company Dashboard", url: "/company/dashboard", icon: Store, description: "View Subscription & Support", roles: ['company'] }
  ,{ title: "Support Center", url: "/admin/support", icon: MessageSquare, description: "Tickets & Messaging", roles: ['support', 'sales', 'technical', 'marketing', 'finance', 'hr', 'admin', 'super_admin'] }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { company, employee, adminAuth, logout, logoutEmployee, logoutAdmin } = useAuth();

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

  // Filter navigation items based on user role and context
  // If not authenticated as software-company admin, hide all "/admin" routes
  const isSoftwareAdminContext = !!(adminAuth.isAuthenticated && adminAuth.adminUser);
  const navigationItems = allNavigationItems.filter(item => {
    if (!userRole) return false;
    if (!isSoftwareAdminContext && item.url.startsWith('/admin')) {
      return false;
    }
    return item.roles.includes(userRole);
  });

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  const handleLogout = () => {
    if (adminAuth.isAuthenticated) {
      logoutAdmin();
    } else if (employee) {
      logoutEmployee();
    } else {
      logout();
    }
  };

  // Get user display info
  const getUserInfo = () => {
    if (adminAuth.isAuthenticated && adminAuth.adminUser) {
      return {
        name: adminAuth.adminUser.username,
        role: adminAuth.adminUser.role,
        type: 'Admin'
      };
    }
    if (employee) {
      return {
        name: employee.name,
        role: employee.position || 'Employee',
        type: 'Employee'
      };
    }
    if (company) {
      return {
        name: company.name,
        role: 'Company Owner',
        type: 'Company'
      };
    }
    return null;
  };

  const userInfo = getUserInfo();

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-sidebar-primary" />
            {state !== "collapsed" && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">Ace-Bill</h1>
                <p className="text-xs text-sidebar-foreground/70">Professional Billing</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {userInfo && state !== "collapsed" && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="text-sm">
              <div className="font-medium text-sidebar-foreground">{userInfo.name}</div>
              <div className="text-xs text-sidebar-foreground/70">{userInfo.role} • {userInfo.type}</div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-5 h-5" />
                      {state !== "collapsed" && (
                        <div className="flex flex-col">
                          <span className="font-medium">{item.title}</span>
                          <span className="text-xs text-sidebar-foreground/70">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings & Logout */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
                   {userRole && (userRole === 'company' || userRole === 'admin' || userRole === 'super_admin') && (
                     <SidebarMenuItem>
                       <SidebarMenuButton asChild>
                         <NavLink to={userRole === 'company' ? "/settings" : "/admin/settings"} className={getNavCls}>
                           <Settings className="w-5 h-5" />
                           {state !== "collapsed" && (
                             <div className="flex flex-col">
                               <span className="font-medium">Settings</span>
                               <span className="text-xs text-sidebar-foreground/70">{userRole === 'company' ? 'Company Settings' : 'Admin Settings'}</span>
                             </div>
                           )}
                         </NavLink>
                       </SidebarMenuButton>
                     </SidebarMenuItem>
                   )}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="w-5 h-5" />
                  {state !== "collapsed" && (
                    <div className="flex flex-col">
                      <span className="font-medium">Logout</span>
                      <span className="text-xs text-sidebar-foreground/70">Sign out</span>
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}