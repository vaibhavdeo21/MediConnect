import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Calendar, Clock, User, Video } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Appointments on load
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/appointments/my-appointments', {
          headers: { Authorization: user.token }
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchAppointments();
  }, [user]);

  if (loading) return <div className="p-10 text-center">Loading your data...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.fullName || "Patient"}</h1>
          <p className="text-slate-600">Here is your health overview.</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-semibold">Upcoming</p>
            <p className="font-bold text-slate-900">{appointments.length} Appointments</p>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Schedule</h2>
      
      {appointments.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No appointments yet</h3>
          <p className="text-slate-500 mb-6">Find a specialist and book your first consultation today.</p>
          <a href="/doctors" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-teal-700">
            Find a Doctor
          </a>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {appointments.map((appt) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={appt.id} 
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-50 p-2 rounded-lg">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{appt.doctor_name || "Dr. Specialist"}</h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Cardiology</span>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  appt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {appt.status}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-slate-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(appt.appointment_date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-slate-600 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  {appt.appointment_time}
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition">
                <Video className="w-4 h-4" />
                Join Call
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;