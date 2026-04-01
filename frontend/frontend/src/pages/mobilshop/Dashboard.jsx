import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../App';
import {
  LayoutDashboard, Package, Users, Wrench, ShoppingCart, 
  TrendingUp, AlertTriangle, Clock, CheckCircle, DollarSign,
  Smartphone, Headphones, ArrowUp, ArrowDown, Activity
} from 'lucide-react';
import { toast } from 'sonner';

const MobilshopDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingRepairs, setPendingRepairs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, repairsRes] = await Promise.all([
        api.get('/mobilshop/reports/dashboard'),
        api.get('/mobilshop/repairs/pending')
      ]);
      setStats(statsRes.data);
      setPendingRepairs(repairsRes.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të të dhënave');
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: "Shitjet Sot",
      value: `€${stats.today?.revenue?.toFixed(2) || '0.00'}`,
      subtitle: `${stats.today?.sales_count || 0} transaksione`,
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Shitjet këtë Muaj",
      value: `€${stats.month?.revenue?.toFixed(2) || '0.00'}`,
      subtitle: `${stats.month?.sales_count || 0} transaksione`,
      icon: TrendingUp,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Riparime në Pritje",
      value: stats.pending_repairs || 0,
      subtitle: "Pajisje për riparim",
      icon: Wrench,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Stok i Ulët",
      value: stats.low_stock_items || 0,
      subtitle: "Produkte për porosi",
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    },
    {
      title: "Total Klientë",
      value: stats.total_customers || 0,
      subtitle: "Klientë të regjistruar",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Vlera e Inventarit",
      value: `€${stats.inventory_value?.toFixed(2) || '0.00'}`,
      subtitle: `${stats.total_products || 0} produkte`,
      icon: Package,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10"
    }
  ] : [];

  const repairStatusCards = [
    { status: 'received', label: 'Të Pranuara', icon: Clock, color: 'text-gray-400' },
    { status: 'diagnosing', label: 'Në Diagnozë', icon: Activity, color: 'text-yellow-400' },
    { status: 'waiting_parts', label: 'Pritje Pjesësh', icon: Package, color: 'text-orange-400' },
    { status: 'repairing', label: 'Në Riparim', icon: Wrench, color: 'text-blue-400' },
    { status: 'completed', label: 'Të Përfunduara', icon: CheckCircle, color: 'text-green-400' }
  ];

  const quickLinks = [
    { to: '/mobilshop/pos', icon: ShoppingCart, label: 'Shitje e Re', color: 'bg-green-500' },
    { to: '/mobilshop/repairs/new', icon: Wrench, label: 'Riparim i Ri', color: 'bg-orange-500' },
    { to: '/mobilshop/products/new', icon: Package, label: 'Produkt i Ri', color: 'bg-blue-500' },
    { to: '/mobilshop/customers/new', icon: Users, label: 'Klient i Ri', color: 'bg-purple-500' }
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-[#00a79d]" />
          Paneli i Kontrollit
        </h1>
        <p className="text-gray-400 mt-1">Mirësevini në sistemin e menaxhimit të mobilshopit</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            className={`${link.color} hover:opacity-90 rounded-xl p-4 flex items-center gap-3 transition-all hover:scale-[1.02]`}
          >
            <link.icon className="w-6 h-6" />
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-[#0f1f35] rounded-xl p-5 border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Repair Status Overview */}
      <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-[#00a79d]" />
          Statusi i Riparimeve
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {repairStatusCards.map((status, index) => (
            <Link
              key={index}
              to={`/mobilshop/repairs?status=${status.status}`}
              className="bg-[#0a1628] rounded-lg p-4 text-center hover:bg-[#0a1628]/50 transition-colors border border-white/5"
            >
              <status.icon className={`w-8 h-8 ${status.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{pendingRepairs[status.status] || 0}</p>
              <p className="text-xs text-gray-400">{status.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Monthly Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sales Summary */}
          <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00a79d]" />
              Përmbledhja Mujore
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-blue-400" />
                  <span className="text-gray-300">Shitje Telefonash</span>
                </div>
                <span className="font-semibold">€{stats.month?.revenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-orange-400" />
                  <span className="text-gray-300">Të Ardhura nga Riparimet</span>
                </div>
                <span className="font-semibold">€{stats.month?.repair_revenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0a1628] rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Riparime të Përfunduara</span>
                </div>
                <span className="font-semibold">{stats.month?.completed_repairs || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#0f1f35] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00a79d]" />
              Aktiviteti i Fundit
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <ArrowUp className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium">Shitje Sot</p>
                  <p className="text-xs text-gray-400">{stats.today?.sales_count || 0} transaksione</p>
                </div>
                <span className="ml-auto font-bold text-green-400">+€{stats.today?.revenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <Clock className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm font-medium">Riparime në Pritje</p>
                  <p className="text-xs text-gray-400">Kërkojnë vëmendje</p>
                </div>
                <span className="ml-auto font-bold text-orange-400">{stats.pending_repairs || 0}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-sm font-medium">Stok i Ulët</p>
                  <p className="text-xs text-gray-400">Produkte për riporosi</p>
                </div>
                <span className="ml-auto font-bold text-red-400">{stats.low_stock_items || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobilshopDashboard;
