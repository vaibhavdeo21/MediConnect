import { useContext } from 'react'; // <--- 1. Import useContext
import { AuthContext } from '../context/AuthContext'; // <--- 2. Import AuthContext
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Clock, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useContext(AuthContext); // <--- 3. Get the user status

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="bg-teal-100 text-teal-800 text-sm font-semibold px-3 py-1 rounded-full">
                New: 24/7 Virtual Consultations
              </span>
              <h1 className="mt-6 text-5xl font-extrabold text-slate-900 leading-tight">
                Healthcare that <br />
                <span className="text-primary">Revolves Around You</span>
              </h1>
              <p className="mt-4 text-xl text-slate-600 max-w-lg">
                Connect with top-tier specialists from the comfort of your home. Secure, private, and effortless medical care.
              </p>
              
              <div className="mt-8 flex gap-4">
                {/* 4. SMART LINK: If user exists -> Go to Doctors. If not -> Go to Register */}
                <Link 
                  to={user ? "/doctors" : "/register"} 
                  className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-teal-700 transition shadow-xl shadow-teal-500/20"
                >
                  Book Appointment <ArrowRight className="w-5 h-5" />
                </Link>

                <Link to="/doctors" className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-3 rounded-full font-bold text-lg hover:bg-slate-50 transition">
                  Find Doctors
                </Link>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block absolute top-10 right-0 w-1/2 h-full"
          >
             <div className="relative w-full h-[500px] bg-gradient-to-tr from-teal-100 to-blue-100 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <div className="absolute inset-0 flex items-center justify-center text-teal-800/20 font-bold text-4xl">
                   [Doctor Image Here]
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section (Same as before) */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Why Choose MediConnect?</h2>
            <p className="mt-4 text-slate-600">We bridge the gap between patient comfort and medical excellence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Video className="w-8 h-8 text-primary" />}
              title="HD Video Consults"
              desc="Face-to-face interactions with doctors without leaving your couch."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-primary" />}
              title="Bank-Grade Security"
              desc="Your medical data is encrypted and HIPAA compliant."
            />
            <FeatureCard 
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Instant Availability"
              desc="Find doctors available right now for urgent queries."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition duration-300 border border-slate-100 group">
    <div className="bg-white p-4 rounded-xl w-fit shadow-sm group-hover:scale-110 transition duration-300 mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default Home;