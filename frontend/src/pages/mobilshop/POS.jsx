import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../App';
import { 
  ShoppingCart, Search, Plus, Minus, Trash2, User, CreditCard, 
  Banknote, Receipt, X, Smartphone, Headphones, Package, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

const MobilshopPOS = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [discount, setDiscount] = useState({ percent: 0, amount: 0 });
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/mobilshop/products?is_sold=false');
      setProducts(res.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të produkteve');
    }
  };

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
    setSelectedCustomer(customer);
    setCustomerSearch(customer.full_name);
    setSearchResults([]);
  };

  const addToCart = (product) => {
    // For phones (unique IMEI), check if already in cart
    if (product.product_type === 'phone') {
      const existing = cart.find(item => item.product_id === product.id);
      if (existing) {
        toast.error('Ky telefon është tashmë në shportë');
        return;
      }
      setCart([...cart, {
        product_id: product.id,
        product: product,
        quantity: 1,
        unit_price: product.sale_price
      }]);
    } else {
      // For accessories, increment quantity
      const existing = cart.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error('Stoku i pamjaftueshëm');
          return;
        }
        setCart(cart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, {
          product_id: product.id,
          product: product,
          quantity: 1,
          unit_price: product.sale_price
        }]);
      }
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.product.quantity && item.product.product_type !== 'phone') {
          toast.error('Stoku i pamjaftueshëm');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const getTotalDiscount = () => {
    const subtotal = getSubtotal();
    return (subtotal * discount.percent / 100) + discount.amount;
  };

  const getGrandTotal = () => {
    return getSubtotal() - getTotalDiscount();
  };

  const getChange = () => {
    if (paymentMethod === 'card') return 0;
    const cash = parseFloat(cashAmount) || 0;
    return Math.max(0, cash - getGrandTotal());
  };

  const handlePayment = async () => {
    if (cart.length === 0) {
      toast.error('Shporta është bosh');
      return;
    }

    const grandTotal = getGrandTotal();
    const cash = parseFloat(cashAmount) || 0;

    if (paymentMethod === 'cash' && cash < grandTotal) {
      toast.error('Shuma e parave nuk mjafton');
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: 0,
          discount_amount: 0
        })),
        payment_method: paymentMethod,
        cash_amount: paymentMethod === 'cash' ? cash : 0,
        card_amount: paymentMethod === 'card' ? grandTotal : 0,
        discount_percent: discount.percent,
        discount_amount: discount.amount
      };

      const res = await api.post('/mobilshop/sales', saleData);
      
      toast.success(`Shitja u regjistrua! Fatura: ${res.data.invoice_number}`);
      
      // Reset
      setCart([]);
      setSelectedCustomer(null);
      setCustomerSearch('');
      setDiscount({ percent: 0, amount: 0 });
      setCashAmount('');
      setShowPayment(false);
      fetchProducts();
      
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë regjistrimit të shitjes');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(searchLower) ||
      p.imei?.includes(search) ||
      p.barcode?.includes(search) ||
      p.brand?.toLowerCase().includes(searchLower) ||
      p.model?.toLowerCase().includes(searchLower)
    );
  });

  const getProductIcon = (type) => {
    if (type === 'phone') return <Smartphone className="w-5 h-5 text-blue-400" />;
    if (type === 'accessory') return <Headphones className="w-5 h-5 text-purple-400" />;
    return <Package className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex">
      {/* Products Section */}
      <div className="flex-1 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko produkt, IMEI, barkod..."
              className="pl-12 h-14 text-lg bg-[#0f1f35] border-white/10 text-white"
              autoFocus
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.is_sold || (product.product_type !== 'phone' && product.quantity === 0)}
              className={`bg-[#0f1f35] rounded-xl p-4 text-left border border-white/10 hover:border-[#00a79d]/50 transition-colors ${
                product.is_sold || (product.product_type !== 'phone' && product.quantity === 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                {getProductIcon(product.product_type)}
                <span className={`text-xs px-2 py-0.5 rounded ${
                  product.condition === 'new' ? 'bg-green-500/20 text-green-400' : 
                  product.condition === 'used' ? 'bg-yellow-500/20 text-yellow-400' : 
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {product.condition === 'new' ? 'I ri' : product.condition === 'used' ? 'I përdorur' : 'Rinovuar'}
                </span>
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {product.brand} {product.model}
              </p>
              {product.imei && (
                <p className="text-xs text-gray-500 font-mono mt-1">
                  IMEI: ...{product.imei.slice(-4)}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-[#00a79d]">€{product.sale_price?.toFixed(2)}</span>
                {product.product_type !== 'phone' && (
                  <span className={`text-xs ${product.quantity <= product.min_stock ? 'text-red-400' : 'text-gray-400'}`}>
                    Stok: {product.quantity}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-[#0f1f35] border-l border-white/10 flex flex-col">
        {/* Customer */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                searchCustomers(e.target.value);
                if (!e.target.value) setSelectedCustomer(null);
              }}
              placeholder="Kërko klientin..."
              className="pl-10 bg-[#0a1628] border-white/10 text-white"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#0a1628] border border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {searchResults.map((customer) => (
                  <button
                    key={customer.id}
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
          {selectedCustomer && (
            <div className="mt-2 flex items-center justify-between bg-[#00a79d]/10 rounded-lg px-3 py-2">
              <span className="text-sm text-[#00a79d]">{selectedCustomer.full_name}</span>
              <button onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Shporta është bosh</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="bg-[#0a1628] rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-xs text-gray-400">€{item.unit_price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {item.product.product_type === 'phone' ? (
                    <span className="text-xs text-gray-400">IMEI: {item.product.imei}</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, -1)}
                        className="p-1 bg-white/10 rounded hover:bg-white/20"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, 1)}
                        className="p-1 bg-white/10 rounded hover:bg-white/20"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <span className="font-bold">€{(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Nëntotali</span>
            <span>€{getSubtotal().toFixed(2)}</span>
          </div>
          {getTotalDiscount() > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Zbritja</span>
              <span className="text-red-400">-€{getTotalDiscount().toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-white/10">
            <span>Total</span>
            <span className="text-[#00a79d]">€{getGrandTotal().toFixed(2)}</span>
          </div>

          {/* Discount */}
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="% Zbritje"
              value={discount.percent || ''}
              onChange={(e) => setDiscount({ ...discount, percent: parseFloat(e.target.value) || 0 })}
              className="w-1/2 bg-[#0a1628] border-white/10 text-white"
            />
            <Input
              type="number"
              placeholder="€ Zbritje"
              value={discount.amount || ''}
              onChange={(e) => setDiscount({ ...discount, amount: parseFloat(e.target.value) || 0 })}
              className="w-1/2 bg-[#0a1628] border-white/10 text-white"
            />
          </div>

          <Button
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className="w-full h-14 bg-[#00a79d] hover:bg-[#008f86] text-lg font-semibold"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Paguaj
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f1f35] rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Përfundo Pagesën</h2>
              <button onClick={() => setShowPayment(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-400">Total për Pagesë</p>
                <p className="text-4xl font-bold text-[#00a79d]">€{getGrandTotal().toFixed(2)}</p>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-colors flex flex-col items-center gap-2 ${
                    paymentMethod === 'cash' ? 'border-[#00a79d] bg-[#00a79d]/10' : 'border-white/10'
                  }`}
                >
                  <Banknote className={`w-8 h-8 ${paymentMethod === 'cash' ? 'text-[#00a79d]' : 'text-gray-400'}`} />
                  <span>Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-colors flex flex-col items-center gap-2 ${
                    paymentMethod === 'card' ? 'border-[#00a79d] bg-[#00a79d]/10' : 'border-white/10'
                  }`}
                >
                  <CreditCard className={`w-8 h-8 ${paymentMethod === 'card' ? 'text-[#00a79d]' : 'text-gray-400'}`} />
                  <span>Kartë</span>
                </button>
              </div>

              {/* Cash Amount */}
              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Shuma e Pranuar</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="0.00"
                    className="text-2xl h-14 text-center bg-[#0a1628] border-white/10 text-white"
                    autoFocus
                  />
                  {parseFloat(cashAmount) >= getGrandTotal() && (
                    <div className="mt-2 bg-green-500/10 rounded-lg p-3 text-center">
                      <p className="text-sm text-gray-400">Kusuri</p>
                      <p className="text-2xl font-bold text-green-400">€{getChange().toFixed(2)}</p>
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={handlePayment}
                disabled={loading || (paymentMethod === 'cash' && parseFloat(cashAmount) < getGrandTotal())}
                className="w-full h-14 bg-[#00a79d] hover:bg-[#008f86] text-lg font-semibold"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Duke procesuar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Konfirmo Pagesën
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopPOS;
