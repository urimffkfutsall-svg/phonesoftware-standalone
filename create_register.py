content = r"""import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Eye, EyeOff, Smartphone, Building2, Phone, Mail, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PSRegister = () => {
  const [form, setForm] = useState({
    emri: '', mbiemri: '', emri_firmes: '', username: '',
    password: '', telefoni: '', email: '', shteti: '', qyteti: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(${API_URL}/api/phonesoftware/auth/register, form);
      setRegEmail(form.email);
      setShowSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Gabim gjate regjistrimit';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="fixed top-0 left-0 right-0 h-1 bg-[#00a79d]" />
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Faleminderit per regjistrim!</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Llogaria juaj u krijua me sukses. Ju lutemi kontrolloni emailin tuaj <strong className="text-gray-700">{regEmail}</strong> dhe klikoni linkun e verifikimit per te aktivizuar llogarine.
          </p>
          <div className="bg-[#00a79d]/10 border border-[#00a79d]/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#00a79d] font-semibold">Email verifikimi u dergua!</p>
            <p className="text-xs text-gray-500 mt-1">Kontrolloni edhe Spam/Junk nese nuk e gjeni.</p>
          </div>
          <button onClick={() => navigate('/phonesoftware/login')}
            className="w-full h-12 bg-[#00a79d] hover:bg-[#008f86] text-white font-semibold rounded-xl transition-all">
            Kthehu te Kycja
          </button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-11 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00a79d] focus:border-[#00a79d] outline-none text-sm transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="fixed top-0 left-0 right-0 h-1 bg-[#00a79d]" />
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00a79d] to-[#008f86] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Krijo Llogari</h1>
            <p className="text-sm text-gray-500 mt-1">Regjistrohuni ne PhoneSoftware</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input name="emri" type="text" placeholder="Emri" value={form.emri}
                  onChange={handleChange} required className={inputClass + " pl-9"} />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input name="mbiemri" type="text" placeholder="Mbiemri" value={form.mbiemri}
                  onChange={handleChange} required className={inputClass + " pl-9"} />
              </div>
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input name="emri_firmes" type="text" placeholder="Emri i Firmes" value={form.emri_firmes}
                onChange={handleChange} required className={inputClass + " pl-9"} />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input name="username" type="text" placeholder="Username" value={form.username}
                onChange={handleChange} required className={inputClass + " pl-9"} />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-[#00a79d]" />
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Fjalekalimi"
                value={form.password} onChange={handleChange} required className={inputClass + " pl-9 pr-10"} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input name="telefoni" type="tel" placeholder="Numri i Telefonit" value={form.telefoni}
                onChange={handleChange} required className={inputClass + " pl-9"} />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
              <input name="email" type="email" placeholder="Emaili" value={form.email}
                onChange={handleChange} required className={inputClass + " pl-9"} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input name="shteti" type="text" placeholder="Shteti" value={form.shteti}
                  onChange={handleChange} required className={inputClass + " pl-9"} />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input name="qyteti" type="text" placeholder="Qyteti" value={form.qyteti}
                  onChange={handleChange} required className={inputClass + " pl-9"} />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-[#00a79d] hover:bg-[#008f86] disabled:opacity-60 text-white font-semibold rounded-xl shadow-md transition-all duration-200">
              {loading ? 'Duke u regjistruar...' : 'REGJISTROHU'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Keni llogari?{' '}
              <a href="/phonesoftware/login" className="text-[#00a79d] font-semibold hover:underline">
                Kycuni ketu
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PSRegister;
"""
with open('frontend/src/pages/phonesoftware/PSRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('PSRegister.jsx u krijua!')
