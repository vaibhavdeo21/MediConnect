import { useState } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Modal from './ui/Modal';

const RescheduleModal = ({ isOpen, onClose, appointment, onUpdate }) => {
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
      await axios.put(`${backendUrl}/api/appointments/status/${appointment.id}`, 
        { status: 'Confirmed', appointment_date: date, appointment_time: time, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment Rescheduled");
      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reschedule Failed");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reschedule Appointment" size="md">
      <form onSubmit={handleReschedule} className="space-y-5">
        {/* Patient Info */}
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          Patient: <span className="font-semibold text-[var(--text-primary)]">{appointment?.patient_name}</span>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">New Date</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input type="date" min={new Date().toISOString().split('T')[0]} value={date} onChange={(e) => setDate(e.target.value)} required className="glass-input w-full pl-11 pr-4" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">New Time</label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="glass-input w-full pl-11 pr-4" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Reason (Optional)</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-[var(--text-muted)]" />
            <textarea rows="2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Schedule conflict..."
              className="glass-input w-full pl-11 pr-4 resize-none" />
          </div>
        </div>

        <div className="p-3 rounded-xl text-xs flex gap-2 bg-cyan-500/5 border border-cyan-500/10 text-cyan-500">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>This will notify the patient via email and their activity log.</p>
        </div>

        <motion.button whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 gradient-primary text-white shadow-glow-cyan disabled:opacity-50">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Confirm Reschedule</>}
        </motion.button>
      </form>
    </Modal>
  );
};

export default RescheduleModal;