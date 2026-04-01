import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useBPAuth } from '../../App';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  ChevronDown,
  Sparkles,
  Link2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from 'sonner';

const BPLayout = () => {
  const { user, logout, loading } = useBPAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/bookpro/login');
    }
  }, [user, loading, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/bookpro/login');
  };

  // Copy booking link to clipboard
  const copyBookingLink = () => {
    // Get tenant slug from user's tenant or use a default
    const tenantSlug = user?.tenant_slug || 'demo-salon';
    const link = `${window.location.origin}/#/book/${tenantSlug}`;
    navigator.clipboard.writeText(link);
    toast.success('Linku i rezervimit u kopjua!');
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Menu items based on role
  const menuItems = [
    { 
      path: '/bookpro/app/dashboard', 
      icon: LayoutDashboard, 
      label: 'Paneli', 
      roles: ['admin', 'stylist', 'receptionist', 'super_admin'] 
    },
    { 
      path: '/bookpro/app/calendar', 
      icon: Calendar, 
      label: 'Kalendari', 
      roles: ['admin', 'stylist', 'receptionist'] 
    },
    { 
      path: '/bookpro/app/appointments', 
      icon: Clock, 
      label: 'Rezervimet', 
      roles: ['admin', 'stylist', 'receptionist'] 
    },
    { 
      path: '/bookpro/app/clients', 
      icon: Users, 
      label: 'Klientët', 
      roles: ['admin', 'stylist', 'receptionist'] 
    },
    { 
      path: '/bookpro/app/services', 
      icon: Sparkles, 
      label: 'Shërbimet', 
      roles: ['admin', 'stylist', 'receptionist'] 
    },
    { 
      path: '/bookpro/app/staff', 
      icon: UserCircle, 
      label: 'Stafi', 
      roles: ['admin'] 
    },
    { 
      path: '/bookpro/app/settings', 
      icon: Settings, 
      label: 'Cilësimet', 
      roles: ['admin'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const NavItem = ({ item, mobile = false }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    
    return (
      <NavLink
        to={item.path}
        onClick={() => mobile && setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30' 
            : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
        }`}
      >
        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-rose-50/50 via-white to-pink-50/50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-rose-100">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-rose-100 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">BookPRO</h1>
              <p className="text-xs text-white/70">Menaxhim Salloni</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-6 px-4">
          <nav className="space-y-2">
            {filteredMenuItems.map(item => (
              <NavItem key={item.path} item={item} />
            ))}
          </nav>

          {/* Booking Link Card */}
          {user?.role === 'admin' && (
            <div className="mt-8 p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="h-5 w-5 text-rose-500" />
                <span className="text-sm font-semibold text-gray-700">Linku i Rezervimit</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Ndajeni këtë link me klientët për të bërë rezervime online
              </p>
              <Button 
                onClick={copyBookingLink}
                size="sm"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
              >
                Kopjo Linkun
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-rose-100 bg-white/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-3 hover:bg-rose-50">
                <Avatar className="h-10 w-10 ring-2 ring-rose-200">
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white font-semibold">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-gray-800">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/bookpro/app/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Cilësimet
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                <LogOut className="h-4 w-4 mr-2" />
                Dilni
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl">
            <div className="h-16 flex items-center justify-between px-4 border-b bg-gradient-to-r from-rose-500 to-pink-500">
              <div className="flex items-center gap-2">
                <Scissors className="h-6 w-6 text-white" />
                <span className="text-lg font-bold text-white">BookPRO</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-white/20">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1 py-4 px-3">
              <nav className="space-y-2">
                {filteredMenuItems.map(item => (
                  <NavItem key={item.path} item={item} mobile />
                ))}
              </nav>
            </ScrollArea>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-rose-100 flex items-center justify-between px-4 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-800">
              {filteredMenuItems.find(item => item.path === location.pathname)?.label || 'BookPRO'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile User Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-rose-500 to-pink-500 text-white text-sm">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-2 border-b">
                  <p className="text-sm font-medium">{user?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Dilni
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BPLayout;
