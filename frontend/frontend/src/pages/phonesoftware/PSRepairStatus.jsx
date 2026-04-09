import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Wrench,
  Calendar,
  Phone,
  MapPin,
  Shield,
  Ban,
  Truck,
  RefreshCw
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSRepairStatus = () => {
  const { ticketNumber } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // Add cache-busting timestamp
      const response = await axios.get(
        `${API_URL}/api/phonesoftware/public/repair-status/${ticketNumber}?t=${Date.now()}`
      );
      setRepair(response.data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.detail || 'Riparimi nuk u gjet');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ticketNumber]);

  useEffect(() => {
    if (ticketNumber) {
      fetchStatus();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchStatus(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [ticketNumber, fetchStatus]);

  const handleRefresh = () => {
    fetchStatus(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'received': return <Package className="h-8 w-8" />;
      case 'in_progress': return <Wrench className="h-8 w-8" />;
      case 'completed': return <CheckCircle className="h-8 w-8" />;
      case 'cannot_repair': return <Ban className="h-8 w-8" />;
      case 'delivered': return <Truck className="h-8 w-8" />;
      default: return <Clock className="h-8 w-8" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'received': return { bg: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' };
      case 'in_progress': return { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' };
      case 'completed': return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' };
      case 'cannot_repair': return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' };
      case 'delivered': return { bg: 'bg-white/[0.02]0', light: 'bg-white/[0.03]', text: 'text-white/70' };
      default: return { bg: 'bg-white/[0.02]0', light: 'bg-white/[0.03]', text: 'text-white/70' };
    }
  };

  const statusSteps = [
    { key: 'received', label: 'Pranuar', icon: Package },
    { key: 'in_progress', label: 'Në proces', icon: Wrench },
    { key: 'completed', label: 'I rregulluar', icon: CheckCircle },
    { key: 'delivered', label: 'Dorëzuar', icon: Truck }
  ];

  const getCurrentStepIndex = (status) => {
    if (status === 'cannot_repair') return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-white/90 mb-2">Riparimi nuk u gjet</h1>
            <p className="text-white/40">Numri i tiketës: <span className="font-mono">{ticketNumber}</span></p>
            <p className="text-sm text-white/25 mt-4">
              Sigurohuni që keni skanuar QR kodin e saktë ose kontaktoni servisin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const colors = getStatusColor(repair.status);
  const currentStep = getCurrentStepIndex(repair.status);
  const shopColor = repair.shop?.color || '#00e6b4';

  return (
    <div className="min-h-screen" style={{background: "#0c0f1a"}} data-testid="repair-status-page">
      {/* Header */}
      <div 
        className="py-6 px-4"
        style={{ backgroundColor: shopColor }}
      >
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              {repair.shop?.logo ? (
                <img src={repair.shop.logo} alt="" className="h-12 mx-auto mb-2 object-contain" />
              ) : (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Smartphone className="h-8 w-8 text-white" />
                  <span className="text-xl font-bold text-white">{repair.shop?.name}</span>
                </div>
              )}
              <h1 className="text-white text-lg font-medium">Statusi i Riparimit</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-white hover:bg-white/20"
              title="Rifresko statusin"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 -mt-4">
        {/* Main Status Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className={`${colors.bg} p-6 text-white text-center`}>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              {getStatusIcon(repair.status)}
            </div>
            <h2 className="text-2xl font-bold">{repair.status_label}</h2>
            <p className="opacity-80 mt-1 font-mono text-sm">{repair.ticket_number}</p>
          </div>
          
          <CardContent className="p-6">
            {/* Device Info */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/40 mb-2">Pajisja</h3>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${colors.light} rounded-lg flex items-center justify-center`}>
                  <Smartphone className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white/90">{repair.device}</p>
                  <div className="flex flex-wrap gap-x-3 text-sm text-white/40">
                    {repair.color && <span>Ngjyra: {repair.color}</span>}
                    {repair.imei && <span className="font-mono text-xs">IMEI: {repair.imei}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Name if available */}
            {repair.customer_name && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Klienti:</span> {repair.customer_name}
                </p>
              </div>
            )}

            {/* Problem */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-white/40 mb-2">Problemi</h3>
              <p className="text-white/70 text-sm bg-white/[0.02] p-3 rounded-lg">{repair.problem}</p>
            </div>

            {/* Accessories Received */}
            {repair.accessories_received && repair.accessories_received.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/40 mb-2">Aksesore të Pranuar</h3>
                <div className="flex flex-wrap gap-2">
                  {repair.accessories_received.map((acc, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/[0.03] text-white/50 text-xs rounded">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            {repair.status !== 'cannot_repair' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white/40 mb-4">Progresi</h3>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;
                    return (
                      <div key={step.key} className="relative flex items-center mb-4 last:mb-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted ? colors.bg : 'bg-gray-200'
                        }`}>
                          <step.icon className={`h-4 w-4 ${isCompleted ? 'text-white' : 'text-white/25'}`} />
                        </div>
                        <span className={`ml-4 text-sm ${isCurrent ? 'font-semibold text-white/90' : 'text-white/40'}`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${colors.light} ${colors.text}`}>
                            Tani
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cannot Repair Notice */}
            {repair.status === 'cannot_repair' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700 font-medium">
                  <Ban className="h-5 w-5" />
                  Nuk mund të rregullohet
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Ju lutemi kontaktoni servisin për më shumë informacion dhe për të marrë pajisjen tuaj.
                </p>
              </div>
            )}

            {/* Cost Info */}
            {(repair.estimated_cost || repair.total_cost) && (
              <div className="mb-6 p-4 bg-white/[0.02] rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-white/50">
                    {repair.total_cost ? 'Kosto Totale:' : 'Kosto e Vlerësuar:'}
                  </span>
                  <span className="font-bold text-lg text-white/90">
                    {(repair.total_cost || repair.estimated_cost)?.toFixed(2)}€
                  </span>
                </div>
              </div>
            )}

            {/* Warranty Info */}
            {repair.warranty_expires && (
              <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Garancia: {repair.warranty_months} muaj</p>
                  <p className="text-xs text-green-600">
                    Deri më: {new Date(repair.warranty_expires).toLocaleDateString('sq-AL')}
                  </p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/40">
                <Calendar className="h-4 w-4" />
                <span>Pranuar: {new Date(repair.created_at).toLocaleDateString('sq-AL', { 
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}</span>
              </div>
              {repair.completed_at && (
                <div className="flex items-center gap-2 text-white/40">
                  <CheckCircle className="h-4 w-4" />
                  <span>Përfunduar: {new Date(repair.completed_at).toLocaleDateString('sq-AL', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}</span>
                </div>
              )}
              {repair.delivered_at && (
                <div className="flex items-center gap-2 text-white/40">
                  <Truck className="h-4 w-4" />
                  <span>Dorëzuar: {new Date(repair.delivered_at).toLocaleDateString('sq-AL', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Shop Contact Card */}
        <Card className="border-0 shadow-sm mt-4">
          <CardContent className="p-4">
            <h3 className="font-medium text-white/90 mb-3">{repair.shop?.name}</h3>
            <div className="space-y-2 text-sm">
              {repair.shop?.phone && (
                <a 
                  href={`tel:${repair.shop.phone}`}
                  className="flex items-center gap-2 text-white/50 hover:text-white/90"
                >
                  <Phone className="h-4 w-4" />
                  {repair.shop.phone}
                </a>
              )}
              {repair.shop?.address && (
                <div className="flex items-center gap-2 text-white/50">
                  <MapPin className="h-4 w-4" />
                  {repair.shop.address}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh Info */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/25">
          <RefreshCw className="h-3 w-3" />
          <span>
            {lastUpdated && `Përditësuar: ${lastUpdated.toLocaleTimeString('sq-AL')}`}
            {' • '}Rifreskimi automatik çdo 30 sek
          </span>
        </div>

        {/* Manual Refresh Button for Mobile */}
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-white/50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Duke rifreskuar...' : 'Rifresko Statusin'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/25 mt-6 pb-4">
          Fuqizuar nga PhoneSoftware
        </p>
      </div>
    </div>
  );
};

export default PSRepairStatus;
