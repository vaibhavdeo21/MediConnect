import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { History, ArrowLeft, Clock, CheckCircle2, MessageSquare, AlertCircle, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActivityLog = () => {
  const { user, theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FIXED: Decoupled Logic - check actual user data for tier and theme state for look
  const isDoctor = user?.role === 'doctor';
  const isDark = theme === 'dark';

  const backendUrl = import.meta.env.VITE_API_URL;

  // THEME SYNC VARIABLES
  const pageBg = isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const cardClass = isDoctor 
    ? (isDark ? "bg-slate-900 border-cyan-500/10 shadow-none" : "bg-white border-blue-100 shadow-xl shadow-blue-900/5")
    : isPremium 
      ? (isDark ? "bg-slate-900 border-yellow-500/10 shadow-none" : "bg-white border-yellow-100 shadow-xl shadow-yellow-900/5")
      : (isDark ? "bg-slate-900 border-white/5 shadow-none" : "bg-white border-slate-100 shadow-xl shadow-slate-900/5");

  const accentText = isDoctor 
    ? (isDark ? "text-cyan-400" : "text-blue-700")
    : isPremium ? "text-yellow-500" : "text-emerald-600";

  useEffect(() => {
    const fetchFullLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/activity-logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(res.data);
      } catch (err) {
        console.error("Error fetching full logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullLogs();
  }, [backendUrl]);

  // ICON HELPER SYNCED WITH DASHBOARD
  const getActivityIcon = (type) => {
    const color = isDoctor ? (isDark ? "text-cyan-400" : "text-blue-600") : isPremium ? "text-yellow-500" : "text-emerald-500";
    switch (type) {
      case 'appointment_confirmed': return <CheckCircle2 className={`h-5 w-5 ${color}`} />;
      case 'message_received': return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'profile_update': return <Users className="h-5 w-5 text-purple-500" />;
      default: return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className={`min-h-screen pt-28 pb-20 px-4 transition-colors duration-500 ${pageBg}`}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className={`flex items-center gap-2 mb-8 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity ${isDark ? 'text-white' : 'text-slate-900'}`}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className={`rounded-[2.5rem] p-10 border transition-all ${cardClass}`}>
          <div className="flex items-center gap-4 mb-10 text-left">
            <div className={`p-3 rounded-2xl ${isDoctor ? (isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-50 text-blue-700') : isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-100 text-emerald-600'}`}>
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className={`text-3xl font-serif font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Full Audit Log</h1>
              <p className={`opacity-60 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>A complete history of your account activity.</p>
            </div>
          </div>

          <div className="space-y-8">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => <div key={i} className={`h-20 w-full rounded-3xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}></div>)}
              </div>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex gap-6 items-start group">
                  <div className={`mt-1 p-3 rounded-full transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    {getActivityIcon(act.type)}
                  </div>
                  <div className={`border-b pb-6 flex-1 text-left ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{act.title}</p>
                    <p className={`mt-1 opacity-70 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{act.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <Clock className="h-3 w-3" /> {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">
                <p className="opacity-40 italic">No activity recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;