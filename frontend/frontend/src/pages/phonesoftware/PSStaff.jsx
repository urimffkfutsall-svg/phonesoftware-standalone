import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  UserCog,
  Wrench,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
  Phone,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSStaff = () => {
  const [staff, setStaff] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'technician',
    phone: '',
    email: '',
    specialization: ''
  });

  useEffect(() => {
    loadStaff();
    loadPerformance();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadStaff = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/staff`, {
        headers: getAuthHeaders()
      });
      setStaff(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të stafit');
    } finally {
      setLoading(false);
    }
  };

  const loadPerformance = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/staff/performance?period=month`, {
        headers: getAuthHeaders()
      });
      setPerformance(response.data);
    } catch (error) {
      console.error('Error loading performance:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.username || (!editingUser && !formData.password)) {
      toast.error('Plotësoni fushat e detyrueshme');
      return;
    }

    setLoading(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await axios.put(`${API_URL}/api/phonesoftware/staff/${editingUser.id}`, payload, {
          headers: getAuthHeaders()
        });
        toast.success('Përdoruesi u përditësua!');
      } else {
        await axios.post(`${API_URL}/api/phonesoftware/staff`, formData, {
          headers: getAuthHeaders()
        });
        toast.success('Përdoruesi u krijua me sukses!');
      }
      setShowDialog(false);
      resetForm();
      loadStaff();
      loadPerformance();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Jeni i sigurt që doni të çaktivizoni këtë përdorues?')) return;

    try {
      await axios.delete(`${API_URL}/api/phonesoftware/staff/${userId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Përdoruesi u çaktivizua');
      loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim');
    }
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
      email: user.email || '',
      specialization: user.specialization || ''
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'technician',
      phone: '',
      email: '',
      specialization: ''
    });
    setShowPassword(false);
  };

  const getRoleLabel = (role) => {
    const labels = {
      'admin': 'Administrator',
      'manager': 'Menaxher',
      'technician': 'Teknik',
      'staff': 'Staff'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-purple-100 text-purple-700',
      'manager': 'bg-blue-100 text-blue-700',
      'technician': 'bg-green-100 text-green-700',
      'staff': 'bg-gray-100 text-gray-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const filteredStaff = staff.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="ps-staff">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menaxhimi i Stafit</h1>
          <p className="text-gray-500">Menaxhoni punonjësit dhe teknikët</p>
        </div>
        <Button 
          className="bg-[#00a79d] hover:bg-[#008f86]"
          onClick={() => { resetForm(); setShowDialog(true); }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Punonjës i Ri
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Staf Total</p>
                <p className="text-2xl font-bold">{staff.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Teknikë</p>
                <p className="text-2xl font-bold">{staff.filter(s => s.role === 'technician').length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Riparime (Muaji)</p>
                <p className="text-2xl font-bold">
                  {performance?.staff_performance?.reduce((sum, s) => sum + s.completed, 0) || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Të Ardhura (Muaji)</p>
                <p className="text-2xl font-bold">
                  {performance?.staff_performance?.reduce((sum, s) => sum + s.revenue, 0)?.toFixed(0) || 0}€
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kërko sipas emrit, username-it ose specializimit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nuk u gjetën punonjës' : 'Ende nuk ka punonjës'}
            </p>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Shto Punonjësin e Parë
            </Button>
          </div>
        ) : (
          filteredStaff.map((user) => {
            const perf = performance?.staff_performance?.find(p => p.user_id === user.id);
            
            return (
              <Card key={user.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg ${
                        user.role === 'admin' ? 'bg-purple-500' :
                        user.role === 'manager' ? 'bg-blue-500' :
                        user.role === 'technician' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  
                  {user.specialization && (
                    <p className="text-sm text-[#00a79d] mb-3 flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {user.specialization}
                    </p>
                  )}
                  
                  {user.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </p>
                  )}
                  
                  {user.email && (
                    <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </p>
                  )}
                  
                  {/* Performance Stats */}
                  {perf && (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{perf.completed}</p>
                        <p className="text-xs text-gray-500">Kryer</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{perf.in_progress}</p>
                        <p className="text-xs text-gray-500">Në proces</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-[#00a79d]">{perf.revenue?.toFixed(0)}€</p>
                        <p className="text-xs text-gray-500">Të ardhura</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edito
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-[#00a79d]" />
              {editingUser ? 'Edito Punonjësin' : 'Punonjës i Ri'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Emri i Plotë *</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Emri Mbiemri"
              />
            </div>
            
            <div>
              <Label>Username *</Label>
              <Input
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="username"
                disabled={editingUser}
              />
            </div>
            
            <div>
              <Label>{editingUser ? 'Fjalëkalimi (lëre bosh për të mos ndryshuar)' : 'Fjalëkalimi *'}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              <Label>Roli *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({...formData, role: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Menaxher</SelectItem>
                  <SelectItem value="technician">Teknik</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.role === 'technician' && (
              <div>
                <Label>Specializimi</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  placeholder="p.sh. iPhone, Samsung, Software"
                />
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefoni</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+383 44 ..."
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading}
            >
              {loading ? 'Duke ruajtur...' : (editingUser ? 'Ruaj Ndryshimet' : 'Krijo Punonjësin')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PSStaff;
