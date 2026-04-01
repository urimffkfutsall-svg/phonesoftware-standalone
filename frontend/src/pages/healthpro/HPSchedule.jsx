import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Stethoscope,
  Pill,
  MapPin,
  User,
  Filter,
  List,
  LayoutGrid,
  CalendarDays,
  Sun,
  Moon
} from 'lucide-react';

const HPSchedule = () => {
  const { user } = useHPAuth();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleData, setScheduleData] = useState({
    checkups: [],
    therapies: [],
    visits: []
  });
  const [filterType, setFilterType] = useState('all');

  const isVisitor = user?.role === 'visitor';

  useEffect(() => {
    loadScheduleData();
  }, [currentDate, viewMode]);

  const loadScheduleData = async () => {
    setLoading(true);
    try {
      const dateStr = formatDate(currentDate);
      let startDate, endDate;

      if (viewMode === 'day') {
        startDate = endDate = dateStr;
      } else if (viewMode === 'week') {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay() + 1); // Monday
        const end = new Date(start);
        end.setDate(end.getDate() + 6); // Sunday
        startDate = formatDate(start);
        endDate = formatDate(end);
      } else {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        startDate = formatDate(start);
        endDate = formatDate(end);
      }

      const [checkups, therapies, visits] = await Promise.all([
        hpApi.get(`/healthpro/checkups?start_date=${startDate}&end_date=${endDate}`),
        hpApi.get(`/healthpro/therapies?active_only=true`),
        hpApi.get(`/healthpro/visits?start_date=${startDate}&end_date=${endDate}`)
      ]);

      setScheduleData({ checkups, therapies, visits });
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Gabim gjatë ngarkimit të orarit');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('sq-AL', options);
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' });
  };

  const getWeekRange = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.getDate()} - ${end.getDate()} ${getMonthName(end)}`;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7));
    } else {
      newDate.setMonth(newDate.getMonth() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get all events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    const events = [];

    // Add checkups
    scheduleData.checkups
      .filter(c => c.scheduled_date === dateStr && c.status === 'planned')
      .forEach(c => {
        events.push({
          id: c.id,
          type: 'checkup',
          title: c.resident_name,
          subtitle: c.checkup_type === 'general' ? 'QKMF' : c.checkup_type,
          time: c.scheduled_time || '09:00',
          color: 'blue',
          icon: Stethoscope,
          details: c
        });
      });

    // Add therapies (recurring daily)
    scheduleData.therapies
      .filter(t => t.is_active && t.start_date <= dateStr && (!t.end_date || t.end_date >= dateStr))
      .forEach(t => {
        (t.administration_time || ['08:00']).forEach(time => {
          events.push({
            id: `${t.id}-${time}`,
            type: 'therapy',
            title: t.name,
            subtitle: t.resident_name,
            time: time,
            color: 'green',
            icon: Pill,
            details: t
          });
        });
      });

    // Add visits
    scheduleData.visits
      .filter(v => v.visit_date === dateStr && !v.is_completed)
      .forEach(v => {
        events.push({
          id: v.id,
          type: 'visit',
          title: v.resident_name,
          subtitle: v.visit_type === 'home' ? 'Vizitë Shtëpi' : 'Vizitë Komunitet',
          time: v.visit_time || '10:00',
          color: 'purple',
          icon: MapPin,
          details: v
        });
      });

    // Filter by type
    const filtered = filterType === 'all' 
      ? events 
      : events.filter(e => e.type === filterType);

    // Sort by time
    return filtered.sort((a, b) => a.time.localeCompare(b.time));
  };

  // Generate week days
  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Generate month calendar
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add padding for days before first of month
    const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Add days of month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add padding after last day
    const endPadding = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const dayNames = ['Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht', 'Die'];

  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
    green: 'bg-green-500/20 text-green-400 border-green-500/50',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
  };

  const typeLabels = {
    checkup: 'Kontroll',
    therapy: 'Terapi',
    visit: 'Vizitë'
  };

  if (loading && scheduleData.checkups.length === 0) {
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
          <h1 className="text-2xl font-bold text-white">Orari</h1>
          <p className="text-gray-400">Kalendari i aktiviteteve të institutit</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">Të gjitha</SelectItem>
              <SelectItem value="checkup">Kontrolla</SelectItem>
              <SelectItem value="therapy">Terapi</SelectItem>
              <SelectItem value="visit">Vizita</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="border-gray-600" onClick={() => navigateDate(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-gray-600" onClick={() => navigateDate(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300" onClick={goToToday}>
                Sot
              </Button>
              <h2 className="text-xl font-semibold text-white ml-4">
                {viewMode === 'day' && formatDisplayDate(currentDate)}
                {viewMode === 'week' && getWeekRange()}
                {viewMode === 'month' && getMonthName(currentDate)}
              </h2>
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="bg-gray-700">
                <TabsTrigger value="day" className="data-[state=active]:bg-[#00a79d]">
                  <Sun className="w-4 h-4 mr-1" />Ditë
                </TabsTrigger>
                <TabsTrigger value="week" className="data-[state=active]:bg-[#00a79d]">
                  <CalendarDays className="w-4 h-4 mr-1" />Javë
                </TabsTrigger>
                <TabsTrigger value="month" className="data-[state=active]:bg-[#00a79d]">
                  <Calendar className="w-4 h-4 mr-1" />Muaj
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-400 text-sm">Kontrolla</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400 text-sm">Terapi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-gray-400 text-sm">Vizita</span>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <DayView events={getEventsForDate(currentDate)} colorClasses={colorClasses} typeLabels={typeLabels} />
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-7 gap-2">
          {getWeekDays().map((day, idx) => {
            const events = getEventsForDate(day);
            const isToday = formatDate(day) === formatDate(new Date());
            return (
              <Card key={idx} className={`bg-gray-800 border-gray-700 ${isToday ? 'ring-2 ring-[#00a79d]' : ''}`}>
                <CardHeader className="p-2 pb-0">
                  <CardTitle className={`text-sm text-center ${isToday ? 'text-[#00a79d]' : 'text-gray-400'}`}>
                    {dayNames[idx]}
                    <span className={`block text-lg ${isToday ? 'text-[#00a79d] font-bold' : 'text-white'}`}>
                      {day.getDate()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-1">
                      {events.map(event => (
                        <div
                          key={event.id}
                          className={`p-2 rounded text-xs border ${colorClasses[event.color]}`}
                        >
                          <p className="font-medium truncate">{event.title}</p>
                          <p className="text-[10px] opacity-75">{event.time}</p>
                        </div>
                      ))}
                      {events.length === 0 && (
                        <p className="text-gray-600 text-xs text-center py-4">Bosh</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getMonthDays().map(({ date, isCurrentMonth }, idx) => {
                const events = getEventsForDate(date);
                const isToday = formatDate(date) === formatDate(new Date());
                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-1 border rounded ${
                      isCurrentMonth ? 'border-gray-700 bg-gray-800/50' : 'border-gray-800 bg-gray-900/30'
                    } ${isToday ? 'ring-2 ring-[#00a79d]' : ''}`}
                  >
                    <p className={`text-sm mb-1 ${
                      isToday ? 'text-[#00a79d] font-bold' : 
                      isCurrentMonth ? 'text-white' : 'text-gray-600'
                    }`}>
                      {date.getDate()}
                    </p>
                    <div className="space-y-0.5">
                      {events.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`px-1 py-0.5 rounded text-[10px] truncate ${colorClasses[event.color]}`}
                          title={`${event.time} - ${event.title}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 3 && (
                        <p className="text-gray-500 text-[10px]">+{events.length - 3} më shumë</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Day View Component
const DayView = ({ events, colorClasses, typeLabels }) => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00

  return (
    <div className="relative">
      {hours.map(hour => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        const hourEvents = events.filter(e => e.time.startsWith(hour.toString().padStart(2, '0')));
        
        return (
          <div key={hour} className="flex border-t border-gray-700 min-h-[60px]">
            <div className="w-16 py-2 text-gray-500 text-sm flex-shrink-0">
              {hourStr}
            </div>
            <div className="flex-1 py-1 px-2">
              <div className="grid gap-1">
                {hourEvents.map(event => {
                  const Icon = event.icon;
                  return (
                    <div
                      key={event.id}
                      className={`p-2 rounded border ${colorClasses[event.color]} flex items-center gap-3`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm opacity-75">{event.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={colorClasses[event.color]}>{typeLabels[event.type]}</Badge>
                        <p className="text-xs mt-1">{event.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
      
      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nuk ka aktivitete të planifikuara për këtë ditë</p>
        </div>
      )}
    </div>
  );
};

export default HPSchedule;
