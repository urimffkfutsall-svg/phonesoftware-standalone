import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  UserCog,
  BarChart3,
  LogOut,
  Menu,
  X,
  Smartphone,
  Bell,
  ChevronLeft,
  Search
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

  const currentPage = filteredNavItems.find(item => location.pathname === item.path)?.label || 'PhoneSoftware';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0c0f1a' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0c0f1a' }} data-testid="ps-layout">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-[260px]' : 'w-[76px]'} transition-all duration-300 ease-in-out`}
        style={{
          background: 'linear-gradient(180deg, rgba(15,19,35,0.98) 0%, rgba(10,13,28,0.99) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div className="h-[70px] flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)' }}
            >
              <Smartphone className="h-5 w-5 text-[#0c0f1a]" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-white text-[15px] leading-tight">PhoneSoftware</h1>
                <p className="text-[11px] text-white/40">Repair Management</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={`h-4 w-4 text-white/40 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {sidebarOpen && (
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-2">Menu</p>
          )}
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'text-[#00e6b4]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                }`
              }
              style={({ isActive }) => isActive ? {
                background: 'rgba(0, 230, 180, 0.08)',
                boxShadow: 'inset 0 0 0 1px rgba(0, 230, 180, 0.12)',
              } : {}}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#00e6b4]" />
                  )}
                  <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                  {sidebarOpen && <span className="text-[13px] font-medium">{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} p-2 rounded-xl`}
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)', color: '#0c0f1a' }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white/90 text-[13px] truncate">{user?.full_name}</p>
                <p className="text-[11px] text-white/30 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-2 flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors w-full px-2 py-2 rounded-lg hover:bg-red-500/5 text-[13px] ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Dilni</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px]"
            style={{
              background: 'linear-gradient(180deg, #0f1323 0%, #0a0d1c 100%)',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="h-[70px] flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)' }}
                >
                  <Smartphone className="h-5 w-5 text-[#0c0f1a]" />
                </div>
                <span className="font-bold text-white text-[15px]">PhoneSoftware</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-white/5">
                <X className="h-5 w-5 text-white/50" />
              </button>
            </div>
            <nav className="py-3 px-2 space-y-1">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'text-[#00e6b4] bg-[#00e6b4]/10'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/[0.03]'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-[14px] font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-white/30 hover:text-red-400 w-full px-3 py-2.5 rounded-lg hover:bg-red-500/5"
              >
                <LogOut className="h-5 w-5" />
                <span>Dilni</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-[70px] flex items-center justify-between px-4 lg:px-6 flex-shrink-0"
          style={{
            background: 'rgba(12, 15, 26, 0.8)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 text-white/60" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white">{currentPage}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 hover:bg-white/5 rounded-xl transition-colors relative">
              <Bell className="h-[18px] w-[18px] text-white/40" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#00e6b4] rounded-full" />
            </button>
            <div className="hidden md:flex items-center gap-2 ml-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold"
                style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)', color: '#0c0f1a' }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-[13px] text-white/60 font-medium">{user?.full_name}</span>
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
