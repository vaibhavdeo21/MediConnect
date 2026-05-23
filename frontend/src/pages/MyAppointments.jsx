import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import RecordsModal from '../components/RecordsModal';
import ReviewModal from '../components/ReviewModal';
import { Calendar, Clock, MapPin, Video, FileText, FolderOpen, Star, Crown, Check, X, Zap, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import StatusBadge from '../components/ui/StatusBadge';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const MyAppointments = () => {
  const { user } = useContext(AuthContext); 
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState(null);
  const [selectedRecordAppt, setSelectedRecordAppt] = useState(null);
  const [selectedReviewDoctorId, setSelectedReviewDoctorId] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;
  const isDoctor = user?.role === 'doctor';

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchAppointments(); }, [user, backendUrl]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/appointments/status/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const filters = ['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'Expired'];
  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <SkeletonLoader type="text" count={1} />
          <SkeletonLoader type="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest glass border border-cyan-500/20 text-cyan-500 mb-3">
                <Calendar className="h-3 w-3" /> Schedule Manager
              </span>
              <h1 className="text-3xl font-display font-bold text-[var(--text-primary)]">
                {isDoctor ? 'Patient' : 'My'} <GradientText gradient="primary">Appointments</GradientText>
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">Manage your schedule and medical history</p>
            </div>
            <span className="px-4 py-2 rounded-full text-sm font-bold glass border border-[var(--border-primary)] text-[var(--text-muted)]">
              {appointments.length} total
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-6">
            {filters.map(f => (
              <motion.button key={f} whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  filter === f
                    ? 'gradient-primary text-white border-transparent shadow-glow-cyan'
                    : 'glass border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}>
                {f === 'all' ? 'All' : f}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Appointments List */}
        {filtered.length === 0 ? (
          <GlassCard hover={false} className="text-center py-16">
            <Calendar className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-1">No appointments found</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {filter !== 'all' ? `No ${filter.toLowerCase()} appointments` : 'Your scheduled visits will appear here'}
            </p>
          </GlassCard>
        ) : (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {filtered.map((appt) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  key={appt.id}
                >
                  <GlassCard 
                    hover={false}
                    variant={appt.is_emergency ? 'red' : 'default'}
                    className={`relative ${appt.is_emergency ? 'border-red-500/30' : ''}`}
                  >
                    {appt.is_emergency && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl" />}
                    
                    <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-display font-bold shrink-0 ${
                          appt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                          appt.status === 'Cancelled' || appt.status === 'Expired' ? 'bg-red-500/10 text-red-500' :
                          appt.is_emergency ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white'
                        }`}>
                          {(isDoctor ? appt.patient_name : appt.doctor_name)?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className={`text-lg font-display font-bold text-[var(--text-primary)] ${appt.status === 'Expired' ? 'line-through opacity-50' : ''}`}>
                              {isDoctor ? appt.patient_name : `Dr. ${appt.doctor_name}`}
                            </h3>
                            {isDoctor && appt.is_patient_premium && (
                              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-md flex items-center gap-1">
                                <Crown className="h-3 w-3 fill-amber-500" /> VIP
                              </span>
                            )}
                            {appt.is_emergency && <StatusBadge status="Emergency" size="sm" />}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {appt.appointment_time}</span>
                            {!isDoctor && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {appt.address || "Virtual Clinic"}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col lg:items-end gap-3">
                        <StatusBadge status={appt.status || 'Pending'} />
                        
                        <div className="flex flex-wrap gap-2">
                          {appt.status === 'Confirmed' && (
                            <>
                              <a href={appt.meeting_link || `https://meet.jit.si/MediConnect-Appt-${appt.id}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-glow-green">
                                <Video className="h-3.5 w-3.5" /> Join Call
                              </a>
                              <button onClick={() => setSelectedRecordAppt(appt)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-blue-500 hover:border-blue-500/30">
                                <FolderOpen className="h-3.5 w-3.5" /> Docs
                              </button>
                              <button onClick={() => setSelectedPrescriptionAppt(appt)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-purple-500 hover:border-purple-500/30">
                                <FileText className="h-3.5 w-3.5" /> Rx
                              </button>
                              {!isDoctor && (
                                <button onClick={() => setSelectedReviewDoctorId(appt.doctor_id)}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-amber-500 hover:border-amber-500/30">
                                  <Star className="h-3.5 w-3.5" /> Rate
                                </button>
                              )}
                            </>
                          )}

                          {isDoctor && appt.status === 'Pending' && (
                            <>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-glow-green">
                                <Check className="h-3.5 w-3.5" /> Accept
                              </motion.button>
                              <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold glass border border-red-500/20 text-red-500 hover:bg-red-500/10">
                                <X className="h-3.5 w-3.5" /> Decline
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Modals */}
        {selectedPrescriptionAppt && <PrescriptionModal isOpen={!!selectedPrescriptionAppt} onClose={() => setSelectedPrescriptionAppt(null)} appointment={selectedPrescriptionAppt} userRole={user?.role} />}
        {selectedRecordAppt && <RecordsModal isOpen={!!selectedRecordAppt} onClose={() => setSelectedRecordAppt(null)} appointment={selectedRecordAppt} userRole={user?.role} />}
        {selectedReviewDoctorId && <ReviewModal isOpen={!!selectedReviewDoctorId} onClose={() => setSelectedReviewDoctorId(null)} doctorId={selectedReviewDoctorId} onSuccess={() => setSelectedReviewDoctorId(null)} />}
      </div>
    </div>
  );
};

export default MyAppointments;