import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
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
  Building2,
  Plus,
  Edit2,
  Trash2,
  Users,
  Wrench,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  Key,
  Copy,
  Eye,
  EyeOff,
  Calendar,
  Ban,
  RefreshCw,
  LogOut,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSAdmin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showUsersListDialog, setShowUsersListDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [editingTenant, setEditingTenant] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    logo_url: '',
    primary_color: '#00a79d',
    secondary_color: '#f3f4f6',
    admin_username: '',
    admin_password: '',
    admin_full_name: '',
    subscription_months: 1
  });

  const [subscriptionData, setSubscriptionData] = useState({
    tenant_id: '',
    tenant_name: '',
    months: 1,
    action: 'extend',
    current_expires: null,
    current_status: 'trial'
  });

  const [userFormData, setUserFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'technician',
    phone: '',
    email: '',
    specialization: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('ps_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'super_admin') {
        navigate('/phonesoftware/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/phonesoftware/login');
      return;
    }
    loadTenants();
  }, [navigate]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadTenants = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/tenants`, {
        headers: getAuthHeaders()
      });
      setTenants(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/phonesoftware/login');
      } else {
        toast.error('Gabim gjatë ngarkimit të firmave');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (expiresDate) => {
    if (!expiresDate) return 0;
    try {
      const expires = new Date(expiresDate);
      const now = new Date();
      const diff = expires - now;
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ps_token');
    localStorage.removeItem('ps_user');
    navigate('/phonesoftware/login');
    toast.info('U çkyçët me sukses');
  };

  const openCreateDialog = () => {
    setEditingTenant(null);
    setFormData({
      name: '',
      company_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      logo_url: '',
      primary_color: '#00a79d',
      secondary_color: '#f3f4f6',
      admin_username: '',
      admin_password: '',
      admin_full_name: '',
      subscription_months: 1
    });
    setShowDialog(true);
  };

  const openEditDialog = (tenant) => {
    setEditingTenant(tenant);
    setFormData({
      name: tenant.name,
      company_name: tenant.company_name,
      email: tenant.email,
      phone: tenant.phone || '',
      address: tenant.address || '',
      city: tenant.city || '',
      logo_url: tenant.logo_url || '',
      primary_color: tenant.primary_color || '#00a79d',
      secondary_color: tenant.secondary_color || '#f3f4f6',
      admin_username: '',
      admin_password: '',
      admin_full_name: '',
      subscription_months: 1
    });
    setShowDialog(true);
  };

  const openSubscriptionDialog = (tenant) => {
    setSubscriptionData({
      tenant_id: tenant.id,
      tenant_name: tenant.company_name,
      months: 1,
      action: 'extend',
      current_expires: tenant.subscription_expires,
      current_status: tenant.status
    });
    setShowSubscriptionDialog(true);
  };

  const handleSubscriptionUpdate = async () => {
    setLoading(true);
    try {
      let newExpires;
      let newStatus = subscriptionData.current_status;
      
      if (subscriptionData.action === 'extend') {
        const baseDate = subscriptionData.current_expires 
          ? new Date(subscriptionData.current_expires) 
          : new Date();
        if (baseDate < new Date()) {
          baseDate.setTime(new Date().getTime());
        }
        baseDate.setMonth(baseDate.getMonth() + parseInt(subscriptionData.months));
        newExpires = baseDate.toISOString();
        newStatus = 'active';
      } else if (subscriptionData.action === 'suspend') {
        newStatus = 'suspended';
        newExpires = subscriptionData.current_expires;
      } else if (subscriptionData.action === 'activate') {
        newStatus = 'active';
        newExpires = subscriptionData.current_expires;
      }
      
      await axios.put(`${API_URL}/api/phonesoftware/tenants/${subscriptionData.tenant_id}`, {
        subscription_expires: newExpires,
        status: newStatus
      }, { headers: getAuthHeaders() });
      
      toast.success('Abonimi u përditësua me sukses!');
      setShowSubscriptionDialog(false);
      loadTenants();
    } catch (error) {
      toast.error('Gabim gjatë përditësimit të abonimit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingTenant) {
        await axios.put(`${API_URL}/api/phonesoftware/tenants/${editingTenant.id}`, {
          company_name: formData.company_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          logo_url: formData.logo_url,
          primary_color: formData.primary_color,
          secondary_color: formData.secondary_color
        }, { headers: getAuthHeaders() });
        toast.success('Firma u përditësua me sukses!');
      } else {
        await axios.post(`${API_URL}/api/phonesoftware/tenants`, formData, {
          headers: getAuthHeaders()
        });
        toast.success('Firma u krijua me sukses!');
      }
      setShowDialog(false);
      loadTenants();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminVerify = async (tenantId) => {
  try {
    await axios.post(`${API_URL}/api/phonesoftware/auth/admin/tenants/${tenantId}/verify`, {}, {
      headers: getAuthHeaders()
    });
    toast.success('Firma u verifikua nga administratori!');
    loadTenants();
  } catch (error) {
    toast.error('Gabim gjate verifikimit');
  }
};



const handleDelete = async (tenantId) => {
    if (!window.confirm('Jeni i sigurt? Kjo do të fshijë firmën dhe TË GJITHA të dhënat e saj!')) return;
    if (!window.confirm('KUJDES: Ky veprim NUK mund të kthehet! Konfirmoni përsëri.')) return;
    
    try {
      await axios.delete(`${API_URL}/api/phonesoftware/tenants/${tenantId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Firma u fshi me sukses');
      loadTenants();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const updateTenantStatus = async (tenantId, status) => {
    try {
      await axios.put(`${API_URL}/api/phonesoftware/tenants/${tenantId}`, { status }, {
        headers: getAuthHeaders()
      });
      toast.success('Statusi u përditësua');
      loadTenants();
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Aktiv</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Pezulluar</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full flex items-center gap-1"><Clock className="h-3 w-3" /> Trial</span>;
      default:
        return null;
    }
  };

  // User Management Functions
  const openUserDialog = (tenant) => {
    setSelectedTenant(tenant);
    setUserFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'technician',
      phone: '',
      email: '',
      specialization: ''
    });
    setShowUserDialog(true);
  };

  const openUsersListDialog = async (tenant) => {
    setSelectedTenant(tenant);
    setShowUsersListDialog(true);
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/tenants/${tenant.id}/users`, {
        headers: getAuthHeaders()
      });
      setTenantUsers(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të përdoruesve');
      setTenantUsers([]);
    }
  };

  const handleCreateUser = async () => {
    if (!userFormData.username || !userFormData.password || !userFormData.full_name) {
      toast.error('Plotësoni të gjitha fushat e detyrueshme');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/phonesoftware/tenants/${selectedTenant.id}/users`, userFormData, {
        headers: getAuthHeaders()
      });
      toast.success('Përdoruesi u krijua me sukses!');
      setShowUserDialog(false);
      loadTenants();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë krijimit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Jeni i sigurt që doni të fshini këtë përdorues?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/phonesoftware/tenants/${selectedTenant.id}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Përdoruesi u fshi');
      const response = await axios.get(`${API_URL}/api/phonesoftware/tenants/${selectedTenant.id}/users`, {
        headers: getAuthHeaders()
      });
      setTenantUsers(response.data);
      loadTenants();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('U kopjua!');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Menaxher';
      case 'technician': return 'Teknik';
      case 'staff': return 'Staff';
      case 'worker': return 'Punëtor';
      default: return role;
    }
  };

  if (!user || user.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="ps-admin-page">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00a79d] to-[#008f86] rounded-lg flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PhoneSoftware</h1>
                <p className="text-xs text-gray-500">Panel Administrativ</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Mirësevini, <strong>{user?.full_name}</strong>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Dilni
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menaxhimi i Firmave</h2>
            <p className="text-gray-500">Shto, edito dhe menaxho firmat që përdorin PhoneSoftware</p>
          </div>
          <Button 
            className="bg-[#00a79d] hover:bg-[#008f86]"
            onClick={openCreateDialog}
            data-testid="ps-add-tenant-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Shto Firmë të Re
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.length}</p>
                  <p className="text-sm text-gray-500">Firma Totale</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.filter(t => t.status === 'active').length}</p>
                  <p className="text-sm text-gray-500">Aktive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.filter(t => t.status === 'trial').length}</p>
                  <p className="text-sm text-gray-500">Trial</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Wrench className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{tenants.reduce((sum, t) => sum + (t.repairs_count || 0), 0)}</p>
                  <p className="text-sm text-gray-500">Riparime Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Lista e Firmave</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="spinner" />
              </div>
            ) : tenants.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ende nuk ka firma të regjistruara</p>
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Shto Firmën e Parë
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {tenants.map((tenant) => (
                  <div 
                    key={tenant.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: tenant.primary_color, borderLeftWidth: '4px' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        {tenant.logo_url ? (
                          <img src={tenant.logo_url} alt="" className="h-12 w-12 object-contain rounded" />
                        ) : (
                          <div 
                            className="h-12 w-12 rounded flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: tenant.primary_color }}
                          >
                            {tenant.company_name?.charAt(0) || 'F'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{tenant.company_name}</h3>
                            {getStatusBadge(tenant.status)}
                          </div>
                          <p className="text-sm text-gray-500">{tenant.name}.phonesoftware.com</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {tenant.email}
                            </span>
                            {tenant.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {tenant.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="text-sm"><Users className="h-3 w-3 inline mr-1" />{tenant.users_count || 0} përdorues</p>
                          <p className="text-sm"><Wrench className="h-3 w-3 inline mr-1" />{tenant.repairs_count || 0} riparime</p>
                          {tenant.subscription_expires && (
                            <p className={`text-xs mt-1 ${calculateRemainingDays(tenant.subscription_expires) <= 7 ? 'text-red-600 font-semibold' : calculateRemainingDays(tenant.subscription_expires) <= 30 ? 'text-orange-600' : 'text-green-600'}`}>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              Abonimi: {calculateRemainingDays(tenant.subscription_expires)} ditë
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-purple-500 hover:bg-purple-50"
                          onClick={() => openSubscriptionDialog(tenant)}
                          title="Menaxho Abonimin"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Select 
                          value={tenant.status} 
                          onValueChange={(value) => updateTenantStatus(tenant.id, value)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Aktiv</SelectItem>
                            <SelectItem value="trial">Trial</SelectItem>
                            <SelectItem value="suspended">Pezullo</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(tenant)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-blue-500 hover:bg-blue-50"
                          onClick={() => openUserDialog(tenant)}
                          title="Shto Përdorues"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openUsersListDialog(tenant)}
                          title="Shiko Përdoruesit"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDelete(tenant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Tenant Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {editingTenant ? 'Edito Firmën' : 'Shto Firmë të Re'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500 border-b pb-2">Informacioni Bazë</h4>
              
              <div>
                <Label>Identifikuesi (subdomain) *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                  placeholder="p.sh. mobilshopurimi"
                  disabled={editingTenant}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.name || 'firma'}.phonesoftware.com</p>
              </div>
              
              <div>
                <Label>Emri i Kompanisë *</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  placeholder="p.sh. Mobile Repair SH.P.K"
                />
              </div>
              
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="info@kompania.com"
                />
              </div>
              
              <div>
                <Label>Telefoni</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+383 44 123 456"
                />
              </div>
              
              <div>
                <Label>Qyteti</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Prishtinë"
                />
              </div>
              
              <div>
                <Label>Adresa</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Rruga, Numri"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-gray-500 border-b pb-2">Branding</h4>
              
              <div>
                <Label>URL e Logos</Label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo_url && (
                  <img src={formData.logo_url} alt="Preview" className="h-12 mt-2 object-contain" />
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ngjyra Primare</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Ngjyra Sekondare</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              {!editingTenant && (
                <>
                  <h4 className="font-medium text-sm text-gray-500 border-b pb-2 mt-6">Admin i Firmës</h4>
                  
                  <div>
                    <Label>Emri i Plotë i Adminit *</Label>
                    <Input
                      value={formData.admin_full_name}
                      onChange={(e) => setFormData({...formData, admin_full_name: e.target.value})}
                      placeholder="Emri Mbiemri"
                    />
                  </div>
                  
                  <div>
                    <Label>Username i Adminit *</Label>
                    <Input
                      value={formData.admin_username}
                      onChange={(e) => setFormData({...formData, admin_username: e.target.value})}
                      placeholder="admin_firma"
                    />
                  </div>
                  
                  <div>
                    <Label>Fjalëkalimi i Adminit *</Label>
                    <Input
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>

                  <h4 className="font-medium text-sm text-gray-500 border-b pb-2 mt-6">Abonimi</h4>
                  
                  <div>
                    <Label>Kohëzgjatja e Abonimit</Label>
                    <Select 
                      value={formData.subscription_months.toString()} 
                      onValueChange={(value) => setFormData({...formData, subscription_months: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Muaj (Trial) - Falas</SelectItem>
                        <SelectItem value="3">3 Muaj - 60€</SelectItem>
                        <SelectItem value="6">6 Muaj - 120€</SelectItem>
                        <SelectItem value="12">12 Muaj - 200€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleSubmit} 
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading || !formData.name || !formData.company_name || !formData.email || (!editingTenant && (!formData.admin_username || !formData.admin_password || !formData.admin_full_name))}
            >
              {loading ? 'Duke ruajtur...' : (editingTenant ? 'Ruaj Ndryshimet' : 'Krijo Firmën')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Shto Përdorues për {selectedTenant?.company_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Emri i Plotë *</Label>
              <Input
                value={userFormData.full_name}
                onChange={(e) => setUserFormData({...userFormData, full_name: e.target.value})}
                placeholder="Emri Mbiemri"
              />
            </div>
            
            <div>
              <Label>Username *</Label>
              <Input
                value={userFormData.username}
                onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                placeholder="username"
              />
            </div>
            
            <div>
              <Label>Fjalëkalimi *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <Label>Telefoni</Label>
              <Input
                value={userFormData.phone}
                onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                placeholder="+383 44 ..."
              />
            </div>
            
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <Label>Roli *</Label>
              <Select 
                value={userFormData.role} 
                onValueChange={(value) => setUserFormData({...userFormData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Menaxher</SelectItem>
                  <SelectItem value="technician">Teknik</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="worker">Punëtor (vetëm riparime)</SelectItem>
                </SelectContent>
              </Select>
              {userFormData.role === 'worker' && (
                <p className="text-xs text-gray-500 mt-1">
                  Punëtori ka akses vetëm për krijimin e riparimeve dhe ndryshimin e statusit.
                </p>
              )}
            </div>
            
            {(userFormData.role === 'technician' || userFormData.role === 'worker') && (
              <div>
                <Label>Specializimi</Label>
                <Input
                  value={userFormData.specialization}
                  onChange={(e) => setUserFormData({...userFormData, specialization: e.target.value})}
                  placeholder="p.sh. iPhone, Samsung, Software"
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleCreateUser} 
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading || !userFormData.username || !userFormData.password || !userFormData.full_name}
            >
              {loading ? 'Duke krijuar...' : 'Krijo Përdoruesin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users List Dialog */}
      <Dialog open={showUsersListDialog} onOpenChange={setShowUsersListDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Përdoruesit e {selectedTenant?.company_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            {tenantUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Nuk ka përdorues</p>
            ) : (
              tenantUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-medium ${
                      u.role === 'admin' ? 'bg-purple-500' : 
                      u.role === 'manager' ? 'bg-blue-500' : 
                      u.role === 'technician' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {u.full_name?.charAt(0) || u.username?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{u.full_name || u.username}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Key className="h-3 w-3" /> {u.username}
                        </span>
                        {u.specialization && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{u.specialization}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      u.role === 'manager' ? 'bg-blue-100 text-blue-700' : 
                      u.role === 'technician' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {getRoleLabel(u.role)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(`Username: ${u.username}`)}
                      title="Kopjo kredencialet"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowUsersListDialog(false)}>Mbyll</Button>
            <Button 
              onClick={() => {
                setShowUsersListDialog(false);
                openUserDialog(selectedTenant);
              }}
              className="bg-[#00a79d] hover:bg-[#008f86]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Shto Përdorues të Ri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Management Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              Menaxho Abonimin
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{subscriptionData.tenant_name}</p>
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-gray-600">
                  Statusi aktual: 
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                    subscriptionData.current_status === 'active' ? 'bg-green-100 text-green-700' :
                    subscriptionData.current_status === 'suspended' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {subscriptionData.current_status === 'active' ? 'Aktiv' : 
                     subscriptionData.current_status === 'suspended' ? 'Pezulluar' : 'Trial'}
                  </span>
                </p>
                {subscriptionData.current_expires && (
                  <p className="text-gray-600">
                    Skadon: 
                    <span className={`ml-2 font-medium ${calculateRemainingDays(subscriptionData.current_expires) <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(subscriptionData.current_expires).toLocaleDateString('sq-AL')}
                      ({calculateRemainingDays(subscriptionData.current_expires)} ditë)
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Veprimi</Label>
              <Select 
                value={subscriptionData.action} 
                onValueChange={(value) => setSubscriptionData({...subscriptionData, action: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extend">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-green-500" />
                      Zgjat Abonimin
                    </span>
                  </SelectItem>
                  <SelectItem value="suspend">
                    <span className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-red-500" />
                      Pezullo Abonimin
                    </span>
                  </SelectItem>
                  <SelectItem value="activate">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Aktivizo Përsëri
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {subscriptionData.action === 'extend' && (
              <div>
                <Label>Shto Muaj</Label>
                <Select 
                  value={subscriptionData.months.toString()} 
                  onValueChange={(value) => setSubscriptionData({...subscriptionData, months: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Muaj - 20€</SelectItem>
                    <SelectItem value="3">3 Muaj - 60€</SelectItem>
                    <SelectItem value="6">6 Muaj - 120€</SelectItem>
                    <SelectItem value="12">12 Muaj - 200€</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  Data e re e skadimit: {(() => {
                    const baseDate = subscriptionData.current_expires 
                      ? new Date(subscriptionData.current_expires) 
                      : new Date();
                    if (baseDate < new Date()) baseDate.setTime(new Date().getTime());
                    baseDate.setMonth(baseDate.getMonth() + parseInt(subscriptionData.months));
                    return baseDate.toLocaleDateString('sq-AL');
                  })()}
                </p>
              </div>
            )}

            {subscriptionData.action === 'suspend' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Pezullimi do të bllokojë aksesin e të gjithë përdoruesve të kësaj firme.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleSubscriptionUpdate}
              className={subscriptionData.action === 'suspend' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00a79d] hover:bg-[#008f86]'}
              disabled={loading}
            >
              {loading ? 'Duke përditësuar...' : 
               subscriptionData.action === 'extend' ? 'Zgjat Abonimin' :
               subscriptionData.action === 'suspend' ? 'Pezullo' : 'Aktivizo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PSAdmin;
