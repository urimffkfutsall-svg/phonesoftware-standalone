import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { toast, Toaster } from 'sonner';
import { 
  Scissors, Calendar, Clock, User, Phone, Mail, 
  ChevronLeft, ChevronRight, Check, Sparkles, Star,
  MapPin, Instagram, Facebook
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const BPPublicBooking = () => {
  const { salonSlug } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: Services, 2: Staff & Time, 3: Details, 4: Confirmation
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [clientInfo, setClientInfo] = useState({
    full_name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  useEffect(() => {
    loadSalonData();
  }, [salonSlug]);

  useEffect(() => {
    if (selectedStylist && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedStylist, selectedDate]);

  const loadSalonData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/bookpro/public/${salonSlug}`);
      const { salon: salonData, services: servicesData, staff: staffData } = response.data;
      setSalon(salonData);
      setServices(servicesData);
      setStaff(staffData);
      
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading salon:', error);
      setSalon(null);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const response = await axios.get(
        `${API}/bookpro/public/${salonSlug}/availability?stylist_id=${selectedStylist}&date=${selectedDate}&duration=${getTotalDuration()}`
      );
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
    }
  };

  const toggleService = (service) => {
    const exists = selectedServices.find(s => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0);
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  };

  const handleSubmitBooking = async () => {
    if (!clientInfo.full_name || !clientInfo.phone) {
      toast.error('Ju lutem plotësoni emrin dhe telefonin');
      return;
    }

    try {
      const response = await axios.post(`${API}/bookpro/public/${salonSlug}/book`, {
        services: selectedServices.map(s => ({
          service_id: s.id,
          service_name: s.name,
          price: s.price,
          duration_minutes: s.duration_minutes
        })),
        stylist_id: selectedStylist,
        appointment_date: selectedDate,
        start_time: selectedTime,
        client_name: clientInfo.full_name,
        client_phone: clientInfo.phone,
        client_email: clientInfo.email,
        notes: clientInfo.notes
      });

      setBookingDetails(response.data);
      setBookingComplete(true);
      setStep(4);
      toast.success('Rezervimi u krye me sukses!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Gabim gjatë rezervimit');
    }
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('sq-AL', { weekday: 'short', day: 'numeric', month: 'short' })
      });
    }
    return dates;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      haircut: 'Prerje',
      coloring: 'Ngjyrosje',
      styling: 'Stilim',
      treatment: 'Trajtim',
      extensions: 'Zgjatim',
      makeup: 'Grim',
      other: 'Të tjera'
    };
    return labels[category] || category;
  };

  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-200 border-t-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <Scissors className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Salloni nuk u gjet</h1>
          <p className="text-gray-500 mb-6">Linku i rezervimit nuk është i vlefshëm ose salloni është joaktiv.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Kthehu në faqen kryesore
          </Button>
        </Card>
      </div>
    );
  }

  // Success Page
  if (bookingComplete && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4">
        <Toaster position="top-center" richColors />
        <div className="max-w-lg mx-auto pt-12">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-10 w-10" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Rezervimi u Konfirmua!</h1>
              <p className="text-white/80">Ju faleminderit që zgjodhët {salon.salon_name}</p>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="text-center p-4 bg-rose-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Numri i Rezervimit</p>
                <p className="text-2xl font-bold text-rose-600">{bookingDetails.appointment_number}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium">{new Date(bookingDetails.appointment_date).toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ora</p>
                    <p className="font-medium">{bookingDetails.start_time} - {bookingDetails.end_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Scissors className="h-5 w-5 text-rose-500" />
                  <div>
                    <p className="text-sm text-gray-500">Shërbimet</p>
                    <p className="font-medium">{bookingDetails.services?.map(s => s.service_name).join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Totali</span>
                  <span className="text-2xl font-bold text-rose-600">€{bookingDetails.total_price?.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Do t'ju kontaktojmë në numrin <strong>{clientInfo.phone}</strong> për konfirmim.
                </p>
              </div>

              <Button 
                onClick={() => window.location.reload()} 
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
              >
                Bëj Rezervim Tjetër
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-rose-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">{salon.salon_name}</h1>
                {salon.city && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {salon.city}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {salon.instagram && (
                <a href={salon.instagram} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-rose-50 rounded-full">
                  <Instagram className="h-5 w-5 text-rose-500" />
                </a>
              )}
              {salon.facebook && (
                <a href={salon.facebook} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-rose-50 rounded-full">
                  <Facebook className="h-5 w-5 text-rose-500" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 rounded ${step > s ? 'bg-rose-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Services */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Zgjidhni Shërbimet</h2>
              <p className="text-gray-500">Zgjidhni një ose më shumë shërbime</p>
            </div>

            {Object.entries(groupedServices).map(([category, categoryServices]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  {getCategoryLabel(category)}
                </h3>
                <div className="grid gap-3">
                  {categoryServices.map((service) => {
                    const isSelected = selectedServices.find(s => s.id === service.id);
                    return (
                      <Card 
                        key={service.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-rose-500 bg-rose-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleService(service)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-500'
                            }`}>
                              {isSelected ? <Check className="h-5 w-5" /> : <Scissors className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{service.name}</p>
                              <p className="text-sm text-gray-500">{service.duration_minutes} min</p>
                            </div>
                          </div>
                          <p className="text-xl font-bold text-rose-600">€{service.price}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Summary Bar */}
            {selectedServices.length > 0 && (
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 p-4 shadow-lg">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{selectedServices.length} shërbime • {getTotalDuration()} min</p>
                    <p className="text-xl font-bold text-rose-600">€{getTotalPrice().toFixed(2)}</p>
                  </div>
                  <Button 
                    onClick={() => setStep(2)}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-8"
                  >
                    Vazhdo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Staff & Time */}
        {step === 2 && (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Zgjidhni Stilistin & Kohën</h2>
              <p className="text-gray-500">Zgjidhni stilistin e preferuar dhe orën</p>
            </div>

            {/* Stylist Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Stilisti</h3>
              <div className="grid grid-cols-2 gap-3">
                {staff.map((member) => (
                  <Card 
                    key={member.id}
                    className={`cursor-pointer transition-all ${
                      selectedStylist === member.id ? 'ring-2 ring-rose-500 bg-rose-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedStylist(member.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        selectedStylist === member.id ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-500'
                      }`}>
                        <User className="h-8 w-8" />
                      </div>
                      <p className="font-medium text-gray-800">{member.full_name}</p>
                      {member.specializations?.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {member.specializations.slice(0, 2).map(s => getCategoryLabel(s)).join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Data</h3>
              <ScrollArea className="w-full">
                <div className="flex gap-2 pb-2">
                  {getDateOptions().map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all ${
                        selectedDate === date.value 
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                          : 'bg-white border hover:border-rose-300'
                      }`}
                    >
                      <p className="text-sm font-medium">{date.label}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Time Selection */}
            {selectedStylist && selectedDate && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Ora e Lirë</h3>
                {availableSlots.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Nuk ka orë të lira për këtë datë</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-3 rounded-lg text-center transition-all ${
                          selectedTime === slot 
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' 
                            : 'bg-white border hover:border-rose-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 p-4 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Mbrapa
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!selectedStylist || !selectedDate || !selectedTime}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-8"
                >
                  Vazhdo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Client Details */}
        {step === 3 && (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Të Dhënat Tuaja</h2>
              <p className="text-gray-500">Plotësoni informacionet për të përfunduar rezervimin</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Emri i Plotë *</Label>
                  <Input 
                    id="name"
                    value={clientInfo.full_name}
                    onChange={(e) => setClientInfo({...clientInfo, full_name: e.target.value})}
                    placeholder="Emri dhe Mbiemri"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numri i Telefonit *</Label>
                  <Input 
                    id="phone"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                    placeholder="+383 44 xxx xxx"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opsional)</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                    placeholder="email@example.com"
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Shënime (opsional)</Label>
                  <Input 
                    id="notes"
                    value={clientInfo.notes}
                    onChange={(e) => setClientInfo({...clientInfo, notes: e.target.value})}
                    placeholder="Shënime shtesë..."
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="bg-rose-50 border-rose-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Përmbledhja e Rezervimit</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shërbimet:</span>
                    <span className="font-medium">{selectedServices.map(s => s.name).join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ora:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kohëzgjatja:</span>
                    <span className="font-medium">{getTotalDuration()} minuta</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-rose-200">
                    <span className="text-lg font-semibold">Totali:</span>
                    <span className="text-2xl font-bold text-rose-600">€{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-rose-100 p-4 shadow-lg">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Mbrapa
                </Button>
                <Button 
                  onClick={handleSubmitBooking}
                  disabled={!clientInfo.full_name || !clientInfo.phone}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 px-8"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Konfirmo Rezervimin
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BPPublicBooking;
