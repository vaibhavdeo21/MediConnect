import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Calendar, Clock, Activity, Search, ArrowUpRight, TrendingUp, Shield, Crown, Zap } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const Dashboard = () => {
  const { user, theme } = useContext(AuthContext); // theme is 'normal' or 'premium'
  const [stats, setStats] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  const isPremium = theme === 'premium';

  // --- THEME CONFIGURATION ---
  const styles = isPremium ? {
    pageBg: "bg-slate-950",
    textPrimary: "text-yellow-50",
    textSecondary: "text-slate-400",
    cardBg: "bg-slate-900 border-yellow-500/20",
    accentText: "text-yellow-400",
    accentBg: "bg-yellow-500/20",
    buttonPrimary: "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-yellow-500/20",
    buttonSecondary: "bg-slate-800 text-yellow-50 hover:bg-slate-700",
    statColors: { blue: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", amber: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", emerald: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400", purple: "from-slate-800 to-slate-900 border-yellow-500/30 text-yellow-400" }
  } : {
    pageBg: "bg-white",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-500",
    cardBg: "bg-white border-slate-100",
    accentText: "text-emerald-600",
    accentBg: "bg-emerald-50",
    buttonPrimary: "bg-slate-900 text-white shadow-slate-900/20",
    buttonSecondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50",
    statColors: { blue: "from-blue-500 to-blue-600", amber: "from-amber-400 to-amber-500", emerald: "from-emerald-500 to-emerald-600", purple: "from-purple-500 to-purple-600" }
  };

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

  if (!stats) return <div className={`min-h-screen flex items-center justify-center font-serif animate-pulse ${styles.textSecondary}`}>Loading dashboard...</div>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${styles.pageBg}`}>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">

        {/* Header */}
        <motion.div variants={item} className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            {isPremium && (
              <div className="flex items-center gap-2 mb-2 animate-pulse">
                <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-500">Premium Member</span>
              </div>
            )}

            <h1 className={`text-4xl font-serif font-bold ${styles.textPrimary}`}>
              Hello, {user.role === 'doctor' ? 'Dr. ' : ''}{user.fullName}
            </h1>
            <p className={`mt-2 text-lg font-light ${styles.textSecondary}`}>Your daily medical overview.</p>
          </div>

          <div className="flex gap-4 items-center">
            {/* Upgrade CTA for Normal Users */}
            {!isPremium && user.role === 'patient' && (
              <Link to="/subscribe" className="hidden md:flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3 rounded-xl font-bold hover:shadow-lg transition">
                <Crown className="h-4 w-4 text-yellow-400" /> Upgrade
              </Link>
            )}

            <div className={`px-6 py-3 rounded-2xl shadow-sm border ${isPremium ? 'bg-slate-900 border-slate-800 text-yellow-50' : 'bg-white border-slate-100 text-slate-900'}`}>
              <p className={`text-xs font-bold uppercase tracking-widest ${styles.textSecondary}`}>Today</p>
              <p className="text-lg font-serif font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </motion.div>

        {/* DOCTOR VIEW */}
        {user.role === "doctor" && (
          <>
            <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <StatCard variants={item} icon={<Calendar className="h-6 w-6" />} title="Total Appts" value={stats.total_appointments} color="blue" styles={styles} isPremium={isPremium} />
              <StatCard variants={item} icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending_requests} color="amber" styles={styles} isPremium={isPremium} />
              <StatCard variants={item} icon={<Activity className="h-6 w-6" />} title="Today" value={stats.today_appointments} color="emerald" styles={styles} isPremium={isPremium} />
              <StatCard
                variants={item}
                icon={<Wallet className="h-6 w-6" />}
                title="Earnings"
                value={`₹${stats?.total_revenue || 0}`}
                color="purple"
                styles={styles}
                isPremium={isPremium}
                isNegative={stats?.total_revenue < 0}
              />            
              </motion.div>

            <motion.div variants={item} className={`relative rounded-3xl overflow-hidden shadow-2xl p-12 ${isPremium ? 'bg-gradient-to-br from-slate-900 to-black text-white border border-yellow-500/20' : 'bg-slate-900 text-white'}`}>
              <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isPremium ? 'bg-yellow-500/10' : 'bg-emerald-500/20'}`}></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-serif font-bold mb-4 flex items-center gap-3">
                  {isPremium && <Zap className="h-6 w-6 text-yellow-400" />} Command Center
                </h3>
                <p className="text-slate-300 max-w-xl text-lg font-light mb-8">Manage appointments, review patient history, and update availability.</p>
                <div className="flex gap-4">
                  <Link to="/my-appointments" className={`px-8 py-4 rounded-xl font-bold transition shadow-lg flex items-center gap-2 ${isPremium ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>View Calendar</Link>
                  <Link to="/profile" className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition backdrop-blur-md">Settings</Link>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* PATIENT VIEW */}
        {user.role === "patient" && (
          <>
            <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <StatCard variants={item} icon={<TrendingUp className="h-6 w-6" />} title="Total Visits" value={stats.total_appointments} color="blue" styles={styles} isPremium={isPremium} />
              <StatCard variants={item} icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending} color="amber" styles={styles} isPremium={isPremium} />
              <StatCard variants={item} icon={<Shield className="h-6 w-6" />} title="Confirmed" value={stats.confirmed} color="emerald" styles={styles} isPremium={isPremium} />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Find Doctor Card */}
              <Link to="/doctors">
                <motion.div variants={item} whileHover={{ scale: 1.02 }} className={`border rounded-3xl p-10 shadow-xl transition-all group cursor-pointer relative overflow-hidden ${isPremium ? 'bg-slate-900 border-yellow-500/20' : 'bg-white border-slate-100 hover:shadow-2xl'}`}>
                  <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 ${isPremium ? 'bg-yellow-500/10' : 'bg-emerald-50'}`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm ${isPremium ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-100 text-emerald-600'}`}><Search className="h-8 w-8" /></div>
                    <h3 className={`text-3xl font-serif font-bold mb-2 ${styles.textPrimary}`}>Find a Doctor</h3>
                    <p className={`mb-6 ${styles.textSecondary}`}>Book top specialists instantly.</p>
                    <span className={`font-bold flex items-center gap-2 ${styles.accentText}`}>Book Now <ArrowUpRight className="h-5 w-5" /></span>
                  </div>
                </motion.div>
              </Link>

              {/* My Schedule Card */}
              <Link to="/my-appointments">
                <motion.div variants={item} whileHover={{ scale: 1.02 }} className={`rounded-3xl p-10 shadow-xl transition-all group cursor-pointer relative overflow-hidden ${isPremium ? 'bg-gradient-to-br from-yellow-900 to-slate-900 text-white border border-yellow-500/20' : 'bg-slate-900 text-white hover:shadow-2xl'}`}>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 text-white"><Calendar className="h-8 w-8" /></div>
                    <h3 className="text-3xl font-serif font-bold mb-2">My Schedule</h3>
                    <p className="text-slate-400 mb-6">View history & prescriptions.</p>
                    <span className="text-white font-bold flex items-center gap-2">Open Calendar <ArrowUpRight className="h-5 w-5" /></span>
                  </div>
                </motion.div>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color, styles, variants, isPremium }) => {
  // If premium, use dark/gold style. If normal, use colorful gradients.
  const cardStyle = isPremium
    ? `bg-slate-900 border border-yellow-500/20 text-white`
    : `bg-white border border-slate-100 text-slate-900`;

  const iconBg = isPremium
    ? `bg-yellow-500/20 text-yellow-400`
    : `bg-gradient-to-br ${styles.statColors[color]} text-white`;

  return (
    <motion.div variants={variants} whileHover={{ y: -5 }} className={`p-6 rounded-3xl shadow-lg flex items-center gap-5 ${cardStyle}`}>
      <div className={`p-4 rounded-2xl shadow-lg ${iconBg}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold opacity-60 uppercase tracking-widest">{title}</p>
        <h4 className="text-3xl font-serif font-bold mt-1">{value || 0}</h4>
      </div>
    </motion.div>
  );
};

export default Dashboard;