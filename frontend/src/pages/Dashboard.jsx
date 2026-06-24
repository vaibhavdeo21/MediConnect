import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users, Calendar, Clock, Activity, Search,
  ArrowUpRight, TrendingUp, Shield, Sparkles, Crown,
  CheckCircle2, AlertCircle, History, MessageSquare, Wallet, 
  Video, Zap, X, Check, Bot, Send, Loader2, ChevronRight, AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import { io as socketIO } from "socket.io-client";
import RescheduleModal from "../components/RescheduleModal";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import GradientText from "../components/ui/GradientText";
import SkeletonLoader from "../components/ui/SkeletonLoader";
import useCountdown from "../hooks/useCountdown";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1, transition: { duration: 0.4 } } };

// Emergency Timer Component
const EmergencyTimer = ({ timeoutAt, onExpire, isPatient }) => {
  const { minutes, seconds, isExpired, totalSeconds } = useCountdown(timeoutAt);

  useEffect(() => {
    if (isExpired && onExpire) onExpire();
  }, [isExpired, onExpire]);

  if (isExpired) {
    return (
      <div className="mt-2 flex items-center gap-2 text-sm font-bold text-red-500">
        <AlertCircle className="h-4 w-4" />
        {isPatient ? "Doctor Unavailable — Finding another specialist" : "Time Expired — Penalty Applied"}
      </div>
    );
  }

  return (
    <div className={`mt-2 flex items-center gap-2 font-bold text-sm font-mono-code ${
      totalSeconds < 120 ? 'text-red-500 animate-pulse' : 'text-amber-500'
    }`}>
      <Clock className="h-4 w-4" />
      {minutes}:{seconds < 10 ? '0' : ''}{seconds}
      <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
        {isPatient ? 'waiting for doctor' : 'to respond'}
      </span>
    </div>
  );
};

// ── Decline Reason Modal ─────────────────────────────────────────────────────
const DeclineReasonModal = ({ isOpen, isEmergency, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.warning("Please provide a reason for declining.");
      return;
    }
    setSubmitting(true);
    await onConfirm(reason.trim());
    setSubmitting(false);
    setReason("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="glass-card w-full max-w-md p-6 border border-red-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">
                {isEmergency ? 'Decline Emergency SOS' : 'Decline Appointment'}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                {isEmergency ? 'A reason is required for declining emergency requests.' : 'Please provide a reason for declining.'}
              </p>
            </div>
          </div>

          {isEmergency && (
            <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 mb-4">
              <p className="text-xs text-red-400 font-semibold">
                ⚠️ Declining an emergency SOS will be recorded. Repeated declines may result in penalties.
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 block">
              Reason for Declining *
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isEmergency ? "e.g. In surgery, handling critical patient, technical issue..." : "e.g. Schedule conflict, patient outside specialty..."}
              className="glass-input w-full text-sm resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl glass border border-[var(--border-primary)] text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Confirm Decline
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Dashboard = () => {
  const { user, theme, updateUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [liveSession, setLiveSession] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(user?.is_emergency_active || false);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  // Decline reason modal state
  const [declineModal, setDeclineModal] = useState({ open: false, apptId: null, isEmergency: false });
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${user?.fullName || 'there'}! I'm your AI health assistant. How can I help you today?` }
  ]);
  const chatScrollRef = useRef(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  const isDoctor = user?.role === 'doctor';
  const isPremium = !isDoctor && user?.is_premium;

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  // ── Fetch dashboard data using Promise.allSettled so one failed
  //    request never blocks the whole dashboard from rendering ──────
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, logsRes, activeCallRes, apptRes] = await Promise.allSettled([
        axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
        axios.get(`${backendUrl}/api/users/activity-logs`, { headers }),
        axios.get(`${backendUrl}/api/appointments/active-call`, { headers }),
        axios.get(`${backendUrl}/api/appointments/my-appointments`, { headers })
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      else setStats({});                                 // render with empty stats rather than forever-loading
      if (logsRes.status === 'fulfilled') setActivities(logsRes.value.data);
      if (apptRes.status === 'fulfilled') setAppointments(apptRes.value.data);
      if (activeCallRes.status === 'fulfilled' && activeCallRes.value.data) setLiveSession(activeCallRes.value.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setStats({});   // unblock the UI even on unexpected error
    }
  };

  useEffect(() => { fetchData(); }, [backendUrl]);

  // ── Socket: reconnect on penalty/expired so sections reload instantly ──
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const socket = socketIO(backendUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 3,
    });

    const refreshAndNotify = (msg) => {
      fetchData();
      if (msg) toast.error(msg, { theme: 'dark', position: 'top-center' });
    };

    // Doctor: penalty was applied for missing an SOS
    socket.on('penalty:applied', (data) => {
      refreshAndNotify(data.message || '⚠️ Penalty applied for missed emergency.');
    });

    // Patient: doctor didn't respond in time
    socket.on('emergency:expired', (data) => {
      refreshAndNotify('Doctor unavailable. Finding another specialist...');
    });

    // General appointment status changes
    socket.on('appointment:status', () => fetchData());
    socket.on('emergency:accepted', () => fetchData());
    socket.on('emergency:reassigned', () => fetchData());
    socket.on('emergency:new', () => fetchData());

    return () => socket.disconnect();
  }, [user, backendUrl]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userText = chatMessage;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText }]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/ai/chat`, 
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, sender: 'bot', 
        text: res.data.reply || "I didn't receive a reply." 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Service temporarily unavailable. Please retry." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleEmergencyActive = async () => {
    try {
      const token = localStorage.getItem("token");
      const newState = !isEmergencyActive;
      await axios.put(`${backendUrl}/api/users/emergency-status`, { active: newState }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsEmergencyActive(newState);
      updateUser({ is_emergency_active: newState });
      toast.info(newState ? "🟢 Emergency Mode Active" : "⚫ Emergency Mode Offline");
    } catch (err) { toast.error("Update Failed"); }
  };

  const onTimerExpire = () => {
    if (!isDoctor) {
      toast.error("Doctor unavailable. Finding another specialist...", {
        position: "top-center", autoClose: false, theme: "dark"
      });
    }
    fetchData();
  };

  const handleStatusUpdate = async (id, status, reason) => {
    const targetAppt = appointments.find(a => a.id === id);
    if (targetAppt?.status === 'Expired') {
      toast.error("This emergency has expired.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/appointments/status/${id}`, 
        { status, reason: reason || undefined }, { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      toast.success(`${status === 'Confirmed' ? '✅ Accepted' : '❌ Declined'}`);
    } catch (err) { toast.error("Action Failed"); }
  };

  const openDeclineModal = (apptId, isEmergency) => {
    setDeclineModal({ open: true, apptId, isEmergency: !!isEmergency });
  };

  const handleDeclineConfirm = async (reason) => {
    await handleStatusUpdate(declineModal.apptId, 'Cancelled', reason);
    setDeclineModal({ open: false, apptId: null, isEmergency: false });
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.filter(appt => appt.id !== id));
      toast.success("Appointment cancelled");
    } catch (err) { toast.error("Deletion Failed"); }
  };

  // Loading state
  if (!stats) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <SkeletonLoader type="text" count={1} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonLoader type="stat" count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500">
      {rescheduleAppt && (
        <RescheduleModal isOpen={!!rescheduleAppt} onClose={() => setRescheduleAppt(null)} appointment={rescheduleAppt} onUpdate={fetchData} />
      )}

      {/* Decline Reason Modal */}
      <DeclineReasonModal
        isOpen={declineModal.open}
        isEmergency={declineModal.isEmergency}
        onConfirm={handleDeclineConfirm}
        onClose={() => setDeclineModal({ open: false, apptId: null, isEmergency: false })}
      />

      {/* Emergency Triage Queue */}
      {appointments.some(a => a.is_emergency && a.status === 'Pending') && (
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-emergency" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
              {isDoctor ? 'Active Emergency Triage' : 'Waiting for Doctor'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.filter(a => a.is_emergency && a.status === 'Pending').map(appt => (
              <motion.div
                key={appt.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass-card p-6 border-red-500/30 bg-red-500/5 flex justify-between items-center"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">
                    {isDoctor ? 'Immediate SOS Request' : 'Connecting to Specialist'}
                  </p>
                  <h4 className="text-lg font-display font-bold text-[var(--text-primary)]">
                    {isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}
                  </h4>
                  <EmergencyTimer timeoutAt={appt.timeout_at} onExpire={onTimerExpire} isPatient={!isDoctor} />
                </div>
                {isDoctor && (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                      className="p-3 bg-emerald-500 rounded-xl text-white shadow-glow-green"
                    >
                      <Check className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeclineModal(appt.id, true)}
                      className="p-3 glass rounded-xl text-red-500 border border-red-500/20"
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chat Widget (Premium Patients Only) */}
      {isPremium && (
        <>
          <AnimatePresence>
            {isChatOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-20 right-6 w-80 md:w-96 h-[500px] z-[100] glass-card overflow-hidden flex flex-col border-cyan-500/20"
              >
                <div className="gradient-primary p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-display font-bold">AI Health Assistant</span>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-hidden">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.sender === 'bot' ? 'bg-cyan-500/20 text-cyan-500' : 'gradient-primary text-white'
                      }`}>
                        {msg.sender === 'bot' ? <Bot className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                      </div>
                      <div className={`p-3 rounded-xl text-sm max-w-[80%] ${
                        msg.sender === 'bot'
                          ? 'glass border border-[var(--border-primary)] text-[var(--text-primary)]'
                          : 'gradient-primary text-white'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="glass p-3 rounded-xl border border-[var(--border-primary)]">
                        <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="p-3 border-t border-[var(--border-primary)] flex gap-2">
                  <input
                    type="text" value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask MediConnect AI..."
                    className="glass-input flex-1 text-sm"
                  />
                  <motion.button whileTap={{ scale: 0.9 }} type="submit" disabled={isChatLoading}
                    className="p-2.5 gradient-primary rounded-xl text-white disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 z-[90] px-5 py-3 rounded-2xl gradient-primary text-white shadow-glow-cyan flex items-center gap-2 font-semibold text-sm"
          >
            <Sparkles className="h-4 w-4" />
            {isChatOpen ? 'Close AI' : 'AI Assistant'}
          </motion.button>
        </>
      )}

      {/* Main Content */}
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Session Banner */}
        <AnimatePresence>
          {liveSession && !isDoctor && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 overflow-hidden">
              <div className="p-0.5 rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-red-500 shadow-glow-red">
                <div className="rounded-[0.9rem] p-6 bg-[var(--bg-primary)] flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-xl animate-ping opacity-20" />
                      <div className="p-3 bg-red-500 rounded-xl text-white relative z-10"><Video className="h-5 w-5" /></div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Emergency Session
                      </div>
                      <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Dr. {liveSession.doctor_name} is waiting</h2>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open(liveSession.meeting_link, '_blank')}
                    className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold shadow-glow-red flex items-center gap-2"
                  >
                    Join Call <Zap className="h-4 w-4 fill-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={item} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {isPremium && (
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Premium Member</span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
              Hello, {isDoctor ? 'Dr. ' : ''}{user.fullName?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">Your healthcare overview</p>
          </div>
          <div className="flex gap-3 items-center">
            {isDoctor && user?.is_emergency && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleEmergencyActive}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                  isEmergencyActive
                    ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-glow-red'
                    : 'glass text-[var(--text-muted)] border-[var(--border-primary)]'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isEmergencyActive ? 'bg-red-500 animate-pulse' : 'bg-[var(--text-muted)]'}`} />
                SOS {isEmergencyActive ? 'Online' : 'Offline'}
              </motion.button>
            )}
            <GlassCard padding="sm" hover={false} className="!rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Today</p>
              <p className="text-sm font-display font-semibold text-[var(--text-primary)]">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </p>
            </GlassCard>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={container} className={`grid grid-cols-2 ${isDoctor ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4 mb-8`}>
          {isDoctor ? (
            <>
              <StatCard icon={Calendar} title="Total Appts" value={stats.total_appointments} gradient="from-blue-500 to-cyan-500" />
              <StatCard icon={Clock} title="Pending" value={stats.pending_requests} gradient="from-amber-500 to-orange-500" />
              <StatCard icon={Activity} title="Today" value={stats.today_appointments} gradient="from-emerald-500 to-cyan-500" />
              <StatCard icon={Users} title="Patients" value={stats.total_patients} gradient="from-purple-500 to-pink-500" />
              <StatCard icon={Wallet} title="Earnings" value={stats?.total_revenue || 0} prefix="₹" gradient="from-amber-500 to-red-500" isNegative={(stats?.total_revenue || 0) < 0} />
            </>
          ) : (
            <>
              <StatCard icon={TrendingUp} title="Total Visits" value={stats.total_appointments} gradient="from-cyan-500 to-blue-500" />
              <StatCard icon={Clock} title="Pending" value={stats.pending} gradient="from-amber-500 to-orange-500" />
              <StatCard icon={Shield} title="Confirmed" value={stats.confirmed} gradient="from-emerald-500 to-cyan-500" />
            </>
          )}
        </motion.div>

        {/* Appointments Section */}
        <motion.div variants={item} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl glass"><Calendar className="h-5 w-5 text-cyan-500" /></div>
              <h3 className="text-xl font-display font-bold text-[var(--text-primary)]">
                {isDoctor ? 'Patient Requests' : 'Upcoming Sessions'}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold glass border border-[var(--border-primary)] text-[var(--text-muted)]">
              {appointments.length} total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((appt) => (
              <GlassCard
                key={appt.id}
                hover={false}
                variant={appt.is_emergency ? 'red' : 'default'}
                className={`relative overflow-hidden ${appt.is_emergency ? 'border-red-500/30' : ''}`}
              >
                {appt.is_emergency && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse" />}
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      appt.is_emergency ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white'
                    }`}>
                      {(isDoctor ? appt.patient_name : appt.doctor_name).charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={`text-base font-display font-bold text-[var(--text-primary)] ${appt.status === 'Expired' ? 'line-through opacity-50' : ''}`}>
                          {isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}
                        </h4>
                        {appt.status === 'Expired' && <StatusBadge status="Expired" size="sm" />}
                        {(isDoctor ? appt.is_patient_premium : isPremium) && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <Crown className="h-3 w-3" /> VIP
                          </span>
                        )}
                        {appt.is_emergency && appt.status !== 'Expired' && (
                          <StatusBadge status="Emergency" size="sm" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointment_date).toDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.appointment_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {appt.status === 'Expired' ? (
                      <StatusBadge status="Expired" />
                    ) : (
                      <>
                        {isDoctor && appt.status === 'Pending' ? (
                          <>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => openDeclineModal(appt.id, appt.is_emergency)}
                              className="px-3 py-2 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 flex items-center gap-1">
                              <X className="h-3 w-3" /> Decline
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                              className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-glow-green flex items-center gap-1">
                              <Check className="h-3 w-3" /> Accept
                            </motion.button>
                          </>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <StatusBadge status={appt.status} />
                            {appt.status === 'Confirmed' && appt.meeting_link && (
                              <motion.button whileTap={{ scale: 0.9 }}
                                onClick={() => window.open(appt.meeting_link, '_blank')}
                                className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-glow-green">
                                <Video className="h-4 w-4" />
                              </motion.button>
                            )}
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteAppointment(appt.id)}
                              className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-500 border border-[var(--border-primary)]">
                              <X className="h-4 w-4" />
                            </motion.button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
            {appointments.length === 0 && (
              <div className="col-span-full py-16 text-center glass-card border-dashed border-[var(--border-primary)]">
                <Calendar className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-muted)] text-sm">No sessions found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Bottom Grid: Quick Actions + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <Link to={isDoctor ? "/my-appointments" : "/doctors"}>
              <GlassCard variant="cyan" className="group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-all" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 shadow-glow-cyan">
                    {isDoctor ? <Calendar className="h-6 w-6 text-white" /> : <Search className="h-6 w-6 text-white" />}
                  </div>
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-1">{isDoctor ? 'Schedule' : 'Find Doctors'}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{isDoctor ? 'Manage your workflow' : 'Connect with specialists'}</p>
                  <span className="font-semibold flex items-center gap-1 text-sm text-cyan-500">
                    Access <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </GlassCard>
            </Link>
            
            <Link to={isDoctor ? "/wallet" : "/profile"}>
              <GlassCard variant="purple" className="group">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-glow-purple">
                    {isDoctor ? <Wallet className="h-6 w-6 text-white" /> : <Users className="h-6 w-6 text-white" />}
                  </div>
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-1">{isDoctor ? 'Earnings' : 'Profile'}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-4">{isDoctor ? 'Track balance' : 'Update health data'}</p>
                  <span className="font-semibold flex items-center gap-1 text-sm text-purple-500">
                    Settings <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </GlassCard>
            </Link>
          </div>

          {/* Activity Feed */}
          <GlassCard hover={false} padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl glass"><History className="h-5 w-5 text-cyan-500" /></div>
              <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Recent Activity</h3>
            </div>
            <div className="space-y-4 flex-1">
              {activities.length > 0 ? (
                activities.slice(0, 4).map((act) => (
                  <div key={act.id} className={`flex gap-3 items-start p-3 rounded-xl transition-colors ${
                    act.title?.includes('Penalty') || act.title?.includes('Unavailable') ? 'bg-red-500/5 border border-red-500/10' : ''
                  }`}>
                    <div className="p-1.5 rounded-lg glass mt-0.5">
                      {act.title?.includes('Penalty') || act.title?.includes('Unavailable')
                        ? <AlertCircle className="h-4 w-4 text-red-500" />
                        : act.type === 'appointment_confirmed'
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        : act.type === 'message_received'
                        ? <MessageSquare className="h-4 w-4 text-blue-500" />
                        : <Activity className="h-4 w-4 text-cyan-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${
                        act.title?.includes('Penalty') || act.title?.includes('Unavailable') ? 'text-red-500' : 'text-[var(--text-primary)]'
                      }`}>{act.title}</p>
                      <p className="text-xs text-[var(--text-muted)] truncate">{act.description}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-8">No recent activity</p>
              )}
            </div>
            <Link to="/activity" className="block w-full mt-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-center glass hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors">
              View Full Log
            </Link>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, gradient, prefix = '', isNegative }) => (
  <motion.div variants={item} whileHover={{ y: -3 }} className="glass-card p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{title}</p>
      <p className={`text-2xl font-display font-bold ${isNegative ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
        <AnimatedCounter value={typeof value === 'number' ? value : parseInt(value) || 0} prefix={prefix} />
      </p>
      {isNegative && <p className="text-[10px] text-red-500 font-bold animate-pulse">Penalty Applied</p>}
    </div>
  </motion.div>
);

export default Dashboard;