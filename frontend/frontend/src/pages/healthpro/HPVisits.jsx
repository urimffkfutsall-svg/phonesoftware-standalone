import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Home,
  Users,
  Filter,
  CheckCircle,
  FileText
} from 'lucide-react';

const HPVisits = () => {
  const { user } = useHPAuth();
  const [visits, setVisits] = useState([]);
  const [residents, setResidents] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [formData, setFormData] = useState({
    resident_id: '',
    visit_type: 'home',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '',
    reason: '',
    staff_ids: [],
    address: '',
    notes: ''
  });

  // Complete dialog
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [completeForm, setCompleteForm] = useState({ result: '', notes: '' });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isVisitor = user?.role === 'visitor';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [visitsRes, residentsRes, employeesRes] = await Promise.all([
        hpApi.get('/healthpro/visits'),
        hpApi.get('/healthpro/residents'),
        hpApi.get('/healthpro/employees')
      ]);
      setVisits(visitsRes);
      setResidents(residentsRes);
      setEmployees(employeesRes.filter(e => e.role !== 'visitor'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVisit) {
        await hpApi.put(`/healthpro/visits/${editingVisit.id}`, formData);
        toast.success('Vizita u përditësua');
      } else {
        await hpApi.post('/healthpro/visits', formData);
        toast.success('Vizita u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni të fshini këtë vizitë?')) return;
    try {
      await hpApi.delete(`/healthpro/visits/${id}`);
      toast.success('Vizita u fshi');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const openCompleteDialog = (visit) => {
    setSelectedVisit(visit);
    setCompleteForm({ result: visit.result || '', notes: visit.notes || '' });
    setShowCompleteDialog(true);
  };

  const handleComplete = async () => {
    try {
      await hpApi.put(`/healthpro/visits/${selectedVisit.id}`, {
        ...completeForm,
        is_completed: true
      });
      toast.success('Vizita u shënua si e përfunduar');
      setShowCompleteDialog(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const resetForm = () => {
    setEditingVisit(null);
    setFormData({
      resident_id: '',
      visit_type: 'home',
      visit_date: new Date().toISOString().split('T')[0],
      visit_time: '',
      reason: '',
      staff_ids: [],
      address: '',
      notes: ''
    });
  };

  const openEditDialog = (visit) => {
    setEditingVisit(visit);
    setFormData({
      resident_id: visit.resident_id,
      visit_type: visit.visit_type,
      visit_date: visit.visit_date,
      visit_time: visit.visit_time || '',
      reason: visit.reason,
      staff_ids: visit.staff_ids || [],
      address: visit.address || '',
      notes: visit.notes || ''
    });
    setShowDialog(true);
  };

  const handleStaffChange = (staffId) => {
    const current = formData.staff_ids || [];
    if (current.includes(staffId)) {
      setFormData({...formData, staff_ids: current.filter(id => id !== staffId)});
    } else {
      setFormData({...formData, staff_ids: [...current, staffId]});
    }
  };

  const filteredVisits = visits.filter(v => {
    const matchesSearch = v.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || v.visit_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'completed' && v.is_completed) ||
                          (statusFilter === 'pending' && !v.is_completed);
    return matchesSearch && matchesType && matchesStatus;
  });

  const visitTypeLabels = {
    home: 'Vizitë në Shtëpi',
    community: 'Vizitë në Komunitet'
  };

  const visitTypeColors = {
    home: 'bg-blue-500/20 text-blue-400',
    community: 'bg-purple-500/20 text-purple-400'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#00a79d] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Vizitat</h1>
          <p className="text-gray-400">Vizitat në shtëpi dhe në komunitet</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-[#00a79d] hover:bg-[#008f86]">
            <Plus className="w-4 h-4 mr-2" />Shto Vizitë
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{visits.length}</p>
            <p className="text-gray-400 text-sm">Totali</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{visits.filter(v => v.visit_type === 'home').length}</p>
            <p className="text-gray-400 text-sm">Në Shtëpi</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{visits.filter(v => v.visit_type === 'community').length}</p>
            <p className="text-gray-400 text-sm">Në Komunitet</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{visits.filter(v => v.is_completed).length}</p>
            <p className="text-gray-400 text-sm">Përfunduara</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Kërko sipas rezidentit, arsyes, adresës..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lloji" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="home">Në Shtëpi</SelectItem>
            <SelectItem value="community">Në Komunitet</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="pending">Në pritje</SelectItem>
            <SelectItem value="completed">Përfunduara</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visits List */}
      <div className="grid gap-4">
        {filteredVisits.map((visit) => (
          <Card key={visit.id} className={`bg-gray-800 border-gray-700 ${visit.is_completed ? 'opacity-75' : ''}`}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${visitTypeColors[visit.visit_type]}`}>
                    {visit.visit_type === 'home' ? <Home className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{visit.resident_name}</h3>
                    <p className="text-[#00a79d] text-sm">{visit.reason}</p>
                    <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{visit.visit_date}
                      </span>
                      {visit.visit_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{visit.visit_time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={visitTypeColors[visit.visit_type]}>
                        {visitTypeLabels[visit.visit_type]}
                      </Badge>
                      <Badge className={visit.is_completed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                        {visit.is_completed ? 'Përfunduar' : 'Në pritje'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="text-sm text-gray-400">
                    {visit.address && (
                      <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{visit.address}</p>
                    )}
                    {visit.staff_names?.length > 0 && (
                      <p className="flex items-center gap-1"><User className="w-3 h-3" />{visit.staff_names.join(', ')}</p>
                    )}
                  </div>
                  
                  {!isVisitor && (
                    <div className="flex gap-2">
                      {!visit.is_completed && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openCompleteDialog(visit)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />Përfundo
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="outline" className="border-gray-600" onClick={() => openEditDialog(visit)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20" onClick={() => handleDelete(visit.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show result if completed */}
              {visit.is_completed && visit.result && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-gray-400 text-xs uppercase">Rezultati:</p>
                  <p className="text-white text-sm">{visit.result}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredVisits.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">Nuk u gjetën vizita</p>
              {isAdmin && (
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="mt-4 bg-[#00a79d] hover:bg-[#008f86]">
                  <Plus className="w-4 h-4 mr-2" />Shto Vizitën e Parë
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingVisit ? 'Edito Vizitën' : 'Shto Vizitë të Re'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-gray-300">Rezidenti *</Label>
                <Select value={formData.resident_id} onValueChange={(v) => setFormData({...formData, resident_id: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Zgjidhni rezidentin" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 max-h-[200px]">
                    {residents.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.first_name} {r.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Lloji i Vizitës *</Label>
                <Select value={formData.visit_type} onValueChange={(v) => setFormData({...formData, visit_type: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="home">Vizitë në Shtëpi</SelectItem>
                    <SelectItem value="community">Vizitë në Komunitet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Arsyeja *</Label>
                <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required placeholder="p.sh. Kontroll rutinë" />
              </div>
              <div>
                <Label className="text-gray-300">Data *</Label>
                <Input type="date" value={formData.visit_date} onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label className="text-gray-300">Ora</Label>
                <Input type="time" value={formData.visit_time} onChange={(e) => setFormData({...formData, visit_time: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Adresa</Label>
                <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="Adresa e vizitës" />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Stafi Përgjegjës</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {employees.map(emp => (
                    <Badge
                      key={emp.id}
                      className={`cursor-pointer ${formData.staff_ids?.includes(emp.id) ? 'bg-[#00a79d] text-white' : 'bg-gray-700 text-gray-300'}`}
                      onClick={() => handleStaffChange(emp.id)}
                    >
                      {emp.first_name} {emp.last_name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Shënime</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" className="border-gray-600" onClick={() => setShowDialog(false)}>Anulo</Button>
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">{editingVisit ? 'Ruaj' : 'Shto'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Përfundo Vizitën</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedVisit?.resident_name} - {selectedVisit?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Rezultati i Vizitës</Label>
              <Textarea value={completeForm.result} onChange={(e) => setCompleteForm({...completeForm, result: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" rows={3} placeholder="Shkruani rezultatin e vizitës..." />
            </div>
            <div>
              <Label className="text-gray-300">Shënime Shtesë</Label>
              <Textarea value={completeForm.notes} onChange={(e) => setCompleteForm({...completeForm, notes: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" rows={2} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="border-gray-600" onClick={() => setShowCompleteDialog(false)}>Anulo</Button>
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />Përfundo Vizitën
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HPVisits;
