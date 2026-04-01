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
  Stethoscope,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Building,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';

const HPCheckups = () => {
  const { user } = useHPAuth();
  const [checkups, setCheckups] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState(null);
  const [formData, setFormData] = useState({
    resident_id: '',
    checkup_type: 'general',
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '',
    institution: '',
    doctor_name: '',
    notes: '',
    results: '',
    recommendations: '',
    is_systematic: false
  });

  // Results dialog
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedCheckup, setSelectedCheckup] = useState(null);
  const [resultsForm, setResultsForm] = useState({ results: '', recommendations: '', status: 'completed' });

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isVisitor = user?.role === 'visitor';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [checkupsRes, residentsRes] = await Promise.all([
        hpApi.get('/healthpro/checkups'),
        hpApi.get('/healthpro/residents')
      ]);
      setCheckups(checkupsRes);
      setResidents(residentsRes);
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
      if (editingCheckup) {
        await hpApi.put(`/healthpro/checkups/${editingCheckup.id}`, formData);
        toast.success('Kontrolla u përditësua');
      } else {
        await hpApi.post('/healthpro/checkups', formData);
        toast.success('Kontrolla u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni të fshini këtë kontroll?')) return;
    try {
      await hpApi.delete(`/healthpro/checkups/${id}`);
      toast.success('Kontrolla u fshi');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleGenerateSystematic = async () => {
    if (!window.confirm('Kjo do të gjenerojë kontrolla sistematike për të gjithë rezidentët aktivë. Vazhdoni?')) return;
    try {
      const result = await hpApi.post('/healthpro/checkups/generate-systematic');
      toast.success(result.message);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const openResultsDialog = (checkup) => {
    setSelectedCheckup(checkup);
    setResultsForm({
      results: checkup.results || '',
      recommendations: checkup.recommendations || '',
      status: 'completed'
    });
    setShowResultsDialog(true);
  };

  const handleSaveResults = async () => {
    try {
      await hpApi.put(`/healthpro/checkups/${selectedCheckup.id}`, resultsForm);
      toast.success('Rezultatet u ruajtën');
      setShowResultsDialog(false);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const resetForm = () => {
    setEditingCheckup(null);
    setFormData({
      resident_id: '',
      checkup_type: 'general',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: '',
      institution: '',
      doctor_name: '',
      notes: '',
      results: '',
      recommendations: '',
      is_systematic: false
    });
  };

  const openEditDialog = (checkup) => {
    setEditingCheckup(checkup);
    setFormData({
      resident_id: checkup.resident_id,
      checkup_type: checkup.checkup_type,
      scheduled_date: checkup.scheduled_date,
      scheduled_time: checkup.scheduled_time || '',
      institution: checkup.institution || '',
      doctor_name: checkup.doctor_name || '',
      notes: checkup.notes || '',
      results: checkup.results || '',
      recommendations: checkup.recommendations || '',
      is_systematic: checkup.is_systematic
    });
    setShowDialog(true);
  };

  const filteredCheckups = checkups.filter(c => {
    const matchesSearch = c.resident_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.institution?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesType = typeFilter === 'all' || c.checkup_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const checkupTypeLabels = {
    general: 'QKMF (Përgjithshme)',
    pulmonology: 'Pulmonologji',
    cardiology: 'Kardiologji',
    gynecology: 'Gjinekologji',
    psychiatry: 'Psikiatri',
    other: 'Tjetër'
  };

  const statusLabels = {
    planned: 'Planifikuar',
    completed: 'Përfunduar',
    cancelled: 'Anuluar'
  };

  const statusColors = {
    planned: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    cancelled: 'bg-red-500/20 text-red-400'
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
          <h1 className="text-2xl font-bold text-white">Kontrollat Mjekësore</h1>
          <p className="text-gray-400">Menaxhoni kontrollet e rezidentëve</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleGenerateSystematic} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <RefreshCw className="w-4 h-4 mr-2" />Gjenero Sistematike
            </Button>
            <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-[#00a79d] hover:bg-[#008f86]">
              <Plus className="w-4 h-4 mr-2" />Shto Kontroll
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Kërko sipas rezidentit, institucionit, mjekut..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Statusi" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Të gjitha</SelectItem>
            <SelectItem value="planned">Planifikuar</SelectItem>
            <SelectItem value="completed">Përfunduar</SelectItem>
            <SelectItem value="cancelled">Anuluar</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
            <Stethoscope className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lloji" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">Të gjitha llojet</SelectItem>
            <SelectItem value="general">QKMF</SelectItem>
            <SelectItem value="pulmonology">Pulmonologji</SelectItem>
            <SelectItem value="cardiology">Kardiologji</SelectItem>
            <SelectItem value="gynecology">Gjinekologji</SelectItem>
            <SelectItem value="psychiatry">Psikiatri</SelectItem>
            <SelectItem value="other">Tjetër</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Checkups List */}
      <div className="grid gap-4">
        {filteredCheckups.map((checkup) => (
          <Card key={checkup.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    checkup.status === 'completed' ? 'bg-green-500/20' : 
                    checkup.status === 'cancelled' ? 'bg-red-500/20' : 'bg-blue-500/20'
                  }`}>
                    <Stethoscope className={`w-6 h-6 ${
                      checkup.status === 'completed' ? 'text-green-400' : 
                      checkup.status === 'cancelled' ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{checkup.resident_name}</h3>
                    <p className="text-[#00a79d] text-sm">{checkupTypeLabels[checkup.checkup_type]}</p>
                    <div className="flex items-center gap-3 mt-1 text-gray-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{checkup.scheduled_date}
                      </span>
                      {checkup.scheduled_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{checkup.scheduled_time}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={statusColors[checkup.status]}>
                        {statusLabels[checkup.status]}
                      </Badge>
                      {checkup.is_systematic && (
                        <Badge className="bg-purple-500/20 text-purple-400">Sistematike</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="text-sm text-gray-400">
                    {checkup.institution && (
                      <p className="flex items-center gap-1"><Building className="w-3 h-3" />{checkup.institution}</p>
                    )}
                    {checkup.doctor_name && (
                      <p className="flex items-center gap-1"><User className="w-3 h-3" />{checkup.doctor_name}</p>
                    )}
                  </div>
                  
                  {!isVisitor && (
                    <div className="flex gap-2">
                      {checkup.status === 'planned' && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openResultsDialog(checkup)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />Rezultatet
                        </Button>
                      )}
                      {isAdmin && (
                        <>
                          <Button size="sm" variant="outline" className="border-gray-600" onClick={() => openEditDialog(checkup)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20" onClick={() => handleDelete(checkup.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Show results if completed */}
              {checkup.status === 'completed' && (checkup.results || checkup.recommendations) && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {checkup.results && (
                    <div className="mb-2">
                      <p className="text-gray-400 text-xs uppercase">Rezultatet:</p>
                      <p className="text-white text-sm">{checkup.results}</p>
                    </div>
                  )}
                  {checkup.recommendations && (
                    <div>
                      <p className="text-gray-400 text-xs uppercase">Rekomandimet:</p>
                      <p className="text-white text-sm">{checkup.recommendations}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredCheckups.length === 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center">
              <Stethoscope className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">Nuk u gjetën kontrolla</p>
              {isAdmin && (
                <Button onClick={() => { resetForm(); setShowDialog(true); }} className="mt-4 bg-[#00a79d] hover:bg-[#008f86]">
                  <Plus className="w-4 h-4 mr-2" />Shto Kontrollën e Parë
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
            <DialogTitle className="text-white">{editingCheckup ? 'Edito Kontrollën' : 'Shto Kontroll të Re'}</DialogTitle>
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
                <Label className="text-gray-300">Lloji i Kontrollit *</Label>
                <Select value={formData.checkup_type} onValueChange={(v) => setFormData({...formData, checkup_type: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="general">QKMF (Përgjithshme)</SelectItem>
                    <SelectItem value="pulmonology">Pulmonologji</SelectItem>
                    <SelectItem value="cardiology">Kardiologji</SelectItem>
                    <SelectItem value="gynecology">Gjinekologji</SelectItem>
                    <SelectItem value="psychiatry">Psikiatri</SelectItem>
                    <SelectItem value="other">Tjetër</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Data *</Label>
                <Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label className="text-gray-300">Ora</Label>
                <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Institucioni</Label>
                <Input value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="p.sh. QKUK, Spitali Regjional" />
              </div>
              <div className="col-span-2">
                <Label className="text-gray-300">Emri i Mjekut</Label>
                <Input value={formData.doctor_name} onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
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
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">{editingCheckup ? 'Ruaj' : 'Shto'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Regjistro Rezultatet</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedCheckup?.resident_name} - {checkupTypeLabels[selectedCheckup?.checkup_type]}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Rezultatet</Label>
              <Textarea value={resultsForm.results} onChange={(e) => setResultsForm({...resultsForm, results: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" rows={3} placeholder="Shkruani rezultatet e kontrollit..." />
            </div>
            <div>
              <Label className="text-gray-300">Rekomandimet</Label>
              <Textarea value={resultsForm.recommendations} onChange={(e) => setResultsForm({...resultsForm, recommendations: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" rows={3} placeholder="Shkruani rekomandimet..." />
            </div>
            <div>
              <Label className="text-gray-300">Statusi</Label>
              <Select value={resultsForm.status} onValueChange={(v) => setResultsForm({...resultsForm, status: v})}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="completed">Përfunduar</SelectItem>
                  <SelectItem value="cancelled">Anuluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" className="border-gray-600" onClick={() => setShowResultsDialog(false)}>Anulo</Button>
            <Button onClick={handleSaveResults} className="bg-[#00a79d] hover:bg-[#008f86]">Ruaj Rezultatet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HPCheckups;
