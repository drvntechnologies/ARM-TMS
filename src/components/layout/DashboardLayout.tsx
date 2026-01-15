import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  FileText,
  FileCheck,
  Users,
  Truck,
  Gift,
  Package,
  BarChart3,
  Settings,
  UserCircle,
  Shield,
  Lock,
  LogOut,
  ChevronDown,
  ChevronRight,
  TruckIcon,
  Key,
  Search,
} from 'lucide-react';

interface MenuItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  submenu?: {
    name: string;
    path: string;
    icon: React.ReactNode;
  }[];
}

const menuItems: MenuItem[] = [
  { name: 'Quotes', path: '/dashboard/quotes', icon: <FileText className="w-5 h-5" /> },
  { name: 'Customer Quotes', path: '/dashboard/customer-quotes', icon: <FileCheck className="w-5 h-5" /> },
  { name: 'Customer Management', path: '/dashboard/customers', icon: <Users className="w-5 h-5" /> },
  { name: 'Carriers', path: '/dashboard/carriers', icon: <Truck className="w-5 h-5" /> },
  {
    name: 'MLB Transport',
    icon: <TruckIcon className="w-5 h-5" />,
    submenu: [
      { name: 'MLB Transport', path: '/dashboard/mlb-transport', icon: <TruckIcon className="w-4 h-4" /> },
      { name: 'MLB Order Lookup', path: '/dashboard/mlb-transport/order-lookup', icon: <Search className="w-4 h-4" /> },
    ]
  },
  { name: 'D1 Relocation Lookup', path: '/dashboard/d1-relocation/order-lookup', icon: <Search className="w-5 h-5" /> },
  { name: 'Referral Management', path: '/dashboard/referrals', icon: <Gift className="w-5 h-5" /> },
  { name: 'Vendors', path: '/dashboard/vendors', icon: <Package className="w-5 h-5" /> },
  { name: 'Reports', path: '/dashboard/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { name: 'API Access', path: '/dashboard/api-access', icon: <Key className="w-5 h-5" /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-5 h-5" /> },
  { name: 'User Management', path: '/dashboard/users', icon: <UserCircle className="w-5 h-5" /> },
  { name: 'User Roles', path: '/dashboard/roles', icon: <Shield className="w-5 h-5" /> },
  { name: 'Access Control List', path: '/dashboard/acl', icon: <Lock className="w-5 h-5" /> },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['MLB Transport']);
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="text-white">
              <h1 className="font-bold text-sm">Auto Relocation</h1>
              <p className="text-xs text-slate-400">Management</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => {
            if (item.submenu) {
              const isExpanded = expandedMenus.includes(item.name);
              const isAnySubmenuActive = item.submenu.some(sub => location.pathname === sub.path);

              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isAnySubmenuActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => {
                        const isActive = location.pathname === subItem.path;
                        return (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            {subItem.icon}
                            <span className="text-sm font-medium">{subItem.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1"></div>

            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <UserCircle className="w-4 h-4" />
                    My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
