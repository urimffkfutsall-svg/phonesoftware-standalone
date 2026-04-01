import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '../../components/ui/input';
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
      
      // Store auth data
      localStorage.setItem('ps_token', access_token);
      localStorage.setItem('ps_user', JSON.stringify(user));

      toast.success('Mirësevini në PhoneSoftware!');
      
      // Navigate based on role
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" data-testid="ps-login-page">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#00a79d]" />
      
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 md:p-10">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#00a79d] to-[#008f86] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PhoneSoftware</h1>
            <p className="text-sm text-gray-500 mt-1">Aplikacion per menaxhimin e Mobileshop</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00a79d] focus:border-[#00a79d] outline-none transition-all"
                required
                data-testid="ps-username-input"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-[#00a79d]" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Fjalëkalimi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 h-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00a79d] focus:border-[#00a79d] outline-none transition-all"
                required
                data-testid="ps-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#00a79d] hover:bg-[#008f86] text-white font-semibold rounded-xl shadow-md transition-all duration-200"
              data-testid="ps-login-btn"
            >
              {loading ? (
                <div className="spinner border-white border-t-transparent" />
              ) : (
                'KYÇU'
              )}
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Nuk keni llogari?{' '}
              <a href="/#/phonesoftware/register" className="text-[#00a79d] font-semibold hover:underline">
                Regjistrohuni ketu
              </a>
            </p>
          </div>

          </div></div>

      {/* Subscription Expired Modal */}
      <Dialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <DialogContent className="sm:max-w-md" data-testid="ps-subscription-expired-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              Abonimi Ka Skaduar
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-10 w-10 text-red-500" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-gray-900">
                Abonimi juaj ka skaduar!
              </p>
              <p className="text-sm text-gray-600">
                {expiredDays > 0 
                  ? `Abonimi juaj ka skaduar para ${expiredDays} ditëve.`
                  : 'Abonimi juaj ka skaduar sot.'}
              </p>
              <p className="text-sm text-gray-500">
                Për të vazhduar përdorimin e sistemit, kontaktoni administratorin.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-gray-700 text-center">Kontaktoni për rinovim:</p>
              <div className="flex items-center justify-center gap-2 text-[#00a79d]">
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
