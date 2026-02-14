import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { X, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const RescheduleModal = ({ isOpen, onClose, appointment, onUpdate }) => {
  const { theme } = useContext(AuthContext);
  const isDark = theme === 'dark';
  
  const [date, setDate] = useState(appointment?.appointment_date || '');
  const [time, setTime] = useState(appointment?.appointment_time || '');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL;

  const handleReschedule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/appointments/status/${appointment.id}`, 
        { 
          status: 'Confirmed', 
          appointment_date: date,
          appointment_time: time,
          reason: reason
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (onUpdate) onUpdate(); // Refresh the dashboard list
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reschedule Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md rounded-[2rem] overflow-hidden border shadow-2xl ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
          >
            {/* Header */}
            <div className={`px-8 py-6 border-b ${isDark ? 'border-white/5 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif font-bold">Reschedule Appointment</h3>
                  <p className="text-xs opacity-70 mt-1">Patient: {appointment?.patient_name}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"><X className="h-5 w-5" /></button>
              </div>
            </div>

            <form onSubmit={handleReschedule} className="p-8 space-y-6">
              {/* Date Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">New Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]} 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark ? 'bg-slate-800 border-white/5 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
                  />
                </div>
              </div>

              {/* Time Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">New Time</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
                  <input 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required
                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none border transition-all ${isDark ? 'bg-slate-800 border-white/5 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
                  />
                </div>
              </div>

              {/* Reason Input (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest opacity-50">Reason for Change (Optional)</label>
                <textarea 
                  rows="2"
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="e.g. Schedule conflict..."
                  className={`w-full p-4 rounded-xl outline-none border transition-all resize-none ${isDark ? 'bg-slate-800 border-white/5 focus:border-blue-500' : 'bg-white border-slate-200 focus:border-blue-500'}`} 
                />
              </div>

              <div className={`p-4 rounded-xl text-xs flex gap-3 ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>Changing this will automatically notify the patient via email and their dashboard activity log.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
              >
                {loading ? 'Updating...' : <><CheckCircle className="h-5 w-5" /> Confirm Reschedule</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RescheduleModal;