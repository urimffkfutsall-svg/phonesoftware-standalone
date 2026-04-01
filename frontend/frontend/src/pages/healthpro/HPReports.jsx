import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Users,
  Stethoscope,
  Pill,
  MapPin,
  Clock,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Filter,
  Printer
} from 'lucide-react';

const HPReports = () => {
  const { user } = useHPAuth();
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('residents');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Report data
  const [reportData, setReportData] = useState(null);
  const [stats, setStats] = useState({
    residents: 0,
    employees: 0,
    checkups: 0,
    therapies: 0,
    visits: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    generateReport();
  }, [activeReport, dateRange, selectedMonth, selectedYear]);

  const loadStats = async () => {
    try {
      const dashData = await hpApi.get('/healthpro/dashboard/stats');
      setStats(dashData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (activeReport) {
        case 'residents':
          data = await hpApi.get('/healthpro/residents');
          break;
        case 'employees':
          data = await hpApi.get('/healthpro/employees');
          break;
        case 'checkups':
          data = await hpApi.get(`/healthpro/checkups?start_date=${dateRange.start}&end_date=${dateRange.end}`);
          break;
        case 'therapies':
          data = await hpApi.get('/healthpro/therapies?active_only=false');
          break;
        case 'visits':
          data = await hpApi.get(`/healthpro/visits?start_date=${dateRange.start}&end_date=${dateRange.end}`);
          break;
        case 'overtime':
          data = await hpApi.get(`/healthpro/overtime/monthly-report?month=${selectedMonth}&year=${selectedYear}`);
          break;
        default:
          data = [];
      }
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Gabim gjatë gjenerimit të raportit');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = '';
    let data = activeReport === 'overtime' ? reportData.employees : reportData;
    
    if (!data || data.length === 0) {
      toast.error('Nuk ka të dhëna për eksport');
      return;
    }

    // Get headers from first item
    const headers = Object.keys(data[0]).filter(k => !k.includes('_id') && k !== 'id');
    csvContent += headers.join(',') + '\n';

    // Add rows
    data.forEach(item => {
      const row = headers.map(h => {
        let val = item[h];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
        return val;
      });
      csvContent += row.join(',') + '\n';
    });

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `healthpro_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Raporti u eksportua në CSV');
  };

  const exportToPDF = () => {
    // Create printable content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Ju lutem lejoni popup-et për këtë faqe');
      return;
    }

    const data = activeReport === 'overtime' ? reportData?.employees : reportData;
    if (!data || data.length === 0) {
      toast.error('Nuk ka të dhëna për eksport');
      printWindow.close();
      return;
    }

    const reportTitles = {
      residents: 'Raporti i Rezidentëve',
      employees: 'Raporti i Punonjësve',
      checkups: 'Raporti i Kontrollave Mjekësore',
      therapies: 'Raporti i Terapive',
      visits: 'Raporti i Vizitave',
      overtime: 'Raporti i Orëve Shtesë'
    };

    let tableHTML = '';
    const headers = Object.keys(data[0]).filter(k => !k.includes('_id') && k !== 'id' && k !== 'tenant_id');
    
    tableHTML += '<table style="width:100%; border-collapse: collapse; font-size: 12px;"><thead><tr>';
    headers.forEach(h => {
      tableHTML += `<th style="border: 1px solid #ddd; padding: 8px; background: #00a79d; color: white;">${h}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    data.forEach(item => {
      tableHTML += '<tr>';
      headers.forEach(h => {
        let val = item[h];
        if (val === null || val === undefined) val = '';
        if (Array.isArray(val)) val = val.join(', ');
        tableHTML += `<td style="border: 1px solid #ddd; padding: 6px;">${val}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitles[activeReport]}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #00a79d; margin-bottom: 5px; }
          .meta { color: #666; margin-bottom: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>HealthPRO - ${reportTitles[activeReport]}</h1>
        <p class="meta">Gjeneruar më: ${new Date().toLocaleDateString('sq-AL')} | Totali: ${data.length} regjistrime</p>
        ${tableHTML}
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    toast.success('Raporti u hap për printim/PDF');
  };

  const reportTypes = [
    { id: 'residents', label: 'Rezidentët', icon: Users, color: 'text-blue-400' },
    { id: 'employees', label: 'Punonjësit', icon: Users, color: 'text-green-400' },
    { id: 'checkups', label: 'Kontrollat', icon: Stethoscope, color: 'text-purple-400' },
    { id: 'therapies', label: 'Terapitë', icon: Pill, color: 'text-orange-400' },
    { id: 'visits', label: 'Vizitat', icon: MapPin, color: 'text-pink-400' },
    { id: 'overtime', label: 'Orët Shtesë', icon: Clock, color: 'text-yellow-400' }
  ];

  const getReportSummary = () => {
    if (!reportData) return null;
    
    const data = activeReport === 'overtime' ? reportData.employees : reportData;
    if (!data) return null;

    switch (activeReport) {
      case 'residents':
        return {
          total: data.length,
          active: data.filter(r => r.status === 'active').length,
          byGender: {
            male: data.filter(r => r.gender === 'male').length,
            female: data.filter(r => r.gender === 'female').length
          }
        };
      case 'employees':
        return {
          total: data.length,
          active: data.filter(e => e.status === 'active').length,
          byRole: data.reduce((acc, e) => {
            acc[e.role] = (acc[e.role] || 0) + 1;
            return acc;
          }, {})
        };
      case 'checkups':
        return {
          total: data.length,
          completed: data.filter(c => c.status === 'completed').length,
          planned: data.filter(c => c.status === 'planned').length,
          cancelled: data.filter(c => c.status === 'cancelled').length
        };
      case 'therapies':
        return {
          total: data.length,
          active: data.filter(t => t.is_active).length,
          byType: data.reduce((acc, t) => {
            acc[t.therapy_type] = (acc[t.therapy_type] || 0) + 1;
            return acc;
          }, {})
        };
      case 'visits':
        return {
          total: data.length,
          completed: data.filter(v => v.is_completed).length,
          home: data.filter(v => v.visit_type === 'home').length,
          community: data.filter(v => v.visit_type === 'community').length
        };
      case 'overtime':
        return {
          totalEmployees: data.length,
          totalHours: reportData.totals?.total_overtime_hours || 0,
          totalPay: reportData.totals?.total_overtime_pay || 0
        };
      default:
        return null;
    }
  };

  const summary = getReportSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Raportet</h1>
          <p className="text-gray-400">Gjeneroni dhe eksportoni raporte</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <FileSpreadsheet className="w-4 h-4 mr-2" />Export CSV
          </Button>
          <Button onClick={exportToPDF} className="bg-[#00a79d] hover:bg-[#008f86]">
            <Printer className="w-4 h-4 mr-2" />Print / PDF
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.residents || 0}</p>
            <p className="text-gray-400 text-xs">Rezidentë</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.employees || 0}</p>
            <p className="text-gray-400 text-xs">Punonjës</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Stethoscope className="w-6 h-6 mx-auto text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.checkups || 0}</p>
            <p className="text-gray-400 text-xs">Kontrolla</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <Pill className="w-6 h-6 mx-auto text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.therapies || 0}</p>
            <p className="text-gray-400 text-xs">Terapi</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4 text-center">
            <MapPin className="w-6 h-6 mx-auto text-pink-400 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.visits || 0}</p>
            <p className="text-gray-400 text-xs">Vizita</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {reportTypes.map(report => {
          const Icon = report.icon;
          const isActive = activeReport === report.id;
          return (
            <Card
              key={report.id}
              className={`bg-gray-800 border-gray-700 cursor-pointer transition-all hover:border-[#00a79d] ${
                isActive ? 'ring-2 ring-[#00a79d] border-[#00a79d]' : ''
              }`}
              onClick={() => setActiveReport(report.id)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${isActive ? 'text-[#00a79d]' : report.color}`} />
                <p className={`text-sm font-medium ${isActive ? 'text-[#00a79d]' : 'text-white'}`}>{report.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {activeReport === 'overtime' ? (
              <>
                <div>
                  <Label className="text-gray-400 text-xs">Muaji</Label>
                  <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                    <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor'].map((m, i) => (
                        <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Viti</Label>
                  <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                    <SelectTrigger className="w-[100px] bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {[2024, 2025, 2026, 2027].map(y => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (activeReport === 'checkups' || activeReport === 'visits') ? (
              <>
                <div>
                  <Label className="text-gray-400 text-xs">Nga Data</Label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-[150px] bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-xs">Deri në Datë</Label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-[150px] bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-sm">Ky raport tregon të gjitha të dhënat aktuale</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      {summary && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00a79d]" />
              Përmbledhja e Raportit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {activeReport === 'residents' && (
                <>
                  <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                    <p className="text-gray-400 text-xs">Totali</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">{summary.active}</p>
                    <p className="text-gray-400 text-xs">Aktivë</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary.byGender?.male || 0}</p>
                    <p className="text-gray-400 text-xs">Meshkuj</p>
                  </div>
                  <div className="bg-pink-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-pink-400">{summary.byGender?.female || 0}</p>
                    <p className="text-gray-400 text-xs">Femra</p>
                  </div>
                </>
              )}
              {activeReport === 'checkups' && (
                <>
                  <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                    <p className="text-gray-400 text-xs">Totali</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">{summary.completed}</p>
                    <p className="text-gray-400 text-xs">Përfunduara</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary.planned}</p>
                    <p className="text-gray-400 text-xs">Planifikuara</p>
                  </div>
                  <div className="bg-red-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-400">{summary.cancelled}</p>
                    <p className="text-gray-400 text-xs">Anuluara</p>
                  </div>
                </>
              )}
              {activeReport === 'overtime' && (
                <>
                  <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{summary.totalEmployees}</p>
                    <p className="text-gray-400 text-xs">Punonjës</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary.totalHours}h</p>
                    <p className="text-gray-400 text-xs">Total Orë</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center col-span-2">
                    <p className="text-2xl font-bold text-green-400">€{summary.totalPay}</p>
                    <p className="text-gray-400 text-xs">Total Pagë Shtesë</p>
                  </div>
                </>
              )}
              {activeReport === 'visits' && (
                <>
                  <div className="bg-gray-700/50 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{summary.total}</p>
                    <p className="text-gray-400 text-xs">Totali</p>
                  </div>
                  <div className="bg-green-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">{summary.completed}</p>
                    <p className="text-gray-400 text-xs">Përfunduara</p>
                  </div>
                  <div className="bg-blue-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-400">{summary.home}</p>
                    <p className="text-gray-400 text-xs">Në Shtëpi</p>
                  </div>
                  <div className="bg-purple-500/10 p-3 rounded-lg text-center">
                    <p className="text-2xl font-bold text-purple-400">{summary.community}</p>
                    <p className="text-gray-400 text-xs">Në Komunitet</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Preview */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00a79d]" />
            Paraqitja e të Dhënave
            {reportData && (
              <Badge className="bg-[#00a79d]/20 text-[#00a79d] ml-2">
                {activeReport === 'overtime' ? reportData.employees?.length : reportData.length} regjistrime
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[#00a79d] border-t-transparent rounded-full" />
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              {reportData && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {Object.keys((activeReport === 'overtime' ? reportData.employees?.[0] : reportData[0]) || {})
                        .filter(k => !k.includes('_id') && k !== 'id' && k !== 'tenant_id')
                        .slice(0, 6)
                        .map(header => (
                          <th key={header} className="text-left py-2 px-3 text-gray-400 font-medium">
                            {header.replace(/_/g, ' ')}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(activeReport === 'overtime' ? reportData.employees : reportData)?.slice(0, 20).map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                        {Object.entries(item)
                          .filter(([k]) => !k.includes('_id') && k !== 'id' && k !== 'tenant_id')
                          .slice(0, 6)
                          .map(([key, value], i) => (
                            <td key={i} className="py-2 px-3 text-white">
                              {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {(!reportData || (activeReport === 'overtime' ? !reportData.employees?.length : !reportData.length)) && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nuk ka të dhëna për këtë raport</p>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HPReports;
