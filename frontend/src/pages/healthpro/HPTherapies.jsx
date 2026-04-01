import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  Pill,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Activity,
  Filter,
  CheckCircle,
  XCircle,
  List,
  LayoutGrid
} from 'lucide-react';

const HPTherapies = () => {
  const { user } = useHPAuth();
  const [therapies, setTherapies] = useState([]);
  const [residents, setResidents] = useState([]);
  const [dailySchedule, setDailySchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingTherapy, setEditingTherapy] = useState(null);
  const [formData, setFormData] = useState({
    resident_id: '',
    therapy_type: 'medication',
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    administration_time: [],
    prescribed_by: '',
    notes: ''
  });
  const [timeInputs, setTimeInputs] = useState(['08:00']);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isVisitor = user?.role === 'visitor';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'schedule') {
      loadDailySchedule();
    }
  }, [activeTab, scheduleDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [therapiesRes, residentsRes] = await Promise.all([
        hpApi.get('/healthpro/therapies?active_only=false'),
        hpApi.get('/healthpro/residents')
      ]);
      setTherapies(therapiesRes);
      setResidents(residentsRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  };

  const loadDailySchedule = async () => {
    try {
      const result = await hpApi.get(`/healthpro/therapies/daily-schedule?date=${scheduleDate}`);
      setDailySchedule(result.schedule || {});
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        administration_time: timeInputs.filter(t => t)
      };
      
      if (editingTherapy) {
        await hpApi.put(`/healthpro/therapies/${editingTherapy.id}`, submitData);
        toast.success('Terapia u përditësua');
      } else {
        await hpApi.post('/healthpro/therapies', submitData);
        toast.success('Terapia u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni të çaktivizoni këtë terapi?')) return;
    try {
      await hpApi.delete(`/healthpro/therapies/${id}`);
      toast.success('Terapia u çaktivizua');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleToggleActive = async (therapy) => {
    try {
      await hpApi.put(`/healthpro/therapies/${therapy.id}`, { is_active: !therapy.is_active });
      toast.success(therapy.is_active ? 'Terapia u çaktivizua' : 'Terapia u aktivizua');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const resetForm = () => {
    setEditingTherapy(null);
    setFormData({
      resident_id: '',
      therapy_type: 'medication',
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      administration_time: [],
      prescribed_by: '',
      notes: ''
    });
    setTimeInputs(['08:00']);
  };

  const openEditDialog = (therapy) => {
    setEditingTherapy(therapy);
    setFormData({
      resident_id: therapy.resident_id,
      therapy_type: therapy.therapy_type,
      name: therapy.name,
      dosage: therapy.dosage || '',
      frequency: therapy.frequency || '',
      duration: therapy.duration || '',
      start_date: therapy.start_date,
      end_date: therapy.end_date || '',
      administration_time: therapy.administration_time || [],
      prescribed_by: therapy.prescribed_by || '',
      notes: therapy.notes || ''
    });
    setTimeInputs(therapy.administration_time?.length ? therapy.administration_time : ['08:00']);
    setShowDialog(true);
  };

  const addTimeInput = () => {
    setTimeInputs([...timeInputs, '']);
  };

  const removeTimeInput = (index) => {
    setTimeInputs(timeInputs.filter((_, i) => i !== index));
  };

  const updateTimeInput = (index, value) => {
    const newTimes = [...timeInputs];
    newTimes[index] = value;
    setTimeInputs(newTimes);
  };

  const filteredTherapies = therapies.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.resident_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || t.therapy_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const therapyTypeLabels = {
    medication: 'Medikament',
    physical: 'Fizike',
    supportive: 'Mbështetëse',
    psychological: 'Psikologjike',
    other: 'Tjetër'
  };

  const therapyTypeColors = {
    medication: 'bg-blue-500/20 text-blue-400',
    physical: 'bg-green-500/20 text-green-400',
    supportive: 'bg-purple-500/20 text-purple-400',
    psychological: 'bg-orange-500/20 text-orange-400',
    other: 'bg-gray-500/20 text-gray-400'
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
          <h1 className="text-2xl font-bold text-white">Terapitë</h1>
          <p className="text-gray-400">Menaxhoni terapitë dhe medikamentet e rezidentëve</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-[#00a79d] hover:bg-[#008f86]">
            <Plus className="w-4 h-4 mr-2" />Shto Terapi
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="list" className="data-[state=active]:bg-[#00a79d]">
            <List className="w-4 h-4 mr-2" />Lista
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#00a79d]">
            <Clock className="w-4 h-4 mr-2" />Orari Ditor
          </TabsTrigger>
        </TabsList>

        {/* List Tab */}
        <TabsContent value="list" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Kërko sipas emrit ose rezidentit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lloji" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Të gjitha llojet</SelectItem>
                <SelectItem value="medication">Medikament</SelectItem>
                <SelectItem value="physical">Fizike</SelectItem>
                <SelectItem value="supportive">Mbështetëse</SelectItem>
                <SelectItem value="psychological">Psikologjike</SelectItem>
                <SelectItem value="other">Tjetër</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Therapies List */}
          <div className="grid gap-4">
            {filteredTherapies.map((therapy) => (
              <Card key={therapy.id} className={`bg-gray-800 border-gray-700 ${!therapy.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${therapyTypeColors[therapy.therapy_type]}`}>
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{therapy.name}</h3>
                        <p className="text-gray-400 text-sm">{therapy.resident_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={therapyTypeColors[therapy.therapy_type]}>
                            {therapyTypeLabels[therapy.therapy_type]}
                          </Badge>
                          <Badge className={therapy.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {therapy.is_active ? 'Aktive' : 'Joaktive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-sm text-gray-400 space-y-1">
                        {therapy.dosage && <p>Doza: <span className="text-white">{therapy.dosage}</span></p>}
                        {therapy.frequency && <p>Frekuenca: <span className="text-white">{therapy.frequency}</span></p>}
                        {therapy.administration_time?.length > 0 && (
                          <p>Orari: <span className="text-[#00a79d]">{therapy.administration_time.join(', ')}</span></p>
                        )}
                      </div>
                      
                      {!isVisitor && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className={therapy.is_active ? 'border-orange-600 text-orange-400' : 'border-green-600 text-green-400'}
                            onClick={() => handleToggleActive(therapy)}
                          >
                            {therapy.is_active ? <XCircle className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                            {therapy.is_active ? 'Çaktivizo' : 'Aktivizo'}
                          </Button>
                          {isAdmin && (
                            <Button size="sm" variant="outline" className="border-gray-600" onClick={() => openEditDialog(therapy)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional details */}
                  <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fillimi: {therapy.start_date}
                    </span>
                    {therapy.end_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Mbarimi: {therapy.end_date}
                      </span>
                    )}
                    {therapy.prescribed_by && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {therapy.prescribed_by}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredTherapies.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Pill className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">Nuk u gjetën terapi</p>
                  {isAdmin && (
                    <Button onClick={() => { resetForm(); setShowDialog(true); }} className="mt-4 bg-[#00a79d] hover:bg-[#008f86]">
                      <Plus className="w-4 h-4 mr-2" />Shto Terapinë e Parë
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="bg-gray-800 border-gray-700 mb-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Label className="text-gray-300">Data:</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-[180px] bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {Object.keys(dailySchedule).length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="py-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">Nuk ka terapi të planifikuara për këtë ditë</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(dailySchedule).map(([time, items]) => (
                <Card key={time} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#00a79d] flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {time}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid gap-2">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                              <Pill className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{item.therapy_name}</p>
                              <p className="text-gray-400 text-sm">{item.resident_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.dosage && <p className="text-[#00a79d] text-sm">{item.dosage}</p>}
                            {item.room_number && <p className="text-gray-500 text-xs">Dhoma {item.room_number}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingTherapy ? 'Edito Terapinë' : 'Shto Terapi të Re'}</DialogTitle>
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
                <Label className="text-gray-300">Lloji *</Label>
                <Select value={formData.therapy_type} onValueChange={(v) => setFormData({...formData, therapy_type: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="medication">Medikament</SelectItem>
                    <SelectItem value="physical">Fizike</SelectItem>
                    <SelectItem value="supportive">Mbështetëse</SelectItem>
                    <SelectItem value="psychological">Psikologjike</SelectItem>
                    <SelectItem value="other">Tjetër</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Emri/Medikamenti *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required placeholder="p.sh. Paracetamol" />
              </div>
              <div>
                <Label className="text-gray-300">Doza</Label>
                <Input value={formData.dosage} onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="p.sh. 500mg" />
              </div>
              <div>
                <Label className="text-gray-300">Frekuenca</Label>
                <Input value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="p.sh. 3 herë në ditë" />
              </div>
              <div>
                <Label className="text-gray-300">Data e Fillimit *</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label className="text-gray-300">Data e Mbarimit</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Oraret e Administrimit</Label>
                <div className="space-y-2">
                  {timeInputs.map((time, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input type="time" value={time} onChange={(e) => updateTimeInput(idx, e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white w-[140px]" />
                      {timeInputs.length > 1 && (
                        <Button type="button" size="sm" variant="ghost" className="text-red-400" onClick={() => removeTimeInput(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="outline" className="border-gray-600" onClick={addTimeInput}>
                    <Plus className="w-4 h-4 mr-1" />Shto Orar
                  </Button>
                </div>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Përshkruar nga</Label>
                <Input value={formData.prescribed_by} onChange={(e) => setFormData({...formData, prescribed_by: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="Dr. ..." />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Shënime</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" rows={2} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" className="border-gray-600" onClick={() => setShowDialog(false)}>Anulo</Button>
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">{editingTherapy ? 'Ruaj' : 'Shto'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HPTherapies;
