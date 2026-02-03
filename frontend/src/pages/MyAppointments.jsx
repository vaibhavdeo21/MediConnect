import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import PrescriptionModal from '../components/PrescriptionModal';
import RecordsModal from '../components/RecordsModal';
import ReviewModal from '../components/ReviewModal';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Video, FileText, FolderOpen, Star, Crown } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const MyAppointments = () => {
  const { user, theme } = useContext(AuthContext); // Get theme for global styling if needed
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState(null);
  const [selectedRecordAppt, setSelectedRecordAppt] = useState(null);
  const [selectedReviewDoctorId, setSelectedReviewDoctorId] = useState(null);

  const backendUrl = import.meta.env.VITE_API_URL;
  const isPremium = theme === 'premium';

  // Styling Variables
  const bgClass = isPremium ? "bg-slate-950" : "bg-slate-50";
  const textPrimary = isPremium ? "text-yellow-50" : "text-slate-900";
  const cardBg = isPremium ? "bg-slate-900 border-yellow-500/20 shadow-yellow-500/5" : "bg-white border-slate-100";
  const textSecondary = isPremium ? "text-slate-400" : "text-slate-500";

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${backendUrl}/api/appointments/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, backendUrl]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/appointments/status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className={`min-h-screen ${bgClass} flex items-center justify-center ${textSecondary}`}>Loading schedule...</div>;

  return (
    <div className={`min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ${bgClass}`}>
      <div className="max-w-5xl mx-auto">
        <div className={`flex items-end justify-between mb-10 border-b pb-6 ${isPremium ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
                <h1 className={`text-3xl font-serif font-bold ${textPrimary}`}>
                {user?.role === 'doctor' ? 'Patient Requests' : 'My Appointments'}
                </h1>
                <p className={`${textSecondary} mt-1`}>Manage your schedule and medical history.</p>
            </div>
            <div className={`px-4 py-2 rounded-full border text-sm font-medium shadow-sm ${isPremium ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
                Total: {appointments.length}
            </div>
        </div>

        {appointments.length === 0 ? (
          <div className={`p-16 rounded-2xl shadow-sm text-center border ${cardBg}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isPremium ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <Calendar className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className={`text-xl font-serif font-medium mb-2 ${textPrimary}`}>No appointments yet</h3>
            <p className={textSecondary}>Your scheduled visits will appear here.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-6">
            <AnimatePresence>
            {appointments.map((appt) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={appt.id} 
                className={`p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row justify-between lg:items-center gap-6 ${cardBg}`}
              >
                
                {/* Left: Info */}
                <div className="flex items-start gap-5">
                  <div className={`p-4 rounded-xl shadow-inner ${appt.status === 'Confirmed' ? (isPremium ? 'bg-emerald-900/20' : 'bg-emerald-50') : (isPremium ? 'bg-slate-800' : 'bg-slate-50')}`}>
                    <Calendar className={`h-6 w-6 ${appt.status === 'Confirmed' ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-serif font-bold flex items-center gap-2 ${textPrimary}`}>
                      {user?.role === 'doctor' ? appt.patient_name : appt.doctor_name}
                      
                      {/* --- VIP GOLD BADGE FOR DOCTORS --- */}
                      {user?.role === 'doctor' && appt.is_patient_premium && (
                         <span className="bg-gradient-to-r from-slate-800 to-black text-yellow-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-yellow-500/50 flex items-center gap-1 shadow-lg shadow-yellow-500/10 animate-pulse">
                            <Crown className="h-3 w-3 fill-yellow-400" /> VIP
                         </span>
                      )}
                    </h3>
                    
                    <div className={`flex flex-wrap gap-4 mt-2 text-sm ${textSecondary}`}>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 opacity-70" /> {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}</span>
                        {user?.role === 'patient' && (
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 opacity-70" /> {appt.address || "Virtual Clinic"}</span>
                        )}
                        {/* Show if Patient is Premium in text (Optional backup) */}
                        {user?.role === 'doctor' && appt.is_patient_premium && <span className="text-yellow-500 text-xs font-bold flex items-center gap-1"><Star className="h-3 w-3" /> Premium Plan</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col lg:items-end gap-4">
                  
                  {/* Status Pill */}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start lg:self-end ${
                    appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {appt.status || 'Pending'}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {appt.status === 'Confirmed' && (
                        <>
                            <a href={`https://meet.jit.si/MediConnect-Appt-${appt.id}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20">
                            <Video className="h-4 w-4" /> Join Call
                            </a>

                            <button onClick={() => setSelectedRecordAppt(appt)}
                            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition ${isPremium ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <FolderOpen className="h-4 w-4 text-blue-500" /> Docs
                            </button>

                            <button onClick={() => setSelectedPrescriptionAppt(appt)}
                            className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition ${isPremium ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            <FileText className="h-4 w-4 text-purple-500" /> Rx
                            </button>

                            {user?.role === 'patient' && (
                            <button onClick={() => setSelectedReviewDoctorId(appt.doctor_id)}
                                className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition ${isPremium ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                                <Star className="h-4 w-4 text-amber-400" /> Rate
                            </button>
                            )}
                        </>
                    )}

                    {/* Doctor Pending Actions */}
                    {user?.role === 'doctor' && appt.status === 'Pending' && (
                        <>
                        <button onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                            className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-200 transition">
                            <CheckCircle className="h-4 w-4" /> Accept
                        </button>
                        <button onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}
                            className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 transition">
                            <XCircle className="h-4 w-4" /> Decline
                        </button>
                        </>
                    )}
                  </div>
                </div>

              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* --- MODALS --- */}
        {selectedPrescriptionAppt && <PrescriptionModal isOpen={!!selectedPrescriptionAppt} onClose={() => setSelectedPrescriptionAppt(null)} appointment={selectedPrescriptionAppt} userRole={user?.role} />}
        {selectedRecordAppt && <RecordsModal isOpen={!!selectedRecordAppt} onClose={() => setSelectedRecordAppt(null)} appointment={selectedRecordAppt} userRole={user?.role} />}
        {selectedReviewDoctorId && <ReviewModal isOpen={!!selectedReviewDoctorId} onClose={() => setSelectedReviewDoctorId(null)} doctorId={selectedReviewDoctorId} onSuccess={() => setSelectedReviewDoctorId(null)} />}

      </div>
    </div>
  );
};

export default MyAppointments;