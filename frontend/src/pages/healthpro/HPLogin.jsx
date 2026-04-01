import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { HeartPulse, Building, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const HPLogin = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Register form
  const [registerData, setRegisterData] = useState({
    name: '',
    institute_type: 'nursing_home',
    address: '',
    phone: '',
    email: '',
    admin_name: '',
    admin_username: '',
    admin_password: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/healthpro/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Gabim gjatë kyçjes');
      }
      
      // Store token and user info
      localStorage.setItem('hp_token', data.access_token);
      localStorage.setItem('hp_user', JSON.stringify(data.user));
      
      toast.success(`Mirë se vini, ${data.user.full_name}!`);
      navigate('/healthpro/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/api/healthpro/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Gabim gjatë regjistrimit');
      }
      
      toast.success('Regjistrimi u krye me sukses! Tani mund të kyçeni.');
      setIsLogin(true);
      setLoginData({
        username: registerData.admin_username,
        password: ''
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMGE3OWQiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDE0di0yaDIyek0zNiAxNHYySDE0di0yaDIyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-4 text-gray-400 hover:text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kthehu
        </Button>

        <Card className="bg-gray-800/90 border-gray-700 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-[#00a79d]/20 rounded-2xl flex items-center justify-center mb-4">
              <HeartPulse className="w-8 h-8 text-[#00a79d]" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">HealthPRO</CardTitle>
            <CardDescription className="text-gray-400">
              Sistemi i Menaxhimit të Institutit Shëndetësor
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Toggle buttons */}
            <div className="flex bg-gray-700/50 rounded-lg p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  isLogin 
                    ? 'bg-[#00a79d] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setIsLogin(true)}
              >
                Kyçu
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  !isLogin 
                    ? 'bg-[#00a79d] text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setIsLogin(false)}
              >
                Regjistrohu
              </button>
            </div>

            {isLogin ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      placeholder="Shkruani username"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Fjalëkalimi</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Shkruani fjalëkalimin"
                      className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#00a79d] hover:bg-[#008f86] text-white"
                  disabled={loading}
                >
                  {loading ? 'Po kyçet...' : 'Kyçu'}
                </Button>
              </form>
            ) : (
              // Register Form
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Emri i Institutit</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      placeholder="p.sh. Shtëpia e Komunitetit Prishtinë"
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Lloji i Institutit</Label>
                  <select
                    value={registerData.institute_type}
                    onChange={(e) => setRegisterData({...registerData, institute_type: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  >
                    <option value="nursing_home">Shtëpi Pleqsh / Nursing Home</option>
                    <option value="community_center">Shtëpi Komuniteti</option>
                    <option value="rehabilitation">Qendër Rehabilitimi</option>
                    <option value="mental_health">Institut për Shëndet Mendor</option>
                    <option value="other">Tjetër</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Telefoni</Label>
                    <Input
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      placeholder="+383..."
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      placeholder="email@institut.com"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-sm text-gray-400 mb-3">Të dhënat e administratorit</p>
                  
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Emri i plotë</Label>
                      <Input
                        value={registerData.admin_name}
                        onChange={(e) => setRegisterData({...registerData, admin_name: e.target.value})}
                        placeholder="Emri Mbiemri"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Username</Label>
                      <Input
                        value={registerData.admin_username}
                        onChange={(e) => setRegisterData({...registerData, admin_username: e.target.value})}
                        placeholder="admin_username"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-gray-300">Fjalëkalimi</Label>
                      <Input
                        type="password"
                        value={registerData.admin_password}
                        onChange={(e) => setRegisterData({...registerData, admin_password: e.target.value})}
                        placeholder="Min. 6 karaktere"
                        className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#00a79d] hover:bg-[#008f86] text-white"
                  disabled={loading}
                >
                  {loading ? 'Po regjistrohet...' : 'Regjistro Institutin'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-gray-500 text-sm mt-4">
          © 2026 HealthPRO - Sistemi i Menaxhimit Shëndetësor
        </p>
      </div>
    </div>
  );
};

export default HPLogin;
