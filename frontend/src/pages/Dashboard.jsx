import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Calendar, Clock, Activity, Search, ArrowUpRight, TrendingUp, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const Dashboard = () => {
  const { user, theme } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;
  const isPremium = theme === 'premium';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) { console.error("Error fetching stats"); }
    };
    fetchStats();
  }, [backendUrl]);

  if (!stats) return (
    <div className={`min-h-screen flex items-center justify-center font-serif animate-pulse ${isPremium ? 'text-yellow-500 bg-slate-950' : 'text-slate-400 bg-slate-50'}`}>
      Loading elite dashboard...
    </div>
  );

  // --- Dynamic Theme Styles ---
  const textMain = isPremium ? "text-white" : "text-slate-900";
  const textSub = isPremium ? "text-slate-400" : "text-slate-500";
  const cardBase = isPremium ? "bg-slate-900 border-yellow-500/10 shadow-none" : "bg-white border-slate-100 shadow-sm";
  const headerCard = isPremium ? "bg-slate-900 border-yellow-500/10" : "bg-white border-slate-100 shadow-sm";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">
      
      {/* Header */}
      <motion.div variants={item} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-left">
            {isPremium && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-black tracking-widest mb-4">
                <Sparkles className="h-3 w-3" /> Elite Account Active
              </div>
            )}
            <h1 className={`text-4xl md:text-5xl font-serif font-bold ${textMain}`}>
              Hello, {user.role === 'doctor' ? 'Dr. ' : ''}{user.fullName}
            </h1>
            <p className={`${textSub} mt-2 text-lg font-light`}>Your daily overview.</p>
        </div>
        <div className={`px-6 py-4 rounded-3xl border flex flex-col items-center md:items-end ${headerCard}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Current Date</p>
            <p className={`text-xl font-serif font-bold ${isPremium ? 'text-yellow-500' : 'text-slate-900'}`}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
        </div>
      </motion.div>

      {/* DOCTOR VIEW */}
      {user.role === "doctor" && (
        <>
          <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Calendar />} title="Total Appts" value={stats.total_appointments} color="blue" />
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Clock />} title="Pending" value={stats.pending_requests} color="amber" />
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Activity />} title="Today" value={stats.today_appointments} color="emerald" />
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Users />} title="Patients" value={stats.total_patients} color="purple" />
          </motion.div>

          <motion.div variants={item} className={`relative rounded-[3rem] overflow-hidden p-12 border ${isPremium ? 'bg-slate-900 border-yellow-500/20' : 'bg-slate-900 border-transparent'}`}>
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isPremium ? 'bg-yellow-500/10' : 'bg-emerald-500/20'}`}></div>
            <div className="relative z-10 text-left">
                <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Medical Command Center</h3>
                <p className="text-slate-400 max-w-xl text-lg font-light mb-8">Efficiently manage your patient queue and professional availability.</p>
                <div className="flex flex-wrap gap-4">
                    <Link to="/my-appointments" className={`px-10 py-4 rounded-2xl font-bold transition shadow-xl flex items-center gap-2 ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
                      View Schedule
                    </Link>
                    <Link to="/profile" className="bg-white/5 border border-white/10 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 transition backdrop-blur-md">
                      Profile Settings
                    </Link>
                </div>
            </div>
          </motion.div>
        </>
      )}

      {/* PATIENT VIEW */}
      {user.role === "patient" && (
        <>
          <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<TrendingUp />} title="Total Visits" value={stats.total_appointments} color="blue" />
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Clock />} title="Pending" value={stats.pending} color="amber" />
            <LuxuryStatCard variants={item} isPremium={isPremium} icon={<Shield />} title="Confirmed" value={stats.confirmed} color="emerald" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/doctors">
                <motion.div variants={item} whileHover={{ y: -5 }} className={`rounded-[2.5rem] p-10 border transition-all group relative overflow-hidden text-left ${cardBase}`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/5' : 'bg-emerald-50'}`}></div>
                    <div className="relative z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-100 text-emerald-600'}`}>
                          <Search className="h-8 w-8" />
                        </div>
                        <h3 className={`text-3xl font-serif font-bold mb-2 ${textMain}`}>Find a Doctor</h3>
                        <p className={`${textSub} mb-6`}>Book top specialists instantly.</p>
                        <span className={`font-bold flex items-center gap-2 ${isPremium ? 'text-yellow-500' : 'text-emerald-700'}`}>
                          Book Now <ArrowUpRight className="h-5 w-5" />
                        </span>
                    </div>
                </motion.div>
            </Link>
            <Link to="/my-appointments">
                <motion.div variants={item} whileHover={{ y: -5 }} className={`rounded-[2.5rem] p-10 border transition-all group relative overflow-hidden text-left ${isPremium ? 'bg-slate-900 border-yellow-500/10 shadow-2xl' : 'bg-slate-950 border-transparent'}`}>
                    <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -ml-16 -mb-16 ${isPremium ? 'bg-yellow-500/5' : 'bg-blue-500/10'}`}></div>
                    <div className="relative z-10">
                        <div className={`w-16 h-16 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border ${isPremium ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-white/10 text-white border-white/10'}`}>
                          <Calendar className="h-8 w-8" />
                        </div>
                        <h3 className="text-3xl font-serif font-bold mb-2 text-white">My Schedule</h3>
                        <p className="text-slate-400 mb-6">View history & prescriptions.</p>
                        <span className="text-white font-bold flex items-center gap-2">
                          Open Calendar <ArrowUpRight className="h-5 w-5" />
                        </span>
                    </div>
                </motion.div>
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
};

const LuxuryStatCard = ({ icon, title, value, color, variants, isPremium }) => {
    const colors = { 
      blue: isPremium ? "from-blue-600 to-blue-900" : "from-blue-500 to-blue-600", 
      amber: isPremium ? "from-yellow-600 to-yellow-900" : "from-amber-400 to-amber-500", 
      emerald: isPremium ? "from-emerald-600 to-emerald-900" : "from-emerald-500 to-emerald-600", 
      purple: isPremium ? "from-purple-600 to-purple-900" : "from-purple-500 to-purple-600" 
    };
    
    return (
        <motion.div variants={variants} whileHover={{ y: -5 }} className={`p-6 rounded-[2rem] border flex items-center gap-5 transition-all ${isPremium ? 'bg-slate-900 border-yellow-500/10' : 'bg-white border-slate-100 shadow-lg'}`}>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-xl`}>
              {icon}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
              <h4 className={`text-3xl font-serif font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>{value || 0}</h4>
            </div>
        </motion.div>
    );
};

export default Dashboard;