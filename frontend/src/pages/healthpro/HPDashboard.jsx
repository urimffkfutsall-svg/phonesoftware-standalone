import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { hpApi, useHPAuth } from './HPLayout';
import { toast } from 'sonner';
import {
  Users,
  Stethoscope,
  Pill,
  Home,
  Building2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Clock,
  ChevronRight,
  Activity,
  HeartPulse
} from 'lucide-react';

const HPDashboard = () => {
  const { user } = useHPAuth();
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, notifRes] = await Promise.all([
        hpApi.get('/healthpro/dashboard/stats'),
        hpApi.get('/healthpro/notifications/dashboard')
      ]);
      setStats(statsRes);
      setNotifications(notifRes);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Rezidentë Aktivë',
      value: stats?.residents?.active || 0,
      icon: Users,
      color: 'from-[#00a79d] to-[#00c4b4]',
      link: '/healthpro/residents'
    },
    {
      title: 'Kontrolla të Planifikuara',
      value: stats?.checkups?.upcoming || 0,
      icon: Stethoscope,
      color: 'from-blue-500 to-blue-600',
      link: '/healthpro/checkups'
    },
    {
      title: 'Terapi Aktive',
      value: stats?.therapies?.active || 0,
      icon: Pill,
      color: 'from-purple-500 to-purple-600',
      link: '/healthpro/therapies'
    },
    {
      title: 'Vizita Këtë Javë',
      value: stats?.visits?.this_week || 0,
      icon: Home,
      color: 'from-orange-500 to-orange-600',
      link: '/healthpro/visits'
    },
    {
      title: 'Punëtorë Aktivë',
      value: stats?.employees?.active || 0,
      icon: Building2,
      color: 'from-pink-500 to-pink-600',
      link: '/healthpro/employees'
    },
    {
      title: 'Vizita në Pritje',
      value: stats?.visits?.pending || 0,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      link: '/healthpro/visits'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#00a79d] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Mirë se vini, {user?.full_name}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={loadDashboard}
          >
            <Activity className="w-4 h-4 mr-2" />
            Rifresko
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.title}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-3 text-sm text-gray-500 group-hover:text-[#00a79d] transition-colors">
                  <span>Shiko detajet</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Notifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#00a79d]" />
              Njoftimet & Kujtimet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <HeartPulse className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nuk ka njoftime të reja</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map((notif, index) => (
                    <div 
                      key={index} 
                      className={`p-4 hover:bg-gray-750 transition-colors ${
                        notif.priority === 'high' ? 'border-l-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          notif.type === 'checkup_reminder' 
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {notif.type === 'checkup_reminder' ? (
                            <Stethoscope className="w-4 h-4" />
                          ) : (
                            <Home className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium">{notif.title}</p>
                          <p className="text-gray-400 text-sm truncate">{notif.message}</p>
                          <p className="text-gray-500 text-xs mt-1">{notif.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00a79d]" />
              Veprime të Shpejta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/healthpro/residents">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Users className="w-6 h-6" />
                  <span className="text-xs">Shto Rezident</span>
                </Button>
              </Link>
              <Link to="/healthpro/checkups">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Stethoscope className="w-6 h-6" />
                  <span className="text-xs">Cakto Kontrollë</span>
                </Button>
              </Link>
              <Link to="/healthpro/therapies">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Pill className="w-6 h-6" />
                  <span className="text-xs">Shto Terapi</span>
                </Button>
              </Link>
              <Link to="/healthpro/visits">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Home className="w-6 h-6" />
                  <span className="text-xs">Planifiko Vizitë</span>
                </Button>
              </Link>
              <Link to="/healthpro/employees">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Building2 className="w-6 h-6" />
                  <span className="text-xs">Shto Punëtor</span>
                </Button>
              </Link>
              <Link to="/healthpro/reports">
                <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-[#00a79d]">
                  <Calendar className="w-6 h-6" />
                  <span className="text-xs">Gjenero Raport</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Residents Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Përmbledhje Rezidentësh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total</span>
                <span className="text-white font-bold">{stats?.residents?.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Aktivë</span>
                <span className="text-green-400">{stats?.residents?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Joaktivë</span>
                <span className="text-gray-500">{stats?.residents?.inactive || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkups Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Kontrolla Këtë Muaj</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Totali</span>
                <span className="text-white font-bold">{stats?.checkups?.this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Të Planifikuara</span>
                <span className="text-blue-400">{stats?.checkups?.upcoming || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visits Summary */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Vizita Këtë Muaj</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Totali</span>
                <span className="text-white font-bold">{stats?.visits?.this_month || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Në Pritje</span>
                <span className="text-yellow-400">{stats?.visits?.pending || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HPDashboard;
