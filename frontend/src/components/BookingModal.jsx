import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, AlertCircle, Zap, Loader2, IndianRupee, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from './ui/Modal';
import { motion } from 'framer-motion';

const BookingModal = ({ isOpen, onClose, doctor }) => {
  const { user } = useContext(AuthContext);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  const backendUrl = import.meta.env.VITE_API_URL;
  const daysMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

  const generateTimeSlots = (availabilityString) => {
    let startStr = "09:00 AM", endStr = "05:00 PM";
    if (availabilityString && availabilityString.includes(',')) {
      const timePart = availabilityString.split(',')[1].trim();
      const times = timePart.split('-');
      if (times.length === 2) { startStr = times[0].trim(); endStr = times[1].trim(); }
    }
    const parseToMinutes = (timeStr) => {
      const [t, modifier] = timeStr.split(' ');
      let [hours, minutes] = t.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    const slots = [];
    for (let m = parseToMinutes(startStr); m < parseToMinutes(endStr); m += 15) {
      const h = Math.floor(m / 60), min = m % 60;
      slots.push(`${h % 12 || 12}:${min < 10 ? '0' + min : min} ${h >= 12 ? 'PM' : 'AM'}`);
    }
    return slots;
  };

  const checkDayAvailability = (selectedDate) => {
    if (!doctor.availability || !selectedDate) return true;
    const dayPart = doctor.availability.split(',')[0].trim();
    const dayRange = dayPart.split('-').map(d => d.trim());
    if (dayRange.length === 2) {
      const startDayNum = daysMap[dayRange[0]], endDayNum = daysMap[dayRange[1]];
      const selectedDayNum = new Date(selectedDate).getDay();
      return startDayNum <= endDayNum
        ? selectedDayNum >= startDayNum && selectedDayNum <= endDayNum
        : selectedDayNum >= startDayNum || selectedDayNum <= endDayNum;
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
      toast.error(`Doctor is only available ${doctor.availability.split(',')[0]}`);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!doctor.is_emergency && !checkDayAvailability(date)) {
      return toast.error("Please select a day the doctor is available.");
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = doctor.is_emergency 
        ? { doctorId: doctor.id, isEmergency: true, appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: 'IMMEDIATE', doctorName: doctor.full_name }
        : { doctorId: doctor.id, appointmentDate: date, appointmentTime: time, doctorName: doctor.full_name };

      await axios.post(`${backendUrl}/api/appointments/book`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(doctor.is_emergency ? "Emergency SOS Dispatched!" : "Session Booked!");
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Booking Failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={doctor?.is_emergency ? 'Emergency SOS' : 'Book Session'} size="md">
      {doctor && (
        <form onSubmit={handleBooking} className="space-y-5">
          {/* Doctor Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-display font-bold ${
              doctor.is_emergency ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white'
            }`}>
              {doctor.full_name?.charAt(0)}
            </div>
            <div>
              <h4 className="font-display font-bold text-[var(--text-primary)]">Dr. {doctor.full_name}</h4>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span>{doctor.specialization}</span>
                <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />₹{doctor.consultation_fee}</span>
              </div>
            </div>
          </div>

          {doctor.is_emergency ? (
            /* Emergency UI */
            <div className="p-5 rounded-xl border-2 border-dashed border-red-500/30 bg-red-500/5">
              <div className="flex items-center gap-3 text-red-500 mb-3">
                <div className="p-2.5 bg-red-500 rounded-xl text-white animate-pulse">
                  <Zap className="h-5 w-5 fill-white" />
                </div>
                <p className="font-display font-bold text-lg">Live Response Mode</p>
              </div>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                A priority alert is sent to Dr. {doctor.full_name?.split(' ')[0]}. You'll receive a "Join Call" link on your dashboard when accepted.
              </p>
            </div>
          ) : (
            /* Standard Booking UI */
            <>
              <div className="p-3 rounded-xl flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/10 text-cyan-500 text-xs font-bold">
                <Clock className="h-3.5 w-3.5" />
                Hours: {doctor.availability || 'Flexible'}
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Select Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={handleDateChange} required
                    className="glass-input w-full pl-11 pr-4" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Time Slot</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <select value={time} onChange={(e) => setTime(e.target.value)} required
                    className="glass-input w-full pl-11 pr-10 appearance-none cursor-pointer">
                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || (!doctor.is_emergency && !checkDayAvailability(date))}
            className={`w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 disabled:opacity-50 transition-all ${
              doctor.is_emergency
                ? 'bg-red-500 text-white shadow-glow-red hover:bg-red-600'
                : 'gradient-primary text-white shadow-glow-cyan'
            }`}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                {doctor.is_emergency ? <Zap className="h-4 w-4 fill-white" /> : <CheckCircle className="h-4 w-4" />}
                {doctor.is_emergency ? 'Dispatch Emergency' : 'Confirm Booking'}
              </>
            )}
          </motion.button>
        </form>
      )}
    </Modal>
  );
};

export default BookingModal;