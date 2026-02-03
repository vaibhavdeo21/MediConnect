import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { History, ArrowLeft, Clock, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ActivityLog = () => {
  const { theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const isPremium = theme === 'premium';
  const backendUrl = import.meta.env.VITE_API_URL;

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

  return (
    <div className={`min-h-screen pt-28 pb-20 px-4 ${isPremium ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <div className={`rounded-[2.5rem] p-10 border ${isPremium ? 'bg-slate-900 border-yellow-500/10' : 'bg-white border-slate-100 shadow-xl'}`}>
          <div className="flex items-center gap-4 mb-10">
            <div className={`p-3 rounded-2xl ${isPremium ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-100 text-emerald-600'}`}>
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">Full Audit Log</h1>
              <p className="opacity-60 text-sm">A complete history of your account activity.</p>
            </div>
          </div>

          <div className="space-y-8">
            {loading ? (
              <p className="text-center py-10 animate-pulse">Retrieving records...</p>
            ) : activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="flex gap-6 items-start group">
                  <div className={`mt-1 p-3 rounded-full ${isPremium ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    {/* Reuse your icon helper logic here */}
                    {act.type === 'appointment_confirmed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-amber-500" />}
                  </div>
                  <div className="border-b border-slate-100/10 pb-6 flex-1 text-left">
                    <p className="font-bold text-lg">{act.title}</p>
                    <p className="opacity-70 mt-1">{act.description}</p>
                    <div className="flex items-center gap-2 mt-3 text-[10px] font-black uppercase tracking-widest opacity-40">
                      <Clock className="h-3 w-3" /> {new Date(act.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-20 opacity-40 italic">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;