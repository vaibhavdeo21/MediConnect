import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Search, MapPin, Star, Stethoscope, Calendar, Clock, X, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- BOOKING STATES ---
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Doctors
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

  // 2. Filter Logic
  const filteredDoctors = doctors.filter(doc => 
    doc.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Handle Book Click
  const handleBookClick = (doctor) => {
    // Debug check
    console.log("Book clicked for:", doctor.full_name);

    if (!user) {
      toast.warn("Please login to book an appointment");
      navigate('/login');
      return;
    }
    setSelectedDoctor(doctor);
  };

  // 4. Submit Appointment
  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/appointments/book`, 
        {
          doctorId: selectedDoctor.id, 
          appointmentDate: bookingDate,
          appointmentTime: bookingTime
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment Booked Successfully!");
      setSelectedDoctor(null);
      setBookingDate('');
      setBookingTime('');
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking Failed");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* --- HEADER SECTION --- */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Find Your Specialist</h1>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Browse our network of top-tier medical professionals.
        </p>
        
        <div className="relative max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-full leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-150 ease-in-out shadow-sm"
            placeholder="Search doctors, specialties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- DOCTORS GRID --- */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-500">Finding the best doctors for you...</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doc, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                // SAFE KEY: Uses ID if available, otherwise Index
                key={doc.id || index} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-teal-50 p-3 rounded-full">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <span className="flex items-center text-yellow-500 text-sm font-bold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      4.8
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{doc.full_name}</h3>
                  <p className="text-primary font-medium text-sm mb-4">{doc.specialization}</p>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{doc.address || "MediConnect Virtual Clinic"}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{doc.availability || "Mon - Fri"}</span>
                    </div>
                    <div className="flex items-center font-semibold text-slate-900">
                      <span className="mr-2">Consultation Fee:</span>
                      <span className="text-green-600 flex items-center">
                         <IndianRupee className="h-3 w-3" /> {doc.consultation_fee}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => handleBookClick(doc)}
                    className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-primary transition-colors cursor-pointer relative z-10"
                  >
                    Book Appointment
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-slate-500 text-lg">No doctors found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* --- BOOKING MODAL --- */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
                <button onClick={() => setSelectedDoctor(null)} className="text-slate-500 hover:text-red-500">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-slate-600 mb-6">
                  Booking with <span className="font-bold text-slate-900">{selectedDoctor.full_name}</span>
                  <br />
                  <span className="text-sm text-primary">{selectedDoctor.specialization}</span>
                </p>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type="date" 
                        required
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary outline-none"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={bookingLoading}
                    className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-70"
                  >
                    {bookingLoading ? "Confirming..." : "Confirm Booking"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Doctors;