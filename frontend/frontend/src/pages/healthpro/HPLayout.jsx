import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  HeartPulse,
  LayoutDashboard,
  Users,
  Stethoscope,
  Pill,
  Home,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Auth Context
const HPAuthContext = createContext(null);

export const useHPAuth = () => useContext(HPAuthContext);

// API helper
export const hpApi = {
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('hp_token')}`
  }),
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      headers: hpApi.getHeaders()
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  },
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'POST',
      headers: hpApi.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'API Error');
    }
    return response.json();
  },
  put: async (endpoint, data) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'PUT',
      headers: hpApi.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'API Error');
    }
    return response.json();
  },
  delete: async (endpoint) => {
    const response = await fetch(`${API_URL}/api${endpoint}`, {
      method: 'DELETE',
      headers: hpApi.getHeaders()
    });
    if (!response.ok) throw new Error('API Error');
    return response.json();
  }
};

const HPLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('hp_user');
    const token = localStorage.getItem('hp_token');
    
    if (!storedUser || !token) {
      navigate('/healthpro/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('hp_token');
    localStorage.removeItem('hp_user');
    navigate('/healthpro/login');
  };

  const menuItems = [
    { path: '/healthpro/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/healthpro/residents', icon: Users, label: 'Rezidentët' },
    { path: '/healthpro/checkups', icon: Stethoscope, label: 'Kontrollat' },
    { path: '/healthpro/therapies', icon: Pill, label: 'Terapitë' },
    { path: '/healthpro/visits', icon: Home, label: 'Vizitat' },
    { path: '/healthpro/employees', icon: Building2, label: 'Punëtorët' },
    { path: '/healthpro/schedule', icon: Calendar, label: 'Orari' },
    { path: '/healthpro/reports', icon: FileText, label: 'Raportet' },
    { path: '/healthpro/settings', icon: Settings, label: 'Cilësimet' },
  ];

  if (!user) return null;

  return (
    <HPAuthContext.Provider value={{ user, setUser }}>
      <div className="min-h-screen bg-gray-900 flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
            <Link to="/healthpro/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00a79d]/20 rounded-xl flex items-center justify-center">
                <HeartPulse className="w-6 h-6 text-[#00a79d]" />
              </div>
              {sidebarOpen && <span className="font-bold text-white text-lg">HealthPRO</span>}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-[#00a79d] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User section */}
          <div className="p-4 border-t border-gray-700">
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <div className="w-10 h-10 bg-[#00a79d]/20 rounded-full flex items-center justify-center">
                <span className="text-[#00a79d] font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
                  <p className="text-gray-500 text-xs truncate">{user?.role}</p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                className="w-full mt-3 text-gray-400 hover:text-white hover:bg-gray-700"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Dilni
              </Button>
            )}
          </div>
        </aside>

        {/* Mobile sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700">
              <div className="h-16 flex items-center justify-between px-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <HeartPulse className="w-6 h-6 text-[#00a79d]" />
                  <span className="font-bold text-white">HealthPRO</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ScrollArea className="h-[calc(100vh-64px)]">
                <nav className="p-4 space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                          isActive
                            ? 'bg-[#00a79d] text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top header */}
          <header className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 lg:px-6">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              <button className="relative text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="hidden lg:flex items-center gap-2 text-gray-400">
                <span className="text-sm">{user?.tenant_name}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto bg-gray-900 p-4 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </HPAuthContext.Provider>
  );
};

export default HPLayout;
