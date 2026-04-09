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
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Wrench,
  ShoppingBag,
  Eye,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSCustomers = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState({ repairs: [], purchases: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadCustomers();
    if (searchParams.get('action') === 'new') {
      setShowDialog(true);
    }
  }, [searchParams]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/customers`, {
        headers: getAuthHeaders()
      });
      setCustomers(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të klientëve');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.phone) {
      toast.error('Plotësoni emrin dhe telefonin');
      return;
    }

    setLoading(true);
    try {
      if (editingCustomer) {
        await axios.put(`${API_URL}/api/phonesoftware/customers/${editingCustomer.id}`, formData, {
          headers: getAuthHeaders()
        });
        toast.success('Klienti u përditësua!');
      } else {
        await axios.post(`${API_URL}/api/phonesoftware/customers`, formData, {
          headers: getAuthHeaders()
        });
        toast.success('Klienti u krijua me sukses!');
      }
      setShowDialog(false);
      resetForm();
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Jeni i sigurt që doni të fshini këtë klient?')) return;

    try {
      await axios.delete(`${API_URL}/api/phonesoftware/customers/${customerId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Klienti u fshi');
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë fshirjes');
    }
  };

  const openEditDialog = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setShowDialog(true);
  };

  const openHistoryDialog = async (customer) => {
    setSelectedCustomer(customer);
    setShowHistoryDialog(true);
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/customers/${customer.id}/history`, {
        headers: getAuthHeaders()
      });
      setCustomerHistory({
        repairs: response.data.repairs || [],
        purchases: response.data.purchases || []
      });
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të historisë');
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    });
  };

  const filteredCustomers = customers.filter(customer =>
    customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="ps-customers">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Menaxhimi i Klientëve</h1>
          <p className="text-white/40">Krijoni dhe menaxhoni klientët tuaj</p>
        </div>
        <Button 
          className="bg-[#00e6b4] hover:bg-[#00d4a0]"
          onClick={() => { resetForm(); setShowDialog(true); }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Klient i Ri
        </Button>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25" />
            <Input
              placeholder="Kërko sipas emrit, telefonit ose email-it..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-white/40">Klientë Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + (c.total_repairs || 0), 0)}
                </p>
                <p className="text-sm text-white/40">Riparime Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0)}
                </p>
                <p className="text-sm text-white/40">Blerje Totale</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Lista e Klientëve</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-white/15 mx-auto mb-4" />
              <p className="text-white/40 mb-4">
                {searchTerm ? 'Nuk u gjetën klientë' : 'Ende nuk ka klientë'}
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Shto Klientin e Parë
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div 
                  key={customer.id}
                  className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#00e6b4] rounded-full flex items-center justify-center text-white font-medium text-lg">
                        {customer.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white/90">{customer.full_name}</h3>
                        <p className="text-sm text-white/40 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {customer.email && (
                    <p className="text-sm text-white/40 flex items-center gap-1 mb-1">
                      <Mail className="h-3 w-3" />
                      {customer.email}
                    </p>
                  )}
                  
                  {customer.address && (
                    <p className="text-sm text-white/40 flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3" />
                      {customer.address}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 pt-3 border-t text-sm text-white/40">
                    <span className="flex items-center gap-1">
                      <Wrench className="h-4 w-4" />
                      {customer.total_repairs || 0} riparime
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-4 w-4" />
                      {customer.total_purchases || 0} blerje
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => openHistoryDialog(customer)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Historia
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditDialog(customer)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#00e6b4]" />
              {editingCustomer ? 'Edito Klientin' : 'Klient i Ri'}
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
              <Label>Telefoni *</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+383 44 123 456"
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
            
            <div>
              <Label>Adresa</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Rruga, Qyteti"
              />
            </div>
            
            <div>
              <Label>Shënime</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Shënime shtesë për klientin"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#00e6b4] hover:bg-[#00d4a0]"
              disabled={loading}
            >
              {loading ? 'Duke ruajtur...' : (editingCustomer ? 'Ruaj Ndryshimet' : 'Krijo Klientin')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#00e6b4]" />
              Historia e {selectedCustomer?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Repairs History */}
            <div>
              <h3 className="font-semibold text-white/90 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Riparimet ({customerHistory.repairs.length})
              </h3>
              {customerHistory.repairs.length === 0 ? (
                <p className="text-white/40 text-sm">Nuk ka riparime</p>
              ) : (
                <div className="space-y-2">
                  {customerHistory.repairs.map((repair) => (
                    <div key={repair.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <div>
                        <p className="font-medium">{repair.ticket_number}</p>
                        <p className="text-sm text-white/40">{repair.brand} {repair.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{repair.total_cost?.toFixed(2) || '0.00'}€</p>
                        <p className="text-xs text-white/40">
                          {new Date(repair.created_at).toLocaleDateString('sq-AL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchases History */}
            <div>
              <h3 className="font-semibold text-white/90 mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Blerjet ({customerHistory.purchases.length})
              </h3>
              {customerHistory.purchases.length === 0 ? (
                <p className="text-white/40 text-sm">Nuk ka blerje</p>
              ) : (
                <div className="space-y-2">
                  {customerHistory.purchases.map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <div>
                        <p className="font-medium">{purchase.sale_number}</p>
                        <p className="text-sm text-white/40">{purchase.items?.length || 0} artikuj</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{purchase.grand_total?.toFixed(2) || '0.00'}€</p>
                        <p className="text-xs text-white/40">
                          {new Date(purchase.created_at).toLocaleDateString('sq-AL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Mbyll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PSCustomers;
