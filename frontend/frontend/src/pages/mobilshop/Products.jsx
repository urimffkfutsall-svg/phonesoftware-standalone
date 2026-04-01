import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../App';
import { 
  Search, Plus, Filter, Smartphone, Headphones, Package,
  Edit2, Trash2, AlertTriangle, X, Save, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const MobilshopProducts = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ type: '', brand: '', category: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    product_type: 'phone',
    brand: '',
    model: '',
    imei: '',
    serial_number: '',
    barcode: '',
    purchase_price: '',
    sale_price: '',
    category: '',
    color: '',
    storage: '',
    condition: 'new',
    warranty_months: 12,
    supplier_id: '',
    location: '',
    quantity: 1,
    min_stock: 1,
    description: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filter.type) params.append('product_type', filter.type);
      if (filter.brand) params.append('brand', filter.brand);
      
      const [productsRes, suppliersRes, brandsRes, categoriesRes] = await Promise.all([
        api.get(`/mobilshop/products?${params}`),
        api.get('/mobilshop/products/suppliers'),
        api.get('/mobilshop/products/brands/list'),
        api.get('/mobilshop/products/categories/list')
      ]);
      
      setProducts(productsRes.data);
      setSuppliers(suppliersRes.data);
      setBrands(brandsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të produkteve');
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        sale_price: parseFloat(formData.sale_price) || 0,
        quantity: parseInt(formData.quantity) || 1,
        min_stock: parseInt(formData.min_stock) || 1,
        warranty_months: parseInt(formData.warranty_months) || 0
      };

      if (editingProduct) {
        await api.put(`/mobilshop/products/${editingProduct.id}`, data);
        toast.success('Produkti u përditësua!');
      } else {
        await api.post('/mobilshop/products', data);
        toast.success('Produkti u shtua!');
      }
      
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë ruajtjes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni ta fshini këtë produkt?')) return;
    try {
      await api.delete(`/mobilshop/products/${id}`);
      toast.success('Produkti u fshi!');
      fetchProducts();
    } catch (error) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      product_type: 'phone',
      brand: '',
      model: '',
      imei: '',
      serial_number: '',
      barcode: '',
      purchase_price: '',
      sale_price: '',
      category: '',
      color: '',
      storage: '',
      condition: 'new',
      warranty_months: 12,
      supplier_id: '',
      location: '',
      quantity: 1,
      min_stock: 1,
      description: ''
    });
    setEditingProduct(null);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      product_type: product.product_type || 'phone',
      brand: product.brand || '',
      model: product.model || '',
      imei: product.imei || '',
      serial_number: product.serial_number || '',
      barcode: product.barcode || '',
      purchase_price: product.purchase_price?.toString() || '',
      sale_price: product.sale_price?.toString() || '',
      category: product.category || '',
      color: product.color || '',
      storage: product.storage || '',
      condition: product.condition || 'new',
      warranty_months: product.warranty_months || 12,
      supplier_id: product.supplier_id || '',
      location: product.location || '',
      quantity: product.quantity || 1,
      min_stock: product.min_stock || 1,
      description: product.description || ''
    });
    setShowModal(true);
  };

  const getProductIcon = (type) => {
    if (type === 'phone') return <Smartphone className="w-5 h-5 text-blue-400" />;
    if (type === 'accessory') return <Headphones className="w-5 h-5 text-purple-400" />;
    return <Package className="w-5 h-5 text-gray-400" />;
  };

  const filteredProducts = products.filter(p => !p.is_sold);

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-7 h-7 text-[#00a79d]" />
            Inventari
          </h1>
          <p className="text-gray-400 text-sm">Menaxho telefonat dhe aksesorët</p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-[#00a79d] hover:bg-[#008f86]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Shto Produkt
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#0f1f35] rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Kërko sipas emrit, IMEI, barkodit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#0a1628] border-white/10 text-white"
            />
          </div>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
          >
            <option value="">Të gjitha llojet</option>
            <option value="phone">Telefona</option>
            <option value="accessory">Aksesorë</option>
            <option value="part">Pjesë</option>
          </select>
          <select
            value={filter.brand}
            onChange={(e) => setFilter({ ...filter, brand: e.target.value })}
            className="px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
          >
            <option value="">Të gjitha markat</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0f1f35] rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a1628]">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Produkti</th>
                <th className="text-left p-4 text-gray-400 font-medium">IMEI/SKU</th>
                <th className="text-left p-4 text-gray-400 font-medium">Çmimi Blerjes</th>
                <th className="text-left p-4 text-gray-400 font-medium">Çmimi Shitjes</th>
                <th className="text-left p-4 text-gray-400 font-medium">Sasia</th>
                <th className="text-left p-4 text-gray-400 font-medium">Statusi</th>
                <th className="text-right p-4 text-gray-400 font-medium">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Duke ngarkuar...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Asnjë produkt nuk u gjet
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {getProductIcon(product.product_type)}
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-400">
                            {product.brand} {product.model}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-mono text-sm">{product.imei || product.sku || '-'}</p>
                    </td>
                    <td className="p-4">€{product.purchase_price?.toFixed(2)}</td>
                    <td className="p-4 font-medium text-[#00a79d]">€{product.sale_price?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`${product.quantity <= product.min_stock ? 'text-red-400' : 'text-white'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="p-4">
                      {product.quantity <= product.min_stock ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Stok i ulët
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                          Në gjendje
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingProduct ? 'Ndrysho Produktin' : 'Shto Produkt të Ri'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Lloji *</label>
                  <select
                    value={formData.product_type}
                    onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
                    required
                  >
                    <option value="phone">Telefon</option>
                    <option value="accessory">Aksesor</option>
                    <option value="part">Pjesë këmbimi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gjendja</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
                  >
                    <option value="new">I ri</option>
                    <option value="used">I përdorur</option>
                    <option value="refurbished">I rinovuar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Emri *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="p.sh. iPhone 15 Pro Max"
                  className="bg-[#0a1628] border-white/10 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Marka</label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="p.sh. Apple"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Modeli</label>
                  <Input
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="p.sh. 15 Pro Max"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
              </div>

              {formData.product_type === 'phone' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">IMEI</label>
                    <Input
                      value={formData.imei}
                      onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                      placeholder="Numri IMEI"
                      className="bg-[#0a1628] border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Hapësira</label>
                    <Input
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      placeholder="p.sh. 256GB"
                      className="bg-[#0a1628] border-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Çmimi Blerjes *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-[#0a1628] border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Çmimi Shitjes *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="0.00"
                    className="bg-[#0a1628] border-white/10 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sasia</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Stok Min.</label>
                  <Input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Garanci (muaj)</label>
                  <Input
                    type="number"
                    value={formData.warranty_months}
                    onChange={(e) => setFormData({ ...formData, warranty_months: e.target.value })}
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ngjyra</label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="p.sh. Titanium Black"
                    className="bg-[#0a1628] border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Furnitori</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/10 rounded-lg text-white"
                  >
                    <option value="">Zgjidhni furnitorin</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
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
                  {editingProduct ? 'Ruaj Ndryshimet' : 'Shto Produktin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopProducts;
