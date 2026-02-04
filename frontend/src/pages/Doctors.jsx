import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { Search, Star, IndianRupee, Clock, Lock, ShieldCheck, Sparkles, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors = () => {
  const { user, theme } = useContext(AuthContext);
  // FIXED Logic: Tier vs Visual Mode
  const isPremium = user?.is_premium; 
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      try { 
        const res = await axios.get(`${backendUrl}/api/doctors`); 
        setDoctors(res.data); 
      } catch (err) { 
        console.error("Error fetching doctors:", err); 
      }
    };
    fetchDoctors();
  }, [backendUrl]);

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookClick = (doc) => {
    if (!user) { 
      toast.info("Please login to book."); 
      navigate('/login'); 
      return; 
    }
    setSelectedDoctor(doc);
  };

  // --- Dynamic Theme Styles ---
  // FIXED: Standard Patient now uses Emerald Green
  const bgClass = isDark ? "bg-slate-950" : "bg-slate-50";
  const cardClass = isPremium 
    ? (isDark ? "bg-slate-900 border-yellow-500/10 shadow-2xl hover:border-yellow-500/40" : "bg-white border-yellow-100 shadow-xl shadow-yellow-900/5 hover:border-yellow-400") 
    : (isDark ? "bg-slate-900 border-emerald-500/10 shadow-2xl hover:border-emerald-500/40" : "bg-white border-emerald-100 shadow-sm hover:shadow-xl hover:border-emerald-300");
  const textMain = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const headerGradient = isPremium 
    ? (isDark ? "from-yellow-900/40 to-slate-900" : "from-yellow-100 to-white") 
    : (isDark ? "from-emerald-900/40 to-slate-900" : "from-emerald-50 to-white");

  return (
    <div className={`min-h-screen py-24 px-4 font-sans transition-colors duration-500 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        
        {/* --- DYNAMIC HEADER --- */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 
            ${isPremium 
              ? (isDark ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200') 
              : (isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-800')}`}>
            {isPremium ? <Sparkles className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />} 
            {isPremium ? 'Elite Network Access' : 'Verified Specialists'}
          </div>
          
          <h1 className={`text-5xl font-serif font-bold mb-4 ${textMain}`}>
            Find Your Specialist
          </h1>
          
          <div className="mt-8 max-w-lg mx-auto relative group text-left">
            <Search className={`absolute left-4 top-4 h-5 w-5 transition-colors 
              ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-600'}`} 
            />
            <input 
              type="text" placeholder="Search by name or specialty..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all border
                ${isDark 
                  ? 'bg-slate-900 border-white/5 text-white focus:ring-2 focus:ring-emerald-500/20' 
                  : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-emerald-500/20'}`}
            />
          </div>
        </motion.div>

        {/* --- DOCTORS GRID --- */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredDoctors.map((doc) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10 }}
                key={doc.id} 
                className={`group rounded-[2.5rem] transition-all duration-500 overflow-hidden border ${cardClass}`}
              >
                {/* Visual Header */}
                <div className={`h-28 bg-gradient-to-br relative ${headerGradient}`}>
                    <div className="absolute inset-0 bg-white/5 opacity-30"></div>
                    <div className={`absolute top-4 right-4 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border 
                      ${isDark ? 'bg-black/20 border-white/10' : 'bg-white/40 border-black/5'}`}>
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4.9</span>
                    </div>
                </div>

                <div className="p-6 relative text-left">
                    {/* Dynamic Avatar */}
                    <div className={`absolute -top-12 left-6 h-20 w-20 rounded-2xl p-1 shadow-lg transform group-hover:scale-105 transition-transform
                      ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className={`h-full w-full rounded-xl flex items-center justify-center text-2xl font-serif font-bold 
                          ${isDark ? 'bg-slate-800 text-emerald-400 border border-white/5' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                            {doc.full_name.charAt(0)}
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-1">
                        <p className={`text-xs font-black uppercase tracking-widest ${isPremium ? 'text-yellow-600' : 'text-emerald-600'}`}>
                          {doc.specialization}
                        </p>
                        <h2 className={`text-2xl font-serif font-bold transition-all ${textMain} ${!user ? 'blur-sm opacity-50' : ''}`}>
                            {user ? `Dr. ${doc.full_name}` : 'Dr. Hidden Name'}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                          ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <Clock className={`h-4 w-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {doc.availability || 'Available Tomorrow'}
                            </span>
                        </div>
                        <div className={`flex items-center gap-3 px-2 ${!user ? 'blur-sm opacity-50' : ''}`}>
                            <IndianRupee className="h-4 w-4 text-slate-400" />
                            <span className={`text-sm font-bold ${textMain}`}>₹{doc.consultation_fee}</span>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookClick(doc)}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2
                          ${!user 
                            ? (isDark ? 'bg-white text-slate-950 hover:bg-emerald-400' : 'bg-slate-900 text-white hover:bg-black') 
                            : (isPremium 
                                ? (isDark ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-yellow-500 text-slate-950 hover:bg-yellow-600 shadow-yellow-900/10') 
                                : (isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30'))
                          }`}
                    >
                        {!user ? <><Lock className="h-4 w-4" /> Login to Book</> : 'Book Appointment'}
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

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