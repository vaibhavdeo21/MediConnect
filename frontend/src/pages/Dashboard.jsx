import { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users, Calendar, Clock, Activity, Search,
  ArrowUpRight, TrendingUp, Shield, Sparkles, Crown,
  CheckCircle2, AlertCircle, History, MessageSquare, Wallet,
  Power, Video, Radio, Zap, Trash2, Edit, X, Check, Bot, Send, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
// IMPORT THE NEW MODAL
import RescheduleModal from "../components/RescheduleModal";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const EmergencyTimer = ({ createdAt, onExpire, isPatient }) => {
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const diff = Math.floor((start + 600000 - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
        if (onExpire) onExpire();
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`mt-2 flex items-center gap-2 font-black text-sm 
            ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
      <Clock className="h-4 w-4" />
      {timeLeft > 0 ? (
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds} ${isPatient ? 'UNTIL AUTO-CANCEL' : 'REMAINING'}`
      ) : (
        <span className="text-red-600 uppercase">Time Up - Penalty Applied</span>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user, theme, updateUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isEmergencyActive, setIsEmergencyActive] = useState(user?.is_emergency_active || false);
  const [liveSession, setLiveSession] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  // --- CHATBOT STATE ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${user?.fullName || 'there'}! I'm your premium health assistant. How can I help you today?` }
  ]);
  const chatScrollRef = useRef(null);

  const backendUrl = import.meta.env.VITE_API_URL;

  const isDoctor = user?.role === 'doctor';
  const isPremium = !isDoctor && user?.is_premium;
  const isDark = theme === 'dark';

  const styles = isPremium ? {
    pageBg: "bg-slate-950",
    textPrimary: "text-yellow-50",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900 border-yellow-500/20",
    accentText: "text-yellow-400",
    statColors: { blue: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", amber: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", emerald: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", purple: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400" }
  } : {
    pageBg: isDark ? "bg-slate-950" : "bg-white",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-500",
    cardBg: isDark ? "bg-slate-900 border-white/5" : "bg-white border-slate-100",
    accentText: "text-emerald-600",
    statColors: { blue: "from-blue-500 to-blue-600", amber: "from-amber-400 to-amber-500", emerald: "from-emerald-500 to-emerald-600", purple: "from-purple-500 to-purple-600" }
  };

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isChatOpen]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, logsRes, activeCallRes, apptRes] = await Promise.all([
        axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
        axios.get(`${backendUrl}/api/users/activity-logs`, { headers }),
        axios.get(`${backendUrl}/api/appointments/active-call`, { headers }),
        axios.get(`${backendUrl}/api/appointments/my-appointments`, { headers })
      ]);
      setStats(statsRes.data);
      setActivities(logsRes.data);
      setAppointments(apptRes.data);
      if (activeCallRes.data) setLiveSession(activeCallRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => { fetchData(); }, [backendUrl]);

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;

    const userText = chatMessage;
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${backendUrl}/api/ai/chat`,
        { message: userText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.reply || "I didn't receive a reply from the medical engine."
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: "High server load. Please retry." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const onTimerExpire = () => {
    if (!isDoctor) {
      toast.error("Doctor is busy. Please look for another emergency doctor immediately!", {
        position: "top-center",
        autoClose: false, // User must manually close it
        closeOnClick: false,
        draggable: false,
        theme: "dark"
      });
    }
    fetchData(); // Refresh to show 'Expired' status
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
      toast.info(newState ? "Live for Emergency" : "Emergency Offline");
    } catch (err) { toast.error("Update Failed"); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/appointments/status/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`SOS ${status === 'Confirmed' ? 'Accepted' : 'Declined'}`);
      // Auto-refresh lists
      window.location.reload();
    } catch (err) { toast.error("Action failed"); }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendUrl}/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(prev => prev.filter(appt => appt.id !== id));
      toast.success("Removed Successfully");
    } catch (err) { toast.error("Deletion Failed"); }
  };

  const getActivityIcon = (type) => {
    const color = isDoctor ? (isDark ? "text-cyan-400" : "text-blue-600") : isPremium ? "text-yellow-500" : "text-emerald-500";
    switch (type) {
      case 'appointment_confirmed': return <CheckCircle2 className={`h-4 w-4 ${color}`} />;
      case 'message_received': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'profile_update': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  if (!stats) return <div className="min-h-screen flex items-center justify-center font-serif animate-pulse">Initializing Dashboard...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${styles.pageBg}`}>
      {rescheduleAppt && (
        <RescheduleModal isOpen={!!rescheduleAppt} onClose={() => setRescheduleAppt(null)} appointment={rescheduleAppt} onUpdate={fetchData} />
      )}
      {isDoctor && appointments.some(a => a.is_emergency && a.status === 'Pending') && (
        <div className="space-y-4 mb-12">
          <h3 className="text-xl font-serif font-bold text-red-500 flex items-center gap-2">
            <Zap className="h-5 w-5 fill-red-500" /> Active Emergency Triage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.filter(a => a.is_emergency && a.status === 'Pending').map(appt => (
              <motion.div
                key={appt.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`p-6 border rounded-[2rem] flex justify-between items-center transition-colors
                        ${isDark ? 'bg-red-950/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}
              >
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">
                    Immediate SOS Request
                  </p>
                  {/* FIXED: Applied styles.textPrimary for visibility */}
                  <h4 className={`text-xl font-bold ${styles.textPrimary}`}>
                    {appt.patient_name}
                  </h4>
                  <EmergencyTimer createdAt={appt.created_at} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                    className="p-4 bg-green-600 rounded-2xl hover:bg-green-500 transition-all text-white shadow-lg shadow-green-900/20"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}
                    className="p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all text-red-500 border border-white/5"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {/* --- GEMINI CHATBOT FLOATING WIDGET (PREMIUM PATIENTS ONLY) --- */}
      {isPremium && !isDoctor && (
        <>
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] z-[100] rounded-[2rem] overflow-hidden shadow-2xl border border-yellow-500/20 bg-slate-900 flex flex-col"
              >
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 fill-white" />
                    <span className="font-serif font-bold text-sm">Gemini AI Assistant</span>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X className="h-5 w-5" /></button>
                </div>

                <div ref={chatScrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-900">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                        ${msg.sender === 'bot' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-400'}`}>
                        {msg.sender === 'bot' ? <Bot className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                      </div>
                      <div className={`p-3 rounded-2xl text-sm max-w-[80%] 
                        ${msg.sender === 'bot' ? 'bg-white/5 text-slate-300 border border-white/10 rounded-tl-none' : 'bg-yellow-600 text-white rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500"><Bot className="h-5 w-5" /></div>
                      <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleChatSubmit} className="p-4 border-t border-white/10 bg-slate-950 flex gap-2">
                  <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Ask MediConnect AI..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50" />
                  <button type="submit" disabled={isChatLoading} className="p-2 bg-yellow-600 rounded-xl text-white hover:bg-yellow-700 transition disabled:opacity-50"><Send className="h-4 w-4" /></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 z-[90] px-6 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-xl flex items-center gap-3 font-bold border border-yellow-400/30"
          >
            <Sparkles className="h-5 w-5 fill-white animate-pulse" />
            {isChatOpen ? 'Close AI' : 'Gemini AI'}
          </motion.button>
        </>
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">
        <AnimatePresence>
          {liveSession && !isDoctor && (
            <motion.div initial={{ height: 0, opacity: 0, y: -20 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0 }} className="mb-12 overflow-hidden">
              <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-2xl">
                <div className={`rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                  <div className="flex items-center gap-6">
                    <div className="relative"><div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" /><div className="p-5 bg-red-600 rounded-full text-white relative z-10 shadow-lg"><Video /></div></div>
                    <div className="text-left"><div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1"><Radio className="h-3 w-3" /> Live Emergency Session</div><h2 className={`text-2xl font-serif font-bold ${styles.textPrimary}`}>Dr. {liveSession.doctor_name} is waiting</h2></div>
                  </div>
                  <button onClick={() => window.open(liveSession.meeting_link, '_blank')} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-bold shadow-xl flex items-center gap-3">Join Instant Call <Zap className="h-5 w-5 fill-white" /></button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={item} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-left">
            {isPremium && <div className="flex items-center gap-2 mb-2 animate-pulse"><Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" /><span className="text-xs font-bold uppercase tracking-widest text-yellow-500">Premium Member</span></div>}
            <h1 className={`text-4xl md:text-5xl font-serif font-bold ${styles.textPrimary}`}>Hello, {isDoctor ? 'Dr. ' : ''}{user.fullName}</h1>
            <p className={`mt-2 text-lg font-light ${styles.textSecondary}`}>Your healthcare overview.</p>
          </div>
          <div className="flex gap-4 items-center">
            {isDoctor && user?.is_emergency && (
              <button onClick={toggleEmergencyActive} className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest border transition-all shadow-lg ${isEmergencyActive ? 'bg-red-600 text-white border-red-500 shadow-red-500/20' : 'bg-slate-200 text-slate-500 border-slate-300'}`}>
                <div className={`w-2 h-2 rounded-full ${isEmergencyActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} /> Emergency {isEmergencyActive ? 'Online' : 'Offline'}
              </button>
            )}
            <div className={`px-6 py-3 rounded-2xl shadow-sm border ${isPremium ? 'bg-slate-900 border-slate-800 text-yellow-50' : 'bg-white border-slate-100 text-slate-900'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${styles.textSecondary}`}>Today</p>
              <p className="text-lg font-serif font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={container} className={`grid grid-cols-1 ${isDoctor ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-12`}>
          {isDoctor ? (
            <>
              <StatCard icon={<Calendar className="h-6 w-6" />} title="Total Appts" value={stats.total_appointments} color="blue" styles={styles} isPremium={isPremium} />
              <StatCard icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending_requests} color="amber" styles={styles} isPremium={isPremium} />
              <StatCard icon={<Activity className="h-6 w-6" />} title="Today" value={stats.today_appointments} color="emerald" styles={styles} isPremium={isPremium} />
              <StatCard icon={<Users className="h-6 w-6" />} title="Patients" value={stats.total_patients} color="purple" styles={styles} isPremium={isPremium} />
            </>
          ) : (
            <>
              <StatCard icon={<TrendingUp className="h-6 w-6" />} title="Total Visits" value={stats.total_appointments} color="blue" styles={styles} isPremium={isPremium} />
              <StatCard icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending} color="amber" styles={styles} isPremium={isPremium} />
              <StatCard icon={<Shield className="h-6 w-6" />} title="Confirmed" value={stats.confirmed} color="emerald" styles={styles} isPremium={isPremium} />
            </>
          )}
        </motion.div>

        <motion.div variants={item} className="mb-12">
          <div className="flex items-center justify-between mb-8 text-left">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}><Calendar className="h-5 w-5" /></div>
              <h3 className={`text-2xl font-serif font-bold ${styles.textPrimary}`}>{isDoctor ? 'Patient Requests' : 'My Upcoming Sessions'}</h3>
            </div>
            <span className={`px-4 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200'}`}>Total: {appointments.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt) => (
              <div key={appt.id} className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group 
                        ${appt.is_emergency ? 'bg-gradient-to-r from-red-50 to-white border-red-200 shadow-xl shadow-red-500/10' : styles.cardBg + ' shadow-sm hover:shadow-md'}
                        ${isDark && appt.is_emergency ? '!bg-none !bg-red-950/20 !border-red-500/50' : ''}`}>

                {appt.is_emergency && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600 animate-pulse"></div>}

                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${appt.is_emergency ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                      {(isDoctor ? appt.patient_name : appt.doctor_name).charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className={`text-xl font-serif font-bold ${styles.textPrimary}`}>{isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}</h4>
                        {(isDoctor ? appt.is_patient_premium : isPremium) && <span className="px-2 py-0.5 bg-yellow-500 text-slate-950 text-[10px] font-bold uppercase rounded-md flex items-center gap-1"><Crown className="h-3 w-3" /> VIP</span>}
                        {appt.is_emergency && <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded-md flex items-center gap-1 animate-pulse"><Zap className="h-3 w-3 fill-white" /> Emergency</span>}
                      </div>
                      <div className={`flex items-center gap-4 text-xs font-medium opacity-70 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(appt.appointment_date).toDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {appt.appointment_time}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-4 md:mt-0">
                    {isDoctor && appt.status === 'Pending' ? (
                      <>
                        <button onClick={() => handleDeleteAppointment(appt.id)} className="px-4 py-2 rounded-xl border border-red-200 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors flex items-center gap-2"><X className="h-3 w-3" /> Decline</button>
                        <button onClick={() => handleStatusUpdate(appt.id, 'Confirmed')} className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-colors flex items-center gap-2"><Check className="h-3 w-3" /> Accept</button>
                      </>
                    ) : (
                      <>
                        <span className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest ${appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{appt.status}</span>
                        <div className="flex gap-2">
                          {appt.status === 'Confirmed' && appt.meeting_link && (
                            <button onClick={() => window.open(appt.meeting_link, '_blank')} className="p-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-md" title="Join Call"><Video className="h-4 w-4" /></button>
                          )}
                          {isDoctor ? (
                            <>
                              <button onClick={() => setRescheduleAppt(appt)} className="p-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition" title="Reschedule"><Edit className="h-4 w-4" /></button>
                              <button onClick={() => handleDeleteAppointment(appt.id)} className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <button onClick={() => handleDeleteAppointment(appt.id)} className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition" title="Cancel Appointment"><X className="h-4 w-4" /></button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {appointments.length === 0 && <div className={`col-span-full py-12 text-center rounded-[2rem] border border-dashed ${styles.textSecondary} ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>No sessions found.</div>}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="flex flex-col gap-6">
            <Link to={isDoctor ? "/my-appointments" : "/doctors"}>
              <motion.div whileHover={{ y: -5 }} className={`rounded-[2rem] p-6 border transition-all group relative overflow-hidden ${styles.cardBg}`}>
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/10' : 'bg-blue-50/50'}`}></div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${isPremium ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-100 text-blue-600'}`}>{isDoctor ? <Calendar className="h-6 w-6" /> : <Search className="h-6 w-6" />}</div>
                  <h3 className={`text-2xl font-serif font-bold mb-1 ${styles.textPrimary}`}>{isDoctor ? 'Schedule' : 'Find Doctors'}</h3>
                  <p className={`text-sm ${styles.textSecondary} mb-4`}>{isDoctor ? 'Manage workflow.' : 'Connect with specialists.'}</p>
                  <span className={`font-bold flex items-center gap-2 text-sm ${styles.accentText}`}>Access Now <ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </motion.div>
            </Link>

            <Link to={isDoctor ? "/wallet" : "/profile"}>
              <motion.div whileHover={{ y: -5 }} className={`rounded-[2rem] p-6 border transition-all group relative overflow-hidden ${styles.cardBg}`}>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-colors ${isDoctor ? (isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-50 text-blue-600')
                    : isPremium ? (isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-100 text-yellow-600')
                      : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                    }`}>
                    {isDoctor ? <Wallet className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                  </div>
                  <h3 className={`text-2xl font-serif font-bold mb-1 ${styles.textPrimary}`}>{isDoctor ? 'Earnings' : 'Profile'}</h3>
                  <p className={`text-sm ${styles.textSecondary} mb-4`}>{isDoctor ? 'Track balance.' : 'Update health data.'}</p>
                  <span className={`font-bold flex items-center gap-2 text-sm ${styles.accentText}`}>Settings <ArrowUpRight className="h-4 w-4" /></span>
                </div>
              </motion.div>
            </Link>
          </div>

          <motion.div variants={item} className={`rounded-[2.5rem] p-8 border transition-all flex flex-col ${styles.cardBg}`}>
            <div className="flex items-center gap-3 mb-6 text-left">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-600'}`}>
                <History className="h-5 w-5" />
              </div>
              <h3 className={`text-xl font-serif font-bold ${styles.textPrimary}`}>Recent Activity</h3>
            </div>
            <div className="space-y-6 flex-1 text-left">
              {activities.length > 0 ? (
                activities.slice(0, 3).map((act) => (
                  <div key={act.id} className="flex gap-4 items-start group">
                    <div className={`mt-1 p-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>{getActivityIcon(act.type)}</div>
                    <div className="text-left flex-1">
                      <p className={`text-sm font-bold ${styles.textPrimary}`}>{act.title}</p>
                      <p className={`text-xs ${styles.textSecondary}`}>{act.description}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm italic opacity-50 text-center py-10">No records.</p>
              )}
            </div>
            <Link to="/activity" className={`w-full mt-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-colors ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              View Full Audit Log
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, styles, variants, isPremium }) => {
  const cardStyle = isPremium ? `bg-slate-900 border border-yellow-500/20 text-white` : `bg-white border border-slate-100 text-slate-900`;
  const iconBg = isPremium ? `bg-yellow-500/20 text-yellow-400` : `bg-gradient-to-br ${styles.statColors[color]} text-white`;
  return (
    <motion.div variants={variants} whileHover={{ y: -5 }} className={`p-6 rounded-3xl shadow-lg flex items-center gap-5 ${cardStyle}`}>
      <div className={`p-4 rounded-2xl shadow-xl ${iconBg}`}>{icon}</div>
      <div className="text-left"><p className="text-xs font-bold opacity-60 uppercase tracking-widest">{title}</p><h4 className="text-3xl font-serif font-bold mt-1">{value || 0}</h4></div>
    </motion.div>
  );
};

const LuxuryStatCard = ({ theme, isDark, icon, title, value, color }) => {
  const colors = {
    cyan: "from-cyan-600 to-cyan-900",
    gold: "from-yellow-500 to-yellow-700",
    blue: "from-blue-600 to-blue-900",
    amber: "from-amber-400 to-amber-500",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600"
  };
  const cardBg = isDark ? 'bg-slate-900 border-white/5 shadow-lg' : 'bg-white border-slate-100 shadow-lg';
  return (
    <motion.div whileHover={{ y: -5 }} className={`p-6 rounded-[2rem] border flex items-center gap-5 transition-all ${cardBg}`}>
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color] || colors.blue} text-white shadow-xl`}>{icon}</div>
      <div className="text-left">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        <h4 className={`text-3xl font-serif font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value || 0}</h4>
      </div>
    </motion.div>
  );
};

export default Dashboard;