import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../App';
import { 
  Users, Search, Plus, Phone, Mail, MapPin, 
  Edit2, Trash2, X, Save, History, ShoppingBag, Wrench
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const MobilshopCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    id_number: '',
    notes: ''
  });

  const fetchCustomers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      
      const res = await api.get(`/mobilshop/customers?${params}`);
      setCustomers(res.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të klientëve');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/mobilshop/customers/${editingCustomer.id}`, formData);
        toast.success('Klienti u përditësua!');
      } else {
        await api.post('/mobilshop/customers', formData);
        toast.success('Klienti u shtua!');
      }
      setShowModal(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni ta fshini këtë klient?')) return;
    try {
      await api.delete(`/mobilshop/customers/${id}`);
      toast.success('Klienti u fshi!');
      fetchCustomers();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const openHistory = async (customer) => {
    try {
      const res = await api.get(`/mobilshop/customers/${customer.id}/history`);
      setCustomerHistory(res.data);
      setShowHistoryModal(true);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të historisë');
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      id_number: '',
      notes: ''
    });
    setEditingCustomer(null);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      full_name: customer.full_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      id_number: customer.id_number || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-[#00a79d]" />
            Klientët
          </h1>
          <p className="text-gray-400 text-sm">Menaxho bazën e klientëve</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-[#00a79d] hover:bg-[#008f86]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Shto Klient
        </Button>
      </div>

      {/* Search */}
      <div className="bg-[#0f1f35] rounded-xl p-4 mb-6 border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Kërko sipas emrit, telefonit, email-it..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#0a1628] border-white/10 text-white"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Duke ngarkuar...
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Asnjë klient nuk u gjet
          </div>
        ) : (
          customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-[#0f1f35] rounded-xl p-5 border border-white/10 hover:border-[#00a79d]/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{customer.full_name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                    <Phone className="w-4 h-4" />
                    {customer.phone}
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#00a79d]/10 px-2 py-1 rounded-lg">
                  <span className="text-[#00a79d] text-sm font-medium">{customer.loyalty_points || 0}</span>
                  <span className="text-gray-400 text-xs">pikë</span>
                </div>
              </div>

              {customer.email && (
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Mail className="w-4 h-4" />
                  {customer.email}
                </div>
              )}
              {customer.city && (
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  {customer.city}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-white/10">
                <div className="bg-[#0a1628] rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-green-400">€{customer.total_purchases?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-gray-400">Blerje</p>
                </div>
                <div className="bg-[#0a1628] rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-orange-400">{customer.total_repairs || 0}</p>
                  <p className="text-xs text-gray-400">Riparime</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => openHistory(customer)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Historia"
                >
                  <History className="w-4 h-4 text-purple-400" />
                </button>
                <button
                  onClick={() => openEditModal(customer)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Ndrysho"
                >
                  <Edit2 className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Fshi"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingCustomer ? 'Ndrysho Klientin' : 'Shto Klient të Ri'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Emri i Plotë *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Emri dhe mbiemri"
                  className="bg-[#0a1628] border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Telefoni *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+383 44 123 456"
                  className="bg-[#0a1628] border-white/10 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-[#0a1628] border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Qyteti</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="p.sh. Prishtinë"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nr. Personal</label>
                  <Input
                    value={formData.id_number}
                    onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                    placeholder="1234567890"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Adresa</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresa e plotë"
                  className="bg-[#0a1628] border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Shënime</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Shënime shtesë..."
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white h-20 resize-none"
                />
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
                  {editingCustomer ? 'Ruaj' : 'Shto'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && customerHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0f1f35]">
              <div>
                <h2 className="text-xl font-semibold">{customerHistory.customer?.full_name}</h2>
                <p className="text-gray-400 text-sm">Historia e klientit</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a1628] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Total Blerje</span>
                  </div>
                  <p className="text-2xl font-bold">€{customerHistory.total_spent?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="bg-[#0a1628] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    <span className="text-gray-400">Total Riparime</span>
                  </div>
                  <p className="text-2xl font-bold">{customerHistory.total_repairs || 0}</p>
                </div>
              </div>

              {/* Purchases */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-green-400" />
                  Blerjet e Fundit
                </h3>
                {customerHistory.purchases?.length > 0 ? (
                  <div className="space-y-2">
                    {customerHistory.purchases.slice(0, 5).map((p) => (
                      <div key={p.id} className="bg-[#0a1628] rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{p.invoice_number}</p>
                          <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('sq-AL')}</p>
                        </div>
                        <p className="font-bold text-green-400">€{p.grand_total?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Asnjë blerje</p>
                )}
              </div>

              {/* Repairs */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  Riparimet e Fundit
                </h3>
                {customerHistory.repairs?.length > 0 ? (
                  <div className="space-y-2">
                    {customerHistory.repairs.slice(0, 5).map((r) => (
                      <div key={r.id} className="bg-[#0a1628] rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{r.device_brand} {r.device_model}</p>
                          <p className="text-xs text-gray-400">{r.ticket_number}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          r.status === 'completed' || r.status === 'delivered' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Asnjë riparim</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopCustomers;
