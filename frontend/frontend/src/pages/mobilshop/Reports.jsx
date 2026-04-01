import React, { useState, useEffect } from 'react';
import { api } from '../../App';
import { 
  BarChart3, TrendingUp, Package, Users, Calendar,
  DollarSign, ShoppingCart, Wrench, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

const MobilshopReports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [period, setPeriod] = useState('month');
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [profitData, setProfitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [sales, inventory, profit] = await Promise.all([
        api.get(`/mobilshop/reports/sales?period=${period}`),
        api.get('/mobilshop/reports/inventory'),
        api.get(`/mobilshop/reports/profit?period=${period}`)
      ]);
      setSalesData(sales.data);
      setInventoryData(inventory.data);
      setProfitData(profit.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të raporteve');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sales', label: 'Shitjet', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventari', icon: Package },
    { id: 'profit', label: 'Fitimi', icon: TrendingUp }
  ];

  const periods = [
    { id: 'day', label: 'Sot' },
    { id: 'week', label: 'Javë' },
    { id: 'month', label: 'Muaj' },
    { id: 'year', label: 'Vit' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00a79d] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#00a79d]" />
            Raportet
          </h1>
          <p className="text-gray-400 text-sm">Analiza e biznesit tuaj</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 bg-[#0f1f35] p-1 rounded-lg">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p.id ? 'bg-[#00a79d] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-[#00a79d] text-white' 
                : 'bg-[#0f1f35] text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sales Report */}
      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Shitje</span>
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold">€{salesData.total_sales?.toFixed(2)}</p>
              <p className="text-sm text-gray-400">{salesData.total_transactions} transaksione</p>
            </div>
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Shitje Telefonash</span>
                <span className="w-5 h-5 text-blue-400">📱</span>
              </div>
              <p className="text-2xl font-bold">{salesData.phone_sales}</p>
              <p className="text-sm text-gray-400">€{salesData.phone_revenue?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Shitje Aksesorësh</span>
                <span className="w-5 h-5 text-purple-400">🎧</span>
              </div>
              <p className="text-2xl font-bold">{salesData.accessory_sales}</p>
              <p className="text-sm text-gray-400">€{salesData.accessory_revenue?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Të Ardhura Riparime</span>
                <Wrench className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-bold">€{salesData.repair_revenue?.toFixed(2)}</p>
              <p className="text-sm text-gray-400">{salesData.repair_count} riparime</p>
            </div>
          </div>

          {/* Top Products */}
          {salesData.top_products && salesData.top_products.length > 0 && (
            <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Produktet më të Shitura</h3>
              <div className="space-y-3">
                {salesData.top_products.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between bg-[#0a1628] rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-[#00a79d]/20 rounded-full flex items-center justify-center text-[#00a79d] font-bold">
                        {index + 1}
                      </span>
                      <span>{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€{product.revenue?.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{product.count} njësi</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales by Day */}
          {salesData.sales_by_day && salesData.sales_by_day.length > 0 && (
            <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Shitjet sipas Ditës</h3>
              <div className="space-y-2">
                {salesData.sales_by_day.map((day) => (
                  <div key={day.date} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-400">{day.date}</span>
                    <div className="flex-1 h-8 bg-[#0a1628] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#00a79d] rounded-full"
                        style={{ 
                          width: `${Math.min(100, (day.revenue / (salesData.total_sales || 1)) * 100 * salesData.sales_by_day.length)}%` 
                        }}
                      />
                    </div>
                    <span className="w-24 text-right font-medium">€{day.revenue?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Report */}
      {activeTab === 'inventory' && inventoryData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Total Produkte</span>
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{inventoryData.total_products}</p>
            </div>
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Telefona</span>
                <span className="text-blue-400">📱</span>
              </div>
              <p className="text-2xl font-bold">{inventoryData.total_phones}</p>
              <p className="text-sm text-gray-400">€{inventoryData.phone_value?.toFixed(2)}</p>
            </div>
            <div className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Aksesorë</span>
                <span className="text-purple-400">🎧</span>
              </div>
              <p className="text-2xl font-bold">{inventoryData.total_accessories}</p>
              <p className="text-sm text-gray-400">€{inventoryData.accessory_value?.toFixed(2)}</p>
            </div>
            <div className="bg-[#00a79d]/20 rounded-xl p-5 border border-[#00a79d]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#00a79d]">Vlera Totale</span>
                <DollarSign className="w-5 h-5 text-[#00a79d]" />
              </div>
              <p className="text-2xl font-bold text-[#00a79d]">€{inventoryData.total_value?.toFixed(2)}</p>
            </div>
          </div>

          {/* Low Stock Alert */}
          {inventoryData.low_stock_items && inventoryData.low_stock_items.length > 0 && (
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                ⚠️ Produkte me Stok të Ulët
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inventoryData.low_stock_items.map((item) => (
                  <div key={item.id} className="bg-[#0a1628] rounded-lg p-3 flex items-center justify-between">
                    <span>{item.name}</span>
                    <span className="text-red-400 font-bold">
                      {item.quantity} / {item.min_stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock by Brand */}
          {inventoryData.stock_by_brand && inventoryData.stock_by_brand.length > 0 && (
            <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Stoku sipas Markës</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {inventoryData.stock_by_brand.map((brand) => (
                  <div key={brand.brand} className="bg-[#0a1628] rounded-lg p-4 text-center">
                    <p className="font-medium">{brand.brand}</p>
                    <p className="text-2xl font-bold text-[#00a79d]">{brand.count}</p>
                    <p className="text-xs text-gray-400">€{brand.value?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Profit Report */}
      {activeTab === 'profit' && profitData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 mb-2">Të Ardhura nga Shitjet</h3>
              <p className="text-3xl font-bold">€{profitData.sales_revenue?.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Kostoja</span>
                <span className="text-red-400">-€{profitData.sales_cost?.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-400">Fitimi</span>
                <span className="text-green-400">€{profitData.sales_profit?.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
              <h3 className="text-gray-400 mb-2">Të Ardhura nga Riparimet</h3>
              <p className="text-3xl font-bold">€{profitData.repair_revenue?.toFixed(2)}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-400">Kostoja Pjesësh</span>
                <span className="text-red-400">-€{profitData.repair_cost?.toFixed(2)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-sm">
                <span className="text-gray-400">Fitimi</span>
                <span className="text-green-400">€{profitData.repair_profit?.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[#00a79d]/20 rounded-xl p-6 border border-[#00a79d]/30">
              <h3 className="text-[#00a79d] mb-2">Fitimi Bruto Total</h3>
              <p className="text-4xl font-bold text-[#00a79d]">€{profitData.gross_profit?.toFixed(2)}</p>
              <div className="mt-4 bg-[#0a1628] rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Marzha e Fitimit</span>
                  <span className="text-xl font-bold text-[#00a79d]">
                    {profitData.profit_margin?.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4">Ndarja e të Ardhurave</h3>
            <div className="h-8 bg-[#0a1628] rounded-full overflow-hidden flex">
              <div 
                className="bg-blue-500 h-full"
                style={{ width: `${(profitData.sales_revenue / profitData.total_revenue * 100) || 0}%` }}
                title="Shitje"
              />
              <div 
                className="bg-orange-500 h-full"
                style={{ width: `${(profitData.repair_revenue / profitData.total_revenue * 100) || 0}%` }}
                title="Riparime"
              />
            </div>
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-sm text-gray-400">Shitje ({((profitData.sales_revenue / profitData.total_revenue * 100) || 0).toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-sm text-gray-400">Riparime ({((profitData.repair_revenue / profitData.total_revenue * 100) || 0).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopReports;
