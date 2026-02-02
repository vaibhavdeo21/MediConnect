import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Video } from 'lucide-react';
import { toast } from 'react-toastify';

const MyAppointments = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Appointments
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

  // 2. Handle Status Update (Accept/Cancel)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/appointments/status/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Appointment ${newStatus}`);
      fetchAppointments(); // Refresh list to show new status immediately
    } catch (err) {
      toast.error("Failed to update status");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20">Loading appointments...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          {user?.role === 'doctor' ? 'Patient Requests' : 'My Appointments'}
        </h1>

        {appointments.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-100">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No appointments found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition hover:shadow-md">
                
                {/* Left Side: Appointment Info */}
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${appt.status === 'Confirmed' ? 'bg-green-50' : 'bg-blue-50'}`}>
                    <Calendar className={`h-6 w-6 ${appt.status === 'Confirmed' ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {user?.role === 'doctor' ? appt.patient_name : appt.doctor_name}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" /> 
                      {new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}
                    </p>
                    {user?.role === 'patient' && (
                       <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                         <MapPin className="h-3 w-3" /> {appt.address || "Virtual Clinic"}
                       </p>
                    )}
                  </div>
                </div>

                {/* Right Side: Status & Actions */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  
                  {/* STATUS BADGE */}
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    appt.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {appt.status || 'Pending'}
                  </span>

                  {/* VIDEO CALL BUTTON (Visible to everyone if Confirmed) */}
                  {appt.status === 'Confirmed' && (
                    <a 
                      href={`https://meet.jit.si/MediConnect-${appt.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition shadow-md whitespace-nowrap"
                    >
                      <Video className="h-4 w-4" /> Join Call
                    </a>
                  )}

                  {/* DOCTOR ACTIONS (Visible only to Doctors if Pending) */}
                  {user?.role === 'doctor' && appt.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(appt.id, 'Confirmed')}
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                        title="Accept Appointment"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(appt.id, 'Cancelled')}
                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                        title="Decline Appointment"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;