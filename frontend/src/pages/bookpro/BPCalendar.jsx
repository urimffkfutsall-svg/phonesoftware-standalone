import React, { useState, useEffect, useRef } from 'react';
import { bpApi, useBPAuth } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, User, Scissors
} from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

const BPCalendar = () => {
  const { user } = useBPAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week
  const [appointments, setAppointments] = useState({});
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate, viewMode]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range
      let startDate, endDate;
      if (viewMode === 'day') {
        startDate = currentDate.toISOString().split('T')[0];
        endDate = startDate;
      } else {
        const weekStart = new Date(currentDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
      }

      const [calendarRes, staffRes] = await Promise.all([
        bpApi.get(`/bookpro/appointments/calendar?start_date=${startDate}&end_date=${endDate}`),
        bpApi.get('/bookpro/staff')
      ]);

      setAppointments(calendarRes.data);
      setStaff(staffRes.data);
    } catch (error) {
      toast.error('Gabim gjatë ngarkimit të kalendarit');
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const days = [];
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayAppointments = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    let dayAppts = appointments[dateStr] || [];
    
    if (selectedStaff !== 'all') {
      dayAppts = dayAppts.filter(a => a.stylist_id === selectedStaff);
    }
    
    return dayAppts;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-300';
      default: return 'bg-gray-400';
    }
  };

  const formatDateHeader = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('sq-AL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } else {
      const weekDays = getWeekDays();
      const start = weekDays[0];
      const end = weekDays[6];
      return `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' })}`;
    }
  };

  const renderDayView = () => {
    const dayAppts = getDayAppointments(currentDate);

    return (
      <div className="relative">
        {/* Time Grid */}
        <div className="border-l border-gray-200">
          {HOURS.map((hour) => (
            <div key={hour} className="flex border-b border-gray-100" style={{ height: '80px' }}>
              <div className="w-16 text-xs text-gray-500 text-right pr-2 pt-1 flex-shrink-0">
                {hour}:00
              </div>
              <div className="flex-1 relative">
                {/* Half hour line */}
                <div className="absolute w-full border-b border-gray-50" style={{ top: '40px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Appointments */}
        <div className="absolute top-0 left-16 right-0">
          {dayAppts.map((apt) => {
            const [startHour, startMin] = apt.start_time.split(':').map(Number);
            const [endHour, endMin] = apt.end_time.split(':').map(Number);
            const top = (startHour - 8) * 80 + (startMin / 60) * 80;
            const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 80;

            return (
              <div
                key={apt.id}
                className={`absolute left-1 right-1 rounded-lg p-2 overflow-hidden ${getStatusColor(apt.status)} text-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                style={{ top: `${top}px`, height: `${Math.max(height, 40)}px` }}
                onClick={() => window.location.href = `#/bookpro/app/appointments`}
              >
                <p className="font-medium text-sm truncate">{apt.client_name}</p>
                <p className="text-xs opacity-90 truncate">
                  {apt.start_time} - {apt.end_time}
                </p>
                {height > 50 && (
                  <p className="text-xs opacity-80 truncate mt-1">
                    {apt.services?.map(s => s.service_name).join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();
    const today = new Date().toISOString().split('T')[0];

    return (
      <div className="flex">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0">
          <div className="h-12 border-b border-gray-200" /> {/* Header spacer */}
          {HOURS.map((hour) => (
            <div key={hour} className="text-xs text-gray-500 text-right pr-2" style={{ height: '60px' }}>
              {hour}:00
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="flex-1 flex">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const dayAppts = getDayAppointments(day);

            return (
              <div key={dateStr} className="flex-1 min-w-[100px] border-l border-gray-200">
                {/* Day Header */}
                <div className={`h-12 border-b border-gray-200 text-center py-1 ${isToday ? 'bg-rose-500/10' : ''}`}>
                  <p className="text-xs text-gray-500">
                    {day.toLocaleDateString('sq-AL', { weekday: 'short' })}
                  </p>
                  <p className={`text-sm font-bold ${isToday ? 'text-rose-500' : ''}`}>
                    {day.getDate()}
                  </p>
                </div>

                {/* Time Slots */}
                <div className="relative">
                  {HOURS.map((hour) => (
                    <div key={hour} className="border-b border-gray-50" style={{ height: '60px' }} />
                  ))}

                  {/* Appointments */}
                  {dayAppts.map((apt) => {
                    const [startHour, startMin] = apt.start_time.split(':').map(Number);
                    const [endHour, endMin] = apt.end_time.split(':').map(Number);
                    const top = (startHour - 8) * 60 + (startMin / 60) * 60;
                    const height = ((endHour - startHour) * 60 + (endMin - startMin)) / 60 * 60;

                    return (
                      <div
                        key={apt.id}
                        className={`absolute left-0.5 right-0.5 rounded p-1 overflow-hidden ${getStatusColor(apt.status)} text-white text-xs cursor-pointer`}
                        style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                        title={`${apt.client_name} - ${apt.start_time}`}
                      >
                        <p className="font-medium truncate">{apt.client_name}</p>
                        {height > 30 && (
                          <p className="opacity-80 truncate">{apt.start_time}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" data-testid="bp-calendar-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalendari</h1>
          <p className="text-gray-500">{formatDateHeader()}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Staff Filter */}
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="w-[180px]">
              <User className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Të gjithë" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Të gjithë stilistët</SelectItem>
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={viewMode === 'day' ? 'bg-rose-500' : ''}
            >
              Dita
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-rose-500' : ''}
            >
              Java
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateDate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Sot
          </Button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Konfirmuar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Në proces</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Përfunduar</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              {viewMode === 'day' ? renderDayView() : renderWeekView()}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BPCalendar;
