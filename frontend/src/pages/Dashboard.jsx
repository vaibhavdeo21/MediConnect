import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Users, Calendar, Clock, Activity, Search,
  ArrowUpRight, TrendingUp, Shield, Sparkles, Crown,
  CheckCircle2, AlertCircle, History, MessageSquare, Wallet, Power, Video, Radio, Zap, Trash2, Edit, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
// IMPORT THE NEW MODAL
import RescheduleModal from "../components/RescheduleModal";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const Dashboard = () => {
  const { user, theme, updateUser } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isEmergencyActive, setIsEmergencyActive] = useState(user?.is_emergency_active || false);
  const [liveSession, setLiveSession] = useState(null);
  const [appointments, setAppointments] = useState([]); 
  
  // NEW STATE FOR RESCHEDULE MODAL
  const [rescheduleAppt, setRescheduleAppt] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;

  const isDoctor = user?.role === 'doctor';
  const isPremium = !isDoctor && user?.is_premium;
  const isDark = theme === 'dark';

  const pageBg = isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const textMain = isDark ? "text-white" : "text-slate-900";
  const textSub = isDark ? "text-slate-400" : "text-slate-500";
  
  const cardBase = isDoctor
    ? (isDark ? "bg-slate-900 border-cyan-500/10 shadow-none" : "bg-white border-blue-100 shadow-xl shadow-blue-900/5")
    : isPremium 
      ? (isDark ? "bg-slate-900 border-yellow-500/20 shadow-yellow-500/5" : "bg-white border-yellow-200 shadow-xl shadow-yellow-900/5") 
      : (isDark ? "bg-slate-900 border-emerald-500/10 shadow-none" : "bg-white border-emerald-100 shadow-xl shadow-emerald-900/5");
    
  const accentText = isDoctor ? (isDark ? "text-cyan-400" : "text-blue-700") : isPremium ? "text-yellow-500" : "text-emerald-600";

  // Moved fetch logic to a reusable function to allow refreshing after update
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      const promises = [
        axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
        axios.get(`${backendUrl}/api/users/activity-logs`, { headers }),
        axios.get(`${backendUrl}/api/appointments/active-call`, { headers }),
        // ADDED THIS: Ensure appointments are fetched for both Doctors AND Patients
        axios.get(`${backendUrl}/api/appointments/my-appointments`, { headers })
      ];

      const [statsRes, logsRes, activeCallRes, apptRes] = await Promise.all(promises);
      
      setStats(statsRes.data);
      setActivities(logsRes.data);
      if (activeCallRes.data) setLiveSession(activeCallRes.data);
      // Ensure appointments state is set for everyone
      if (apptRes) setAppointments(apptRes.data);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [backendUrl, isDoctor]);

  const toggleEmergencyActive = async () => {
    try {
        const token = localStorage.getItem("token");
        const newState = !isEmergencyActive;
        await axios.put(`${backendUrl}/api/users/emergency-status`, { active: newState }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setIsEmergencyActive(newState);
        updateUser({ is_emergency_active: newState });
        toast.info(newState ? "You are now Live for Emergency" : "Emergency Service Offline");
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment? This action cannot be undone.")) return;
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`${backendUrl}/api/appointments/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(prev => prev.filter(appt => appt.id !== id));
        toast.success("Appointment Deleted & Patient Notified");
    } catch (err) {
        toast.error("Deletion Failed");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
        const token = localStorage.getItem("token");
        const meetingLink = status === 'Confirmed' ? `https://meet.mediconnect.com/${id}` : null;
        await axios.put(`${backendUrl}/api/appointments/status/${id}`, 
            { status, meeting_link: meetingLink }, 
            { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchData();
        toast.success(`Appointment ${status}`);
    } catch (err) { toast.error("Action Failed"); }
  };

  if (!stats) return (
    <div className={`min-h-screen flex items-center justify-center font-serif animate-pulse ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-400'}`}>
      Initializing {isDoctor ? 'Clinical' : 'Registry'} Dashboard...
    </div>
  );

  const getActivityIcon = (type) => {
    const color = isDoctor 
      ? (isDark ? "text-cyan-400" : "text-blue-600") 
      : isPremium ? "text-yellow-500" : "text-emerald-500";
      
    switch (type) {
      case 'appointment_confirmed': return <CheckCircle2 className={`h-4 w-4 ${color}`} />;
      case 'message_received': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'profile_update': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className={`${pageBg} min-h-screen transition-colors duration-500`}>
      {/* MODAL: Render RescheduleModal when an appointment is selected */}
      {rescheduleAppt && (
        <RescheduleModal 
            isOpen={!!rescheduleAppt} 
            onClose={() => setRescheduleAppt(null)} 
            appointment={rescheduleAppt}
            onUpdate={fetchData} // Refresh list after update
        />
      )}

      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">

        {/* PRIORITY LIVE CALL SECTION */}
        <AnimatePresence>
          {liveSession && !isDoctor && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }} animate={{ height: 'auto', opacity: 1, y: 0 }} exit={{ height: 0, opacity: 0 }}
              className="mb-12 overflow-hidden"
            >
              <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 shadow-2xl">
                <div className={`rounded-[2.4rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                      <div className="p-5 bg-red-600 rounded-full text-white relative z-10 shadow-lg shadow-red-500/40">
                        <Video className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                        <Radio className="h-3 w-3" /> Live Emergency Session
                      </div>
                      <h2 className={`text-2xl md:text-3xl font-serif font-bold ${textMain}`}>
                        Dr. {liveSession.doctor_name} is waiting for you
                      </h2>
                    </div>
                  </div>
                  <button 
                    onClick={() => window.open(liveSession.meeting_link, '_blank')}
                    className="w-full md:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-bold shadow-xl shadow-red-500/30 hover:bg-red-700 transition-all flex items-center justify-center gap-3 hover:scale-[1.02]"
                  >
                    Join Instant Call <Zap className="h-5 w-5 fill-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={item} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
                {isDoctor ? (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest mb-0 border ${isDark ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                    Clinical Mode
                </div>
                ) : isPremium && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest mb-0 border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-yellow-50 border-yellow-200 text-yellow-600'}`}>
                    <Sparkles className="h-3 w-3" /> Elite Account
                </div>
                )}

                {isDoctor && user?.is_emergency && (
                    <button 
                        onClick={toggleEmergencyActive}
                        className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border transition-all ${
                        isEmergencyActive ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20' : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isEmergencyActive ? 'bg-white animate-ping' : 'bg-slate-400'}`} />
                        Emergency {isEmergencyActive ? 'Online' : 'Offline'}
                    </button>
                )}
            </div>
            <h1 className={`text-4xl md:text-5xl font-serif font-bold ${textMain}`}>
              Hello, {isDoctor ? 'Dr. ' : ''}{user.fullName}
            </h1>
          </div>
          <div className={`px-6 py-4 rounded-3xl border flex flex-col items-center md:items-end ${cardBase}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Current Date</p>
            <p className={`text-xl font-serif font-bold ${accentText}`}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* --- STAT CARDS --- */}
        <motion.div variants={container} className={`grid grid-cols-1 ${isDoctor ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-12`}>
          {isDoctor ? (
            <>
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Calendar />} title="Total Appts" value={stats.total_appointments} color="cyan" />
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Clock />} title="Pending" value={stats.pending_requests} color="amber" />
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Activity />} title="Today" value={stats.today_appointments} color="cyan" />
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Users />} title="Patients" value={stats.total_patients} color="purple" />
            </>
          ) : (
            <>
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<TrendingUp />} title="Total Visits" value={stats.total_appointments} color={isPremium ? "gold" : "emerald"} />
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Clock />} title="Pending" value={stats.pending} color="amber" />
              <LuxuryStatCard theme={theme} isDark={isDark} icon={<Shield />} title="Confirmed" value={stats.confirmed} color="emerald" />
            </>
          )}
        </motion.div>

        {/* --- APPOINTMENT LIST SECTION (RESTORED FOR PATIENTS) --- */}
        {/* Shows for both Doctors (as requests) and Patients (as booked sessions) */}
        <motion.div variants={item} className="mb-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}><Calendar className="h-5 w-5" /></div>
                    <h3 className={`text-2xl font-serif font-bold ${textMain}`}>{isDoctor ? 'Patient Requests' : 'My Upcoming Sessions'}</h3>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200'}`}>Total: {appointments.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appt) => (
                    <div key={appt.id} className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group 
                        ${appt.is_emergency ? 'bg-gradient-to-r from-red-50 to-white border-red-200 shadow-xl shadow-red-500/10' : cardBase + ' shadow-sm hover:shadow-md'}
                        ${isDark && appt.is_emergency ? '!bg-none !bg-red-950/20 !border-red-500/50' : ''}`}>
                        
                        {appt.is_emergency && <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600 animate-pulse"></div>}

                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                {/* Initial Icon */}
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${appt.is_emergency ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {(isDoctor ? appt.patient_name : appt.doctor_name).charAt(0)}
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className={`text-xl font-serif font-bold ${textMain}`}>{isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}</h4>
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
                                                // Patient Actions: Cancel Only
                                                <button onClick={() => handleDeleteAppointment(appt.id)} className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition" title="Cancel Appointment"><X className="h-4 w-4" /></button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {appointments.length === 0 && <div className={`col-span-full py-12 text-center rounded-[2rem] border border-dashed ${textSub} ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>No sessions scheduled.</div>}
            </div>
        </motion.div>

        {/* BOTTOM NAV GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Left Column: Stacked Cards */}
          <div className="flex flex-col gap-6">
            <Link to={isDoctor ? "/my-appointments" : "/doctors"}>
                <motion.div whileHover={{ y: -5 }} className={`rounded-[2rem] p-6 border transition-all group relative overflow-hidden ${cardBase}`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/10' : 'bg-blue-50/50'}`}></div>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${isPremium ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-100 text-blue-600'}`}>{isDoctor ? <Calendar className="h-6 w-6" /> : <Search className="h-6 w-6" />}</div>
                    <h3 className={`text-2xl font-serif font-bold mb-1 ${textMain}`}>{isDoctor ? 'Schedule' : 'Find Doctors'}</h3>
                    <p className={`text-sm ${textSub} mb-4`}>{isDoctor ? 'Manage patient flow.' : 'Connect with specialists.'}</p>
                    <span className={`font-bold flex items-center gap-2 text-sm ${accentText}`}>Access Now <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </motion.div>
            </Link>
            
            <Link to={isDoctor ? "/wallet" : "/profile"}>
                <motion.div whileHover={{ y: -5 }} className={`rounded-[2rem] p-6 border transition-all group relative overflow-hidden ${cardBase}`}>
                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border transition-colors ${
                      isDoctor ? (isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-50 text-blue-600') 
                      : isPremium ? (isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-100 text-yellow-600')
                      : (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                    }`}>
                      {isDoctor ? <Wallet className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                    </div>
                    <h3 className={`text-2xl font-serif font-bold mb-1 ${textMain}`}>{isDoctor ? 'Earnings' : 'Profile'}</h3>
                    <p className={`text-sm ${textSub} mb-4`}>{isDoctor ? 'Track wallet balance.' : 'Update health data.'}</p>
                    <span className={`font-bold flex items-center gap-2 text-sm ${accentText}`}>Settings <ArrowUpRight className="h-4 w-4" /></span>
                  </div>
                </motion.div>
            </Link>
          </div>

          {/* Right Column: Recent Activity (Max 3 Logs) */}
          <motion.div variants={item} className={`rounded-[2.5rem] p-8 border transition-all flex flex-col ${cardBase}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-600'}`}>
                <History className="h-5 w-5" />
              </div>
              <h3 className={`text-xl font-serif font-bold ${textMain}`}>Recent Activity</h3>
            </div>
            <div className="space-y-6 flex-1">
              {loadingLogs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className={`h-12 w-full rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>) }
                </div>
              ) : activities.length > 0 ? (
                activities.slice(0, 3).map((act) => (
                  <ActivityItem key={act.id} isDark={isDark} icon={getActivityIcon(act.type)} title={act.title} desc={act.description} time={new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
                ))
              ) : (
                <p className={`text-sm italic ${textSub} text-center py-10`}>No activity records.</p>
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

const ActivityItem = ({ isDark, icon, title, desc, time }) => (
  <div className="flex gap-4 items-start group">
    <div className={`mt-1 p-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>{icon}</div>
    <div className="text-left flex-1">
      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
      <p className="text-[10px] text-slate-500 mt-1">{time}</p>
    </div>
  </div>
);

export default Dashboard;