import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../App';
import { 
  Wrench, Search, Plus, Clock, CheckCircle, AlertTriangle,
  Phone, Smartphone, User, Edit2, X, Save, DollarSign, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const statusConfig = {
  received: { label: 'Pranuar', color: 'bg-gray-500', textColor: 'text-gray-400' },
  diagnosing: { label: 'Në Diagnozë', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  waiting_parts: { label: 'Pritje Pjesësh', color: 'bg-orange-500', textColor: 'text-orange-400' },
  repairing: { label: 'Në Riparim', color: 'bg-blue-500', textColor: 'text-blue-400' },
  completed: { label: 'Përfunduar', color: 'bg-green-500', textColor: 'text-green-400' },
  delivered: { label: 'Dorëzuar', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  cancelled: { label: 'Anuluar', color: 'bg-red-500', textColor: 'text-red-400' }
};

const MobilshopRepairs = () => {
  const [searchParams] = useSearchParams();
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: '',
    device_brand: '',
    device_model: '',
    device_imei: '',
    device_color: '',
    device_password: '',
    issue_description: '',
    accessories_received: '',
    estimated_cost: '',
    technician_id: '',
    priority: 'normal',
    notes: ''
  });

  const fetchRepairs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await api.get(`/mobilshop/repairs?${params}`);
      setRepairs(res.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users');
      setTechnicians(res.data.filter(u => u.role === 'technician' || u.role === 'admin'));
    } catch (error) {
      console.error('Error fetching technicians');
    }
  };

  useEffect(() => {
    fetchRepairs();
    fetchTechnicians();
  }, [fetchRepairs]);

  const searchCustomers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await api.get(`/mobilshop/customers/search/${query}`);
      setSearchResults(res.data);
    } catch (error) {
      console.error('Error searching customers');
    }
  };

  const selectCustomer = (customer) => {
    setFormData({ ...formData, customer_id: customer.id });
    setCustomerSearch(customer.full_name + ' - ' + customer.phone);
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        estimated_cost: parseFloat(formData.estimated_cost) || 0
      };

      await api.post('/mobilshop/repairs', data);
      toast.success('Riparimi u regjistrua!');
      setShowModal(false);
      resetForm();
      fetchRepairs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const updateStatus = async (repairId, newStatus) => {
    try {
      await api.patch(`/mobilshop/repairs/${repairId}/status`, { status: newStatus });
      toast.success('Statusi u përditësua!');
      fetchRepairs();
      if (selectedRepair && selectedRepair.id === repairId) {
        const res = await api.get(`/mobilshop/repairs/${repairId}`);
        setSelectedRepair(res.data);
      }
    } catch (error) {
      toast.error('Gabim gjatë përditësimit');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      device_brand: '',
      device_model: '',
      device_imei: '',
      device_color: '',
      device_password: '',
      issue_description: '',
      accessories_received: '',
      estimated_cost: '',
      technician_id: '',
      priority: 'normal',
      notes: ''
    });
    setCustomerSearch('');
  };

  const openDetail = async (repair) => {
    try {
      const res = await api.get(`/mobilshop/repairs/${repair.id}`);
      setSelectedRepair(res.data);
      setShowDetailModal(true);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit');
    }
  };

  const getNextStatus = (currentStatus) => {
    const flow = ['received', 'diagnosing', 'waiting_parts', 'repairing', 'completed', 'delivered'];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-7 h-7 text-[#00a79d]" />
            Riparimet
          </h1>
          <p className="text-gray-400 text-sm">Menaxho tiketat e riparimeve</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-[#00a79d] hover:bg-[#008f86]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Riparim i Ri
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1f35] rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Kërko sipas tiketës, IMEI, klientit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0a1628] border-white/10 text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
          >
            <option value="">Të gjitha statuset</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            statusFilter === '' ? 'bg-[#00a79d] text-white' : 'bg-[#0f1f35] text-gray-400 hover:bg-white/10'
          }`}
        >
          Të Gjitha
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              statusFilter === key ? 'bg-[#00a79d] text-white' : 'bg-[#0f1f35] text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Repairs List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Duke ngarkuar...</div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Asnjë riparim nuk u gjet</div>
        ) : (
          repairs.map((repair) => (
            <div
              key={repair.id}
              className="bg-[#0f1f35] rounded-xl p-4 border border-white/10 hover:border-[#00a79d]/30 transition-colors cursor-pointer"
              onClick={() => openDetail(repair)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${statusConfig[repair.status]?.color}/20`}>
                    <Smartphone className={`w-6 h-6 ${statusConfig[repair.status]?.textColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#00a79d]">{repair.ticket_number}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${statusConfig[repair.status]?.color}/20 ${statusConfig[repair.status]?.textColor}`}>
                        {statusConfig[repair.status]?.label}
                      </span>
                      {repair.priority === 'urgent' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                          Urgjent
                        </span>
                      )}
                    </div>
                    <p className="font-medium mt-1">{repair.device_brand} {repair.device_model}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {repair.customer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {repair.customer_phone}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Kosto e Vlerësuar</p>
                    <p className="font-bold text-lg">€{repair.estimated_cost?.toFixed(2)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Repair Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1f35]">
              <h2 className="text-xl font-semibold">Regjistro Riparim të Ri</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Customer Search */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-1">Klienti *</label>
                <Input
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    searchCustomers(e.target.value);
                  }}
                  placeholder="Kërko klientin sipas emrit ose telefonit..."
                  className="bg-[#0a1628] border-white/10 text-white"
                  required={!formData.customer_id}
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#0a1628] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full px-4 py-2 text-left hover:bg-white/10 flex items-center justify-between"
                      >
                        <span>{customer.full_name}</span>
                        <span className="text-gray-400 text-sm">{customer.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Marka e Pajisjes *</label>
                  <Input
                    value={formData.device_brand}
                    onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })}
                    placeholder="p.sh. Apple, Samsung"
                    className="bg-[#0a1628] border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Modeli *</label>
                  <Input
                    value={formData.device_model}
                    onChange={(e) => setFormData({ ...formData, device_model: e.target.value })}
                    placeholder="p.sh. iPhone 15 Pro"
                    className="bg-[#0a1628] border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">IMEI</label>
                  <Input
                    value={formData.device_imei}
                    onChange={(e) => setFormData({ ...formData, device_imei: e.target.value })}
                    placeholder="Numri IMEI"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ngjyra</label>
                  <Input
                    value={formData.device_color}
                    onChange={(e) => setFormData({ ...formData, device_color: e.target.value })}
                    placeholder="p.sh. Black"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Kodi i Pajisjes (PIN/Pattern)</label>
                <Input
                  value={formData.device_password}
                  onChange={(e) => setFormData({ ...formData, device_password: e.target.value })}
                  placeholder="Kodi për të hapur telefonin"
                  className="bg-[#0a1628] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Problemi/Defekti *</label>
                <textarea
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  placeholder="Përshkruani problemin e pajisjes..."
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white h-24 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Aksesorë të Pranuar</label>
                <Input
                  value={formData.accessories_received}
                  onChange={(e) => setFormData({ ...formData, accessories_received: e.target.value })}
                  placeholder="p.sh. Karikues, kufje, cover"
                  className="bg-[#0a1628] border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Kosto e Vlerësuar</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimated_cost}
                    onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                    placeholder="0.00"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prioriteti</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
                  >
                    <option value="low">I ulët</option>
                    <option value="normal">Normal</option>
                    <option value="high">I lartë</option>
                    <option value="urgent">Urgjent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tekniku</label>
                  <select
                    value={formData.technician_id}
                    onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Zgjidhni</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Anulo
                </Button>
                <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">
                  <Save className="w-4 h-4 mr-2" />
                  Regjistro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1f35]">
              <div>
                <span className="font-mono text-[#00a79d]">{selectedRepair.ticket_number}</span>
                <h2 className="text-xl font-semibold mt-1">
                  {selectedRepair.device_brand} {selectedRepair.device_model}
                </h2>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="bg-[#0a1628] rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full ${statusConfig[selectedRepair.status]?.color}/20 ${statusConfig[selectedRepair.status]?.textColor}`}>
                    {statusConfig[selectedRepair.status]?.label}
                  </span>
                  {getNextStatus(selectedRepair.status) && (
                    <Button
                      onClick={() => updateStatus(selectedRepair.id, getNextStatus(selectedRepair.status))}
                      className="bg-[#00a79d] hover:bg-[#008f86]"
                      size="sm"
                    >
                      Kalo në: {statusConfig[getNextStatus(selectedRepair.status)]?.label}
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  {Object.keys(statusConfig).slice(0, 6).map((status, index) => (
                    <div
                      key={status}
                      className={`h-2 flex-1 rounded ${
                        Object.keys(statusConfig).indexOf(selectedRepair.status) >= index
                          ? statusConfig[status].color
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Klienti</h3>
                <div className="bg-[#0a1628] rounded-lg p-4">
                  <p className="font-medium">{selectedRepair.customer_name}</p>
                  <p className="text-gray-400">{selectedRepair.customer_phone}</p>
                </div>
              </div>

              {/* Device Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">IMEI</h3>
                  <p className="bg-[#0a1628] rounded-lg p-3 font-mono">
                    {selectedRepair.device_imei || '-'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Ngjyra</h3>
                  <p className="bg-[#0a1628] rounded-lg p-3">
                    {selectedRepair.device_color || '-'}
                  </p>
                </div>
              </div>

              {/* Issue */}
              <div>
                <h3 className="text-sm text-gray-400 mb-2">Problemi</h3>
                <p className="bg-[#0a1628] rounded-lg p-4">{selectedRepair.issue_description}</p>
              </div>

              {/* Costs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#0a1628] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">Kosto Pjesësh</p>
                  <p className="text-xl font-bold">€{selectedRepair.parts_cost?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-[#0a1628] rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">Puna</p>
                  <p className="text-xl font-bold">€{selectedRepair.labor_cost?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-[#00a79d]/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-[#00a79d]">Total</p>
                  <p className="text-xl font-bold text-[#00a79d]">€{selectedRepair.total_cost?.toFixed(2) || '0.00'}</p>
                </div>
              </div>

              {/* Status History */}
              {selectedRepair.status_history && selectedRepair.status_history.length > 0 && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-2">Historia e Statusit</h3>
                  <div className="space-y-2">
                    {selectedRepair.status_history.map((entry, index) => (
                      <div key={index} className="bg-[#0a1628] rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusConfig[entry.status]?.color}`}></span>
                          <span>{statusConfig[entry.status]?.label}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(entry.timestamp).toLocaleString('sq-AL')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopRepairs;
