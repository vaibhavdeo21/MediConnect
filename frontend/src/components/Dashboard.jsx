import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users, Calendar, Clock, Activity, FileText, PlusCircle, Search } from "lucide-react";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats");
      }
    };
    fetchStats();
  }, [backendUrl]);

  if (!stats) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* WELCOME SECTION */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user.role === 'doctor' ? 'Dr. ' : ''}{user.fullName}
        </h1>
        <p className="text-slate-600 mt-2">Here is what's happening with your account today.</p>
      </div>

      {/* DOCTOR DASHBOARD */}
      {user.role === "doctor" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} title="Total Appointments" value={stats.total_appointments} color="bg-blue-50" />
            <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} title="Pending Requests" value={stats.pending_requests} color="bg-yellow-50" />
            <StatCard icon={<Activity className="h-6 w-6 text-green-600" />} title="Today's Appointments" value={stats.today_appointments} color="bg-green-50" />
            <StatCard icon={<Users className="h-6 w-6 text-purple-600" />} title="Total Patients" value={stats.total_patients} color="bg-purple-50" />
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <Link to="/my-appointments" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-lg font-medium hover:bg-primary transition">
                <Calendar className="h-5 w-5" /> Manage Appointments
              </Link>
              <Link to="/profile" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-lg font-medium hover:bg-slate-50 transition">
                <Users className="h-5 w-5" /> Edit Profile
              </Link>
            </div>
          </div>
        </>
      )}

      {/* PATIENT DASHBOARD */}
      {user.role === "patient" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<Calendar className="h-6 w-6 text-blue-600" />} title="Total Appointments" value={stats.total_appointments} color="bg-blue-50" />
            <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} title="Pending Approvals" value={stats.pending} color="bg-yellow-50" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-600" />} title="Confirmed Visits" value={stats.confirmed} color="bg-green-50" />
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/doctors" className="block group">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg shadow-teal-500/20 transition transform group-hover:scale-[1.02]">
                    <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Find a Doctor</h3>
                    <p className="opacity-90 mt-1 text-sm">Book an appointment with a specialist.</p>
                </div>
            </Link>

            <Link to="/my-appointments" className="block group">
                <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition transform group-hover:scale-[1.02]">
                    <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">My Appointments</h3>
                    <p className="text-slate-500 mt-1 text-sm">View your history, prescriptions, and reports.</p>
                </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Component for Stats
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900">{value || 0}</h4>
    </div>
  </div>
);

// Helper Icon
const CheckCircleIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default Dashboard;