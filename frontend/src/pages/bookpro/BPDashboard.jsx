import React, { useState, useEffect } from 'react';
import { useBPAuth, bpApi } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Scissors,
  UserPlus
} from 'lucide-react';

const BPDashboard = () => {
  const { user } = useBPAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, appointmentsRes] = await Promise.all([
        bpApi.get('/bookpro/dashboard/stats'),
        bpApi.get('/bookpro/appointments/today')
      ]);
      setStats(statsRes.data);
      setTodayAppointments(appointmentsRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Gabim gjatë ngarkimit të dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Në pritje';
      case 'confirmed': return 'Konfirmuar';
      case 'in_progress': return 'Në proces';
      case 'completed': return 'Përfunduar';
      case 'cancelled': return 'Anuluar';
      case 'no_show': return 'Nuk erdhi';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="bp-dashboard">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-xl p-6 text-white shadow-lg shadow-rose-500/20">
        <h1 className="text-2xl font-bold mb-1">
          Mirë se vini, {user?.full_name}! 👋
        </h1>
        <p className="text-white/80">
          Ja një përmbledhje e ditës suaj
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rezervimet Sot</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.today_appointments || 0}</p>
              </div>
              <div className="h-12 w-12 bg-rose-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Të Ardhura Sot</p>
                <p className="text-3xl font-bold text-gray-800">€{stats?.today_revenue?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rezervime Javës</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.week_appointments || 0}</p>
              </div>
              <div className="h-12 w-12 bg-pink-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-pink-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Klientë</p>
                <p className="text-3xl font-bold text-gray-800">{stats?.total_clients || 0}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.pending_appointments || 0}</p>
                <p className="text-sm text-gray-500">Në pritje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.completed_today || 0}</p>
                <p className="text-sm text-gray-500">Përfunduar sot</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#00a79d]/10 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-[#00a79d]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.new_clients_this_month || 0}</p>
                <p className="text-sm text-gray-500">Klientë të rinj (muaji)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#00a79d]" />
            Rezervimet e Sotme
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => window.location.href = '#/bookpro/app/calendar'}>
            Shiko Kalendarin
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mb-4 opacity-50" />
                <p>Nuk ka rezervime për sot</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-lg font-bold text-[#00a79d]">{apt.start_time}</p>
                      <p className="text-xs text-gray-500">{apt.end_time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{apt.client_name || 'Klient i panjohur'}</p>
                      <p className="text-sm text-gray-500">
                        {apt.services?.map(s => s.service_name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        <Scissors className="h-3 w-3 inline mr-1" />
                        {apt.stylist_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">€{apt.total_price?.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Month Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistikat Mujore</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rezervime këtë muaj</span>
                <span className="font-bold text-xl">{stats?.month_appointments || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Të ardhura këtë muaj</span>
                <span className="font-bold text-xl text-green-600">€{stats?.month_revenue?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Të ardhura javore</span>
                <span className="font-bold text-xl">€{stats?.week_revenue?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#00a79d]/5 to-[#00c4b4]/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#00a79d]" />
              Veprime të Shpejta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => window.location.href = '#/bookpro/app/appointments'}
              >
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Rezervim i Ri</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => window.location.href = '#/bookpro/app/clients'}
              >
                <UserPlus className="h-5 w-5" />
                <span className="text-xs">Klient i Ri</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => window.location.href = '#/bookpro/app/calendar'}
              >
                <Clock className="h-5 w-5" />
                <span className="text-xs">Kalendari</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2"
                onClick={() => window.location.href = '#/bookpro/app/services'}
              >
                <Scissors className="h-5 w-5" />
                <span className="text-xs">Shërbimet</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BPDashboard;
