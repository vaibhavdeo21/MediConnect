import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Calendar, Clock, Activity, FileText, Search, ArrowUpRight, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

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

  if (!stats) return <div className="min-h-screen flex items-center justify-center font-serif text-slate-400 animate-pulse">Loading dashboard...</div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto px-4 py-12 font-sans">
      
      {/* Header */}
      <motion.div variants={item} className="mb-12 flex items-end justify-between">
        <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900">Hello, {user.role === 'doctor' ? 'Dr. ' : ''}{user.fullName}</h1>
            <p className="text-slate-500 mt-2 text-lg font-light">Your daily overview.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today</p>
            <p className="text-lg font-serif font-medium text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </div>
      </motion.div>

      {/* DOCTOR VIEW */}
      {user.role === "doctor" && (
        <>
          <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <LuxuryStatCard variants={item} icon={<Calendar className="h-6 w-6" />} title="Total Appts" value={stats.total_appointments} color="blue" />
            <LuxuryStatCard variants={item} icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending_requests} color="amber" />
            <LuxuryStatCard variants={item} icon={<Activity className="h-6 w-6" />} title="Today" value={stats.today_appointments} color="emerald" />
            <LuxuryStatCard variants={item} icon={<Users className="h-6 w-6" />} title="Patients" value={stats.total_patients} color="purple" />
          </motion.div>

          <motion.div variants={item} className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 text-white p-12">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
                <h3 className="text-3xl font-serif font-bold mb-4">Command Center</h3>
                <p className="text-slate-300 max-w-xl text-lg font-light mb-8">Manage appointments and availability.</p>
                <div className="flex gap-4">
                    <Link to="/my-appointments" className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition shadow-lg flex items-center gap-2">View Calendar</Link>
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
            <LuxuryStatCard variants={item} icon={<TrendingUp className="h-6 w-6" />} title="Total Visits" value={stats.total_appointments} color="blue" />
            <LuxuryStatCard variants={item} icon={<Clock className="h-6 w-6" />} title="Pending" value={stats.pending} color="amber" />
            <LuxuryStatCard variants={item} icon={<Shield className="h-6 w-6" />} title="Confirmed" value={stats.confirmed} color="emerald" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/doctors">
                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="bg-white border border-slate-100 rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8 text-emerald-600"><Search className="h-8 w-8" /></div>
                        <h3 className="text-3xl font-serif font-bold text-slate-900 mb-2">Find a Doctor</h3>
                        <p className="text-slate-500 mb-6">Book top specialists instantly.</p>
                        <span className="text-emerald-700 font-bold flex items-center gap-2">Book Now <ArrowUpRight className="h-5 w-5" /></span>
                    </div>
                </motion.div>
            </Link>
            <Link to="/my-appointments">
                <motion.div variants={item} whileHover={{ scale: 1.02 }} className="bg-slate-900 text-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden">
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
  );
};

const LuxuryStatCard = ({ icon, title, value, color, variants }) => {
    const colors = { blue: "from-blue-500 to-blue-600", amber: "from-amber-400 to-amber-500", emerald: "from-emerald-500 to-emerald-600", purple: "from-purple-500 to-purple-600" };
    return (
        <motion.div variants={variants} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}>{icon}</div>
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p><h4 className="text-3xl font-serif font-bold text-slate-900">{value || 0}</h4></div>
        </motion.div>
    );
};

export default Dashboard;