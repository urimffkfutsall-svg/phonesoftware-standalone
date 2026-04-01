import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBPAuth } from '../../App';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { toast } from 'sonner';
import { Scissors, Eye, EyeOff, Loader2, Sparkles, Star } from 'lucide-react';

const BPLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useBPAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Ju lutem plotësoni të gjitha fushat');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Mirë se vini!');
        navigate('/bookpro/app/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Professional Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-rose-200/20 to-transparent rounded-full" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Scissors className="absolute top-[15%] left-[10%] w-8 h-8 text-rose-300/40 rotate-45" />
        <Sparkles className="absolute top-[25%] right-[15%] w-6 h-6 text-pink-300/50" />
        <Star className="absolute bottom-[30%] left-[20%] w-5 h-5 text-rose-400/30" />
        <Scissors className="absolute bottom-[20%] right-[10%] w-10 h-10 text-rose-300/30 -rotate-12" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center pb-4 pt-8">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-rose-500/30 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Scissors className="h-10 w-10 text-white" />
          </div>
          
          {/* Brand Name */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 bg-clip-text text-transparent">
            BookPRO
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sistemi Profesional për Sallone Ondulimi
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Shkruani username"
                className="h-12 border-gray-200 focus:border-rose-500 focus:ring-rose-500/20 bg-gray-50/50"
                autoComplete="username"
                data-testid="bp-username-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Fjalëkalimi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Shkruani fjalëkalimin"
                  className="h-12 pr-12 border-gray-200 focus:border-rose-500 focus:ring-rose-500/20 bg-gray-50/50"
                  autoComplete="current-password"
                  data-testid="bp-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-10 w-10 text-gray-400 hover:text-rose-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white font-semibold shadow-lg shadow-rose-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/40"
              disabled={loading}
              data-testid="bp-login-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Duke u kyçur...
                </>
              ) : (
                'Kyçu në Sistem'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Nuk keni llogari?{' '}
              <a href="/#/" className="text-rose-500 hover:text-rose-600 hover:underline font-medium">
                Kontaktoni Administratorin
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 text-center">
        <p className="text-rose-700/60 text-sm font-medium">
          © 2024 BookPRO - Sistemi për Sallone Profesionale
        </p>
      </div>
    </div>
  );
};

export default BPLogin;
