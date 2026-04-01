import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Apple, Globe, Shield, Zap, Clock, Check, Gift, Star, TrendingUp, Utensils, Store, Briefcase, Sparkles, Smartphone, ArrowRight, Scissors, HeartPulse, Lock, ArrowUpRight } from 'lucide-react';

const LandingDashboard = () => {
  const navigate = useNavigate();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    // Check if super admin is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'super_admin') {
          setIsSuperAdmin(true);
        }
      } catch (e) {}
    }
  }, []);

  const handleRegister = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/gate');
  };

  const pricingPlans = [
    { duration: '1 Muaj', price: 20, perMonth: 20, popular: false },
    { duration: '3 Muaj', price: 60, perMonth: 20, popular: false },
    { duration: '6 Muaj', price: 120, perMonth: 20, popular: false },
    { duration: '12 Muaj', price: 150, originalPrice: 230, perMonth: 12.5, popular: true, savings: 80 },
  ];

  const comingSoonApps = [
    {
      icon: Utensils,
      title: 'Menaxhimi i Restoranteve',
      description: 'Sistemi i plotë për menaxhimin e restoranteve: porosi, tavolina, menu dixhitale, stafi i kuzhinës.',
      features: ['Menaxhim i tavolinave', 'Porosi në kohë reale', 'Menu dixhitale me QR'],
      gradient: 'from-orange-500/20 to-orange-600/10',
      borderColor: 'border-orange-500/30',
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400',
      dotColor: 'bg-orange-400'
    },
    {
      icon: Store,
      title: 'Menaxhimi i Mobilshopave',
      description: 'Sistemi i avancuar për dyqanet e telefonave: servisim, shitje, inventar, garanci, riparime.',
      features: ['Menaxhim i riparimeve', 'Inventar i telefonave', 'Gjurmim i garancive'],
      gradient: 'from-blue-500/20 to-blue-600/10',
      borderColor: 'border-blue-500/30',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-400',
      dotColor: 'bg-blue-400'
    },
    {
      icon: Briefcase,
      title: 'Menaxhimi i Punëtorëve',
      description: 'Sistemi komplet për menaxhimin e punëve dhe punëtorëve: orari, paga, pushime, detyra.',
      features: ['Orari i punës', 'Llogaritja e pagave', 'Menaxhimi i pushimeve'],
      gradient: 'from-purple-500/20 to-purple-600/10',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      dotColor: 'bg-purple-400'
    }
  ];

  const features = [
    'Menaxhim i produkteve pa limit',
    'Raporte të detajuara të shitjeve',
    'Multi-përdorues (admin & arkëtar)',
    'Fatura profesionale',
    'Sinkronizim në kohë reale',
    'Mbështetje teknike 24/7',
    'Eksport të dhënash',
    'Backup automatik',
  ];

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00a79d]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00a79d]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#00a79d]/5 to-transparent rounded-full"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

      {/* Header */}
      <header className="relative w-full py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_retailsys-1/artifacts/9i1h1bxb_logo%20icon.png" 
              alt="DataPOS" 
              className="h-12 object-contain"
            />
            <span className="text-xl font-bold text-white tracking-tight">DataPOS</span>
          </div>
          <div className="flex items-center gap-3">
          <button
            onClick={handleRegister}
            className="px-6 py-2 text-sm font-medium text-[#00a79d] hover:text-white border border-[#00a79d]/30 hover:border-[#00a79d] hover:bg-[#00a79d]/10 rounded-full transition-all"
          >
            Regjistrohu
          </button>
          <button
            onClick={handleLogin}
            className="px-6 py-2 text-sm font-medium bg-[#00a79d] hover:bg-[#008f86] text-white rounded-full transition-all"
          >
            Kyçu
          </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-[#00a79d]/10 border border-[#00a79d]/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-[#00a79d]" />
              <span className="text-sm text-[#00a79d] font-medium">Software profesional për biznesin tënd</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Menaxho shitjet me
              <span className="block text-[#00a79d]">DataPOS</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Sistemi më i avancuar POS për bizneset në Kosovë. Fillo me 30 ditë provë falas!
            </p>
          </div>

          {/* Special Offer Banner */}
          <div className="bg-gradient-to-r from-[#00a79d]/20 via-[#00a79d]/10 to-[#00a79d]/20 border border-[#00a79d]/30 rounded-2xl p-6 mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#ff6b6b] text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              OFERTË SPECIALE
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#00a79d]/20 rounded-full flex items-center justify-center">
                  <Gift className="w-8 h-8 text-[#00a79d]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Kurseni 80€ në Vitin e Parë!</h3>
                  <p className="text-gray-400">Abonohuni për 12 muaj dhe paguani vetëm</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-gray-500 line-through text-lg">230€</span>
                  <span className="text-4xl font-bold text-[#00a79d] ml-3">150€</span>
                  <span className="text-gray-400 text-sm">/vit</span>
                </div>
                <a
                  href="https://github.com/urimkrasniqi1/DATAPOS/releases/download/v1.0.0/DataPOS.rar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 bg-[#00a79d] hover:bg-[#008f86] text-white font-semibold rounded-xl transition-all transform hover:scale-105"
                >
                  Shkarko Tani →
                </a>
              </div>
            </div>
          </div>

          {/* Platform Options */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Zgjidhni Platformën</h2>
            <p className="text-gray-400">Përdorni DataPOS në çdo pajisje</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
            {/* Windows Button - ACTIVE */}
            <a
              href="https://github.com/urimkrasniqi1/DATAPOS/releases/download/v1.0.0/DataPOS.rar"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-gradient-to-b from-[#00a79d]/20 to-[#00a79d]/5 backdrop-blur-sm rounded-2xl p-8 border border-[#00a79d]/30 hover:border-[#00a79d] transition-all duration-500 flex flex-col items-center text-center overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#00a79d]/0 to-[#00a79d]/0 group-hover:from-[#00a79d]/10 group-hover:to-[#00a79d]/20 transition-all duration-500"></div>
              <div className="absolute top-4 right-4 bg-[#00a79d] text-white text-xs font-semibold px-3 py-1 rounded-full">
                SHKARKO
              </div>
              <div className="relative">
                <div className="w-20 h-20 bg-[#00a79d]/20 group-hover:bg-[#00a79d]/30 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110">
                  <Monitor className="w-10 h-10 text-[#00a79d]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Windows</h3>
                <p className="text-gray-400 text-sm mb-4">Aplikacion desktop</p>
                <div className="inline-flex items-center gap-2 text-[#00a79d] text-sm font-medium">
                  <span>Shkarko .RAR →</span>
                </div>
              </div>
            </a>

            {/* macOS Button */}
            <div className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-sm rounded-2xl p-8 border border-white/10 flex flex-col items-center text-center overflow-hidden opacity-60">
              <div className="absolute top-4 right-4 bg-[#00a79d]/20 text-[#00a79d] text-xs font-semibold px-3 py-1 rounded-full">
                SË SHPEJTI
              </div>
              <div className="relative">
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Apple className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">macOS</h3>
                <p className="text-gray-600 text-sm mb-4">Aplikacion desktop</p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Çmimet e Abonimit</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Zgjidhni planin që përshtatet më mirë me nevojat e biznesit tuaj. Të gjitha planet përfshijnë 30 ditë provë falas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pricingPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-gradient-to-b ${
                    plan.popular
                      ? 'from-[#00a79d]/20 to-[#00a79d]/5 border-[#00a79d]'
                      : 'from-white/[0.08] to-white/[0.02] border-white/10'
                  } backdrop-blur-sm rounded-2xl p-6 border flex flex-col`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00a79d] text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      MË I POPULLARIZUAR
                    </div>
                  )}
                  
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-lg font-semibold text-white mb-2">{plan.duration}</h3>
                    <div className="flex items-center justify-center gap-2">
                      {plan.originalPrice && (
                        <span className="text-gray-500 line-through text-lg">{plan.originalPrice}€</span>
                      )}
                      <span className="text-4xl font-bold text-white">{plan.price}€</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{plan.perMonth}€/muaj</p>
                    {plan.savings && (
                      <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full mt-2">
                        <TrendingUp className="w-3 h-3" />
                        Kurseni {plan.savings}€
                      </div>
                    )}
                  </div>

                  <a
                    href="https://github.com/urimkrasniqi1/DATAPOS/releases/download/v1.0.0/DataPOS.rar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-semibold transition-all text-center block ${
                      plan.popular
                        ? 'bg-[#00a79d] hover:bg-[#008f86] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Shkarko Tani
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Apps Section */}
          <div className="mb-16">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-4">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">Aplikacionet Tona</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Zgjidhje Software për Çdo Biznes</h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Sistemet që lehtësojnë punën tuaj dhe rrisin produktivitetin
              </p>
            </div>

            {/* PhoneSoftware - ACTIVE */}
            <div 
              onClick={() => navigate('/phonesoftware/login')}
              className="cursor-pointer relative p-8 rounded-2xl bg-gradient-to-br from-[#00a79d]/20 to-[#00a79d]/5 border border-[#00a79d]/50 overflow-hidden group hover:scale-[1.02] hover:border-[#00a79d] transition-all duration-300 mb-6"
              data-testid="phonesoftware-card"
            >
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 text-xs font-bold bg-[#00a79d] text-white rounded-full">
                  AKTIV - Hyr Tani
                </span>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-[#00a79d]/20 group-hover:bg-[#00a79d]/30 rounded-2xl flex items-center justify-center transition-all">
                  <Smartphone className="w-10 h-10 text-[#00a79d]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-2xl mb-2 flex items-center gap-3">
                    PhoneSoftware
                    <ArrowRight className="w-5 h-5 text-[#00a79d] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-gray-400 mb-4 max-w-2xl">
                    Sistemi i avancuar për menaxhimin e dyqaneve të telefonave: riparime, inventar, shitje, klientë, staf dhe raporte të detajuara.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-[#00a79d]/10 text-[#00a79d] text-xs font-medium rounded-full">Menaxhim i Riparimeve</span>
                    <span className="px-3 py-1 bg-[#00a79d]/10 text-[#00a79d] text-xs font-medium rounded-full">Inventar & Stok</span>
                    <span className="px-3 py-1 bg-[#00a79d]/10 text-[#00a79d] text-xs font-medium rounded-full">CRM Klientësh</span>
                    <span className="px-3 py-1 bg-[#00a79d]/10 text-[#00a79d] text-xs font-medium rounded-full">Raporte & Analitikë</span>
                    <span className="px-3 py-1 bg-[#00a79d]/10 text-[#00a79d] text-xs font-medium rounded-full">Menaxhim Stafi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BookPRO - ACTIVE - Hair Salon Management */}
            <div 
              onClick={() => navigate('/bookpro/login')}
              className="cursor-pointer relative p-8 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/50 overflow-hidden group hover:scale-[1.02] hover:border-rose-500 transition-all duration-300 mb-6"
              data-testid="bookpro-card"
            >
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full">
                  AKTIV - Hyr Tani
                </span>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-rose-500/20 group-hover:bg-rose-500/30 rounded-2xl flex items-center justify-center transition-all">
                  <Scissors className="w-10 h-10 text-rose-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-2xl mb-2 flex items-center gap-3">
                    BookPRO
                    <ArrowRight className="w-5 h-5 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-gray-400 mb-4 max-w-2xl">
                    Sistemi profesional për sallone ondulimi dhe bukurie: rezervime online 24/7, kalendar i avancuar, CRM klientësh dhe menaxhim stafi.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">Rezervime Online 24/7</span>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">Kalendar i Avancuar</span>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">CRM Klientësh</span>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">Menaxhim Stafit</span>
                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 text-xs font-medium rounded-full">Dashboard & Raporte</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HealthPRO - Coming Soon (Super Admin can access) - Healthcare Management */}
            <div 
              onClick={() => isSuperAdmin && navigate('/healthpro/login')}
              className={`relative p-8 rounded-2xl bg-gradient-to-br from-[#00a79d]/10 to-[#00a79d]/5 border border-[#00a79d]/30 overflow-hidden mb-6 ${
                isSuperAdmin 
                  ? 'cursor-pointer hover:scale-[1.02] hover:border-[#00a79d] transition-all duration-300 group' 
                  : ''
              }`}
              data-testid="healthpro-card"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {isSuperAdmin ? (
                  <>
                    <span className="px-4 py-1.5 text-xs font-bold bg-[#00a79d] text-white rounded-full flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" />
                      QASJE ADMIN
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="px-4 py-1.5 text-xs font-bold bg-gray-700 text-gray-300 rounded-full">
                      SË SHPEJTI
                    </span>
                  </>
                )}
              </div>
              <div className={`flex items-start gap-6 ${isSuperAdmin ? '' : 'opacity-80'}`}>
                <div className={`w-20 h-20 bg-[#00a79d]/20 rounded-2xl flex items-center justify-center ${isSuperAdmin ? 'group-hover:bg-[#00a79d]/30' : ''} transition-all`}>
                  <HeartPulse className="w-10 h-10 text-[#00a79d]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-2xl mb-2 flex items-center gap-3">
                    HealthPRO
                    {isSuperAdmin ? (
                      <ArrowRight className="w-5 h-5 text-[#00a79d] opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded">v1.0 në zhvillim</span>
                    )}
                  </h3>
                  <p className="text-gray-400 mb-4 max-w-2xl">
                    Sistemi profesional për menaxhimin e instituteve shëndetësore dhe komuniteteve: rezidentë, kontrolla mjekësore, terapi, vizita dhe menaxhim stafi.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>Menaxhim Rezidentësh</span>
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>Kontrolla Mjekësore</span>
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>Terapi & Trajtim</span>
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>Vizita Shtëpie/Komunitet</span>
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>HR & Pagat</span>
                    <span className={`px-3 py-1 bg-[#00a79d]/10 ${isSuperAdmin ? 'text-[#00a79d]' : 'text-[#00a79d]/70'} text-xs font-medium rounded-full`}>Raporte të Avancuara</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon Apps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {comingSoonApps.map((app, index) => (
                <div
                  key={index}
                  className={`relative p-6 rounded-2xl bg-gradient-to-br ${app.gradient} border ${app.borderColor} overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold bg-white/10 text-white rounded-full backdrop-blur-sm">
                      SË SHPEJTI
                    </span>
                  </div>
                  <div className={`w-14 h-14 ${app.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                    <app.icon className={`w-7 h-7 ${app.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-white text-lg mb-2">{app.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {app.description}
                  </p>
                  <ul className="space-y-2">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 ${app.dotColor} rounded-full`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent rounded-2xl p-8 border border-white/10 mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Çfarë Përfshihet?</h2>
              <p className="text-gray-400">Të gjitha planet përfshijnë këto veçori</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-6 h-6 bg-[#00a79d]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[#00a79d]" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-sm mb-8">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00a79d]" />
              <span>100% i sigurt</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00a79d]" />
              <span>I shpejtë dhe efikas</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#00a79d]" />
              <span>Mbështetje 24/7</span>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-[#00a79d]/10 via-[#00a79d]/20 to-[#00a79d]/10 rounded-2xl p-8 border border-[#00a79d]/20">
            <h2 className="text-2xl font-bold text-white mb-4">Gati për të Filluar?</h2>
            <p className="text-gray-400 mb-6">Shkarkoni aplikacionin dhe filloni të menaxhoni shitjet tuaja.</p>
            <a
              href="https://github.com/urimkrasniqi1/DATAPOS/releases/download/v1.0.0/DataPOS.rar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-[#00a79d] hover:bg-[#008f86] text-white font-semibold rounded-xl transition-all transform hover:scale-105 text-lg"
            >
              Shkarko për Windows →
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative py-8 text-center border-t border-white/5">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} DataPOS. Të gjitha të drejtat e rezervuara.
        </p>
      </footer>
    </div>
  );
};

export default LandingDashboard;
