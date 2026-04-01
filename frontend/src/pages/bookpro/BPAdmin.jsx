import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Plus, Search, Scissors, Building, Users, Calendar, 
  Trash2, LogOut, ArrowLeft, Clock, UserPlus, Eye, 
  Edit, ChevronRight, User, Phone, Mail
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'stylist', label: 'Stilist/e' },
  { value: 'receptionist', label: 'Recepsionist/e' },
];

const BPAdmin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('tenants');
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [showUsersDialog, setShowUsersDialog] = useState(false);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  
  // Selected data
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    salon_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    admin_username: '',
    admin_password: '',
    admin_full_name: '',
    subscription_months: 1
  });
  const [extendMonths, setExtendMonths] = useState(1);
  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'admin',
    phone: '',
    email: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('bp_token');
    const savedUser = localStorage.getItem('bp_user');
    
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'super_admin') {
        setUser(userData);
        setIsAuthenticated(true);
        loadTenants(token);
        return;
      }
    }
    
    setLoading(false);
  };

  const loadTenants = async (token) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/bookpro/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të sallonëve');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${API}/bookpro/auth/login`, { username, password });
      const { access_token, user: userData } = response.data;
      
      if (userData.role !== 'super_admin') {
        toast.error('Vetëm Super Admin ka qasje në këtë faqe');
        return;
      }

      localStorage.setItem('bp_token', access_token);
      localStorage.setItem('bp_user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      loadTenants(access_token);
      toast.success('Mirë se vini!');
    } catch (error) {
      toast.error('Kredencialet e gabuara');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bp_token');
    localStorage.removeItem('bp_user');
    setUser(null);
    setIsAuthenticated(false);
    setTenants([]);
  };

  const handleCreateTenant = async () => {
    if (!formData.name || !formData.salon_name || !formData.email || 
        !formData.admin_username || !formData.admin_password || !formData.admin_full_name) {
      toast.error('Ju lutem plotësoni të gjitha fushat e detyrueshme');
      return;
    }

    try {
      const token = localStorage.getItem('bp_token');
      await axios.post(`${API}/bookpro/tenants`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Salloni u krijua me sukses');
      setShowCreateDialog(false);
      resetForm();
      loadTenants(token);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë krijimit');
    }
  };

  const handleExtendSubscription = async () => {
    if (!selectedTenant) return;

    try {
      const token = localStorage.getItem('bp_token');
      await axios.post(
        `${API}/bookpro/tenants/${selectedTenant.id}/extend-subscription?months=${extendMonths}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Abonimi u zgjat me ${extendMonths} muaj`);
      setShowExtendDialog(false);
      loadTenants(token);
    } catch (error) {
      toast.error('Gabim gjatë zgjatjes së abonimit');
    }
  };

  const handleDeleteTenant = async (tenant) => {
    if (!confirm(`Jeni të sigurt që dëshironi të fshini "${tenant.salon_name}"? Kjo veprim nuk mund të kthehet.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('bp_token');
      await axios.delete(`${API}/bookpro/tenants/${tenant.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Salloni u fshi me sukses');
      loadTenants(token);
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const loadTenantUsers = async (tenant) => {
    setSelectedTenant(tenant);
    setShowUsersDialog(true);
    setLoadingUsers(true);
    
    try {
      const token = localStorage.getItem('bp_token');
      const response = await axios.get(`${API}/bookpro/tenants/${tenant.id}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenantUsers(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të përdoruesve');
      setTenantUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!userFormData.username || !userFormData.password || !userFormData.full_name) {
      toast.error('Ju lutem plotësoni fushat e detyrueshme');
      return;
    }

    try {
      const token = localStorage.getItem('bp_token');
      await axios.post(
        `${API}/bookpro/tenants/${selectedTenant.id}/users`,
        userFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Përdoruesi u shtua me sukses');
      setShowAddUserDialog(false);
      resetUserForm();
      loadTenantUsers(selectedTenant);
      loadTenants(token); // Refresh tenant counts
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë shtimit');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Jeni të sigurt që dëshironi të fshini "${userName}"?`)) return;

    try {
      const token = localStorage.getItem('bp_token');
      await axios.delete(`${API}/bookpro/tenants/${selectedTenant.id}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Përdoruesi u fshi');
      loadTenantUsers(selectedTenant);
      loadTenants(token);
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      salon_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      admin_username: '',
      admin_password: '',
      admin_full_name: '',
      subscription_months: 1
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'admin',
      phone: '',
      email: ''
    });
  };

  const filteredTenants = tenants.filter(t =>
    t.salon_name.toLowerCase().includes(search.toLowerCase()) ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (tenant) => {
    const expires = new Date(tenant.subscription_expires);
    const now = new Date();
    const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

    if (tenant.status === 'suspended') {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Pezulluar</span>;
    }
    if (daysLeft < 0) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Skaduar</span>;
    }
    if (daysLeft <= 7) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">{daysLeft} ditë</span>;
    }
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Aktiv</span>;
  };

  const getRoleLabel = (role) => {
    return ROLES.find(r => r.value === role)?.label || role;
  };

  // Login Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-500/30">
              <Scissors className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">BookPRO Admin</CardTitle>
            <p className="text-gray-500">Paneli i Super Administratorit</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required placeholder="Username" className="border-gray-200 focus:border-rose-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Fjalëkalimi</Label>
                <Input id="password" name="password" type="password" required placeholder="Fjalëkalimi" className="border-gray-200 focus:border-rose-500" />
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
                Kyçu
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={() => navigate('/bookpro/login')} className="text-rose-600 hover:text-rose-700">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kthehu te Kyçja
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">BookPRO Admin</h1>
              <p className="text-sm text-gray-500">Menaxhimi i Sallonëve</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Mirë se vini, {user?.full_name}</span>
            <Button variant="outline" onClick={handleLogout} className="border-rose-200 text-rose-600 hover:bg-rose-50">
              <LogOut className="h-4 w-4 mr-2" />
              Dilni
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card className="border-rose-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Building className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">{tenants.length}</p>
                  <p className="text-sm text-gray-500">Sallone</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">{tenants.reduce((sum, t) => sum + (t.users_count || 0), 0)}</p>
                  <p className="text-sm text-gray-500">Përdorues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">{tenants.reduce((sum, t) => sum + (t.appointments_count || 0), 0)}</p>
                  <p className="text-sm text-gray-500">Rezervime</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">{tenants.reduce((sum, t) => sum + (t.clients_count || 0), 0)}</p>
                  <p className="text-sm text-gray-500">Klientë</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Section */}
        <Card className="border-rose-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Building className="h-5 w-5 text-rose-500" />
              Sallonët dhe Administratorët
            </CardTitle>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Shto Sallon
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="relative max-w-md mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kërko sallone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-gray-200 focus:border-rose-500"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"></div>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="py-12 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nuk ka sallone. Krijoni sallonin e parë!</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Salloni</TableHead>
                      <TableHead>Kontakti</TableHead>
                      <TableHead>Qyteti</TableHead>
                      <TableHead className="text-center">Përdorues</TableHead>
                      <TableHead className="text-center">Klientë</TableHead>
                      <TableHead>Statusi</TableHead>
                      <TableHead className="text-right">Veprime</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id} className="hover:bg-rose-50/50">
                        <TableCell>
                          <div>
                            <p className="font-semibold text-gray-800">{tenant.salon_name}</p>
                            <p className="text-xs text-gray-500">/{tenant.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-gray-700">{tenant.email}</p>
                            <p className="text-gray-500">{tenant.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{tenant.city || '-'}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold text-rose-600">{tenant.users_count || 0}</span>
                        </TableCell>
                        <TableCell className="text-center">{tenant.clients_count || 0}</TableCell>
                        <TableCell>{getStatusBadge(tenant)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => loadTenantUsers(tenant)}
                              title="Shiko/Shto Përdorues"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-100"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Përdorues
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setSelectedTenant(tenant); setShowExtendDialog(true); }}
                              title="Zgjat Abonimin"
                              className="hover:bg-blue-100"
                            >
                              <Clock className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTenant(tenant)}
                              title="Fshi"
                              className="hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Create Tenant Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-rose-500" />
              Krijo Sallon të Ri
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Identifikuesi (slug) *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                  placeholder="sallon-xyz"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salon_name">Emri i Sallonit *</Label>
                <Input
                  id="salon_name"
                  value={formData.salon_name}
                  onChange={(e) => setFormData({ ...formData, salon_name: e.target.value })}
                  placeholder="Sallon XYZ"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoni</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+383..."
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Qyteti</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Prishtinë"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription_months">Muaj Abonimi</Label>
                <Input
                  id="subscription_months"
                  type="number"
                  min="1"
                  value={formData.subscription_months}
                  onChange={(e) => setFormData({ ...formData, subscription_months: parseInt(e.target.value) || 1 })}
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                <UserPlus className="h-4 w-4 text-rose-500" />
                Administrator i Sallonit
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_full_name">Emri i Plotë *</Label>
                  <Input
                    id="admin_full_name"
                    value={formData.admin_full_name}
                    onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })}
                    placeholder="Emri Mbiemri"
                    className="border-gray-200 focus:border-rose-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin_username">Username *</Label>
                  <Input
                    id="admin_username"
                    value={formData.admin_username}
                    onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                    placeholder="admin"
                    className="border-gray-200 focus:border-rose-500"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="admin_password">Fjalëkalimi *</Label>
                <Input
                  id="admin_password"
                  type="password"
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  placeholder="Fjalëkalimi"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleCreateTenant} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              Krijo Sallonin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Zgjat Abonimin
            </DialogTitle>
          </DialogHeader>

          {selectedTenant && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-800">{selectedTenant.salon_name}</p>
                <p className="text-sm text-gray-500">
                  Abonimi aktual skadon: {new Date(selectedTenant.subscription_expires).toLocaleDateString('sq-AL')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="extend_months">Zgjat me (muaj)</Label>
                <Input
                  id="extend_months"
                  type="number"
                  min="1"
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(parseInt(e.target.value) || 1)}
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleExtendSubscription} className="bg-blue-500 hover:bg-blue-600">
              Zgjat Abonimin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Manage Users Dialog */}
      <Dialog open={showUsersDialog} onOpenChange={setShowUsersDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-500" />
                Përdoruesit - {selectedTenant?.salon_name}
              </span>
              <Button 
                onClick={() => { resetUserForm(); setShowAddUserDialog(true); }}
                size="sm"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Shto Përdorues
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"></div>
              </div>
            ) : tenantUsers.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Nuk ka përdorues. Shtoni përdoruesin e parë!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tenantUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-rose-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.full_name}</p>
                        <p className="text-sm text-gray-500">@{u.username}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                            u.role === 'stylist' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {getRoleLabel(u.role)}
                          </span>
                          {u.phone && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {u.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(u.id, u.full_name)}
                      className="hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsersDialog(false)}>
              Mbyll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-rose-500" />
              Shto Përdorues të Ri
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_full_name">Emri i Plotë *</Label>
              <Input
                id="user_full_name"
                value={userFormData.full_name}
                onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                placeholder="Emri Mbiemri"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_username">Username *</Label>
                <Input
                  id="user_username"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder="username"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_password">Fjalëkalimi *</Label>
                <Input
                  id="user_password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Fjalëkalimi"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Roli *</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value })}
              >
                <SelectTrigger className="border-gray-200 focus:border-rose-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_phone">Telefoni</Label>
                <Input
                  id="user_phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="+383..."
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_email">Email</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="border-gray-200 focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleAddUser} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              Shto Përdoruesin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BPAdmin;
