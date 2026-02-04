import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Calendar, Clock, CheckCircle, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ isOpen, onClose, doctor }) => {
  const { theme } = useContext(AuthContext);
  const isPremium = theme === 'premium';
  const isDark = theme === 'dark';
  
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  const backendUrl = import.meta.env.VITE_API_URL;
  const daysMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

  const generateTimeSlots = (availabilityString) => {
    const defaultStart = "09:00 AM";
    const defaultEnd = "05:00 PM";
    let startStr = defaultStart;
    let endStr = defaultEnd;

    if (availabilityString && availabilityString.includes(',')) {
      const timePart = availabilityString.split(',')[1].trim();
      const times = timePart.split('-');
      if (times.length === 2) {
        startStr = times[0].trim();
        endStr = times[1].trim();
      }
    }

    const parseToMinutes = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseToMinutes(startStr);
    const endMinutes = parseToMinutes(endStr);
    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += 15) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      const minStr = min < 10 ? '0' + min : min;
      slots.push(`${hour12}:${minStr} ${ampm}`);
    }
    return slots;
  };

  const checkDayAvailability = (selectedDate) => {
    if (!doctor.availability || !selectedDate) return true;
    const dayPart = doctor.availability.split(',')[0].trim();
    const dayRange = dayPart.split('-').map(d => d.trim());

    if (dayRange.length === 2) {
      const startDayNum = daysMap[dayRange[0]];
      const endDayNum = daysMap[dayRange[1]];
      const selectedDayNum = new Date(selectedDate).getDay();

      if (startDayNum <= endDayNum) {
        return selectedDayNum >= startDayNum && selectedDayNum <= endDayNum;
      } else {
        return selectedDayNum >= startDayNum || selectedDayNum <= endDayNum;
      }
    }
    return true;
  };

  useEffect(() => {
    if (doctor) {
      const slots = generateTimeSlots(doctor.availability);
      setTimeSlots(slots);
      setTime(slots[0] || '');
    }
  }, [doctor]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    if (!checkDayAvailability(selectedDate)) {
      toast.error(`Doctor is only available ${doctor.availability.split(',')[0]}`, {
        icon: <AlertCircle className="text-red-500" />
      });
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    // Bypass validation for emergency bookings
    if (!doctor.is_emergency && !checkDayAvailability(date)) {
      return toast.error("Please select a day the doctor is available.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // FIXED: Instant Booking Payload for Emergency
      const payload = doctor.is_emergency 
        ? { 
            doctorId: doctor.id, 
            isEmergency: true, 
            appointmentDate: new Date().toISOString().split('T')[0], 
            appointmentTime: 'IMMEDIATE',
            doctorName: doctor.full_name 
          }
        : { 
            doctorId: doctor.id, 
            appointmentDate: date, 
            appointmentTime: time, 
            doctorName: doctor.full_name 
          };

      await axios.post(
        `${backendUrl}/api/appointments/book`, 
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(doctor.is_emergency ? "Emergency SOS Dispatched!" : "Elite Session Booked!");
      onClose();
    } catch (err) {
      toast.error("Booking Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md rounded-[2.5rem] overflow-hidden border transition-all ${isPremium ? 'bg-slate-900 border-yellow-500/20 text-white' : 'bg-white border-slate-100 text-slate-900 shadow-2xl'}`}
          >
            {/* Modal Header - Red for Emergency */}
            <div className={`px-8 py-6 flex justify-between items-center ${doctor.is_emergency ? 'bg-red-600 text-white' : isPremium ? 'bg-slate-800/50 border-b border-white/5' : 'bg-slate-900 text-white'}`}>
              <div className="text-left">
                {doctor.is_emergency ? (
                    <div className="inline-flex items-center gap-1 text-white text-[9px] font-black uppercase tracking-tighter mb-1">
                        <Zap className="h-2 w-2 fill-white" /> Instant Dispatch
                    </div>
                ) : isPremium && (
                    <div className="inline-flex items-center gap-1 text-yellow-500 text-[9px] font-black uppercase tracking-tighter mb-1">
                        <Sparkles className="h-2 w-2" /> Elite Booking
                    </div>
                )}
                <h3 className="text-xl font-serif font-bold italic">{doctor.is_emergency ? 'Emergency SOS' : 'Book Session'}</h3>
                <p className="text-xs opacity-70">Dr. {doctor.full_name}</p>
              </div>
              <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleBooking} className="p-8 space-y-6">
              {doctor.is_emergency ? (
                // EMERGENCY INSTANT UI
                <div className={`p-6 rounded-3xl border-2 border-dashed ${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-4 text-red-600 mb-4">
                        <div className="p-3 bg-red-600 rounded-2xl text-white animate-pulse"><Zap className="h-6 w-6 fill-white" /></div>
                        <p className="font-bold text-lg">Live Response Mode</p>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        By clicking below, a priority alert is sent to Dr. {doctor.full_name.split(' ')[0]}. You will receive an instant "Join Call" link on your dashboard as soon as they accept.
                    </p>
                </div>
              ) : (
                // STANDARD BOOKING UI
                <>
                  <div className={`p-4 rounded-2xl flex items-center gap-3 border ${isPremium ? 'bg-slate-950 border-yellow-500/10 text-yellow-500' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                    <Clock className="h-4 w-4" />
                    <span className="text-[11px] font-bold uppercase tracking-tight">Hours: {doctor.availability}</span>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <input type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={handleDateChange} required
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all ${isPremium ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-200'}`} />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Available Slots</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                      <select value={time} onChange={(e) => setTime(e.target.value)} required
                        className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all appearance-none ${isPremium ? 'bg-slate-800 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" disabled={loading || (!doctor.is_emergency && !checkDayAvailability(date))}
                className={`w-full py-5 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-xl ${
                    doctor.is_emergency ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30' :
                    isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 
                    'bg-slate-950 text-white hover:bg-emerald-600'
                } disabled:opacity-50`}
              >
                {loading ? "Processing..." : (
                    <>
                        {doctor.is_emergency ? <Zap className="h-5 w-5 fill-white" /> : <CheckCircle className="h-5 w-5" />} 
                        {doctor.is_emergency ? 'Dispatch Emergency Call' : 'Confirm Elite Booking'}
                    </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;