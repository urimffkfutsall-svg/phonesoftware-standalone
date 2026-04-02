import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Wrench,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  User,
  Phone,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  UserCheck,
  Calendar,
  FileText,
  ChevronRight,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import PSRepairReceipt from './PSRepairReceipt';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSRepairs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [useManualCustomer, setUseManualCustomer] = useState(false);
  
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [receiptRepair, setReceiptRepair] = useState(null);

  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    device_type: 'phone',
    brand: '',
    model: '',
    imei: '',
    serial_number: '',
    color: '',
    problem_description: '',
    customer_notes: '',
    estimated_cost: '',
    warranty_months: 1,
    accessories_received: []
  });

  const [updateData, setUpdateData] = useState({
    status: '',
    technician_id: '',
    diagnosis: '',
    repair_notes: '',
    labor_cost: 0
  });

  useEffect(() => {
    loadRepairs();
    loadCustomers();
    loadTechnicians();
    loadSpareParts();
    
    if (searchParams.get('action') === 'new') {
      setShowDialog(true);
    }
  }, [searchParams]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadRepairs = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/repairs`, {
        headers: getAuthHeaders()
      });
      setRepairs(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të riparimeve');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/customers`, {
        headers: getAuthHeaders()
      });
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/staff/technicians`, {
        headers: getAuthHeaders()
      });
      setTechnicians(response.data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const loadSpareParts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/inventory/spare-parts/available`, {
        headers: getAuthHeaders()
      });
      setSpareParts(response.data);
    } catch (error) {
      console.error('Error loading spare parts:', error);
    }
  };

  const handleCreateRepair = async () => {
    if (!formData.problem_description) {
      toast.error('Plotësoni përshkrimin e problemit');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        problem_description: formData.problem_description,
        device_type: formData.device_type || 'phone',
        brand: formData.brand || null,
        model: formData.model || null,
        imei: formData.imei || null,
        serial_number: formData.serial_number || null,
        color: formData.color || null,
        customer_notes: formData.customer_notes || null,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
        warranty_months: formData.warranty_months || 1,
        accessories_received: formData.accessories_received || []
      };

      // Add customer info
      if (useManualCustomer) {
        payload.customer_name = formData.customer_name || null;
        payload.customer_phone = formData.customer_phone || null;
      } else if (formData.customer_id) {
        payload.customer_id = formData.customer_id;
        payload.customer_name = formData.customer_name || null;
        payload.customer_phone = formData.customer_phone || null;
        }

      const response = await axios.post(`${API_URL}/api/phonesoftware/repairs`, payload, { headers: getAuthHeaders() });
      
      // Store the created repair for receipt
      const createdRepair = response.data;
      
      toast.success('Riparimi u krijua me sukses!');
      setShowDialog(false);
      setUseManualCustomer(false);
      setFormData({
        customer_id: '',
        customer_name: '',
        customer_phone: '',
        device_type: 'phone',
        brand: '',
        model: '',
        imei: '',
        serial_number: '',
        color: '',
        problem_description: '',
        customer_notes: '',
        estimated_cost: '',
        warranty_months: 1,
        accessories_received: []
      });
      loadRepairs();
      
      // Show receipt dialog
      setReceiptRepair(createdRepair);
      setShowReceiptDialog(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë krijimit');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRepair = async () => {
    if (!selectedRepair) return;

    setLoading(true);
    try {
      await axios.put(`${API_URL}/api/phonesoftware/repairs/${selectedRepair.id}`, updateData, {
        headers: getAuthHeaders()
      });
      
      toast.success('Riparimi u përditësua!');
      setShowDetailDialog(false);
      loadRepairs();
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRepair = async (repairId) => {
    if (!window.confirm('Jeni i sigurt që doni të fshini këtë riparim?')) return;

    try {
      await axios.delete(`${API_URL}/api/phonesoftware/repairs/${repairId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Riparimi u fshi');
      loadRepairs();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const openDetailDialog = (repair) => {
    setSelectedRepair(repair);
    setUpdateData({
      status: repair.status,
      technician_id: repair.technician_id || '',
      diagnosis: repair.diagnosis || '',
      repair_notes: repair.repair_notes || '',
      labor_cost: repair.labor_cost || 0
    });
    setShowDetailDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cannot_repair': return 'bg-red-100 text-red-700 border-red-200';
      case 'delivered': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'received': 'Pranuar në servis',
      'in_progress': 'Në proces',
      'completed': 'I rregulluar',
      'cannot_repair': 'Nuk rregullohet',
      'delivered': 'Dorëzuar'
    };
    return labels[status] || status;
  };

  const getDeviceIcon = (type) => {
    return <Smartphone className="h-5 w-5 text-[#00a79d]" />;
  };

  const filteredRepairs = repairs.filter(repair => {
    const matchesSearch = 
      repair.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.imei?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const repairStats = {
    total: repairs.length,
    pending: repairs.filter(r => ['received', 'in_progress'].includes(r.status)).length,
    completed: repairs.filter(r => r.status === 'completed').length,
    delivered: repairs.filter(r => r.status === 'delivered').length
  };

  return (
    <div className="space-y-6" data-testid="ps-repairs">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00a79d] to-[#008f86] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Menaxhimi i Riparimeve</h1>
            <p className="text-white/80 mt-1">Krijoni dhe menaxhoni riparimet e pajisjeve</p>
          </div>
          <Button 
            className="bg-white text-[#00a79d] hover:bg-gray-100 font-semibold shadow-lg"
            onClick={() => setShowDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Registro punën
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{repairStats.total}</p>
            <p className="text-sm text-white/70">Total</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{repairStats.pending}</p>
            <p className="text-sm text-white/70">Në Pritje</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{repairStats.completed}</p>
            <p className="text-sm text-white/70">Gati</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
            <p className="text-3xl font-bold">{repairStats.delivered}</p>
            <p className="text-sm text-white/70">Dorëzuar</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kërko sipas numrit, markës, modelit, IMEI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statusi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha</SelectItem>
                <SelectItem value="received">Pranuar në servis</SelectItem>
                <SelectItem value="in_progress">Në proces</SelectItem>
                <SelectItem value="completed">I rregulluar</SelectItem>
                <SelectItem value="cannot_repair">Nuk rregullohet</SelectItem>
                <SelectItem value="delivered">Dorëzuar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Repairs List */}
      <Card className="border-0 shadow-sm bg-gray-50/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-700">
              Lista e Punëve
            </CardTitle>
            <span className="text-sm text-gray-500">
              {filteredRepairs.length} {filteredRepairs.length === 1 ? 'punë' : 'punë'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : filteredRepairs.length === 0 ? (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Nuk u gjetën riparime me këto kritere'
                  : 'Ende nuk ka riparime'}
              </p>
              <Button onClick={() => setShowDialog(true)} className="bg-[#00a79d] hover:bg-[#008f86]">
                <Plus className="h-4 w-4 mr-2" />
                Krijo Riparimin e Parë
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRepairs.map((repair) => (
                <div 
                  key={repair.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => openDetailDialog(repair)}
                  data-testid={`repair-card-${repair.ticket_number}`}
                >
                  {/* Status Indicator */}
                  <div className={`w-1 h-12 rounded-full flex-shrink-0 ${
                    repair.status === 'completed' ? 'bg-green-500' :
                    repair.status === 'in_progress' ? 'bg-yellow-500' :
                    repair.status === 'cannot_repair' ? 'bg-red-500' :
                    repair.status === 'delivered' ? 'bg-gray-400' :
                    'bg-blue-500'
                  }`} />
                  
                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-gray-900 font-mono text-sm">{repair.ticket_number}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${getStatusColor(repair.status)}`}>
                        {getStatusLabel(repair.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-800">{repair.brand || '-'} {repair.model || ''}</span>
                      {repair.color && (
                        <span className="text-gray-400">• {repair.color}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="truncate max-w-[150px]">
                        <User className="h-3 w-3 inline mr-0.5" />
                        {repair.customer_name || 'Pa klient'}
                      </span>
                      <span>
                        <Calendar className="h-3 w-3 inline mr-0.5" />
                        {new Date(repair.created_at).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Right Side */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {repair.estimated_cost > 0 && repair.total_cost === 0 && (
                      <span className="text-xs text-gray-500">~{repair.estimated_cost.toFixed(0)}€</span>
                    )}
                    {repair.total_cost > 0 && (
                      <span className="font-bold text-gray-900 text-sm">{repair.total_cost.toFixed(2)}€</span>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#00a79d] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Repair Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">Registro punën</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Klienti Section */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b border-[#00a79d]/30 pb-1">Klienti</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Klienti *</Label>
                  <Input value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} placeholder="Emri i klientit" />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Numri tel *</Label>
                  <Input value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} placeholder="Numri kontaktues" />
                </div>
              </div>
              <button type="button" onClick={() => {
                const found = customers.find(cu => cu.phone?.includes(formData.customer_phone) || cu.full_name?.toLowerCase().includes(formData.customer_name?.toLowerCase()));
                if (found) { setFormData({...formData, customer_id: found.id, customer_name: found.full_name, customer_phone: found.phone}); toast.success("Klienti u gjet!"); }
                else { toast.info("Klienti i ri do të krijohet automatikisht."); }
              }} className="bg-[#00a79d] hover:bg-[#008f86] text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors">
                Zgjedh/shto klientin
              </button>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-[#00a79d] uppercase tracking-wide border-b border-[#00a79d]/30 pb-1">Puna ne</h3>
            </div>

            
            {/* Device Info - All Optional */}
            <div>
              <Label>Lloji i Pajisjes</Label>
              <Select 
                value={formData.device_type} 
                onValueChange={(value) => setFormData({...formData, device_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Telefon</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="smartwatch">Smartwatch</SelectItem>
                  <SelectItem value="other">Tjetër</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Marka</Label>
              <Input
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder="p.sh. Apple, Samsung"
              />
            </div>

            <div>
              <Label>Modeli</Label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="p.sh. iPhone 14 Pro"
              />
            </div>

            <div>
              <Label>IMEI</Label>
              <Input
                value={formData.imei}
                onChange={(e) => setFormData({...formData, imei: e.target.value})}
                placeholder="15 shifra"
              />
            </div>

            <div>
              <Label>Numri Serial</Label>
              <Input
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>

            <div>
              <Label>Ngjyra</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({...formData, color: e.target.value})}
                placeholder="p.sh. E zezë"
              />
            </div>

            <div className="md:col-span-2">
              <Label>Përshkrimi i Problemit *</Label>
              <Textarea
                value={formData.problem_description}
                onChange={(e) => setFormData({...formData, problem_description: e.target.value})}
                placeholder="Përshkruani problemin e pajisjes"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <Label>Shënimet e Klientit</Label>
              <Textarea
                value={formData.customer_notes}
                onChange={(e) => setFormData({...formData, customer_notes: e.target.value})}
                placeholder="Shënime shtesë nga klienti"
                rows={2}
              />
            </div>

            <div>
              <Label>Kosto e Vlerësuar (€)</Label>
              <Input
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Garancia (muaj)</Label>
              <Select 
                value={formData.warranty_months.toString()} 
                onValueChange={(value) => setFormData({...formData, warranty_months: parseInt(value)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pa garanci</SelectItem>
                  <SelectItem value="1">1 muaj</SelectItem>
                  <SelectItem value="3">3 muaj</SelectItem>
                  <SelectItem value="6">6 muaj</SelectItem>
                  <SelectItem value="12">12 muaj</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleCreateRepair}
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading}
            >
              {loading ? 'Duke krijuar...' : 'Krijo Riparimin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Repair Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              <FileText className="h-5 w-5 text-[#00a79d]" />
              {selectedRepair?.ticket_number}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRepair && (
            <div className="space-y-6">
              {/* Device & Customer Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Pajisja</p>
                  <p className="font-medium">{selectedRepair.brand} {selectedRepair.model}</p>
                  {selectedRepair.imei && <p className="text-xs text-gray-500">IMEI: {selectedRepair.imei}</p>}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Klienti</p>
                  <p className="font-medium">{selectedRepair.customer_name || '-'}</p>
                  <p className="text-xs text-gray-500">{selectedRepair.customer_phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Problemi</p>
                  <p className="text-sm">{selectedRepair.problem_description}</p>
                </div>
              </div>

              {/* Update Form */}
              <div className="space-y-4">
                <div>
                  <Label>Statusi</Label>
                  <Select 
                    value={updateData.status} 
                    onValueChange={(value) => setUpdateData({...updateData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Pranuar në servis</SelectItem>
                      <SelectItem value="in_progress">Në proces</SelectItem>
                      <SelectItem value="completed">I rregulluar</SelectItem>
                      <SelectItem value="cannot_repair">Nuk rregullohet</SelectItem>
                      <SelectItem value="delivered">Dorëzuar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tekniku</Label>
                  <Select 
                    value={updateData.technician_id} 
                    onValueChange={(value) => setUpdateData({...updateData, technician_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Zgjidhni teknikun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Pa teknik</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.full_name} {tech.specialization && `(${tech.specialization})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Diagnoza</Label>
                  <Textarea
                    value={updateData.diagnosis}
                    onChange={(e) => setUpdateData({...updateData, diagnosis: e.target.value})}
                    placeholder="Rezultati i diagnozës"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Shënimet e Riparimit</Label>
                  <Textarea
                    value={updateData.repair_notes}
                    onChange={(e) => setUpdateData({...updateData, repair_notes: e.target.value})}
                    placeholder="Çfarë u bë gjatë riparimit"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Kosto e Punës (€)</Label>
                  <Input
                    type="number"
                    value={updateData.labor_cost}
                    onChange={(e) => setUpdateData({...updateData, labor_cost: parseFloat(e.target.value) || 0})}
                  />
                </div>

                {/* Cost Summary */}
                <div className="p-4 bg-[#00a79d]/5 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Kosto e Pjesëve:</span>
                    <span>{selectedRepair.parts_cost?.toFixed(2) || '0.00'}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kosto e Punës:</span>
                    <span>{updateData.labor_cost?.toFixed(2) || '0.00'}€</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                    <span>TOTALI:</span>
                    <span>{((selectedRepair.parts_cost || 0) + (updateData.labor_cost || 0)).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              className="text-red-500 hover:bg-red-50"
              onClick={() => {
                setShowDetailDialog(false);
                handleDeleteRepair(selectedRepair?.id);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Fshi
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setReceiptRepair(selectedRepair);
                setShowReceiptDialog(true);
              }}
            >
              <Printer className="h-4 w-4 mr-2" />
              Printo Kupon
            </Button>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleUpdateRepair}
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading}
            >
              {loading ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      {showReceiptDialog && receiptRepair && (
        <PSRepairReceipt 
          repair={receiptRepair} 
          onClose={() => {
            setShowReceiptDialog(false);
            setReceiptRepair(null);
          }} 
        />
      )}
    </div>
  );
};

export default PSRepairs;
