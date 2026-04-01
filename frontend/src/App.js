import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import GateLogin from './pages/GateLogin';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Branches from './pages/Branches';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import SuperAdmin from './pages/SuperAdmin';
import LandingDashboard from './pages/LandingDashboard';
import Debts from './pages/Debts';

// PhoneSoftware Pages
import PSLogin from './pages/phonesoftware/PSLogin';
import PSAdmin from './pages/phonesoftware/PSAdmin';
import PSLayout from './pages/phonesoftware/PSLayout';
import PSDashboard from './pages/phonesoftware/PSDashboard';
import PSRepairs from './pages/phonesoftware/PSRepairs';
import PSCustomers from './pages/phonesoftware/PSCustomers';
import PSInventory from './pages/phonesoftware/PSInventory';
import PSStaff from './pages/phonesoftware/PSStaff';
import PSReports from './pages/phonesoftware/PSReports';
import PSRepairStatus from './pages/phonesoftware/PSRepairStatus';

// BookPRO Pages
import BPLogin from './pages/bookpro/BPLogin';
import BPLayout from './pages/bookpro/BPLayout';
import BPDashboard from './pages/bookpro/BPDashboard';
import BPServices from './pages/bookpro/BPServices';
import BPClients from './pages/bookpro/BPClients';
import BPStaff from './pages/bookpro/BPStaff';
import BPAppointments from './pages/bookpro/BPAppointments';
import BPCalendar from './pages/bookpro/BPCalendar';
import BPSettings from './pages/bookpro/BPSettings';
import BPAdmin from './pages/bookpro/BPAdmin';
import BPPublicBooking from './pages/bookpro/BPPublicBooking';

// HealthPRO Pages
import HPLogin from './pages/healthpro/HPLogin';
import HPLayout from './pages/healthpro/HPLayout';
import HPDashboard from './pages/healthpro/HPDashboard';
import HPResidents from './pages/healthpro/HPResidents';
import HPEmployees from './pages/healthpro/HPEmployees';
import HPCheckups from './pages/healthpro/HPCheckups';
import HPTherapies from './pages/healthpro/HPTherapies';
import HPVisits from './pages/healthpro/HPVisits';
import HPSchedule from './pages/healthpro/HPSchedule';
import HPReports from './pages/healthpro/HPReports';
import HPSettings from './pages/healthpro/HPSettings';

// Layout
import MainLayout from './components/MainLayout';

// Mobilshop Pages
import MobilshopLayout from './pages/mobilshop/Layout';
import MobilshopDashboard from './pages/mobilshop/Dashboard';
import MobilshopProducts from './pages/mobilshop/Products';
import MobilshopCustomers from './pages/mobilshop/Customers';
import MobilshopRepairs from './pages/mobilshop/Repairs';
import MobilshopPOS from './pages/mobilshop/POS';
import MobilshopReports from './pages/mobilshop/Reports';

// Remove Emergent badge
const removeEmergentBadge = () => {
  const badge = document.getElementById('emergent-badge');
  if (badge) badge.remove();

  document.querySelectorAll('a[href*="emergent"]').forEach(el => el.remove());

  document.querySelectorAll('body > a[style*="position: fixed"]').forEach(el => {
    if (el.textContent?.includes('Emergent') || el.innerHTML?.includes('emergent')) {
      el.remove();
    }
  });
};

if (typeof window !== 'undefined') {
  removeEmergentBadge();
  setTimeout(removeEmergentBadge, 100);
  setTimeout(removeEmergentBadge, 500);
  setTimeout(removeEmergentBadge, 1000);
  setTimeout(removeEmergentBadge, 2000);
}

const updatePageTitle = (userData) => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
    const subdomain = parts[0];
    const companyName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
    document.title = `${companyName} - POS`;
  } else if (userData?.role === 'super_admin') {
    document.title = 'DataPOS - Admin';
  } else {
    document.title = 'DataPOS';
  }
};

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app') {
    const subdomain = parts[0];
    const companyName = subdomain.charAt(0).toUpperCase() + subdomain.slice(1);
    document.title = `${companyName} - POS`;
  }
}

const isElectron = window.navigator.userAgent.toLowerCase().includes('electron');
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://www.datapos.pro';
const API = `${BACKEND_URL}/api`;

const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'app' && parts[0] !== 'localhost') {
    return parts[0].toLowerCase();
  }
  if (parts.length > 3 && parts[0] !== 'www' && parts[0] !== 'app') {
    return parts[0].toLowerCase();
  }
  return null;
};

const AuthContext = createContext(null);
const BPAuthContext = createContext(null);
const TenantContext = createContext(null);

export const useTenant = () => {
  const context = useContext(TenantContext);
  return context;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const useBPAuth = () => {
  const context = useContext(BPAuthContext);
  if (!context) throw new Error('useBPAuth must be used within BPAuthProvider');
  return context;
};

export const api = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' }
});

export const bpApi = axios.create({
  baseURL: API,
  headers: { 'Content-Type': 'application/json' }
});

bpApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('bp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

bpApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('bp_token');
      if (token) {
        localStorage.removeItem('bp_token');
        localStorage.removeItem('bp_user');
        window.location.href = '/#/bookpro/login';
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('t3next_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('t3next_token');
      if (token) {
        localStorage.removeItem('t3next_token');
        localStorage.removeItem('t3next_user');
        window.location.href = '/#/login';
      }
    }
    return Promise.reject(error);
  }
);

const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [tenantLoading, setTenantLoading] = useState(false);

  useEffect(() => {
    const subdomain = getSubdomain();
    if (!subdomain) return;

    setTenantLoading(true);

    const fetchTenant = async () => {
      try {
        const response = await axios.get(`${API}/tenants/by-subdomain/${subdomain}`);
        setTenant(response.data);
        document.title = `${response.data.company_name || response.data.name} - POS`;
        localStorage.setItem('tenant_context', JSON.stringify(response.data));
      } catch (error) {
        console.error('Failed to fetch tenant:', error);
      } finally {
        setTenantLoading(false);
      }
    };

    fetchTenant();
  }, []);

  const value = { tenant, tenantLoading, subdomain: getSubdomain() };
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isNewSession = sessionStorage.getItem('ipos_session_active') !== 'true';

    if (isNewSession) {
      localStorage.removeItem('t3next_token');
      localStorage.removeItem('t3next_user');
      sessionStorage.setItem('ipos_session_active', 'true');
      setLoading(false);
      return;
    }

    const savedUser = localStorage.getItem('t3next_user');
    const savedToken = localStorage.getItem('t3next_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sessionStorage.removeItem('ipos_session_active');
      }
    };

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('ipos_session_active');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('t3next_token', access_token);
      localStorage.setItem('t3next_user', JSON.stringify(userData));
      sessionStorage.setItem('ipos_session_active', 'true');
      setUser(userData);
      updatePageTitle(userData);
      toast.success('Mirësevini!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Gabim gjatë kyçjes';
      const status = error.response?.status || 500;
      if (status !== 402) {
        toast.error(message);
      }
      return { success: false, error: message, status };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('t3next_token');
    localStorage.removeItem('t3next_user');
    sessionStorage.removeItem('ipos_session_active');
    setUser(null);
    toast.info('U çkyçët me sukses');
  }, []);

  const value = { user, login, logout, loading, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const BPAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('bp_user');
    const savedToken = localStorage.getItem('bp_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/bookpro/auth/login`, { username, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('bp_token', access_token);
      localStorage.setItem('bp_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      const message = error.response?.data?.detail || 'Kredencialet e gabuara';
      toast.error(message);
      return false;
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('bp_token');
    localStorage.removeItem('bp_user');
    setUser(null);
    toast.info('U çkyçët me sukses');
  }, []);

  const value = { user, login, logout, loading, isAuthenticated: !!user };
  return <BPAuthContext.Provider value={value}>{children}</BPAuthContext.Provider>;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Entry Point - Shko direkt te PhoneSoftware Login */}
      <Route path="/" element={<Navigate to="/phonesoftware/login" replace />} />

      {/* Registration Page */}
      <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'cashier' ? '/pos' : '/dashboard'} /> : <Register />} />

      {/* Gate Login */}
      <Route path="/gate" element={isAuthenticated ? <Navigate to="/login" /> : <GateLogin />} />

      {/* POS Login */}
      <Route path="/login" element={
        isAuthenticated ? (
          user?.role === 'cashier' ? <Navigate to="/pos" /> : <Navigate to="/dashboard" />
        ) : (
          <Login />
        )
      } />

      {/* Cashier gets POS without MainLayout */}
      <Route path="/pos" element={
        <ProtectedRoute>
          <POS />
        </ProtectedRoute>
      } />

      <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Products />
          </ProtectedRoute>
        } />
        <Route path="stock" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Stock />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Users />
          </ProtectedRoute>
        } />
        <Route path="branches" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Branches />
          </ProtectedRoute>
        } />
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="debts" element={
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <Debts />
          </ProtectedRoute>
        } />
        <Route path="settings" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="audit-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="super-admin" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdmin />
          </ProtectedRoute>
        } />
      </Route>

      {/* Legacy routes */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="/products" element={<Navigate to="/app/products" replace />} />
      <Route path="/stock" element={<Navigate to="/app/stock" replace />} />
      <Route path="/users" element={<Navigate to="/app/users" replace />} />
      <Route path="/branches" element={<Navigate to="/app/branches" replace />} />
      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
      <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
      <Route path="/audit-logs" element={<Navigate to="/app/audit-logs" replace />} />
      <Route path="/super-admin" element={<Navigate to="/app/super-admin" replace />} />

      {/* PhoneSoftware Routes */}
      <Route path="/phonesoftware/login" element={<PSLogin />} />
      <Route path="/phonesoftware/admin" element={<PSAdmin />} />
      <Route path="/repair-status/:ticketNumber" element={<PSRepairStatus />} />
      <Route path="/phonesoftware" element={<PSLayout />}>
        <Route path="dashboard" element={<PSDashboard />} />
        <Route path="repairs" element={<PSRepairs />} />
        <Route path="customers" element={<PSCustomers />} />
        <Route path="inventory" element={<PSInventory />} />
        <Route path="staff" element={<PSStaff />} />
        <Route path="reports" element={<PSReports />} />
      </Route>

      {/* BookPRO Routes */}
      <Route path="/bookpro/login" element={<BPLogin />} />
      <Route path="/bookpro/admin" element={<BPAdmin />} />
      <Route path="/book/:salonSlug" element={<BPPublicBooking />} />
      <Route path="/bookpro/app" element={<BPLayout />}>
        <Route index element={<Navigate to="/bookpro/app/dashboard" replace />} />
        <Route path="dashboard" element={<BPDashboard />} />
        <Route path="calendar" element={<BPCalendar />} />
        <Route path="appointments" element={<BPAppointments />} />
        <Route path="clients" element={<BPClients />} />
        <Route path="services" element={<BPServices />} />
        <Route path="staff" element={<BPStaff />} />
        <Route path="settings" element={<BPSettings />} />
      </Route>

      {/* HealthPRO Routes */}
      <Route path="/healthpro/login" element={<HPLogin />} />
      <Route path="/healthpro" element={<HPLayout />}>
        <Route index element={<Navigate to="/healthpro/dashboard" replace />} />
        <Route path="dashboard" element={<HPDashboard />} />
        <Route path="residents" element={<HPResidents />} />
        <Route path="checkups" element={<HPCheckups />} />
        <Route path="therapies" element={<HPTherapies />} />
        <Route path="visits" element={<HPVisits />} />
        <Route path="employees" element={<HPEmployees />} />
        <Route path="schedule" element={<HPSchedule />} />
        <Route path="reports" element={<HPReports />} />
        <Route path="settings" element={<HPSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/phonesoftware/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <HashRouter>
      <TenantProvider>
        <AuthProvider>
          <BPAuthProvider>
            <Toaster position="top-right" richColors closeButton />
            <AppRoutes />
          </BPAuthProvider>
        </AuthProvider>
      </TenantProvider>
    </HashRouter>
  );
}

export default App;
