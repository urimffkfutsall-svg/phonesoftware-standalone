import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wrench,
  Package,
  Users,
  DollarSign,
  Calendar,
  Download,
  PieChart,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSReports = () => {
  const [repairsReport, setRepairsReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);
  const [partsReport, setPartsReport] = useState(null);
  const [revenueReport, setRevenueReport] = useState(null);
  const [customersReport, setCustomersReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    loadReports();
  }, [period]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const [repairs, inventory, parts, revenue, customers] = await Promise.all([
        axios.get(`${API_URL}/api/phonesoftware/reports/repairs`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/api/phonesoftware/reports/inventory`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/api/phonesoftware/reports/parts-usage`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/api/phonesoftware/reports/revenue?period=${period}`, { headers: getAuthHeaders() }),
        axios.get(`${API_URL}/api/phonesoftware/reports/customers`, { headers: getAuthHeaders() })
      ]);
      
      setRepairsReport(repairs.data);
      setInventoryReport(inventory.data);
      setPartsReport(parts.data);
      setRevenueReport(revenue.data);
      setCustomersReport(customers.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të raporteve');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'received': 'Pranuar',
      'diagnosing': 'Në diagnostikim',
      'waiting_parts': 'Në pritje',
      'in_progress': 'Në proces',
      'completed': 'Përfunduar',
      'delivered': 'Dorëzuar',
      'cancelled': 'Anuluar'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'received': 'bg-blue-500',
      'diagnosing': 'bg-purple-500',
      'waiting_parts': 'bg-orange-500',
      'in_progress': 'bg-yellow-500',
      'completed': 'bg-green-500',
      'delivered': 'bg-gray-500',
      'cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ps-reports">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raportet & Analitika</h1>
          <p className="text-gray-500">Monitoroni performancën e biznesit tuaj</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Sot</SelectItem>
              <SelectItem value="week">Javën</SelectItem>
              <SelectItem value="month">Muajin</SelectItem>
              <SelectItem value="year">Vitin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-[#00a79d] to-[#008f86] text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Të Ardhura Totale</p>
                <p className="text-3xl font-bold">{revenueReport?.totals?.revenue?.toFixed(2) || '0.00'}€</p>
              </div>
              <DollarSign className="h-10 w-10 text-white/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Kosto e Pjesëve</p>
                <p className="text-2xl font-bold text-red-600">{revenueReport?.totals?.parts_cost?.toFixed(2) || '0.00'}€</p>
              </div>
              <Package className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Fitimi Neto</p>
                <p className="text-2xl font-bold text-green-600">{revenueReport?.totals?.profit?.toFixed(2) || '0.00'}€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Riparime</p>
                <p className="text-2xl font-bold">{revenueReport?.totals?.repairs_count || 0}</p>
              </div>
              <Wrench className="h-8 w-8 text-gray-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      {revenueReport?.timeline?.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#00a79d]" />
              Të Ardhurat sipas Ditëve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueReport.timeline.slice(-7).map((day) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-500">{day.date}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-[#00a79d] rounded-lg flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(100, (day.revenue / (revenueReport?.totals?.revenue || 1)) * 100 * 7)}%` }}
                    >
                      <span className="text-xs text-white font-medium">{day.revenue.toFixed(0)}€</span>
                    </div>
                  </div>
                  <span className="w-16 text-sm text-gray-600 text-right">{day.count} rip.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Repairs Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-[#00a79d]" />
              Statusi i Riparimeve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {repairsReport?.status_breakdown && Object.entries(repairsReport.status_breakdown).map(([status, count]) => {
                const total = repairsReport?.summary?.total_repairs || 1;
                const percentage = Math.round((count / total) * 100);
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{getStatusLabel(status)}</span>
                      <span className="font-medium">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{repairsReport?.summary?.total_repairs || 0}</p>
                <p className="text-xs text-gray-500">Riparime Total</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{repairsReport?.summary?.completion_rate || 0}%</p>
                <p className="text-xs text-gray-500">Shkalla e Përfundimit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Report */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[#00a79d]" />
              Raporti i Inventarit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventoryReport?.category_breakdown && Object.entries(inventoryReport.category_breakdown).map(([category, data]) => {
                const categoryLabels = {
                  'phone_new': 'Telefona të Rinj',
                  'phone_used': 'Telefona të Përdorur',
                  'accessory': 'Aksesorë',
                  'spare_part': 'Pjesë Rezervë'
                };
                
                return (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{categoryLabels[category] || category}</p>
                      <p className="text-xs text-gray-500">{data.count} artikuj • {data.quantity} copë</p>
                    </div>
                    <p className="font-semibold text-[#00a79d]">{data.value?.toFixed(0) || 0}€</p>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{inventoryReport?.summary?.total_items || 0}</p>
                <p className="text-xs text-gray-500">Artikuj</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#00a79d]">{inventoryReport?.summary?.total_value?.toFixed(0) || 0}€</p>
                <p className="text-xs text-gray-500">Vlera</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600">{inventoryReport?.summary?.low_stock_count || 0}</p>
                <p className="text-xs text-gray-500">Stok i Ulët</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parts Usage & Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parts Usage */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[#00a79d]" />
              Përdorimi i Pjesëve Rezervë
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partsReport?.parts_breakdown?.length > 0 ? (
              <div className="space-y-3">
                {partsReport.parts_breakdown.slice(0, 5).map((part, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{part.item_name}</p>
                      <p className="text-xs text-gray-500">{part.usage_count} herë në {part.total_quantity} copë</p>
                    </div>
                    <p className="font-semibold text-[#00a79d]">{part.total_cost?.toFixed(2) || '0.00'}€</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Nuk ka të dhëna për këtë periudhë</p>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
              <span className="text-gray-500">Total pjesë të përdorura:</span>
              <span className="font-semibold">{partsReport?.total_parts_used || 0} copë • {partsReport?.total_parts_cost?.toFixed(2) || '0.00'}€</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[#00a79d]" />
              Klientët Më të Mirë
            </CardTitle>
          </CardHeader>
          <CardContent>
            {customersReport?.top_customers?.length > 0 ? (
              <div className="space-y-3">
                {customersReport.top_customers.slice(0, 5).map((customer, index) => (
                  <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{customer.full_name}</p>
                      <p className="text-xs text-gray-500">{customer.repairs_count} riparime</p>
                    </div>
                    <p className="font-semibold text-[#00a79d]">{customer.total_spent?.toFixed(2) || '0.00'}€</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Ende nuk ka klientë</p>
            )}
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
              <span className="text-gray-500">Total klientë:</span>
              <span className="font-semibold">{customersReport?.total_customers || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PSReports;
