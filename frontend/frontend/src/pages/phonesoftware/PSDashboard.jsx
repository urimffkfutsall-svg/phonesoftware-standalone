import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Wrench,
  Package,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowRight,
  Calendar,
  DollarSign,
  User
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('ps_user');
    if (storedUser) setUser(JSON.parse(storedUser));
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
      case 'received': return 'status-received';
      case 'diagnosing': return 'bg-purple-500/15 text-purple-400';
      case 'waiting_parts': return 'status-waiting_parts';
      case 'in_progress': return 'status-in_progress';
      case 'completed': return 'status-completed';
      case 'delivered': return 'status-delivered';
      default: return 'status-delivered';
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

  const getBarColor = (status) => {
    switch (status) {
      case 'received': return '#60a5fa';
      case 'in_progress': return '#facc15';
      case 'waiting_parts': return '#fb923c';
      case 'completed': return '#4ade80';
      case 'delivered': return '#94a3b8';
      default: return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Riparime në Pritje',
      value: stats?.repairs?.pending || 0,
      sub: `${stats?.repairs?.today || 0} të reja sot`,
      icon: Clock,
      gradient: 'linear-gradient(135deg, rgba(251, 146, 60, 0.12) 0%, rgba(251, 146, 60, 0.04) 100%)',
      iconBg: 'rgba(251, 146, 60, 0.15)',
      iconColor: '#fb923c',
      borderColor: 'rgba(251, 146, 60, 0.1)',
    },
    {
      label: 'Riparime Totale',
      value: stats?.repairs?.total || 0,
      icon: Wrench,
      gradient: 'linear-gradient(135deg, rgba(96, 165, 250, 0.12) 0%, rgba(96, 165, 250, 0.04) 100%)',
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconColor: '#60a5fa',
      borderColor: 'rgba(96, 165, 250, 0.1)',
    },
    {
      label: 'Të Ardhura (Muaji)',
      value: `${stats?.revenue?.this_month?.toFixed(2) || '0.00'}€`,
      icon: TrendingUp,
      gradient: 'linear-gradient(135deg, rgba(0, 230, 180, 0.12) 0%, rgba(0, 230, 180, 0.04) 100%)',
      iconBg: 'rgba(0, 230, 180, 0.15)',
      iconColor: '#00e6b4',
      borderColor: 'rgba(0, 230, 180, 0.1)',
    },
    {
      label: 'Stok i Ulët',
      value: stats?.inventory?.low_stock || 0,
      sub: `${stats?.inventory?.total || 0} artikuj total`,
      icon: AlertTriangle,
      gradient: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12) 0%, rgba(248, 113, 113, 0.04) 100%)',
      iconBg: 'rgba(248, 113, 113, 0.15)',
      iconColor: '#f87171',
      borderColor: 'rgba(248, 113, 113, 0.1)',
    },
  ];

  return (
    <div className="space-y-6" data-testid="ps-dashboard">
      {/* Welcome Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 230, 180, 0.1) 0%, rgba(0, 180, 216, 0.08) 100%)',
          border: '1px solid rgba(0, 230, 180, 0.12)',
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00e6b4 0%, transparent 70%)' }} />
        <h1 className="text-2xl font-bold text-white mb-1">
          Mirësevini, {user?.full_name}!
        </h1>
        <p className="text-white/40 text-[14px]">
          Ja një përmbledhje e aktivitetit tuaj sot.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: card.gradient,
              border: `1px solid ${card.borderColor}`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-medium text-white/40 uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: card.iconBg }}>
                <card.icon className="h-5 w-5" style={{ color: card.iconColor }} />
              </div>
            </div>
            {card.sub && (
              <p className="text-[11px] text-white/30 mt-2">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Repairs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold text-white/70 uppercase tracking-wider mb-4">Veprime të Shpejta</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/phonesoftware/repairs?action=new')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group"
              style={{ background: 'linear-gradient(135deg, rgba(0,230,180,0.15) 0%, rgba(0,180,216,0.1) 100%)', border: '1px solid rgba(0,230,180,0.15)' }}
            >
              <span className="flex items-center gap-3">
                <Wrench className="h-4 w-4 text-[#00e6b4]" />
                <span className="text-[13px] font-semibold text-white/80">Riparim i Ri</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[#00e6b4] group-hover:translate-x-1 transition-transform" />
            </button>
            {user?.role !== 'worker' && (
              <>
                <button
                  onClick={() => navigate('/phonesoftware/customers?action=new')}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-white/40" />
                    <span className="text-[13px] font-medium text-white/50">Klient i Ri</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                </button>
                <button
                  onClick={() => navigate('/phonesoftware/inventory?action=new')}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all group hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-white/40" />
                    <span className="text-[13px] font-medium text-white/50">Artikull i Ri</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Repairs */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-white/70 uppercase tracking-wider">Riparimet e Fundit</h3>
            <button 
              onClick={() => navigate('/phonesoftware/repairs')}
              className="text-[12px] text-[#00e6b4]/70 hover:text-[#00e6b4] transition-colors flex items-center gap-1"
            >
              Shiko të gjitha <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          
          {stats?.recent_repairs?.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_repairs.map((repair) => (
                <div 
                  key={repair.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer hover:bg-white/[0.03]"
                  style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  onClick={() => navigate(`/phonesoftware/repairs?id=${repair.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(0,230,180,0.1)' }}
                    >
                      <Wrench className="h-4 w-4 text-[#00e6b4]" />
                    </div>
                    <div>
                      <p className="font-mono font-bold text-white/80 text-[13px]">{repair.ticket_number}</p>
                      <p className="text-[11px] text-white/30">
                        {repair.brand} {repair.model} • {repair.customer_name || 'Pa klient'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-[10px] font-semibold rounded-lg ${getStatusColor(repair.status)}`}>
                      {getStatusLabel(repair.status)}
                    </span>
                    <p className="text-[10px] text-white/20 mt-1">
                      {new Date(repair.created_at).toLocaleDateString('sq-AL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-white/10" />
              <p className="text-white/30 text-[13px]">Nuk ka riparime ende</p>
              <button 
                className="mt-3 px-4 py-2 rounded-xl text-[13px] font-semibold text-[#0c0f1a] transition-all"
                style={{ background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)' }}
                onClick={() => navigate('/phonesoftware/repairs?action=new')}
              >
                Krijo Riparimin e Parë
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repair Status Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold text-white/70 uppercase tracking-wider mb-4">Statusi i Riparimeve</h3>
          <div className="space-y-3">
            {['received', 'in_progress', 'waiting_parts', 'completed', 'delivered'].map((status) => {
              const count = stats?.repairs?.status_counts?.[status] || 0;
              const total = stats?.repairs?.total || 1;
              const percentage = Math.round((count / total) * 100) || 0;
              
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-white/40">{getStatusLabel(status)}</span>
                    <span className="font-mono font-bold text-white/60">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, background: getBarColor(status) }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass-card p-5">
          <h3 className="text-[14px] font-bold text-white/70 uppercase tracking-wider mb-4">Përmbledhje</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, value: stats?.customers?.total || 0, label: 'Klientë', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
              { icon: DollarSign, value: `${stats?.revenue?.total?.toFixed(0) || 0}€`, label: 'Të Ardhura Total', color: '#00e6b4', bg: 'rgba(0,230,180,0.1)' },
              { icon: Package, value: stats?.inventory?.total || 0, label: 'Artikuj në Stok', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
              { icon: Calendar, value: stats?.staff?.total || 0, label: 'Staf', color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl text-center"
                style={{ background: item.bg, border: `1px solid ${item.bg}` }}
              >
                <item.icon className="h-6 w-6 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-[11px] text-white/30 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSDashboard;
