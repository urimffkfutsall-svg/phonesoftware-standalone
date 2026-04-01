import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  LayoutDashboard, Package, Users, Wrench, ShoppingCart,
  BarChart3, Settings, LogOut, Menu, X, Smartphone, ChevronDown
} from 'lucide-react';

const MobilshopLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/mobilshop', icon: LayoutDashboard, label: 'Paneli', exact: true },
    { path: '/mobilshop/pos', icon: ShoppingCart, label: 'Shitje (POS)' },
    { path: '/mobilshop/products', icon: Package, label: 'Inventari' },
    { path: '/mobilshop/repairs', icon: Wrench, label: 'Riparimet' },
    { path: '/mobilshop/customers', icon: Users, label: 'Klientët' },
    { path: '/mobilshop/reports', icon: BarChart3, label: 'Raportet' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f1f35] border-r border-white/10 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00a79d]/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-[#00a79d]" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white">MobilShop</h1>
                <p className="text-xs text-gray-400">Menaxhimi</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-[#00a79d] text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen ? (
            <div className="bg-[#0a1628] rounded-xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-[#00a79d]/20 rounded-full flex items-center justify-center">
                  <span className="text-[#00a79d] font-bold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Dilni
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Dilni"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 border-t border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <X className="w-5 h-5" />
              <span className="text-sm">Mbyll</span>
            </div>
          ) : (
            <Menu className="w-5 h-5 mx-auto" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MobilshopLayout;
