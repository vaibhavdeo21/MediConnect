import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../components/Dashboard'; // Import the new Dashboard
import { Stethoscope, ShieldCheck, Video, CalendarCheck } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  // 1. IF LOGGED IN: SHOW DASHBOARD
  if (user) {
    return <Dashboard />;
  }

  // 2. IF LOGGED OUT: SHOW LANDING PAGE
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

          <div className="md:w-1/2 space-y-6 animate-in slide-in-from-left duration-700">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Healthcare at your <br />
              <span className="text-primary">Fingertips.</span>
            </h1>
            <p className="text-lg text-slate-300">
              Connect with top doctors, get prescriptions, and manage your health records—all from the comfort of your home.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/doctors" className="bg-primary hover:bg-teal-600 text-white px-8 py-3 rounded-full font-bold transition shadow-lg shadow-teal-500/30">
                Find a Doctor
              </Link>
              <Link to="/register?role=doctor" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-full font-bold transition backdrop-blur-sm">
                Join as Doctor
              </Link>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center animate-in zoom-in duration-700">
            {/* Abstract Illustration Placeholder */}
            <div className="relative w-80 h-80 bg-gradient-to-tr from-teal-500 to-blue-600 rounded-full opacity-20 blur-3xl absolute"></div>
            <div className="relative bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md max-w-sm w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Dr. Sarah Smith</h3>
                  <p className="text-sm text-slate-300">Cardiologist • Online</p>
                </div>
              </div>
              <div className="bg-white/10 h-32 rounded-lg mb-4 flex items-center justify-center text-sm text-slate-300">
                Video Call in Progress...
              </div>
              <div className="flex gap-2">
                <button className="flex-1 bg-red-500 py-2 rounded-lg font-bold">End</button>
                <button className="flex-1 bg-primary py-2 rounded-lg font-bold">Mute</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Why Choose MediConnect?</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CalendarCheck className="h-8 w-8 text-primary" />}
              title="Instant Booking"
              desc="Book appointments with verified doctors instantly. No waiting in lines."
            />
            <FeatureCard
              icon={<Video className="h-8 w-8 text-blue-500" />}
              title="HD Video Consults"
              desc="High-quality video calls powered by secure Jitsi Meet technology."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-8 w-8 text-purple-500" />}
              title="Secure Records"
              desc="Your prescriptions and medical reports are stored securely and privately."
            />
          </div>
        </div>
      </section>

    </div>
  );
};

// Helper Component for Feature Cards
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition border border-slate-100">
    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default Home;