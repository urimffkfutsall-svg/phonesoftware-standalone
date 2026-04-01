import React, { useState, useEffect } from 'react';
import { bpApi, useBPAuth } from '../../App';
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
import { toast } from 'sonner';
import { 
  Plus, Search, Calendar, Clock, User, Scissors, 
  CheckCircle, XCircle, DollarSign, Filter 
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Të gjitha' },
  { value: 'confirmed', label: 'Konfirmuar' },
  { value: 'in_progress', label: 'Në proces' },
  { value: 'completed', label: 'Përfunduar' },
  { value: 'cancelled', label: 'Anuluar' },
];

const BPAppointments = () => {
  const { user } = useBPAuth();
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showDialog, setShowDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    client_phone: '',
    stylist_id: '',
    services: [],
    appointment_date: new Date().toISOString().split('T')[0],
    start_time: '10:00',
    notes: ''
  });
  const [completeData, setCompleteData] = useState({
    payment_method: 'cash',
    payment_amount: 0,
    tip_amount: 0
  });

  useEffect(() => {
    loadData();
  }, [dateFilter, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, staffRes, servicesRes, clientsRes] = await Promise.all([
        bpApi.get(`/bookpro/appointments?date=${dateFilter}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`),
        bpApi.get('/bookpro/staff'),
        bpApi.get('/bookpro/services'),
        bpApi.get('/bookpro/clients?limit=500')
      ]);
      setAppointments(appointmentsRes.data);
      setStaff(staffRes.data);
      setServices(servicesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async () => {
    if (!formData.stylist_id || formData.services.length === 0) {
      toast.error('Zgjidhni stilistin dhe së paku një shërbim');
      return;
    }

    if (!formData.client_id && !formData.client_name) {
      toast.error('Zgjidhni klientin ose shkruani emrin');
      return;
    }

    try {
      await bpApi.post('/bookpro/appointments', formData);
      toast.success('Rezervimi u krijua');
      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë krijimit');
    }
  };

  const handleComplete = async () => {
    if (!selectedAppointment) return;

    try {
      await bpApi.post(`/bookpro/appointments/${selectedAppointment.id}/complete`, null, {
        params: {
          payment_method: completeData.payment_method,
          payment_amount: completeData.payment_amount || selectedAppointment.total_price,
          tip_amount: completeData.tip_amount
        }
      });
      toast.success('Rezervimi u përfundua');
      setShowCompleteDialog(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim');
    }
  };

  const handleCancel = async (apt) => {
    if (!confirm('Jeni të sigurt që dëshironi të anuloni këtë rezervim?')) return;

    try {
      await bpApi.post(`/bookpro/appointments/${apt.id}/cancel`);
      toast.success('Rezervimi u anulua');
      loadData();
    } catch (error) {
      toast.error('Gabim gjatë anulimit');
    }
  };

  const openCompleteDialog = (apt) => {
    setSelectedAppointment(apt);
    setCompleteData({
      payment_method: 'cash',
      payment_amount: apt.total_price,
      tip_amount: 0
    });
    setShowCompleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      client_name: '',
      client_phone: '',
      stylist_id: '',
      services: [],
      appointment_date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      notes: ''
    });
  };

  const toggleService = (service) => {
    const current = formData.services;
    const exists = current.find(s => s.service_id === service.id);
    
    if (exists) {
      setFormData({
        ...formData,
        services: current.filter(s => s.service_id !== service.id)
      });
    } else {
      setFormData({
        ...formData,
        services: [...current, {
          service_id: service.id,
          service_name: service.name,
          price: service.price,
          duration_minutes: service.duration_minutes
        }]
      });
    }
  };

  const getTotalDuration = () => {
    return formData.services.reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  const getTotalPrice = () => {
    return formData.services.reduce((sum, s) => sum + s.price, 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no_show': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Në pritje';
      case 'confirmed': return 'Konfirmuar';
      case 'in_progress': return 'Në proces';
      case 'completed': return 'Përfunduar';
      case 'cancelled': return 'Anuluar';
      case 'no_show': return 'Nuk erdhi';
      default: return status;
    }
  };

  return (
    <div className="space-y-6" data-testid="bp-appointments-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rezervimet</h1>
          <p className="text-gray-500">Menaxhoni rezervimet e sallonit</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-rose-500 hover:bg-rose-600"
          data-testid="new-appointment-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Rezervim i Ri
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-500" />
            Rezervimet për {new Date(dateFilter).toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nuk ka rezervime për këtë datë</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-center min-w-[70px]">
                      <p className="text-lg font-bold text-rose-500">{apt.start_time}</p>
                      <p className="text-xs text-gray-500">{apt.end_time}</p>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{apt.client_name || 'Klient i panjohur'}</span>
                        {apt.client_phone && (
                          <span className="text-sm text-gray-500">({apt.client_phone})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Scissors className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {apt.services?.map(s => s.service_name).join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Stilist/e: {apt.stylist_name} • {apt.total_duration} min
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-gray-800">€{apt.total_price?.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {apt.status === 'confirmed' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => openCompleteDialog(apt)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancel(apt)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Create Appointment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rezervim i Ri</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Client Selection */}
            <div className="space-y-2">
              <Label>Klienti</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => {
                  if (value === 'new') {
                    setFormData({ ...formData, client_id: '', client_name: '', client_phone: '' });
                  } else {
                    const client = clients.find(c => c.id === value);
                    setFormData({
                      ...formData,
                      client_id: value,
                      client_name: client?.full_name || '',
                      client_phone: client?.phone || ''
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zgjidhni klientin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">+ Klient i ri (walk-in)</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Walk-in Client Info */}
            {!formData.client_id && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Emri i Klientit</Label>
                  <Input
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    placeholder="Emri"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefoni</Label>
                  <Input
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    placeholder="+383..."
                  />
                </div>
              </div>
            )}

            {/* Stylist Selection */}
            <div className="space-y-2">
              <Label>Stilisti *</Label>
              <Select
                value={formData.stylist_id}
                onValueChange={(value) => setFormData({ ...formData, stylist_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Zgjidhni stilistin" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ora *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
            </div>

            {/* Services Selection */}
            <div className="space-y-2">
              <Label>Shërbimet *</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                {services.map((service) => {
                  const isSelected = formData.services.some(s => s.service_id === service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'bg-white hover:border-rose-500'
                      }`}
                    >
                      <p className="font-medium text-sm">{service.name}</p>
                      <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {service.duration_minutes} min • €{service.price}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {formData.services.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kohëzgjatja totale:</span>
                  <span className="font-medium">{getTotalDuration()} minuta</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Çmimi total:</span>
                  <span className="font-bold text-rose-500">€{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Shënime (opsional)</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Shënime shtesë..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleCreateAppointment} className="bg-rose-500 hover:bg-rose-600">
              Krijo Rezervimin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Appointment Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Përfundo Rezervimin</DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedAppointment.client_name}</p>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.services?.map(s => s.service_name).join(', ')}
                </p>
                <p className="text-lg font-bold mt-2">€{selectedAppointment.total_price?.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <Label>Metoda e Pagesës</Label>
                <Select
                  value={completeData.payment_method}
                  onValueChange={(value) => setCompleteData({ ...completeData, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Para në dorë</SelectItem>
                    <SelectItem value="card">Kartë</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pagesa (€)</Label>
                  <Input
                    type="number"
                    value={completeData.payment_amount}
                    onChange={(e) => setCompleteData({ ...completeData, payment_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bakshish (€)</Label>
                  <Input
                    type="number"
                    value={completeData.tip_amount}
                    onChange={(e) => setCompleteData({ ...completeData, tip_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Përfundo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BPAppointments;
