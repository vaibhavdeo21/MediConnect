import { useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  ShieldCheck, Video, CalendarCheck, Activity, 
  UserPlus, ArrowRight, Heart, Brain, 
  Stethoscope, Pill, Microscope, Sparkles, Star
} from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const { user, loading, theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isPremium = theme === 'premium';

  useEffect(() => {
    // This is the "Loop Breaker" - pushes logged-in users to the Dashboard route
    if (!loading && user && location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading || (user && location.pathname === '/')) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isPremium ? 'bg-slate-950' : 'bg-white'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 ${isPremium ? 'border-yellow-500' : 'border-emerald-500'}`}></div>
        <p className={`mt-4 font-serif italic animate-pulse ${isPremium ? 'text-yellow-500' : 'text-emerald-500'}`}>
          MediConnect Elite...
        </p>
      </div>
    );
  }

  // --- Dynamic Theme Variables ---
  const bgClass = isPremium ? "bg-slate-950 text-white" : "bg-white text-slate-900";
  const sectionBg = isPremium ? "bg-slate-900/50" : "bg-slate-50";
  const cardBg = isPremium ? "bg-slate-900 border-yellow-500/10" : "bg-white border-slate-100 shadow-sm";
  const statBg = isPremium ? "bg-yellow-600" : "bg-emerald-600";
  const accentText = isPremium ? "text-yellow-500" : "text-emerald-600";

  return (
    <div className={`min-h-screen font-sans selection:bg-emerald-100 transition-colors duration-500 ${bgClass}`}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-slate-950 pt-24 pb-32 lg:pt-40 text-left">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-3xl opacity-30 ${isPremium ? 'bg-yellow-500/20' : 'bg-emerald-500/20'}`}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border text-sm font-medium mb-8 ${isPremium ? 'border-yellow-500/20 text-yellow-500' : 'border-white/10 text-emerald-300'}`}
            >
                <Sparkles className="h-4 w-4" /> #1 Trusted Telemedicine Platform in India
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-serif font-bold text-white tracking-tight mb-6">
              Exceptional Care. <br/>
              <span className={`italic bg-clip-text text-transparent bg-gradient-to-r ${isPremium ? 'from-yellow-500 to-yellow-200' : 'from-emerald-400 to-teal-200'}`}>Expertly Delivered.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 font-light leading-relaxed">
              Connect with 500+ verified specialists within minutes. Experience the future of healthcare with HD video consults and digital prescriptions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
              <Link to="/login" className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 group ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-yellow-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/25'}`}>
                Consult a Doctor Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register?role=doctor" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-bold transition backdrop-blur-sm text-center">
                Join as a Specialist
              </Link>
            </div>
        </div>
      </section>

      {/* --- STATISTICS BAR --- */}
      <section className={`${statBg} py-12 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Verified Doctors", val: "500+" },
            { label: "Successful Consults", val: "15k+" },
            { label: "Patient Satisfaction", val: "4.9/5" },
            { label: "Response Time", val: "15 min" }
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-serif font-bold text-white mb-1">{item.val}</div>
              <div className={`text-xs uppercase tracking-widest font-bold ${isPremium ? 'text-yellow-100' : 'text-emerald-100'}`}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SPECIALTY GRID --- */}
      <section className={`py-24 px-4 transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-serif font-bold mb-4 ${isPremium ? 'text-white' : 'text-slate-900'}`}>Consult Top Specialists</h2>
            <p className={isPremium ? 'text-slate-400' : 'text-slate-500'}>World-class expertise available at your fingertips.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: 'Cardiology', icon: <Heart /> },
              { name: 'Neurology', icon: <Brain /> },
              { name: 'Dermatology', icon: <Stethoscope /> },
              { name: 'Pediatrics', icon: <Activity /> },
              { name: 'General Medicine', icon: <Microscope /> },
              { name: 'Psychiatry', icon: <Pill /> }
            ].map((spec) => (
              <div key={spec.name} className={`p-8 border rounded-[2rem] text-center transition-all cursor-pointer group ${cardBg} ${isPremium ? 'hover:border-yellow-500 hover:shadow-yellow-500/10' : 'hover:border-emerald-500 hover:shadow-2xl'}`}>
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center transition-all ${isPremium ? 'bg-slate-800 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-950' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  {spec.icon}
                </div>
                <span className={`text-sm font-bold ${isPremium ? 'text-slate-300' : 'text-slate-800'}`}>{spec.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className={`py-24 transition-colors duration-500 ${sectionBg}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <h2 className={`text-4xl font-serif font-bold mb-8 leading-tight ${isPremium ? 'text-white' : 'text-slate-900'}`}>Your Health Journey, <br/>Simplified in 3 Steps.</h2>
              <div className="space-y-12">
                <Step num="01" title="Find your Doctor" desc="Search by department or symptoms. View doctor profiles, ratings, and availability." isPremium={isPremium} />
                <Step num="02" title="Book Instant Slot" desc="Schedule a video call or clinic visit. Secure your spot with bank-grade payment encryption." isPremium={isPremium} />
                <Step num="03" title="Digital Consultation" desc="Receive your prescription and records instantly in your secure dashboard." isPremium={isPremium} />
              </div>
            </div>
            <div className="relative">
              <div className={`aspect-square rounded-[3rem] border flex items-center justify-center p-8 ${isPremium ? 'bg-yellow-500/5 border-yellow-500/10' : 'bg-emerald-600/5 border-emerald-100'}`}>
                 <Video className={`h-32 w-32 ${isPremium ? 'text-yellow-500/20' : 'text-emerald-200'}`} />
                 <div className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce">
                    <div className="flex gap-2 items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] ${isPremium ? 'bg-yellow-500' : 'bg-emerald-500'}`}>DR</div>
                      <div className="text-[10px] font-bold text-slate-900">Incoming Call...</div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className={`py-24 overflow-hidden text-left transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 text-left">
            <div className="max-w-xl">
              <h2 className={`text-3xl md:text-5xl font-serif font-bold mb-6 ${isPremium ? 'text-white' : 'text-slate-900'}`}>Voices of Trust</h2>
              <p className={isPremium ? 'text-slate-400' : 'text-slate-500'}>Don't just take our word for it. Join thousands of patients who have found a better way to manage their health.</p>
            </div>
            <div className={`px-6 py-3 border rounded-full text-sm font-bold ${isPremium ? 'bg-slate-900 border-yellow-500/20 text-yellow-500' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
              Average 4.9/5 Rating
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <TestimonialCard 
              quote="The specialist was extremely thorough. I got my cardiology consult and prescription within 20 minutes without leaving my office."
              author="Arjun Mehta" role="Premium Member" initials="AM" color={isPremium ? "bg-yellow-500/10 text-yellow-500" : "bg-emerald-100 text-emerald-700"} isPremium={isPremium}
            />
            <TestimonialCard 
              quote="The Elite theme and AI health assistant are game changers. It feels like having a private doctor in my pocket 24/7."
              author="Priya Sharma" role="Elite Member" initials="PS" color={isPremium ? "bg-yellow-500/10 text-yellow-500" : "bg-yellow-100 text-yellow-700"} isPremium={isPremium}
            />
            <TestimonialCard 
              quote="As a doctor, the integrated EHR and wallet system make managing my practice incredibly simple. Best platform for specialists."
              author="Dr. Vikram Rao" role="Verified Surgeon" initials="VR" color={isPremium ? "bg-yellow-500/10 text-yellow-500" : "bg-blue-100 text-blue-700"} isPremium={isPremium}
            />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-24 bg-slate-950 relative overflow-hidden text-center">
        <div className={`absolute inset-0 opacity-50 ${isPremium ? 'bg-yellow-500/5' : 'bg-emerald-500/5'}`}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className={`text-4xl md:text-5xl font-serif font-bold mb-8 italic text-transparent bg-clip-text bg-gradient-to-r ${isPremium ? 'from-yellow-100 to-yellow-400' : 'from-emerald-100 to-emerald-400'}`}>Better Health Starts with a Single Click.</h2>
          <Link to="/register" className={`inline-block px-12 py-5 rounded-2xl font-bold transition-all shadow-2xl ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-white text-slate-950 hover:bg-emerald-50'}`}>
            Create Your Free Account
          </Link>
          <p className="mt-6 text-slate-500 text-sm">Join 15,000+ Indians who trust MediConnect for their wellness.</p>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className={`py-20 border-t text-left transition-colors duration-500 ${isPremium ? 'bg-slate-950 border-yellow-500/10' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 text-left">
          <div className="col-span-1 md:col-span-2">
            <div className={`text-3xl font-serif font-bold mb-6 ${isPremium ? 'text-white' : 'text-slate-950'}`}>MediConnect<span className={isPremium ? 'text-yellow-500' : 'text-emerald-600'}>.</span></div>
            <p className="text-slate-500 max-w-sm mb-8">Revolutionizing healthcare accessibility in India through premium virtual care and AI-driven assistance.</p>
          </div>
          <div>
            <h4 className={`font-bold mb-6 ${isPremium ? 'text-white' : 'text-slate-900'}`}>Explore</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><Link to="/doctors" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Find Doctors</Link></li>
              <li><Link to="/register?role=doctor" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Join as Doctor</Link></li>
              <li><Link to="/subscribe" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Elite Premium</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={`font-bold mb-6 ${isPremium ? 'text-white' : 'text-slate-900'}`}>Support</h4>
            <ul className="space-y-4 text-slate-500 text-sm">
              <li><Link to="/privacy" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Terms of Service</Link></li>
              <li><a href="mailto:support@mediconnect.com" className={isPremium ? 'hover:text-yellow-500' : 'hover:text-emerald-600'}>Contact Us</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components
const Step = ({ num, title, desc, isPremium }) => (
  <div className="flex gap-6 text-left">
    <div className={`text-4xl font-serif font-bold ${isPremium ? 'text-yellow-500/20' : 'text-emerald-100'}`}>{num}</div>
    <div className="text-left">
      <h3 className={`text-xl font-bold mb-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ quote, author, role, initials, color, isPremium }) => (
  <div className={`p-10 rounded-[2.5rem] border relative group hover:shadow-2xl transition-all duration-500 text-left ${isPremium ? 'bg-slate-900 border-yellow-500/10' : 'bg-white border-slate-100 shadow-sm'}`}>
    <div className="flex gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <p className={`italic leading-relaxed mb-8 text-lg ${isPremium ? 'text-slate-300' : 'text-slate-700'}`}>"{quote}"</p>
    <div className="flex items-center gap-4 text-left">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold ${color}`}>
        {initials}
      </div>
      <div className="text-left">
        <div className={`font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>{author}</div>
        <div className={`text-xs uppercase tracking-widest font-bold ${isPremium ? 'text-yellow-500/50' : 'text-slate-400'}`}>{role}</div>
      </div>
    </div>
  </div>
);

export default Home;