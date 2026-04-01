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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Smartphone,
  Headphones,
  Wrench,
  Filter,
  ArrowUpDown,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSInventory = () => {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'spare_part',
    brand: '',
    model: '',
    sku: '',
    barcode: '',
    imei: '',
    serial_number: '',
    condition: '',
    purchase_price: '',
    sale_price: '',
    quantity: 1,
    min_stock: 5,
    location: '',
    supplier: '',
    warranty_months: 0,
    notes: ''
  });

  useEffect(() => {
    loadInventory();
    loadStats();
    if (searchParams.get('action') === 'new') {
      setShowDialog(true);
    }
  }, [searchParams]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadInventory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/inventory`, {
        headers: getAuthHeaders()
      });
      setItems(response.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të inventarit');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/inventory/stats`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.purchase_price || !formData.sale_price) {
      toast.error('Plotësoni fushat e detyrueshme');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price),
        sale_price: parseFloat(formData.sale_price),
        quantity: parseInt(formData.quantity),
        min_stock: parseInt(formData.min_stock),
        warranty_months: parseInt(formData.warranty_months) || null
      };

      if (editingItem) {
        await axios.put(`${API_URL}/api/phonesoftware/inventory/${editingItem.id}`, payload, {
          headers: getAuthHeaders()
        });
        toast.success('Artikulli u përditësua!');
      } else {
        await axios.post(`${API_URL}/api/phonesoftware/inventory`, payload, {
          headers: getAuthHeaders()
        });
        toast.success('Artikulli u shtua me sukses!');
      }
      setShowDialog(false);
      resetForm();
      loadInventory();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Jeni i sigurt që doni të fshini këtë artikull?')) return;

    try {
      await axios.delete(`${API_URL}/api/phonesoftware/inventory/${itemId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Artikulli u fshi');
      loadInventory();
      loadStats();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || '',
      model: item.model || '',
      sku: item.sku || '',
      barcode: item.barcode || '',
      imei: item.imei || '',
      serial_number: item.serial_number || '',
      condition: item.condition || '',
      purchase_price: item.purchase_price.toString(),
      sale_price: item.sale_price.toString(),
      quantity: item.quantity,
      min_stock: item.min_stock,
      location: item.location || '',
      supplier: item.supplier || '',
      warranty_months: item.warranty_months || 0,
      notes: item.notes || ''
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'spare_part',
      brand: '',
      model: '',
      sku: '',
      barcode: '',
      imei: '',
      serial_number: '',
      condition: '',
      purchase_price: '',
      sale_price: '',
      quantity: 1,
      min_stock: 5,
      location: '',
      supplier: '',
      warranty_months: 0,
      notes: ''
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'phone_new':
      case 'phone_used':
        return <Smartphone className="h-5 w-5" />;
      case 'accessory':
        return <Headphones className="h-5 w-5" />;
      case 'spare_part':
        return <Wrench className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'phone_new': 'Telefon i Ri',
      'phone_used': 'Telefon i Përdorur',
      'accessory': 'Aksesor',
      'spare_part': 'Pjesë Rezervë'
    };
    return labels[category] || category;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'new': 'I Ri',
      'like_new': 'Si i Ri',
      'good': 'I Mirë',
      'fair': 'Mesatar',
      'poor': 'I Dobët'
    };
    return labels[condition] || condition;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode?.includes(searchTerm) ||
      item.imei?.includes(searchTerm);
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = items.filter(item => item.is_low_stock);

  return (
    <div className="space-y-6" data-testid="ps-inventory">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menaxhimi i Inventarit</h1>
          <p className="text-gray-500">Menaxhoni stokun e telefonave, aksesorëve dhe pjesëve rezervë</p>
        </div>
        <Button 
          className="bg-[#00a79d] hover:bg-[#008f86]"
          onClick={() => { resetForm(); setShowDialog(true); }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Artikull i Ri
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Artikuj Total</p>
                <p className="text-2xl font-bold">{stats?.total_items || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vlera e Stokut</p>
                <p className="text-2xl font-bold">{stats?.total_value?.toFixed(0) || 0}€</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stok i Ulët</p>
                <p className="text-2xl font-bold text-red-600">{stats?.low_stock_count || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pjesë Rezervë</p>
                <p className="text-2xl font-bold">{stats?.category_counts?.spare_part || 0}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Wrench className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Kërko sipas emrit, markës, barkodit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Të gjitha</SelectItem>
                <SelectItem value="phone_new">Telefona të Rinj</SelectItem>
                <SelectItem value="phone_used">Telefona të Përdorur</SelectItem>
                <SelectItem value="accessory">Aksesorë</SelectItem>
                <SelectItem value="spare_part">Pjesë Rezervë</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-800">Stok i Ulët!</p>
                <p className="text-sm text-red-600">
                  {lowStockItems.length} artikuj kanë stok të ulët dhe duhet të riporositen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm || categoryFilter !== 'all' 
                  ? 'Nuk u gjetën artikuj me këto kritere'
                  : 'Ende nuk ka artikuj në inventar'}
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Shto Artikullin e Parë
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Artikulli</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Kategoria</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Blerje</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Shitje</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Stoku</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Veprime</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.is_low_stock ? 'bg-red-100 text-red-600' : 'bg-[#00a79d]/10 text-[#00a79d]'
                          }`}>
                            {getCategoryIcon(item.category)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.brand} {item.model}
                              {item.barcode && <span className="ml-2">• {item.barcode}</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{getCategoryLabel(item.category)}</span>
                        {item.condition && (
                          <p className="text-xs text-gray-400">{getConditionLabel(item.condition)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm text-gray-600">{item.purchase_price.toFixed(2)}€</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">{item.sale_price.toFixed(2)}€</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 text-sm rounded-full ${
                          item.is_low_stock 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.quantity}
                        </span>
                        {item.is_low_stock && (
                          <p className="text-xs text-red-500 mt-1">Min: {item.min_stock}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#00a79d]" />
              {editingItem ? 'Edito Artikullin' : 'Artikull i Ri'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Bazë</TabsTrigger>
              <TabsTrigger value="details">Detaje</TabsTrigger>
              <TabsTrigger value="stock">Stoku</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div>
                <Label>Emri i Artikullit *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="p.sh. Ekran iPhone 14 Pro"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kategoria *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone_new">Telefon i Ri</SelectItem>
                      <SelectItem value="phone_used">Telefon i Përdorur</SelectItem>
                      <SelectItem value="accessory">Aksesor</SelectItem>
                      <SelectItem value="spare_part">Pjesë Rezervë</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(formData.category === 'phone_used') && (
                  <div>
                    <Label>Gjendja</Label>
                    <Select 
                      value={formData.condition} 
                      onValueChange={(value) => setFormData({...formData, condition: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zgjidhni gjendjen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="like_new">Si i Ri</SelectItem>
                        <SelectItem value="good">I Mirë</SelectItem>
                        <SelectItem value="fair">Mesatar</SelectItem>
                        <SelectItem value="poor">I Dobët</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Marka</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    placeholder="p.sh. Apple"
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Çmimi i Blerjes (€) *</Label>
                  <Input
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Çmimi i Shitjes (€) *</Label>
                  <Input
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({...formData, sale_price: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    placeholder="Kodi i artikullit"
                  />
                </div>
                <div>
                  <Label>Barkodi</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              {(formData.category === 'phone_new' || formData.category === 'phone_used') && (
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Furnitori</Label>
                  <Input
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Emri i furnitorit"
                  />
                </div>
                <div>
                  <Label>Garancia (muaj)</Label>
                  <Input
                    type="number"
                    value={formData.warranty_months}
                    onChange={(e) => setFormData({...formData, warranty_months: parseInt(e.target.value) || 0})}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label>Shënime</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Shënime shtesë për artikullin"
                  rows={2}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="stock" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sasia në Stok *</Label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <Label>Stoku Minimal</Label>
                  <Input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({...formData, min_stock: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert kur stoku bie nën këtë vlerë</p>
                </div>
              </div>
              
              <div>
                <Label>Lokacioni</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="p.sh. Raft A1"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Anulo</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#00a79d] hover:bg-[#008f86]"
              disabled={loading}
            >
              {loading ? 'Duke ruajtur...' : (editingItem ? 'Ruaj Ndryshimet' : 'Shto Artikullin')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PSInventory;
