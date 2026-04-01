import React, { useState, useEffect } from 'react';
import { bpApi } from '../../App';
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
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Search, UserCircle, Phone, Mail, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'stylist', label: 'Stilist/e' },
  { value: 'receptionist', label: 'Recepsionist/e' },
];

const SPECIALIZATIONS = [
  { value: 'haircut', label: 'Prerje Flokësh' },
  { value: 'coloring', label: 'Ngjyrosje' },
  { value: 'styling', label: 'Stilim' },
  { value: 'treatment', label: 'Trajtim' },
  { value: 'extensions', label: 'Zgjatim Flokësh' },
  { value: 'bridal', label: 'Nuse' },
  { value: 'makeup', label: 'Grim' },
];

const BPStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'stylist',
    phone: '',
    email: '',
    specializations: [],
    bio: '',
    commission_percent: 0
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await bpApi.get('/bookpro/staff?active_only=false');
      setStaff(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të stafit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || (!editingStaff && (!formData.username || !formData.password))) {
      toast.error('Ju lutem plotësoni fushat e detyrueshme');
      return;
    }

    try {
      const data = { ...formData };
      if (editingStaff && !data.password) {
        delete data.password;
      }

      if (editingStaff) {
        await bpApi.put(`/bookpro/staff/${editingStaff.id}`, data);
        toast.success('Stafi u përditësua');
      } else {
        await bpApi.post('/bookpro/staff', data);
        toast.success('Stafi u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      username: member.username,
      password: '',
      full_name: member.full_name,
      role: member.role,
      phone: member.phone || '',
      email: member.email || '',
      specializations: member.specializations || [],
      bio: member.bio || '',
      commission_percent: member.commission_percent || 0
    });
    setShowDialog(true);
  };

  const handleDelete = async (member) => {
    if (!confirm(`Jeni të sigurt që dëshironi të çaktivizoni "${member.full_name}"?`)) return;
    
    try {
      await bpApi.delete(`/bookpro/staff/${member.id}`);
      toast.success('Stafi u çaktivizua');
      loadStaff();
    } catch (error) {
      toast.error('Gabim gjatë çaktivizimit');
    }
  };

  const resetForm = () => {
    setEditingStaff(null);
    setFormData({
      username: '',
      password: '',
      full_name: '',
      role: 'stylist',
      phone: '',
      email: '',
      specializations: [],
      bio: '',
      commission_percent: 0
    });
  };

  const toggleSpecialization = (spec) => {
    const current = formData.specializations || [];
    if (current.includes(spec)) {
      setFormData({ ...formData, specializations: current.filter(s => s !== spec) });
    } else {
      setFormData({ ...formData, specializations: [...current, spec] });
    }
  };

  const getSpecLabel = (spec) => {
    return SPECIALIZATIONS.find(s => s.value === spec)?.label || spec;
  };

  const filteredStaff = staff.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="bp-staff-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stafi</h1>
          <p className="text-gray-500">Menaxhoni punonjësit e sallonit</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-rose-500 hover:bg-rose-600"
          data-testid="add-staff-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Staf
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Kërko staf..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UserCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nuk ka staf. Shtoni anëtarin e parë!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((member) => (
            <Card key={member.id} className={`${!member.is_active ? 'opacity-60' : ''}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-rose-500 text-white text-lg">
                      {member.full_name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 truncate">{member.full_name}</h3>
                      {!member.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                          Joaktiv
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                    
                    {member.phone && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3" />
                        {member.phone}
                      </p>
                    )}
                    
                    {member.specializations?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.specializations.slice(0, 3).map((spec) => (
                          <span key={spec} className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full">
                            {getSpecLabel(spec)}
                          </span>
                        ))}
                        {member.specializations.length > 3 && (
                          <span className="text-xs text-gray-400">+{member.specializations.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-gray-800">{member.appointments_count || 0}</p>
                    <p className="text-xs text-gray-500">Rezervime</p>
                  </div>
                  <div className="flex-1 text-center">
                    <p className="text-lg font-bold text-green-600">€{(member.total_revenue || 0).toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Të ardhura</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                      <Edit className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? 'Modifiko Stafin' : 'Shto Staf të Ri'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Emri i Plotë *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Emri dhe Mbiemri"
                />
              </div>
              <div className="space-y-2">
                <Label>Roli</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username {!editingStaff && '*'}</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  disabled={!!editingStaff}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{editingStaff ? 'Fjalëkalim i ri' : 'Fjalëkalimi *'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingStaff ? 'Lër bosh për të mos ndryshuar' : 'Fjalëkalimi'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefoni</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+383 44 xxx xxx"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Specializimet</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec.value}
                    type="button"
                    onClick={() => toggleSpecialization(spec.value)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      formData.specializations?.includes(spec.value)
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-rose-500'
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission">Komisioni (%)</Label>
              <Input
                id="commission"
                type="number"
                min="0"
                max="100"
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (opsional)</Label>
              <Input
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Përshkrim i shkurtër..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600">
              {editingStaff ? 'Ruaj Ndryshimet' : 'Shto Stafin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BPStaff;
