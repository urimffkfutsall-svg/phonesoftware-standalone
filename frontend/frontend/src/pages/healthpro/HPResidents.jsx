import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { hpApi } from './HPLayout';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  AlertCircle
} from 'lucide-react';

const HPResidents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    personal_id: '',
    address: '',
    phone: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_relation: '',
    health_status: '',
    diagnoses: [],
    medical_history: '',
    allergies: '',
    blood_type: '',
    room_number: '',
    admission_date: '',
    notes: ''
  });

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      setLoading(true);
      const data = await hpApi.get(`/healthpro/residents${search ? `?search=${search}` : ''}`);
      setResidents(data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të rezidentëve');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingResident) {
        await hpApi.put(`/healthpro/residents/${editingResident.id}`, formData);
        toast.success('Rezidenti u përditësua me sukses');
      } else {
        await hpApi.post('/healthpro/residents', formData);
        toast.success('Rezidenti u shtua me sukses');
      }
      setShowDialog(false);
      resetForm();
      loadResidents();
    } catch (error) {
      toast.error(error.message || 'Gabim gjatë ruajtjes');
    }
  };

  const handleEdit = (resident) => {
    setEditingResident(resident);
    setFormData({
      first_name: resident.first_name || '',
      last_name: resident.last_name || '',
      date_of_birth: resident.date_of_birth || '',
      gender: resident.gender || 'male',
      personal_id: resident.personal_id || '',
      address: resident.address || '',
      phone: resident.phone || '',
      guardian_name: resident.guardian_name || '',
      guardian_phone: resident.guardian_phone || '',
      guardian_relation: resident.guardian_relation || '',
      health_status: resident.health_status || '',
      diagnoses: resident.diagnoses || [],
      medical_history: resident.medical_history || '',
      allergies: resident.allergies || '',
      blood_type: resident.blood_type || '',
      room_number: resident.room_number || '',
      admission_date: resident.admission_date || '',
      notes: resident.notes || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që dëshironi ta çaktivizoni këtë rezident?')) return;
    try {
      await hpApi.delete(`/healthpro/residents/${id}`);
      toast.success('Rezidenti u çaktivizua');
      loadResidents();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const resetForm = () => {
    setEditingResident(null);
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      personal_id: '',
      address: '',
      phone: '',
      guardian_name: '',
      guardian_phone: '',
      guardian_relation: '',
      health_status: '',
      diagnoses: [],
      medical_history: '',
      allergies: '',
      blood_type: '',
      room_number: '',
      admission_date: '',
      notes: ''
    });
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} vjeç`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Rezidentët</h1>
          <p className="text-gray-400">Menaxhoni rezidentët e institutit</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-[#00a79d] hover:bg-[#008f86] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Shto Rezident
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Kërko sipas emrit, ID, dhomës..."
              className="pl-10 bg-gray-700 border-gray-600 text-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadResidents()}
            />
          </div>
        </CardContent>
      </Card>

      {/* Residents List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-[#00a79d] border-t-transparent rounded-full" />
            </div>
          ) : residents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nuk ka rezidentë të regjistruar</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-gray-700">
                {residents.map((resident) => (
                  <div key={resident.id} className="p-4 hover:bg-gray-750 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#00a79d]/20 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-[#00a79d]" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {resident.first_name} {resident.last_name}
                            {resident.room_number && (
                              <span className="ml-2 text-xs bg-gray-700 px-2 py-0.5 rounded">
                                Dhoma {resident.room_number}
                              </span>
                            )}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-400">
                            {resident.date_of_birth && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {calculateAge(resident.date_of_birth)}
                              </span>
                            )}
                            {resident.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {resident.phone}
                              </span>
                            )}
                            {resident.address && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {resident.address}
                              </span>
                            )}
                          </div>
                          {resident.health_status && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {resident.health_status}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          resident.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-600 text-gray-400'
                        }`}>
                          {resident.status === 'active' ? 'Aktiv' : 'Joaktiv'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(resident)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(resident.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingResident ? 'Modifiko Rezidentin' : 'Shto Rezident të Ri'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Emri *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Mbiemri *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Data e Lindjes</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Gjinia</Label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="male">Mashkull</option>
                  <option value="female">Femër</option>
                  <option value="other">Tjetër</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Nr. Personal / ID</Label>
                <Input
                  value={formData.personal_id}
                  onChange={(e) => setFormData({...formData, personal_id: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Telefoni</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Dhoma</Label>
                <Input
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="p.sh. 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Adresa</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Guardian Info */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">Kujdestari / Familjar</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Emri</Label>
                  <Input
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({...formData, guardian_name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Telefoni</Label>
                  <Input
                    value={formData.guardian_phone}
                    onChange={(e) => setFormData({...formData, guardian_phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Lidhja</Label>
                  <Input
                    value={formData.guardian_relation}
                    onChange={(e) => setFormData({...formData, guardian_relation: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="p.sh. Djali, Vajza"
                  />
                </div>
              </div>
            </div>

            {/* Health Info */}
            <div className="border-t border-gray-700 pt-4">
              <p className="text-sm text-gray-400 mb-3">Informata Shëndetësore</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Gjendja Shëndetësore</Label>
                    <Input
                      value={formData.health_status}
                      onChange={(e) => setFormData({...formData, health_status: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="p.sh. E qëndrueshme"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Grupi i Gjakut</Label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({...formData, blood_type: e.target.value})}
                      className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Zgjidhni</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Alergjitë</Label>
                  <Input
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="p.sh. Penicilina, Gluten"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Historia Mjekësore</Label>
                  <Textarea
                    value={formData.medical_history}
                    onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Shënime</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} className="border-gray-600 text-gray-300">
                Anulo
              </Button>
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86] text-white">
                {editingResident ? 'Ruaj Ndryshimet' : 'Shto Rezidentin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HPResidents;
