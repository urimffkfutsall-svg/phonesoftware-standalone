import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { User, Lock, Eye, EyeOff, Smartphone, AlertTriangle, CreditCard, Phone } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [expiredDays, setExpiredDays] = useState(0);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/phonesoftware/auth/login`, {
        username,
        password
      });

      const { access_token, user } = response.data;
      localStorage.setItem('ps_token', access_token);
      localStorage.setItem('ps_user', JSON.stringify(user));

      toast.success('Mirësevini në PhoneSoftware!');
      
      if (user.role === 'super_admin') {
        navigate('/phonesoftware/admin');
      } else {
        navigate('/phonesoftware/dashboard');
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || 'Gabim gjatë kyçjes';
      
      if (status === 402 && detail.startsWith('SUBSCRIPTION_EXPIRED|')) {
        const days = parseInt(detail.split('|')[1]) || 0;
        setExpiredDays(days);
        setShowExpiredModal(true);
      } else {
        setError(detail);
        toast.error(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
      style={{ background: '#0c0f1a' }}
      data-testid="ps-login-page"
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00e6b4 0%, transparent 70%)' }} />
        <div className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00b4d8 0%, transparent 70%)' }} />
      </div>

      {/* Top accent line */}
      <div className="fixed top-0 left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #00e6b4, #00b4d8, transparent)' }} />
      
      <div className="w-full max-w-[420px] mx-4 relative z-10">
        <div className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 80px rgba(0,230,180,0.03)',
          }}
        >
          <div className="p-8 md:p-10">
            {/* Logo */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)',
                  boxShadow: '0 8px 32px rgba(0, 230, 180, 0.3)',
                }}
              >
                <Smartphone className="h-8 w-8 text-[#0c0f1a]" />
              </div>
              <h1 className="text-2xl font-bold text-white">PhoneSoftware</h1>
              <p className="text-sm text-white/30 mt-1">Mobile Repair & Shop Management</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-white/25" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 h-12 rounded-xl text-white placeholder-white/25 text-[14px] outline-none transition-all focus:ring-1 focus:ring-[#00e6b4]/50"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  required
                  data-testid="ps-username-input"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#00e6b4]/50" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Fjalëkalimi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 h-12 rounded-xl text-white placeholder-white/25 text-[14px] outline-none transition-all focus:ring-1 focus:ring-[#00e6b4]/50"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  required
                  data-testid="ps-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/25 hover:text-white/50 transition-colors" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/25 hover:text-white/50 transition-colors" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-3 rounded-xl text-sm text-center text-red-400"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                >
                  {error}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 font-semibold rounded-xl text-[14px] tracking-wide transition-all duration-200 border-0"
                style={{
                  background: 'linear-gradient(135deg, #00e6b4 0%, #00b4d8 100%)',
                  color: '#0c0f1a',
                  boxShadow: '0 4px 20px rgba(0, 230, 180, 0.25)',
                }}
                data-testid="ps-login-btn"
              >
                {loading ? (
                  <div className="spinner border-[#0c0f1a] border-t-transparent" style={{ width: '20px', height: '20px' }} />
                ) : (
                  'KYÇU'
                )}
              </Button>
            </form>

            {/* Back to home link */}
            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a
                href="/"
                className="text-white/25 hover:text-[#00e6b4] text-sm transition-colors"
              >
                ← Kthehu në faqen kryesore
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Expired Modal */}
      <Dialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <DialogContent className="sm:max-w-md" data-testid="ps-subscription-expired-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              Abonimi Ka Skaduar
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <CreditCard className="h-10 w-10 text-red-400" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-white">
                Abonimi juaj ka skaduar!
              </p>
              <p className="text-sm text-white/50">
                {expiredDays > 0 
                  ? `Abonimi juaj ka skaduar para ${expiredDays} ditëve.`
                  : 'Abonimi juaj ka skaduar sot.'}
              </p>
              <p className="text-sm text-white/40">
                Për të vazhduar përdorimin e sistemit, kontaktoni administratorin.
              </p>
            </div>

            <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-sm font-medium text-white/60 text-center">Kontaktoni për rinovim:</p>
              <div className="flex items-center justify-center gap-2 text-[#00e6b4]">
                <Phone className="h-4 w-4" />
                <span className="font-medium">+383 44 123 456</span>
              </div>
            </div>

            <Button
              onClick={() => setShowExpiredModal(false)}
              variant="outline"
              className="w-full"
            >
              Mbyll
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PSLogin;
