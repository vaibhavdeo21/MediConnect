import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <--- Import Navigate
import { AuthContext } from '../context/AuthContext'; // <--- Import Auth
import BookingModal from '../components/BookingModal';
import { Search, MapPin, Star, IndianRupee, Clock, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

const Doctors = () => {
  const { user } = useContext(AuthContext); // <--- Get User Status
  const navigate = useNavigate(); // <--- Init Router
  
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

  // --- NEW: Handle Booking Click ---
  const handleBookClick = (doc) => {
    if (!user) {
      toast.info("Please login to view details and book.");
      navigate('/login');
      return;
    }
    setSelectedDoctor(doc);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Find Your Specialist</h1>
          <p className="text-slate-600 mt-2">Book appointments with top doctors near you</p>
          
          <div className="mt-8 max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search doctor or specialization..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition overflow-hidden flex flex-col relative">
              
              {/* --- BLURRED CONTENT LOGIC --- */}
              <div className={`p-6 flex-1 transition-all duration-300 ${!user ? 'blur-sm select-none grayscale opacity-70' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{doc.full_name}</h2>
                    <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold mt-1">
                      {doc.specialization}
                    </span>
                  </div>
                  <div className="bg-yellow-50 p-2 rounded-lg flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-slate-700">4.8</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-500">
                  <p className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" /> 
                    <span className="font-medium text-slate-900">₹{doc.consultation_fee}</span> Consultation Fee
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> 
                    {doc.availability || 'Mon-Fri, 9AM-5PM'}
                  </p>
                </div>
              </div>

              {/* --- LOGIN OVERLAY (If not logged in) --- */}
              {!user && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <div className="bg-white/90 p-4 rounded-full shadow-lg mb-2">
                        <Lock className="h-6 w-6 text-slate-700" />
                    </div>
                </div>
              )}

              {/* Footer Button */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 relative z-20">
                <button 
                  onClick={() => handleBookClick(doc)} // Use new handler
                  className={`w-full font-bold py-2 rounded-lg transition shadow-lg ${!user ? 'bg-slate-800 hover:bg-slate-900 text-white' : 'bg-primary hover:bg-teal-700 text-white shadow-teal-500/20'}`}
                >
                  {!user ? 'Login to View Details' : 'Book Appointment'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            No doctors found matching your search.
          </div>
        )}

        {/* BOOKING MODAL */}
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