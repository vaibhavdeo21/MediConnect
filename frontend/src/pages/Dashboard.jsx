import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { 
  Users, Calendar, Clock, Activity, Search, 
  ArrowUpRight, TrendingUp, Shield, Sparkles, 
  CheckCircle2, AlertCircle, History, MessageSquare, Wallet 
} from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const Dashboard = () => {
  const { user, theme } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const backendUrl = import.meta.env.VITE_API_URL;
  
  const isPremium = theme === 'premium';
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, logsRes] = await Promise.all([
          axios.get(`${backendUrl}/api/users/dashboard-stats`, { headers }),
          axios.get(`${backendUrl}/api/users/activity-logs`, { headers })
        ]);
        setStats(statsRes.data);
        setActivities(logsRes.data);
      } catch (err) { 
        console.error("Error fetching dashboard data:", err); 
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchData();
  }, [backendUrl]);

  if (!stats) return (
    <div className={`min-h-screen flex items-center justify-center font-serif animate-pulse ${isDoctor ? 'text-cyan-500 bg-slate-950' : isPremium ? 'text-yellow-500 bg-slate-950' : 'text-slate-400 bg-slate-50'}`}>
      Initializing {isDoctor ? 'Clinical' : 'Elite'} Dashboard...
    </div>
  );

  const textMain = (isDoctor || isPremium) ? "text-white" : "text-slate-900";
  const textSub = (isDoctor || isPremium) ? "text-slate-400" : "text-slate-500";
  const cardBase = isDoctor 
    ? "bg-slate-900 border-cyan-500/10 shadow-none" 
    : isPremium ? "bg-slate-900 border-yellow-500/10 shadow-none" : "bg-white border-slate-100 shadow-sm";
  const accentText = isDoctor ? "text-cyan-400" : isPremium ? "text-yellow-500" : "text-emerald-700";

  const getActivityIcon = (type) => {
    const color = isDoctor ? "text-cyan-400" : "text-emerald-500";
    switch (type) {
      case 'appointment_confirmed': return <CheckCircle2 className={`h-4 w-4 ${color}`} />;
      case 'message_received': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'profile_update': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">
      
      <motion.div variants={item} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
            {isDoctor ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] uppercase font-black tracking-widest mb-4">
                Clinical Mode Active
              </div>
            ) : isPremium && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-black tracking-widest mb-4">
                <Sparkles className="h-3 w-3" /> Elite Account Active
              </div>
            )}
            <h1 className={`text-4xl md:text-5xl font-serif font-bold ${textMain}`}>
              Hello, {isDoctor ? 'Dr. ' : ''}{user.fullName}
            </h1>
            <p className={`${textSub} mt-2 text-lg font-light`}>Your daily overview.</p>
        </div>
        <div className={`px-6 py-4 rounded-3xl border flex flex-col items-center md:items-end ${cardBase}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Current Date</p>
            <p className={`text-xl font-serif font-bold ${isDoctor ? 'text-cyan-400' : isPremium ? 'text-yellow-500' : 'text-slate-900'}`}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
        </div>
      </motion.div>

      <motion.div variants={container} className={`grid grid-cols-1 ${user.role === 'doctor' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-12`}>
        {user.role === 'doctor' ? (
          <>
            <LuxuryStatCard isDoctor icon={<Calendar />} title="Total Appts" value={stats.total_appointments} color="cyan" />
            <LuxuryStatCard isDoctor icon={<Clock />} title="Pending" value={stats.pending_requests} color="amber" />
            <LuxuryStatCard isDoctor icon={<Activity />} title="Today" value={stats.today_appointments} color="cyan" />
            <LuxuryStatCard isDoctor icon={<Users />} title="Patients" value={stats.total_patients} color="purple" />
          </>
        ) : (
          <>
            <LuxuryStatCard isPremium={isPremium} icon={<TrendingUp />} title="Total Visits" value={stats.total_appointments} color="blue" />
            <LuxuryStatCard isPremium={isPremium} icon={<Clock />} title="Pending" value={stats.pending} color="amber" />
            <LuxuryStatCard isPremium={isPremium} icon={<Shield />} title="Confirmed" value={stats.confirmed} color="emerald" />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to={isDoctor ? "/my-appointments" : "/doctors"}>
                <motion.div whileHover={{ y: -5 }} className={`rounded-[2.5rem] p-10 border transition-all group relative overflow-hidden h-full ${cardBase}`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 ${isDoctor ? 'bg-cyan-500/5' : isPremium ? 'bg-yellow-500/5' : 'bg-emerald-50'}`}></div>
                    <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${isDoctor ? 'bg-cyan-500/10 text-cyan-400' : isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isDoctor ? <Calendar className="h-8 w-8" /> : <Search className="h-8 w-8" />}
                        </div>
                        <h3 className={`text-3xl font-serif font-bold mb-2 ${textMain}`}>{isDoctor ? 'Schedule' : 'Find a Doctor'}</h3>
                        <p className={`${textSub} mb-6`}>{isDoctor ? 'Manage your patient queue and availability.' : 'Book top specialists instantly for any health concern.'}</p>
                        <span className={`font-bold flex items-center gap-2 ${accentText}`}>
                          {isDoctor ? 'Open Calendar' : 'Book Now'} <ArrowUpRight className="h-5 w-5" />
                        </span>
                    </div>
                </motion.div>
            </Link>
            
            <Link to={isDoctor ? "/wallet" : "/profile"}>
                <motion.div whileHover={{ y: -5 }} className={`rounded-[2.5rem] p-10 border transition-all group relative overflow-hidden h-full ${isDoctor || isPremium ? 'bg-slate-900 border-white/5 shadow-2xl' : 'bg-slate-950 border-transparent shadow-xl'}`}>
                    <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -ml-16 -mb-16 ${isDoctor ? 'bg-purple-500/5' : isPremium ? 'bg-yellow-500/5' : 'bg-blue-500/10'}`}></div>
                    <div className="relative z-10">
                        <div className={`w-16 h-16 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border ${isDoctor ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : isPremium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-white/10 text-white border-white/10'}`}>
                          {isDoctor ? <Wallet className="h-8 w-8" /> : <Users className="h-8 w-8" />}
                        </div>
                        <h3 className="text-3xl font-serif font-bold mb-2 text-white">{isDoctor ? 'Earnings' : 'Profile'}</h3>
                        <p className="text-slate-400 mb-6">{isDoctor ? 'Track fees and wallet balance.' : 'Update clinical or personal health data.'}</p>
                        <span className="text-white font-bold flex items-center gap-2">Settings <ArrowUpRight className="h-5 w-5" /></span>
                    </div>
                </motion.div>
            </Link>
          </div>
        </div>

        <motion.div variants={item} className={`rounded-[2.5rem] p-8 border flex flex-col h-full ${cardBase}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2 rounded-lg ${isDoctor ? 'bg-cyan-500/10 text-cyan-400' : isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-100 text-slate-600'}`}>
              <History className="h-5 w-5" />
            </div>
            <h3 className={`text-xl font-serif font-bold ${textMain}`}>Recent Activity</h3>
          </div>
          <div className="space-y-6 flex-1">
            {loadingLogs ? (
               <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className={`h-12 w-full rounded-xl animate-pulse ${isDoctor || isPremium ? 'bg-slate-800' : 'bg-slate-50'}`}></div>)}
               </div>
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((act) => (
                <ActivityItem key={act.id} isDoctor={isDoctor} isPremium={isPremium} icon={getActivityIcon(act.type)} title={act.title} desc={act.description} time={new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
              ))
            ) : (
              <p className={`text-sm italic ${textSub} text-center py-10`}>No activity records.</p>
            )}
          </div>
          <Link to="/activity" className={`w-full mt-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-center transition-colors ${isDoctor ? 'bg-slate-800 text-cyan-400 hover:bg-slate-700' : isPremium ? 'bg-slate-800 text-yellow-500 hover:bg-slate-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            View Full Audit Log
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

const LuxuryStatCard = ({ icon, title, value, color, isPremium, isDoctor }) => {
    const colors = { 
      cyan: "from-cyan-600 to-cyan-900",
      blue: isPremium ? "from-blue-600 to-blue-900" : "from-blue-500 to-blue-600", 
      amber: isPremium ? "from-yellow-600 to-yellow-900" : "from-amber-400 to-amber-500", 
      emerald: "from-emerald-500 to-emerald-600", 
      purple: "from-purple-500 to-purple-600" 
    };
    return (
        <motion.div whileHover={{ y: -5 }} className={`p-6 rounded-[2rem] border flex items-center gap-5 transition-all ${isDoctor || isPremium ? 'bg-slate-900 border-white/5 shadow-lg shadow-black/20' : 'bg-white border-slate-100 shadow-lg'}`}>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-xl`}>{icon}</div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
              <h4 className={`text-3xl font-serif font-bold ${isDoctor || isPremium ? 'text-white' : 'text-slate-900'}`}>{value || 0}</h4>
            </div>
        </motion.div>
    );
};

const ActivityItem = ({ icon, title, desc, time, isPremium, isDoctor }) => (
  <div className="flex gap-4 items-start group">
    <div className={`mt-1 p-2 rounded-full ${isDoctor || isPremium ? 'bg-slate-800' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <div className="text-left flex-1">
      <p className={`text-sm font-bold ${isDoctor || isPremium ? 'text-white' : 'text-slate-900'}`}>{title}</p>
      <p className={`text-xs ${isDoctor || isPremium ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
      <p className="text-[10px] text-slate-500 mt-1">{time}</p>
    </div>
  </div>
);

export default Dashboard;