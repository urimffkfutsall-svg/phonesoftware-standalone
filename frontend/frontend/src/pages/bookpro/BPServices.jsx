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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Scissors, Clock, DollarSign, Edit, Trash2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'haircut', label: 'Prerje Flokësh' },
  { value: 'coloring', label: 'Ngjyrosje' },
  { value: 'styling', label: 'Stilim' },
  { value: 'treatment', label: 'Trajtim' },
  { value: 'extensions', label: 'Zgjatim Flokësh' },
  { value: 'bridal', label: 'Nuse' },
  { value: 'makeup', label: 'Grim' },
  { value: 'nails', label: 'Thonj' },
  { value: 'other', label: 'Tjetër' },
];

const BPServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'haircut',
    description: '',
    duration_minutes: 30,
    price: 0,
    is_popular: false
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await bpApi.get('/bookpro/services');
      setServices(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të shërbimeve');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Ju lutem plotësoni emrin dhe çmimin');
      return;
    }

    try {
      if (editingService) {
        await bpApi.put(`/bookpro/services/${editingService.id}`, formData);
        toast.success('Shërbimi u përditësua');
      } else {
        await bpApi.post('/bookpro/services', formData);
        toast.success('Shërbimi u shtua');
      }
      setShowDialog(false);
      resetForm();
      loadServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_popular: service.is_popular
    });
    setShowDialog(true);
  };

  const handleDelete = async (service) => {
    if (!confirm(`Jeni të sigurt që dëshironi të fshini "${service.name}"?`)) return;
    
    try {
      await bpApi.delete(`/bookpro/services/${service.id}`);
      toast.success('Shërbimi u fshi');
      loadServices();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'haircut',
      description: '',
      duration_minutes: 30,
      price: 0,
      is_popular: false
    });
  };

  const getCategoryLabel = (value) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    getCategoryLabel(s.category).toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const groupedServices = filteredServices.reduce((acc, service) => {
    const cat = service.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-6" data-testid="bp-services-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shërbimet</h1>
          <p className="text-gray-500">Menaxhoni shërbimet e sallonit</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-rose-500 hover:bg-rose-600"
          data-testid="add-service-btn"
        >
          <Plus className="h-4 w-4 mr-2" />
          Shto Shërbim
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Kërko shërbime..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
        </div>
      ) : Object.keys(groupedServices).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Scissors className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nuk ka shërbime. Shtoni shërbimin e parë!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedServices).map(([category, categoryServices]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-rose-500" />
                  {getCategoryLabel(category)}
                  <span className="text-sm font-normal text-gray-500">({categoryServices.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-800">{service.name}</h3>
                          {service.is_popular && (
                            <span className="text-xs px-2 py-0.5 bg-rose-500 text-white rounded-full">
                              Popullor
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {service.duration_minutes} min
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-rose-500">€{service.price.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Modifiko Shërbimin' : 'Shto Shërbim të Ri'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Emri i Shërbimit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="p.sh. Prerje Femra"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Kohëzgjatja (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Çmimi (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Përshkrimi (opsional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Përshkrim i shkurtër..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_popular"
                checked={formData.is_popular}
                onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_popular" className="cursor-pointer">
                Shëno si popullor
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Anulo
            </Button>
            <Button onClick={handleSubmit} className="bg-rose-500 hover:bg-rose-600">
              {editingService ? 'Ruaj Ndryshimet' : 'Shto Shërbimin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BPServices;
