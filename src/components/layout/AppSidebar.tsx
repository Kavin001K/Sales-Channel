import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  Menu,
  X
} from "lucide-react";

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

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
    description: "Overview & Analytics"
  },
  {
    title: "Sales",
    url: "/sales",
    icon: ShoppingCart,
    description: "Process Transactions"
  },
  {
    title: "Quick POS",
    url: "/quickpos",
    icon: ShoppingCart,
    description: "Quick POS Billing"
  },
  {
    title: "Generate Invoice",
    url: "/create-invoice",
    icon: Receipt,
    description: "Create Invoice"
  },
  {
    title: "Products",
    url: "/products",
    icon: Package,
    description: "Manage Inventory"
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    description: "Customer Management"
  },
  {
    title: "Employees",
    url: "/employees",
    icon: UserCheck,
    description: "Staff Management"
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: Receipt,
    description: "Transaction History"
  },
  {
    title: "Reports",
    url: "/reports",
    icon: TrendingUp,
    description: "Sales Analytics"
  }
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar
      collapsible="icon"
      className="hidden md:block"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 md:w-6 md:h-6 text-sidebar-primary" />
              {state !== "collapsed" && (
                <div>
                  <h1 className="text-base md:text-lg font-bold text-sidebar-foreground">Ace-Bill</h1>
                  <p className="text-xs text-sidebar-foreground/70">Professional Billing</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setOpen(!state.open)}
              className="p-1 rounded hover:bg-sidebar-accent/50 md:hidden"
            >
              {state.open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs md:text-sm">Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                      {state !== "collapsed" && (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm md:text-base">{item.title}</span>
                          <span className="text-xs text-sidebar-foreground/70 hidden lg:block">{item.description}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="w-5 h-5" />
                    {state !== "collapsed" && <span>Settings</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}