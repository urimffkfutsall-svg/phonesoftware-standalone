import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Smartphone,
  ChevronDown,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';

const PSLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ps_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/phonesoftware/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
    navigate('/phonesoftware/login');
    toast.info('U çkyçët me sukses');
  };

  const navItems = [
    { path: '/phonesoftware/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'technician', 'staff', 'worker'] },
    { path: '/phonesoftware/repairs', icon: Wrench, label: 'Riparime', roles: ['admin', 'manager', 'technician', 'staff', 'worker'] },
    { path: '/phonesoftware/inventory', icon: Package, label: 'Inventari', roles: ['admin', 'manager', 'staff'] },
    { path: '/phonesoftware/customers', icon: Users, label: 'Klientët', roles: ['admin', 'manager', 'staff'] },
    { path: '/phonesoftware/staff', icon: UserCog, label: 'Stafi', roles: ['admin', 'manager'] },
    { path: '/phonesoftware/reports', icon: BarChart3, label: 'Raportet', roles: ['admin', 'manager'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex" data-testid="ps-layout">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r transition-all duration-300`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00a79d] to-[#008f86] rounded-lg flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">PhoneSoftware</h1>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.tenant_id ? 'Tenant' : 'Admin'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Menu className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#00a79d]/10 text-[#00a79d] font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t p-4">
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
            <div className="w-10 h-10 bg-[#00a79d] rounded-full flex items-center justify-center text-white font-medium">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.full_name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors ${sidebarOpen ? 'w-full' : 'justify-center'}`}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span>Dilni</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <div className="h-16 flex items-center justify-between px-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00a79d] to-[#008f86] rounded-lg flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-gray-900">PhoneSoftware</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="py-4">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#00a79d]/10 text-[#00a79d] font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 border-t p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-500 w-full"
              >
                <LogOut className="h-5 w-5" />
                <span>Dilni</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredNavItems.find(item => location.pathname === item.path)?.label || 'PhoneSoftware'}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <span>{user?.full_name}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PSLayout;
