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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, Users, Phone, Mail, Calendar, Eye, Edit, Trash2 } from 'lucide-react';

const BPClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'female',
    notes: '',
    preferences: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await bpApi.get('/bookpro/clients');
      setClients(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të klientëve');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.phone) {
      toast.error('Ju lutem plotësoni emrin dhe telefonin');
      return;
    }

    try {
      if (editingClient) {
        await bpApi.put(`/bookpro/clients/${editingClient.id}`, formData);
        toast.success('Klienti u përditësua');
      } else {
        await bpApi.post('/bookpro/clients', formData);
        toast.success('Klienti u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadClients();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const handleView = async (client) => {
    try {
      const response = await bpApi.get(`/bookpro/clients/${client.id}/history`);
      setSelectedClient(response.data);
      setShowViewDialog(true);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të detajeve');
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData({
      full_name: client.full_name,
      phone: client.phone,
      email: client.email || '',
      gender: client.gender || 'female',
      notes: client.notes || '',
      preferences: client.preferences || ''
    });
    setShowDialog(true);
  };

  const handleDelete = async (client) => {
    if (!confirm(`Jeni të sigurt që dëshironi të fshini "${client.full_name}"?`)) return;
    
    try {
      await bpApi.delete(`/bookpro/clients/${client.id}`);
      toast.success('Klienti u fshi');
      loadClients();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      full_name: '',
      phone: '',
      email: '',
      gender: 'female',
      notes: '',
      preferences: ''
    });
  };

  const filteredClients = clients.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6" data-testid="bp-clients-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Klientët</h1>
          <p className="text-gray-500">Menaxhoni klientët e sallonit</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-rose-500 hover:bg-rose-600"
          data-testid="add-client-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Klient
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Kërko klientë..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-rose-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-sm text-gray-500">Total Klientë</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-rose-500" />
            Lista e Klientëve
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nuk ka klientë</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Emri</TableHead>
                    <TableHead>Telefoni</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vizita</TableHead>
                    <TableHead>Shpenzuar</TableHead>
                    <TableHead className="text-right">Veprime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.full_name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {client.phone}
                        </span>
                      </TableCell>
                      <TableCell>
                        {client.email ? (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {client.email}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{client.total_visits || 0}</TableCell>
                      <TableCell className="font-medium text-rose-500">
                        €{(client.total_spent || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleView(client)}>
                            <Eye className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(client)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Modifiko Klientin' : 'Shto Klient të Ri'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              <Label htmlFor="phone">Telefoni *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+383 44 xxx xxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opsional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferences">Preferencat (opsional)</Label>
              <Input
                id="preferences"
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                placeholder="Lloji i flokëve, alergjitë, etj."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Shënime (opsional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Shënime të tjera..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600">
              {editingClient ? 'Ruaj Ndryshimet' : 'Shto Klientin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detajet e Klientit</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Emri</p>
                  <p className="font-medium">{selectedClient.client?.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefoni</p>
                  <p className="font-medium">{selectedClient.client?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Vizita</p>
                  <p className="font-medium">{selectedClient.total_visits}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Shpenzuar</p>
                  <p className="font-medium text-rose-500">€{selectedClient.total_spent?.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Historiku i Rezervimeve</h4>
                <ScrollArea className="h-[300px]">
                  {selectedClient.appointments?.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nuk ka rezervime</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.appointments?.map((apt) => (
                        <div key={apt.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{apt.services?.map(s => s.service_name).join(', ')}</p>
                              <p className="text-sm text-gray-500">{apt.appointment_date} - {apt.start_time}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">€{apt.total_price?.toFixed(2)}</p>
                              <p className={`text-xs ${apt.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                                {apt.status === 'completed' ? 'Përfunduar' : apt.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BPClients;
