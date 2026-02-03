import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import { ShieldCheck, Video, CalendarCheck, Activity, UserPlus, ArrowRight } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  if (user) {
    return <Dashboard />;
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-emerald-100">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 pt-20 pb-32 lg:pt-32">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-300 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                #1 Trusted Telemedicine Platform
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight mb-6 animate-in zoom-in duration-700">
              Healthcare, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Reimagined.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-in slide-in-from-bottom-8 duration-1000">
              Experience premium virtual care. Connect with top-tier specialists, manage secure records, and receive prescriptions instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-200">
              <Link to="/doctors" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                Find a Specialist <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register?role=doctor" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-xl font-bold transition backdrop-blur-sm flex items-center justify-center gap-2">
                Join as Doctor <UserPlus className="h-4 w-4" />
              </Link>
            </div>

            {/* Floating UI Mockup */}
            <div className="mt-20 relative mx-auto max-w-4xl bg-slate-900/50 border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-2xl animate-in fade-in duration-1000 delay-500">
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-emerald-500 rounded-full blur-2xl opacity-20"></div>
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 px-2">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">LIVE SESSION • SECURE • END-TO-END ENCRYPTED</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 bg-slate-800 rounded-lg h-64 flex items-center justify-center border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10"></div>
                        <Video className="h-12 w-12 text-slate-600" />
                        <div className="absolute bottom-4 left-4 z-20 text-white">
                            <p className="font-bold">Dr. Sarah Smith</p>
                            <p className="text-xs text-emerald-400">Cardiologist</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-slate-800 rounded-lg h-32 border border-white/5 flex items-center justify-center">
                            <Activity className="h-8 w-8 text-slate-600" />
                        </div>
                        <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-lg h-28 p-4">
                            <p className="text-emerald-400 text-xs font-bold uppercase mb-2">Prescription</p>
                            <div className="h-2 w-20 bg-emerald-500/20 rounded mb-2"></div>
                            <div className="h-2 w-12 bg-emerald-500/20 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Why Leaders Choose MediConnect</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">We bridge the gap between patient convenience and medical excellence.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<CalendarCheck className="h-8 w-8 text-emerald-600" />}
                    title="Seamless Scheduling"
                    desc="Smart availability algorithms ensure you find a time that fits your life perfectly."
                />
                <FeatureCard 
                    icon={<Video className="h-8 w-8 text-blue-600" />}
                    title="HD Virtual Consults"
                    desc="Crystal clear video technology powered by encrypted Jitsi Meet servers."
                />
                <FeatureCard 
                    icon={<ShieldCheck className="h-8 w-8 text-purple-600" />}
                    title="Bank-Grade Security"
                    desc="Your medical records and prescriptions are protected with enterprise-level encryption."
                />
            </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-white p-10 rounded-2xl shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 group">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-emerald-50 flex items-center justify-center mb-6 transition-colors">
            {icon}
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-light">{desc}</p>
    </div>
);

export default Home;