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
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Define mobile navigation items with role-based access
const allMobileNavItems = [
  { title: "Dashboard", url: "/", icon: BarChart3, roles: ['company', 'admin', 'manager', 'cashier', 'support', 'sales'] },
  { title: "Sales", url: "/sales", icon: ShoppingCart, roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Quick POS", url: "/quickpos", icon: Receipt, roles: ['company', 'admin', 'manager', 'cashier'] },
  { title: "Products", url: "/products", icon: Package, roles: ['company', 'admin', 'manager'] },
  { title: "Customers", url: "/customers", icon: Users, roles: ['company', 'admin', 'manager', 'cashier', 'sales', 'support'] },
  { title: "Reports", url: "/reports", icon: TrendingUp, roles: ['company', 'admin', 'manager'] },
  { title: "Admin", url: "/admin", icon: Shield, roles: ['super_admin', 'admin'] },
  { title: "CRM", url: "/admin/crm", icon: Users, roles: ['sales', 'support', 'admin'] }
];

export function MobileNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { company, employee, adminAuth } = useAuth();

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

  // Filter navigation items based on user role and limit to 5 items for mobile
  const mobileNavItems = allMobileNavItems
    .filter(item => {
      if (!userRole) return false;
      return item.roles.includes(userRole);
    })
    .slice(0, 5); // Limit to 5 items for mobile

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive(item.url)
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
} 