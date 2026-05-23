import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { History, ArrowLeft, Clock, CheckCircle2, MessageSquare, AlertCircle, Users, Calendar, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import GradientText from "../components/ui/GradientText";
import SkeletonLoader from "../components/ui/SkeletonLoader";

const ActivityLog = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFullLogs();
  }, [backendUrl]);

  const getActivityIcon = (type, title) => {
    if (title?.includes('Penalty') || title?.includes('Unavailable') || title?.includes('Expired'))
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (title?.includes('Emergency') || title?.includes('SOS'))
      return <Zap className="h-4 w-4 text-red-500" />;
    switch (type) {
      case 'appointment_confirmed': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'message_received': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'profile_update': return <Users className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-cyan-500" />;
    }
  };

  // Group by date
  const grouped = activities.reduce((acc, act) => {
    const date = new Date(act.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(act);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>

        <GlassCard hover={false} padding="lg">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl gradient-primary text-white shadow-glow-cyan">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                Audit <GradientText gradient="primary">Log</GradientText>
              </h1>
              <p className="text-sm text-[var(--text-muted)]">Complete history of your account activity</p>
            </div>
          </div>

          {/* Timeline */}
          {loading ? (
            <SkeletonLoader type="table-row" count={5} />
          ) : activities.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(grouped).map(([date, acts]) => (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-[var(--border-primary)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">{date}</span>
                    <div className="h-px flex-1 bg-[var(--border-primary)]" />
                  </div>
                  <div className="space-y-3">
                    {acts.map((act) => {
                      const isPenalty = act.title?.includes('Penalty') || act.title?.includes('Unavailable');
                      return (
                        <motion.div
                          key={act.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex gap-4 items-start p-4 rounded-xl transition-colors ${
                            isPenalty ? 'bg-red-500/5 border border-red-500/10' : 'hover:bg-[var(--bg-tertiary)]'
                          }`}
                        >
                          <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isPenalty ? 'bg-red-500/10' : 'glass'
                          }`}>
                            {getActivityIcon(act.type, act.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${isPenalty ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                              {act.title}
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{act.description}</p>
                            <div className="flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                              <Clock className="h-3 w-3" />
                              {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <History className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--text-muted)]">No activity recorded yet</p>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default ActivityLog;