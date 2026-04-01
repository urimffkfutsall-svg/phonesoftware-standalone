import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { hpApi, useHPAuth } from './HPLayout';
import {
  Settings,
  Building,
  Clock,
  Bell,
  Shield,
  Save,
  RefreshCw,
  Sun,
  Moon,
  Calendar,
  DollarSign,
  Users,
  Percent,
  Play,
  CheckCircle
} from 'lucide-react';

const HPSettings = () => {
  const { user } = useHPAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningTasks, setRunningTasks] = useState(false);
  const [activeTab, setActiveTab] = useState('institute');
  
  // Settings state
  const [instituteSettings, setInstituteSettings] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    institute_type: 'nursing_home'
  });
  
  const [coefficients, setCoefficients] = useState({
    normal: 1.25,
    night: 1.5,
    weekend: 1.5,
    holiday: 2.0
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    checkup_reminder_days: 7,
    therapy_end_reminder: true,
    overdue_alerts: true,
    email_notifications: false
  });

  const [taskResults, setTaskResults] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [coefs] = await Promise.all([
        hpApi.get('/healthpro/overtime/coefficients')
      ]);
      setCoefficients(coefs);
      
      // Set institute info from user context
      setInstituteSettings({
        name: user?.tenant_name || '',
        address: '',
        phone: '',
        email: '',
        institute_type: 'nursing_home'
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCoefficients = async () => {
    setSaving(true);
    try {
      await hpApi.put('/healthpro/overtime/coefficients', coefficients);
      toast.success('Koeficientët u ruajtën me sukses');
    } catch (error) {
      toast.error(error.message || 'Gabim gjatë ruajtjes');
    } finally {
      setSaving(false);
    }
  };

  const runBackgroundTasks = async () => {
    setRunningTasks(true);
    try {
      const result = await hpApi.post('/healthpro/notifications/run-tasks');
      setTaskResults(result.results);
      toast.success('Task-et u ekzekutuan me sukses');
    } catch (error) {
      toast.error(error.message || 'Gabim gjatë ekzekutimit');
    } finally {
      setRunningTasks(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[#00a79d] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Vetëm administratori mund të shohë cilësimet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Cilësimet</h1>
        <p className="text-gray-400">Konfiguroni parametrat e sistemit</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger value="institute" className="data-[state=active]:bg-[#00a79d]">
            <Building className="w-4 h-4 mr-2" />Instituti
          </TabsTrigger>
          <TabsTrigger value="overtime" className="data-[state=active]:bg-[#00a79d]">
            <Clock className="w-4 h-4 mr-2" />Orët Shtesë
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-[#00a79d]">
            <Bell className="w-4 h-4 mr-2" />Njoftimet
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-[#00a79d]">
            <RefreshCw className="w-4 h-4 mr-2" />Task-et
          </TabsTrigger>
        </TabsList>

        {/* Institute Settings */}
        <TabsContent value="institute" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#00a79d]" />
                Informacionet e Institutit
              </CardTitle>
              <CardDescription className="text-gray-400">
                Të dhënat bazë të institutit tuaj
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-gray-300">Emri i Institutit</Label>
                  <Input
                    value={instituteSettings.name}
                    onChange={(e) => setInstituteSettings({...instituteSettings, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="p.sh. Qendra e Kujdesit për të Moshuarit"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-300">Adresa</Label>
                  <Input
                    value={instituteSettings.address}
                    onChange={(e) => setInstituteSettings({...instituteSettings, address: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Adresa e plotë"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Telefoni</Label>
                  <Input
                    value={instituteSettings.phone}
                    onChange={(e) => setInstituteSettings({...instituteSettings, phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="+383 44 123 456"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={instituteSettings.email}
                    onChange={(e) => setInstituteSettings({...instituteSettings, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="info@instituti.com"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button className="bg-[#00a79d] hover:bg-[#008f86]">
                  <Save className="w-4 h-4 mr-2" />Ruaj Ndryshimet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overtime Settings */}
        <TabsContent value="overtime" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00a79d]" />
                Koeficientët e Orëve Shtesë
              </CardTitle>
              <CardDescription className="text-gray-400">
                Vendosni përqindjet për llojet e ndryshme të orëve shtesë
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-blue-400" />
                    <Label className="text-gray-300">Orë Shtesë Normale</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={coefficients.normal}
                      onChange={(e) => setCoefficients({...coefficients, normal: parseFloat(e.target.value) || 1})}
                      className="bg-gray-700 border-gray-600 text-white w-24"
                    />
                    <span className="text-gray-400">× paga/orë</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    = {((coefficients.normal - 1) * 100).toFixed(0)}% shtesë mbi pagën normale
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-purple-400" />
                    <Label className="text-gray-300">Orë Nate (22:00-06:00)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={coefficients.night}
                      onChange={(e) => setCoefficients({...coefficients, night: parseFloat(e.target.value) || 1})}
                      className="bg-gray-700 border-gray-600 text-white w-24"
                    />
                    <span className="text-gray-400">× paga/orë</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    = {((coefficients.night - 1) * 100).toFixed(0)}% shtesë mbi pagën normale
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-orange-400" />
                    <Label className="text-gray-300">Fundjavë (Shtunë/Diel)</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={coefficients.weekend}
                      onChange={(e) => setCoefficients({...coefficients, weekend: parseFloat(e.target.value) || 1})}
                      className="bg-gray-700 border-gray-600 text-white w-24"
                    />
                    <span className="text-gray-400">× paga/orë</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    = {((coefficients.weekend - 1) * 100).toFixed(0)}% shtesë mbi pagën normale
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-red-400" />
                    <Label className="text-gray-300">Festa Zyrtare</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.05"
                      min="1"
                      max="5"
                      value={coefficients.holiday}
                      onChange={(e) => setCoefficients({...coefficients, holiday: parseFloat(e.target.value) || 1})}
                      className="bg-gray-700 border-gray-600 text-white w-24"
                    />
                    <span className="text-gray-400">× paga/orë</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    = {((coefficients.holiday - 1) * 100).toFixed(0)}% shtesë mbi pagën normale
                  </p>
                </div>
              </div>
              
              {/* Example calculation */}
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <h4 className="text-white text-sm font-medium mb-2 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-[#00a79d]" />
                    Shembull Llogaritjeje
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Paga mujore: <span className="text-white">€800</span> → Paga për orë: <span className="text-white">€{(800/176).toFixed(2)}</span>
                    <br />
                    3 orë normale: 3 × €{(800/176).toFixed(2)} × {coefficients.normal} = <span className="text-[#00a79d] font-medium">€{(3 * (800/176) * coefficients.normal).toFixed(2)}</span>
                    <br />
                    2 orë nate: 2 × €{(800/176).toFixed(2)} × {coefficients.night} = <span className="text-[#00a79d] font-medium">€{(2 * (800/176) * coefficients.night).toFixed(2)}</span>
                  </p>
                </CardContent>
              </Card>

              <div className="flex justify-end pt-4">
                <Button onClick={saveCoefficients} disabled={saving} className="bg-[#00a79d] hover:bg-[#008f86]">
                  {saving ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Ruaj Koeficientët
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#00a79d]" />
                Cilësimet e Njoftimeve
              </CardTitle>
              <CardDescription className="text-gray-400">
                Konfiguroni njoftimet dhe alarmet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Kujtese për kontrolla</p>
                    <p className="text-gray-400 text-sm">Njoftime para kontrollave të planifikuara</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={notificationSettings.checkup_reminder_days}
                      onChange={(e) => setNotificationSettings({...notificationSettings, checkup_reminder_days: parseInt(e.target.value)})}
                      className="w-16 bg-gray-700 border-gray-600 text-white text-center"
                    />
                    <span className="text-gray-400">ditë para</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Kujtese për terapi që mbarojnë</p>
                    <p className="text-gray-400 text-sm">Njoftime kur terapitë janë duke mbaruar</p>
                  </div>
                  <Switch
                    checked={notificationSettings.therapy_end_reminder}
                    onCheckedChange={(v) => setNotificationSettings({...notificationSettings, therapy_end_reminder: v})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Alarme për kontrolla të vonuara</p>
                    <p className="text-gray-400 text-sm">Njofto kur kontrollet janë të vonuara</p>
                  </div>
                  <Switch
                    checked={notificationSettings.overdue_alerts}
                    onCheckedChange={(v) => setNotificationSettings({...notificationSettings, overdue_alerts: v})}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg opacity-50">
                  <div>
                    <p className="text-white font-medium">Njoftime me Email</p>
                    <p className="text-gray-400 text-sm">Dërgo njoftime me email (Së shpejti)</p>
                  </div>
                  <Switch disabled checked={false} />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button className="bg-[#00a79d] hover:bg-[#008f86]">
                  <Save className="w-4 h-4 mr-2" />Ruaj Cilësimet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Tasks */}
        <TabsContent value="tasks" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#00a79d]" />
                Task-et e Sistemit
              </CardTitle>
              <CardDescription className="text-gray-400">
                Ekzekutoni task-et automatike manualisht
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Card className="bg-gray-700/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-white font-medium mb-1">Gjenero Kontrolla Sistematike</h4>
                      <p className="text-gray-400 text-sm mb-3">
                        Krijon kontrolla të reja për rezidentët që nuk kanë pasur kontroll në 6 muajt e fundit.
                        Zakonisht ekzekutohet automatikisht çdo ditë.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-500/20 text-blue-400">Automatike</Badge>
                        <Badge className="bg-gray-600 text-gray-300">Çdo 6 muaj</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={runBackgroundTasks}
                      disabled={runningTasks}
                      className="bg-[#00a79d] hover:bg-[#008f86]"
                    >
                      {runningTasks ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Ekzekuto Tani
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Task Results */}
              {taskResults && (
                <Card className="bg-green-500/10 border-green-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h4 className="text-green-400 font-medium">Rezultatet e Task-eve</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{taskResults.systematic_checkups?.created || 0}</p>
                        <p className="text-gray-400 text-sm">Kontrolla të krijuara</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{taskResults.systematic_checkups?.skipped || 0}</p>
                        <p className="text-gray-400 text-sm">Të kapërcyera</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{taskResults.therapy_reminders || 0}</p>
                        <p className="text-gray-400 text-sm">Njoftime terapish</p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      Ekzekutuar më: {new Date(taskResults.run_at).toLocaleString('sq-AL')}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-gray-700/30 rounded-lg">
                <h4 className="text-white text-sm font-medium mb-2">Çfarë bëjnë Task-et?</h4>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Gjenerojnë kontrolla sistematike për rezidentët pa kontroll në 6 muaj</li>
                  <li>• Krijojnë njoftime për terapi që mbarojnë brenda 7 ditëve</li>
                  <li>• Identifikojnë kontrolla të vonuara dhe krijojnë alarme</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HPSettings;
