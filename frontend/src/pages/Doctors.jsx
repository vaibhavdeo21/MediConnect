import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Star, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Doctors from Backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const backendUrl = import.meta.env.VITE_API_URL;
        // This calls your existing getAllDoctors function
        const res = await axios.get(`${backendUrl}/api/doctors`);
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // 2. Filter Logic
  const filteredDoctors = doctors.filter(doc => 
    doc.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
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
                // FIX: Use 'doctor_id' because that is what your SQL query returns
                key={doc.doctor_id} 
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
                      <span>MediConnect Virtual Clinic</span>
                    </div>
                    <div className="flex items-center font-semibold text-slate-900">
                      <span className="mr-2">Consultation Fee:</span>
                      <span className="text-green-600">${doc.consultation_fee}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <button className="w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-primary transition-colors">
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
    </div>
  );
};

export default Doctors;