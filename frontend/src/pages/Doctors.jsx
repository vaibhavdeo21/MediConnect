import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import { Search, Star, IndianRupee, Clock, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchDoctors = async () => {
      try { const res = await axios.get(`${backendUrl}/api/doctors`); setDoctors(res.data); } 
      catch (err) { console.error("Error fetching doctors:", err); }
    };
    fetchDoctors();
  }, [backendUrl]);

  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookClick = (doc) => {
    if (!user) { toast.info("Please login to book."); navigate('/login'); return; }
    setSelectedDoctor(doc);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Animated Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="h-3 w-3" /> Verified Specialists
          </div>
          <h1 className="text-5xl font-serif font-bold text-slate-900 mb-4">Find Your Specialist</h1>
          
          <div className="mt-8 max-w-lg mx-auto relative group">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" placeholder="Search doctor..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>
        </motion.div>

        {/* Animated Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {filteredDoctors.map((doc) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                key={doc.id} 
                className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-100"
              >
                {/* Gradient Header */}
                <div className="h-28 bg-gradient-to-br from-emerald-900 to-slate-900 relative">
                    <div className="absolute inset-0 bg-white/5 opacity-30"></div>
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 border border-white/20">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-white">4.9</span>
                    </div>
                </div>

                <div className="p-6 relative">
                    {/* Floating Avatar */}
                    <div className="absolute -top-12 left-6 h-20 w-20 bg-white rounded-2xl p-1 shadow-lg transform group-hover:scale-105 transition-transform">
                        <div className="h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-serif font-bold text-slate-400">
                            {doc.full_name.charAt(0)}
                        </div>
                    </div>
                    
                    <div className="mt-8 space-y-1">
                        <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">{doc.specialization}</p>
                        <h2 className={`text-2xl font-serif font-bold text-slate-900 transition-all ${!user ? 'blur-sm opacity-50' : ''}`}>
                            {user ? `Dr. ${doc.full_name}` : 'Dr. Hidden Name'}
                        </h2>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <Clock className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">{doc.availability || 'Mon-Fri, 9AM-5PM'}</span>
                        </div>
                        <div className={`flex items-center gap-3 px-2 ${!user ? 'blur-sm opacity-50' : ''}`}>
                            <IndianRupee className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-bold text-slate-900">₹{doc.consultation_fee}</span>
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleBookClick(doc)}
                        className={`w-full mt-6 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg flex items-center justify-center gap-2
                            ${!user ? 'bg-slate-900 text-white hover:bg-black' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30'}`}
                    >
                        {!user ? <><Lock className="h-4 w-4" /> Login to Book</> : 'Book Appointment'}
                    </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {selectedDoctor && <BookingModal isOpen={!!selectedDoctor} onClose={() => setSelectedDoctor(null)} doctor={selectedDoctor} />}
      </div>
    </div>
  );
};

export default Doctors;