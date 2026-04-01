import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Wrench,
  Package,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ps_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    loadDashboard();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('ps_token');
    return { Authorization: `Bearer ${token}` };
  };

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/phonesoftware/reports/dashboard`, {
        headers: getAuthHeaders()
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-700';
      case 'diagnosing': return 'bg-purple-100 text-purple-700';
      case 'waiting_parts': return 'bg-orange-100 text-orange-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'delivered': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'received': return 'Pranuar';
      case 'diagnosing': return 'Në diagnostikim';
      case 'waiting_parts': return 'Në pritje';
      case 'in_progress': return 'Në proces';
      case 'completed': return 'Përfunduar';
      case 'delivered': return 'Dorëzuar';
      case 'cancelled': return 'Anuluar';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="ps-dashboard">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#00a79d] to-[#008f86] rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Mirësevini, {user?.full_name}!
        </h1>
        <p className="text-white/80">
          Ja një përmbledhje e aktivitetit tuaj sot.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Riparime në Pritje</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.repairs?.pending || 0}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.repairs?.today || 0} të reja sot
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Riparime Totale</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.repairs?.total || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Wrench className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Të Ardhura (Muaji)</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.revenue?.this_month?.toFixed(2) || '0.00'}€</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stok i Ulët</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.inventory?.low_stock || 0}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {stats?.inventory?.total || 0} artikuj total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Veprime të Shpejta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/phonesoftware/repairs?action=new')}
              className="w-full justify-between bg-[#00a79d] hover:bg-[#008f86]"
            >
              <span className="flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Riparim i Ri
              </span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            {user?.role !== 'worker' && (
              <>
                <Button
                  onClick={() => navigate('/phonesoftware/customers?action=new')}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Klient i Ri
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => navigate('/phonesoftware/inventory?action=new')}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Artikull i Ri
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Repairs */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Riparimet e Fundit</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/phonesoftware/repairs')}
            >
              Shiko të gjitha
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recent_repairs?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_repairs.map((repair) => (
                  <div 
                    key={repair.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/phonesoftware/repairs?id=${repair.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#00a79d]/10 rounded-lg flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-[#00a79d]" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{repair.ticket_number}</p>
                        <p className="text-sm text-gray-500">
                          {repair.brand} {repair.model} • {repair.customer_name || 'Pa klient'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(repair.status)}`}>
                        {getStatusLabel(repair.status)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(repair.created_at).toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nuk ka riparime ende</p>
                <Button 
                  className="mt-3 bg-[#00a79d] hover:bg-[#008f86]"
                  onClick={() => navigate('/phonesoftware/repairs?action=new')}
                >
                  Krijo Riparimin e Parë
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repair Status Distribution */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Statusi i Riparimeve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['received', 'in_progress', 'waiting_parts', 'completed', 'delivered'].map((status) => {
                const count = stats?.repairs?.status_counts?.[status] || 0;
                const total = stats?.repairs?.total || 1;
                const percentage = Math.round((count / total) * 100) || 0;
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{getStatusLabel(status)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          status === 'received' ? 'bg-blue-500' :
                          status === 'in_progress' ? 'bg-yellow-500' :
                          status === 'waiting_parts' ? 'bg-orange-500' :
                          status === 'completed' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Përmbledhje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.customers?.total || 0}</p>
                <p className="text-sm text-gray-500">Klientë</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.revenue?.total?.toFixed(0) || 0}€</p>
                <p className="text-sm text-gray-500">Të Ardhura Total</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.inventory?.total || 0}</p>
                <p className="text-sm text-gray-500">Artikuj në Stok</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats?.staff?.total || 0}</p>
                <p className="text-sm text-gray-500">Staf</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PSDashboard;
