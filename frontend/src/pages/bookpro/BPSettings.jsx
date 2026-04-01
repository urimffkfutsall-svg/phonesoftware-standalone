import React, { useState, useEffect } from 'react';
import { bpApi, useBPAuth } from '../../App';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Building, Clock, Link2, Save, Loader2, Copy, Check } from 'lucide-react';

const DAYS = [
  { value: 'monday', label: 'E Hënë' },
  { value: 'tuesday', label: 'E Martë' },
  { value: 'wednesday', label: 'E Mërkurë' },
  { value: 'thursday', label: 'E Enjte' },
  { value: 'friday', label: 'E Premte' },
  { value: 'saturday', label: 'E Shtunë' },
  { value: 'sunday', label: 'E Diel' },
];

const BPSettings = () => {
  const { user } = useBPAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    name: '',
    salon_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    opening_time: '09:00',
    closing_time: '19:00',
    working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    nui: '',
    nf: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await bpApi.get('/bookpro/tenants/my-salon');
      const tenant = response.data;
      setSettings({
        name: tenant.name || '',
        salon_name: tenant.salon_name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address: tenant.address || '',
        city: tenant.city || '',
        opening_time: tenant.opening_time || '09:00',
        closing_time: tenant.closing_time || '19:00',
        working_days: tenant.working_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        nui: tenant.nui || '',
        nf: tenant.nf || ''
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await bpApi.put('/bookpro/tenants/my-salon', settings);
      toast.success('Cilësimet u ruajtën me sukses');
    } catch (error) {
      toast.error('Gabim gjatë ruajtjes së cilësimeve');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    const current = settings.working_days || [];
    if (current.includes(day)) {
      setSettings({ ...settings, working_days: current.filter(d => d !== day) });
    } else {
      setSettings({ ...settings, working_days: [...current, day] });
    }
  };

  const getBookingLink = () => {
    const slug = settings.name || 'salon';
    return `${window.location.origin}/#/book/${slug}`;
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(getBookingLink());
    setCopied(true);
    toast.success('Linku u kopjua!');
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-rose-200 border-t-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl" data-testid="bp-settings-page">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Cilësimet</h1>
        <p className="text-gray-500">Menaxhoni cilësimet e sallonit</p>
      </div>

      {/* Booking Link Card */}
      <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <Link2 className="h-5 w-5" />
            Linku i Rezervimit për Klientët
          </CardTitle>
          <CardDescription>Ndajeni këtë link me klientët për rezervime online 24/7</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={getBookingLink()}
              readOnly
              className="flex-1 bg-white border-rose-200 text-gray-700"
            />
            <Button 
              onClick={copyBookingLink}
              className={`${copied ? 'bg-green-500' : 'bg-rose-500 hover:bg-rose-600'} text-white`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slug" className="text-rose-700">Identifikuesi i Linkut (slug)</Label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">.../#/book/</span>
              <Input
                id="slug"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: generateSlug(e.target.value) })}
                placeholder="emri-sallonit"
                className="flex-1 border-rose-200"
              />
            </div>
            <p className="text-xs text-gray-500">
              Përdorni vetëm shkronja të vogla, numra dhe viza (-)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Building className="h-5 w-5 text-rose-500" />
            Informacionet e Biznesit
          </CardTitle>
          <CardDescription>Të dhënat bazë të sallonit tuaj</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salon_name">Emri i Sallonit</Label>
              <Input
                id="salon_name"
                value={settings.salon_name}
                onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
                placeholder="Emri i sallonit"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="email@example.com"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoni</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="+383 44 xxx xxx"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Qyteti</Label>
              <Input
                id="city"
                value={settings.city}
                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                placeholder="Prishtinë"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresa</Label>
            <Input
              id="address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="Adresa e plotë"
              className="border-gray-200 focus:border-rose-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nui">NUI (Numri Unik Identifikues)</Label>
              <Input
                id="nui"
                value={settings.nui}
                onChange={(e) => setSettings({ ...settings, nui: e.target.value })}
                placeholder="NUI"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nf">NF (Numri Fiskal)</Label>
              <Input
                id="nf"
                value={settings.nf}
                onChange={(e) => setSettings({ ...settings, nf: e.target.value })}
                placeholder="NF"
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Clock className="h-5 w-5 text-rose-500" />
            Orari i Punës
          </CardTitle>
          <CardDescription>Orët dhe ditët e punës së sallonit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening_time">Ora e Hapjes</Label>
              <Input
                id="opening_time"
                type="time"
                value={settings.opening_time}
                onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing_time">Ora e Mbylljes</Label>
              <Input
                id="closing_time"
                type="time"
                value={settings.closing_time}
                onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                className="border-gray-200 focus:border-rose-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ditët e Punës</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    settings.working_days?.includes(day.value)
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-rose-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Duke ruajtur...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Ruaj Cilësimet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BPSettings;
