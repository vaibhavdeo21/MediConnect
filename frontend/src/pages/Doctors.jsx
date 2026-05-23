import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { Search, Star, IndianRupee, Clock, Lock, Sparkles, AlertCircle, Zap, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import GradientText from '../components/ui/GradientText';
import SkeletonLoader from '../components/ui/SkeletonLoader';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('specialty') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [filterEmergency, setFilterEmergency] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      try { 
        const res = await axios.get(`${backendUrl}/api/doctors`); 
        setDoctors(res.data); 
      } catch (err) { 
        console.error("Error fetching doctors:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, [backendUrl]);

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEmergency = filterEmergency ? doc.is_emergency : true;
    return matchesSearch && matchesEmergency;
  });

  const handleBookClick = (doc) => {
    if (!user) { 
      toast.info("Please login to book."); 
      navigate('/login'); 
      return; 
    }
    setSelectedDoctor(doc);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 glass border border-cyan-500/20 text-cyan-500">
            <Sparkles className="h-3 w-3" /> Verified Specialists
          </span>
          
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-[var(--text-primary)]">
            Find Your <GradientText gradient="primary">Specialist</GradientText>
          </h1>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-3 mt-8 max-w-2xl mx-auto">
            <div className="w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input 
                type="text" placeholder="Search by name or specialty..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input w-full pl-11 pr-4"
              />
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterEmergency(!filterEmergency)}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap border ${
                filterEmergency 
                  ? 'bg-red-500 text-white border-red-500 shadow-glow-red' 
                  : 'glass border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-red-500/30 hover:text-red-500'
              }`}
            >
              <Zap className={`h-4 w-4 ${filterEmergency ? 'fill-white animate-pulse' : ''}`} />
              SOS Only
            </motion.button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="glass-card p-0 overflow-hidden">
                <div className="skeleton h-28 w-full rounded-none" />
                <div className="p-6 space-y-3">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton h-6 w-2/3" />
                  <div className="skeleton h-10 w-full rounded-xl" />
                  <div className="skeleton h-12 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDoctors.map((doc) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  key={doc.id} 
                  className={`glass-card p-0 overflow-hidden transition-all duration-300 ${
                    doc.is_emergency ? 'border-red-500/30 shadow-glow-red' : ''
                  }`}
                >
                  {/* Header Gradient */}
                  <div className={`h-24 relative ${
                    doc.is_emergency
                      ? 'bg-gradient-to-br from-red-500/20 to-orange-500/10'
                      : 'bg-gradient-to-br from-cyan-500/10 to-purple-500/5'
                  }`}>
                    {/* Emergency Badge */}
                    {doc.is_emergency && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-glow-red">
                        <Zap className="h-3 w-3 fill-white" /> SOS Ready
                      </div>
                    )}

                    {/* Rating */}
                    <div className="absolute top-3 right-3 glass px-2.5 py-1 rounded-full flex items-center gap-1 border border-[var(--border-primary)]">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">4.9</span>
                    </div>
                  </div>

                  <div className="p-6 relative">
                    {/* Avatar */}
                    <div className="absolute -top-10 left-6 w-16 h-16 rounded-2xl glass border border-[var(--border-primary)] p-0.5 shadow-lg">
                      <div className={`w-full h-full rounded-[0.85rem] flex items-center justify-center text-xl font-display font-bold ${
                        doc.is_emergency ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white'
                      }`}>
                        {doc.full_name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="mt-6 space-y-1">
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${
                        doc.is_emergency ? 'text-red-500' : 'text-cyan-500'
                      }`}>
                        {doc.specialization}
                      </p>
                      <h2 className={`text-lg font-display font-bold text-[var(--text-primary)] ${!user ? 'blur-sm' : ''}`}>
                        {user ? `Dr. ${doc.full_name}` : 'Dr. ••••••'}
                      </h2>
                    </div>

                    <div className="mt-4 space-y-2">
                      {/* Status */}
                      <div className={`flex items-center gap-3 p-2.5 rounded-xl border transition-colors ${
                        doc.is_emergency
                          ? (doc.is_emergency_active ? 'bg-red-500/5 border-red-500/20' : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] opacity-60')
                          : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)]'
                      }`}>
                        {doc.is_emergency ? (
                          <>
                            <div className={`w-2 h-2 rounded-full ${doc.is_emergency_active ? 'bg-red-500 animate-pulse' : 'bg-[var(--text-muted)]'}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${doc.is_emergency_active ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                              {doc.is_emergency_active ? 'Active Now' : 'Offline'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5 text-cyan-500" />
                            <span className="text-xs text-[var(--text-secondary)]">
                              {doc.availability || 'Available Tomorrow'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Fee */}
                      <div className={`flex items-center gap-2 px-2 ${!user ? 'blur-sm' : ''}`}>
                        <IndianRupee className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                        <span className="text-sm font-bold text-[var(--text-primary)]">₹{doc.consultation_fee}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">/ session</span>
                      </div>
                    </div>

                    {/* Book Button */}
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => doc.is_emergency && !doc.is_emergency_active ? toast.error("Doctor is currently offline") : handleBookClick(doc)}
                      className={`w-full mt-5 py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        !user 
                          ? 'glass border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-cyan-500/30'
                          : doc.is_emergency
                            ? (doc.is_emergency_active
                              ? 'bg-red-500 text-white shadow-glow-red hover:bg-red-600'
                              : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed')
                            : 'gradient-primary text-white shadow-glow-cyan hover:shadow-lg'
                      }`}
                      disabled={doc.is_emergency && !doc.is_emergency_active}
                    >
                      {!user ? (
                        <><Lock className="h-4 w-4" /> Login to Book</>
                      ) : doc.is_emergency ? (
                        doc.is_emergency_active ? <>
                          <Zap className="h-4 w-4 fill-white" /> Emergency Book
                        </> : 'Offline'
                      ) : 'Book Appointment'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-20">
            <Search className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">No doctors found</h3>
            <p className="text-sm text-[var(--text-muted)]">Try adjusting your search or filters</p>
          </div>
        )}

        {selectedDoctor && (
          <BookingModal 
            isOpen={!!selectedDoctor} 
            onClose={() => setSelectedDoctor(null)} 
            doctor={selectedDoctor} 
          />
        )}
      </div>
    </div>
  );
};

export default Doctors;