import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Moon,
  Sun,
  Calendar,
  Eye,
  EyeOff,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Filter,
  Settings,
  Percent,
  Save
} from 'lucide-react';

const HPEmployees = () => {
  const { user } = useHPAuth();
  const [employees, setEmployees] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('employees');
  
  // Employee Dialog
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    first_name: '', last_name: '', username: '', password: '',
    email: '', phone: '', role: 'caregiver', department: '',
    position: '', salary: '', contract_type: 'full-time'
  });

  // Salary Edit Dialog
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [salaryEditEmployee, setSalaryEditEmployee] = useState(null);
  const [newSalary, setNewSalary] = useState('');

  // Visitor Dialog
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    full_name: '', username: '', password: '', email: '', notes: ''
  });

  // Overtime Dialog
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [overtimeEntries, setOvertimeEntries] = useState([]);
  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split('T')[0],
    overtime_type: 'normal',
    hours: '',
    notes: '',
    custom_coefficient: ''
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlySummary, setMonthlySummary] = useState(null);

  // Coefficients Settings Dialog
  const [showCoefficientsDialog, setShowCoefficientsDialog] = useState(false);
  const [coefficients, setCoefficients] = useState({
    normal: 1.25,
    night: 1.5,
    weekend: 1.5,
    holiday: 2.0
  });
  const [useCustomCoefficient, setUseCustomCoefficient] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isVisitor = user?.role === 'visitor';

  useEffect(() => {
    loadData();
    loadCoefficients();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, visRes] = await Promise.all([
        hpApi.get('/healthpro/employees'),
        isAdmin ? hpApi.get('/healthpro/visitors') : Promise.resolve([])
      ]);
      setEmployees(empRes);
      setVisitors(visRes);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  };

  const loadCoefficients = async () => {
    try {
      const coefs = await hpApi.get('/healthpro/overtime/coefficients');
      setCoefficients(coefs);
    } catch (error) {
      console.error('Error loading coefficients:', error);
    }
  };

  const handleSaveCoefficients = async () => {
    try {
      await hpApi.put('/healthpro/overtime/coefficients', coefficients);
      toast.success('Koeficientët u ruajtën me sukses');
      setShowCoefficientsDialog(false);
    } catch (error) {
      toast.error(error.message || 'Gabim gjatë ruajtjes');
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...employeeForm,
        salary: employeeForm.salary ? parseFloat(employeeForm.salary) : null
      };
      if (editingEmployee) {
        await hpApi.put(`/healthpro/employees/${editingEmployee.id}`, submitData);
        toast.success('Punëtori u përditësua');
      } else {
        await hpApi.post('/healthpro/employees', submitData);
        toast.success('Punëtori u shtua');
      }
      setShowEmployeeDialog(false);
      resetEmployeeForm();
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleSalaryUpdate = async () => {
    if (!salaryEditEmployee) return;
    try {
      await hpApi.put(`/healthpro/employees/${salaryEditEmployee.id}`, {
        salary: parseFloat(newSalary) || 0
      });
      toast.success('Paga u përditësua me sukses');
      setShowSalaryDialog(false);
      setSalaryEditEmployee(null);
      setNewSalary('');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim gjatë përditësimit të pagës');
    }
  };

  const openSalaryDialog = (emp) => {
    setSalaryEditEmployee(emp);
    setNewSalary(emp.salary || '');
    setShowSalaryDialog(true);
  };

  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      await hpApi.post('/healthpro/visitors', visitorForm);
      toast.success('Vizitori u krijua');
      setShowVisitorDialog(false);
      setVisitorForm({ full_name: '', username: '', password: '', email: '', notes: '' });
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni të çaktivizoni këtë punëtor?')) return;
    try {
      await hpApi.delete(`/healthpro/employees/${id}`);
      toast.success('Punëtori u çaktivizua');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleToggleVisitor = async (id, currentStatus) => {
    try {
      await hpApi.put(`/healthpro/visitors/${id}/toggle-status`);
      toast.success(currentStatus ? 'Vizitori u çaktivizua' : 'Vizitori u aktivizua');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (!window.confirm('Jeni të sigurt që doni të fshini këtë vizitor?')) return;
    try {
      await hpApi.delete(`/healthpro/visitors/${id}`);
      toast.success('Vizitori u fshi');
      loadData();
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const openOvertimeDialog = async (employee) => {
    setSelectedEmployee(employee);
    setShowOvertimeDialog(true);
    setUseCustomCoefficient(false);
    setOvertimeForm({
      date: new Date().toISOString().split('T')[0],
      overtime_type: 'normal',
      hours: '',
      notes: '',
      custom_coefficient: ''
    });
    await loadOvertimeData(employee.id);
  };

  const loadOvertimeData = async (employeeId) => {
    try {
      const [entries, summary] = await Promise.all([
        hpApi.get(`/healthpro/overtime?employee_id=${employeeId}&month=${selectedMonth}&year=${selectedYear}`),
        hpApi.get(`/healthpro/overtime/summary/${employeeId}?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      setOvertimeEntries(entries);
      setMonthlySummary(summary);
    } catch (error) {
      console.error('Error loading overtime:', error);
    }
  };

  const handleOvertimeSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        employee_id: selectedEmployee.id,
        date: overtimeForm.date,
        overtime_type: overtimeForm.overtime_type,
        hours: parseFloat(overtimeForm.hours),
        notes: overtimeForm.notes
      };
      
      // If using custom coefficient, include it
      if (useCustomCoefficient && overtimeForm.custom_coefficient) {
        payload.custom_coefficient = parseFloat(overtimeForm.custom_coefficient);
      }
      
      await hpApi.post('/healthpro/overtime', payload);
      toast.success('Orët shtesë u regjistruan');
      setOvertimeForm({ 
        date: new Date().toISOString().split('T')[0], 
        overtime_type: 'normal', 
        hours: '', 
        notes: '',
        custom_coefficient: ''
      });
      setUseCustomCoefficient(false);
      loadOvertimeData(selectedEmployee.id);
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const handleDeleteOvertime = async (id) => {
    try {
      await hpApi.delete(`/healthpro/overtime/${id}`);
      toast.success('Regjistrimi u fshi');
      loadOvertimeData(selectedEmployee.id);
    } catch (error) {
      toast.error(error.message || 'Gabim');
    }
  };

  const resetEmployeeForm = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      first_name: '', last_name: '', username: '', password: '',
      email: '', phone: '', role: 'caregiver', department: '',
      position: '', salary: '', contract_type: 'full-time'
    });
  };

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      first_name: emp.first_name || '',
      last_name: emp.last_name || '',
      username: emp.username || '',
      password: '',
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || 'caregiver',
      department: emp.department || '',
      position: emp.position || '',
      salary: emp.salary || '',
      contract_type: emp.contract_type || 'full-time'
    });
    setShowEmployeeDialog(true);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.first_name} ${emp.last_name} ${emp.username}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
    return matchesSearch && matchesRole && emp.role !== 'visitor';
  });

  const roleLabels = {
    admin: 'Administrator',
    doctor: 'Mjek',
    nurse: 'Infermier/e',
    caregiver: 'Kujdestar/e',
    therapist: 'Terapist',
    support: 'Mbështetje',
    visitor: 'Vizitor'
  };

  const overtimeTypeLabels = {
    normal: 'Normale',
    night: 'Natë',
    weekend: 'Fundjavë',
    holiday: 'Festë'
  };

  const overtimeTypeColors = {
    normal: 'bg-blue-500/20 text-blue-400',
    night: 'bg-purple-500/20 text-purple-400',
    weekend: 'bg-orange-500/20 text-orange-400',
    holiday: 'bg-red-500/20 text-red-400'
  };

  // Get current coefficient for selected overtime type
  const getCurrentCoefficient = () => {
    if (useCustomCoefficient && overtimeForm.custom_coefficient) {
      return parseFloat(overtimeForm.custom_coefficient);
    }
    return coefficients[overtimeForm.overtime_type] || 1.25;
  };

  // Calculate preview pay
  const calculatePreviewPay = () => {
    if (!selectedEmployee?.salary || !overtimeForm.hours) return 0;
    const hourlyRate = selectedEmployee.salary / 176;
    const coef = getCurrentCoefficient();
    return (parseFloat(overtimeForm.hours) * hourlyRate * coef).toFixed(2);
  };

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
          <h1 className="text-2xl font-bold text-white">Menaxhimi i Stafit</h1>
          <p className="text-gray-400">Punëtorët dhe vizitorët e institutit</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowCoefficientsDialog(true)} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Settings className="w-4 h-4 mr-2" />Koeficientët
            </Button>
            <Button onClick={() => { resetEmployeeForm(); setShowEmployeeDialog(true); }} className="bg-[#00a79d] hover:bg-[#008f86]">
              <Plus className="w-4 h-4 mr-2" />Shto Punëtor
            </Button>
            <Button onClick={() => setShowVisitorDialog(true)} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <Eye className="w-4 h-4 mr-2" />Shto Vizitor
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="employees" className="data-[state=active]:bg-[#00a79d]">
            <Users className="w-4 h-4 mr-2" />Punëtorët ({filteredEmployees.length})
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="visitors" className="data-[state=active]:bg-[#00a79d]">
              <Eye className="w-4 h-4 mr-2" />Vizitorët ({visitors.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="mt-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Kërko punëtor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtro sipas rolit" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">Të gjitha rolet</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="doctor">Mjek</SelectItem>
                <SelectItem value="nurse">Infermier/e</SelectItem>
                <SelectItem value="caregiver">Kujdestar/e</SelectItem>
                <SelectItem value="therapist">Terapist</SelectItem>
                <SelectItem value="support">Mbështetje</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee List */}
          <div className="grid gap-4">
            {filteredEmployees.map((emp) => (
              <Card key={emp.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#00a79d]/20 rounded-full flex items-center justify-center">
                        <span className="text-[#00a79d] font-bold text-lg">
                          {emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{emp.first_name} {emp.last_name}</h3>
                        <p className="text-gray-400 text-sm">@{emp.username}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${emp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {emp.status === 'active' ? 'Aktiv' : 'Joaktiv'}
                          </Badge>
                          <Badge className="bg-gray-700 text-gray-300">{roleLabels[emp.role] || emp.role}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                      <div className="text-sm text-gray-400">
                        {emp.department && <p>Departamenti: {emp.department}</p>}
                        <div className="flex items-center gap-2">
                          <span className="text-[#00a79d] font-medium">Paga: €{emp.salary || 0}</span>
                          {isAdmin && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-gray-400 hover:text-[#00a79d]"
                              onClick={() => openSalaryDialog(emp)}
                              data-testid={`edit-salary-btn-${emp.id}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {!isVisitor && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => openOvertimeDialog(emp)}
                            data-testid={`overtime-btn-${emp.id}`}
                          >
                            <Clock className="w-4 h-4 mr-1" />Orë Shtesë
                          </Button>
                          {isAdmin && (
                            <>
                              <Button size="sm" variant="outline" className="border-gray-600" onClick={() => openEditEmployee(emp)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20" onClick={() => handleDeleteEmployee(emp.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredEmployees.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">Nuk u gjetën punëtorë</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Visitors Tab */}
        {isAdmin && (
          <TabsContent value="visitors" className="mt-4">
            <Card className="bg-gray-800 border-gray-700 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#00a79d] mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium">Çfarë është roli Vizitor?</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Vizitorët janë përdorues me qasje vetëm për lexim (read-only). Ata mund të shohin të dhënat
                      e rezidentëve, kontrollave, dhe raporteve, por nuk mund të bëjnë asnjë ndryshim.
                      Ideale për mbikëqyrës, auditorë, ose familjarë të autorizuar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {visitors.map((vis) => (
                <Card key={vis.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${vis.is_active ? 'bg-purple-500/20' : 'bg-gray-700'}`}>
                          {vis.is_active ? <Eye className="w-6 h-6 text-purple-400" /> : <EyeOff className="w-6 h-6 text-gray-500" />}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{vis.full_name}</h3>
                          <p className="text-gray-400 text-sm">@{vis.username}</p>
                          <Badge className={vis.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {vis.is_active ? 'Aktiv' : 'Çaktivizuar'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={vis.is_active ? 'border-orange-600 text-orange-400' : 'border-green-600 text-green-400'}
                          onClick={() => handleToggleVisitor(vis.id, vis.is_active)}
                        >
                          {vis.is_active ? 'Çaktivizo' : 'Aktivizo'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                          onClick={() => handleDeleteVisitor(vis.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {vis.notes && <p className="text-gray-500 text-sm mt-2 ml-16">{vis.notes}</p>}
                  </CardContent>
                </Card>
              ))}

              {visitors.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="py-12 text-center">
                    <Eye className="w-12 h-12 mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-400">Nuk ka vizitorë të regjistruar</p>
                    <Button onClick={() => setShowVisitorDialog(true)} className="mt-4 bg-[#00a79d] hover:bg-[#008f86]">
                      <Plus className="w-4 h-4 mr-2" />Shto Vizitorin e Parë
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Coefficients Settings Dialog */}
      <Dialog open={showCoefficientsDialog} onOpenChange={setShowCoefficientsDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00a79d]" />
              Cilësimet e Koeficientëve të Orëve Shtesë
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Vendosni përqindjet për llojet e ndryshme të orëve shtesë
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Sun className="w-4 h-4 text-blue-400" />
                  Orë Shtesë Normale
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={coefficients.normal}
                    onChange={(e) => setCoefficients({...coefficients, normal: parseFloat(e.target.value) || 1})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-gray-400">× paga/orë</span>
                </div>
                <p className="text-xs text-gray-500">Aktuale: {((coefficients.normal - 1) * 100).toFixed(0)}% shtesë</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Moon className="w-4 h-4 text-purple-400" />
                  Orë Nate (22:00-06:00)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={coefficients.night}
                    onChange={(e) => setCoefficients({...coefficients, night: parseFloat(e.target.value) || 1})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-gray-400">× paga/orë</span>
                </div>
                <p className="text-xs text-gray-500">Aktuale: {((coefficients.night - 1) * 100).toFixed(0)}% shtesë</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Fundjavë (Shtunë/Diel)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={coefficients.weekend}
                    onChange={(e) => setCoefficients({...coefficients, weekend: parseFloat(e.target.value) || 1})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-gray-400">× paga/orë</span>
                </div>
                <p className="text-xs text-gray-500">Aktuale: {((coefficients.weekend - 1) * 100).toFixed(0)}% shtesë</p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  Festa Zyrtare
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={coefficients.holiday}
                    onChange={(e) => setCoefficients({...coefficients, holiday: parseFloat(e.target.value) || 1})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <span className="text-gray-400">× paga/orë</span>
                </div>
                <p className="text-xs text-gray-500">Aktuale: {((coefficients.holiday - 1) * 100).toFixed(0)}% shtesë</p>
              </div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg mt-4">
              <h4 className="text-white text-sm font-medium mb-2">Shembull Llogaritjeje:</h4>
              <p className="text-gray-400 text-sm">
                Paga mujore: €800 → Paga për orë: €{(800/176).toFixed(2)}<br />
                3 orë normale: 3 × €{(800/176).toFixed(2)} × {coefficients.normal} = <span className="text-[#00a79d] font-medium">€{(3 * (800/176) * coefficients.normal).toFixed(2)}</span>
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="border-gray-600" onClick={() => setShowCoefficientsDialog(false)}>Anulo</Button>
            <Button onClick={handleSaveCoefficients} className="bg-[#00a79d] hover:bg-[#008f86]">
              <Save className="w-4 h-4 mr-2" />Ruaj Koeficientët
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Salary Edit Dialog */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#00a79d]" />
              Ndrysho Pagën - {salaryEditEmployee?.first_name} {salaryEditEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-300">Paga Aktuale</Label>
              <p className="text-2xl font-bold text-gray-400">€{salaryEditEmployee?.salary || 0}</p>
            </div>
            <div>
              <Label className="text-gray-300">Paga e Re (€/muaj)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white text-lg"
                placeholder="0.00"
              />
            </div>
            {newSalary && (
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <p className="text-gray-400 text-sm">
                  Paga për orë: <span className="text-white font-medium">€{(parseFloat(newSalary) / 176).toFixed(2)}</span>
                  <span className="text-gray-500 ml-2">(bazuar në 176 orë/muaj)</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="border-gray-600" onClick={() => setShowSalaryDialog(false)}>Anulo</Button>
            <Button onClick={handleSalaryUpdate} className="bg-[#00a79d] hover:bg-[#008f86]">
              <Save className="w-4 h-4 mr-2" />Ruaj Pagën
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Dialog */}
      <Dialog open={showEmployeeDialog} onOpenChange={setShowEmployeeDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editingEmployee ? 'Edito Punëtorin' : 'Shto Punëtor të Ri'}</DialogTitle>
            <DialogDescription className="text-gray-400">Plotësoni të dhënat e punëtorit</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmployeeSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Emri *</Label>
                <Input value={employeeForm.first_name} onChange={(e) => setEmployeeForm({...employeeForm, first_name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label className="text-gray-300">Mbiemri *</Label>
                <Input value={employeeForm.last_name} onChange={(e) => setEmployeeForm({...employeeForm, last_name: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Username *</Label>
                <Input value={employeeForm.username} onChange={(e) => setEmployeeForm({...employeeForm, username: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required disabled={!!editingEmployee} />
              </div>
              <div>
                <Label className="text-gray-300">{editingEmployee ? 'Fjalëkalim i Ri (opsionale)' : 'Fjalëkalimi *'}</Label>
                <Input type="password" value={employeeForm.password} onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required={!editingEmployee} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Email</Label>
                <Input type="email" value={employeeForm.email} onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-300">Telefoni</Label>
                <Input value={employeeForm.phone} onChange={(e) => setEmployeeForm({...employeeForm, phone: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Roli *</Label>
                <Select value={employeeForm.role} onValueChange={(v) => setEmployeeForm({...employeeForm, role: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="doctor">Mjek</SelectItem>
                    <SelectItem value="nurse">Infermier/e</SelectItem>
                    <SelectItem value="caregiver">Kujdestar/e</SelectItem>
                    <SelectItem value="therapist">Terapist</SelectItem>
                    <SelectItem value="support">Mbështetje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300">Departamenti</Label>
                <Input value={employeeForm.department} onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="p.sh. Kujdesi Ditor" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Paga Bazë (€/muaj)</Label>
                <Input type="number" value={employeeForm.salary} onChange={(e) => setEmployeeForm({...employeeForm, salary: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" placeholder="0.00" />
              </div>
              <div>
                <Label className="text-gray-300">Lloji i Kontratës</Label>
                <Select value={employeeForm.contract_type} onValueChange={(v) => setEmployeeForm({...employeeForm, contract_type: v})}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                    <SelectItem value="contract">Kontratë</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" className="border-gray-600" onClick={() => setShowEmployeeDialog(false)}>Anulo</Button>
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">{editingEmployee ? 'Ruaj Ndryshimet' : 'Shto Punëtorin'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Visitor Dialog */}
      <Dialog open={showVisitorDialog} onOpenChange={setShowVisitorDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Shto Vizitor të Ri</DialogTitle>
            <DialogDescription className="text-gray-400">Vizitori do të ketë qasje vetëm për lexim</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVisitorSubmit} className="space-y-4">
            <div>
              <Label className="text-gray-300">Emri i Plotë *</Label>
              <Input value={visitorForm.full_name} onChange={(e) => setVisitorForm({...visitorForm, full_name: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Username *</Label>
                <Input value={visitorForm.username} onChange={(e) => setVisitorForm({...visitorForm, username: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
              <div>
                <Label className="text-gray-300">Fjalëkalimi *</Label>
                <Input type="password" value={visitorForm.password} onChange={(e) => setVisitorForm({...visitorForm, password: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white" required />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Email</Label>
              <Input type="email" value={visitorForm.email} onChange={(e) => setVisitorForm({...visitorForm, email: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" />
            </div>
            <div>
              <Label className="text-gray-300">Shënime (arsyeja e qasjes)</Label>
              <Input value={visitorForm.notes} onChange={(e) => setVisitorForm({...visitorForm, notes: e.target.value})}
                className="bg-gray-700 border-gray-600 text-white" placeholder="p.sh. Auditor i jashtëm, Familjar i rezidentit..." />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" className="border-gray-600" onClick={() => setShowVisitorDialog(false)}>Anulo</Button>
              <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">Krijo Vizitorin</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Overtime Dialog */}
      <Dialog open={showOvertimeDialog} onOpenChange={setShowOvertimeDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00a79d]" />
              Orët Shtesë - {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>

          {/* Month Selector */}
          <div className="flex items-center gap-3 mb-4">
            <Select value={String(selectedMonth)} onValueChange={(v) => { setSelectedMonth(Number(v)); if(selectedEmployee) loadOvertimeData(selectedEmployee.id); }}>
              <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor'].map((m, i) => (
                  <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(selectedYear)} onValueChange={(v) => { setSelectedYear(Number(v)); if(selectedEmployee) loadOvertimeData(selectedEmployee.id); }}>
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

          {/* Monthly Summary */}
          {monthlySummary && (
            <Card className="bg-gray-700/50 border-gray-600 mb-4">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <Sun className="w-5 h-5 mx-auto text-blue-400 mb-1" />
                    <p className="text-2xl font-bold text-white">{monthlySummary.normal_hours}h</p>
                    <p className="text-xs text-gray-400">Normale (×{coefficients.normal})</p>
                  </div>
                  <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                    <Moon className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                    <p className="text-2xl font-bold text-white">{monthlySummary.night_hours}h</p>
                    <p className="text-xs text-gray-400">Natë (×{coefficients.night})</p>
                  </div>
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                    <p className="text-2xl font-bold text-white">{monthlySummary.weekend_hours}h</p>
                    <p className="text-xs text-gray-400">Fundjavë (×{coefficients.weekend})</p>
                  </div>
                  <div className="text-center p-3 bg-red-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto text-red-400 mb-1" />
                    <p className="text-2xl font-bold text-white">{monthlySummary.holiday_hours}h</p>
                    <p className="text-xs text-gray-400">Festë (×{coefficients.holiday})</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between items-center">
                  <div>
                    <p className="text-gray-400 text-sm">Total Orë Shtesë: <span className="text-white font-medium">{monthlySummary.total_overtime_hours}h</span></p>
                    <p className="text-gray-400 text-sm">Paga Bazë: <span className="text-white font-medium">€{monthlySummary.base_salary}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Paga Orëve Shtesë:</p>
                    <p className="text-2xl font-bold text-[#00a79d]">€{monthlySummary.total_overtime_pay}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Overtime Form */}
          {isAdmin && (
            <form onSubmit={handleOvertimeSubmit} className="space-y-3 mb-4 p-4 bg-gray-700/30 rounded-lg">
              <div className="flex flex-wrap gap-3">
                <Input type="date" value={overtimeForm.date} onChange={(e) => setOvertimeForm({...overtimeForm, date: e.target.value})}
                  className="w-[140px] bg-gray-700 border-gray-600 text-white" required />
                <Select value={overtimeForm.overtime_type} onValueChange={(v) => setOvertimeForm({...overtimeForm, overtime_type: v})}>
                  <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="normal">Normale (×{coefficients.normal})</SelectItem>
                    <SelectItem value="night">Natë (×{coefficients.night})</SelectItem>
                    <SelectItem value="weekend">Fundjavë (×{coefficients.weekend})</SelectItem>
                    <SelectItem value="holiday">Festë (×{coefficients.holiday})</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" step="0.5" min="0.5" max="24" value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({...overtimeForm, hours: e.target.value})}
                  className="w-[80px] bg-gray-700 border-gray-600 text-white" placeholder="Orë" required />
                <Input value={overtimeForm.notes} onChange={(e) => setOvertimeForm({...overtimeForm, notes: e.target.value})}
                  className="flex-1 min-w-[150px] bg-gray-700 border-gray-600 text-white" placeholder="Shënime (opsionale)" />
              </div>
              
              {/* Custom Coefficient Option */}
              <div className="flex items-center gap-4 pt-2 border-t border-gray-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomCoefficient}
                    onChange={(e) => setUseCustomCoefficient(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-[#00a79d]"
                  />
                  <span className="text-gray-300 text-sm">Përdor koeficient manual</span>
                </label>
                {useCustomCoefficient && (
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={overtimeForm.custom_coefficient}
                      onChange={(e) => setOvertimeForm({...overtimeForm, custom_coefficient: e.target.value})}
                      className="w-[80px] bg-gray-700 border-gray-600 text-white"
                      placeholder="×1.5"
                    />
                  </div>
                )}
                {overtimeForm.hours && selectedEmployee?.salary && (
                  <div className="ml-auto text-right">
                    <p className="text-gray-400 text-xs">Llogaritja:</p>
                    <p className="text-[#00a79d] font-bold">€{calculatePreviewPay()}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="bg-[#00a79d] hover:bg-[#008f86]">
                  <Plus className="w-4 h-4 mr-1" />Shto Orët Shtesë
                </Button>
              </div>
            </form>
          )}

          {/* Overtime Entries List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {overtimeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={overtimeTypeColors[entry.overtime_type]}>
                      {overtimeTypeLabels[entry.overtime_type]}
                    </Badge>
                    <div>
                      <p className="text-white text-sm">{entry.date}</p>
                      {entry.notes && <p className="text-gray-400 text-xs">{entry.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-medium">{entry.hours}h</p>
                      <p className="text-[#00a79d] text-sm">€{entry.calculated_pay}</p>
                    </div>
                    {isAdmin && (
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteOvertime(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {overtimeEntries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nuk ka orë shtesë të regjistruara për këtë muaj</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HPEmployees;
