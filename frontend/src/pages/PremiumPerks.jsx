import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Zap, Bot, Star, Crown, Headphones } from 'lucide-react';

const PremiumPerks = () => {
  return (
    <div className="min-h-screen bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-yellow-500/30">
      <div className="max-w-5xl mx-auto">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
        >
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4 fill-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-yellow-50 mb-4 tracking-tight">Elite <span className="text-yellow-500 italic">Privileges</span></h1>
            <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">Welcome to the inner circle. Your health experience is now prioritized, intelligent, and secure.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PerkCard 
                icon={<Bot className="text-yellow-500" />} 
                title="24/7 AI Health Concierge" 
                desc="Powered by Gemini AI, your personal assistant is ready to analyze symptoms and provide health insights anytime, anywhere."
            />
            <PerkCard 
                icon={<Zap className="text-yellow-500" />} 
                title="Priority Scheduling" 
                desc="Your appointments appear at the top of doctors' lists. Get seen faster with our VIP queuing system."
            />
            <PerkCard 
                icon={<ShieldCheck className="text-yellow-500" />} 
                title="Enhanced Data Protection" 
                desc="Extra layers of encryption for your medical records and prescriptions. Your privacy is our absolute priority."
            />
            <PerkCard 
                icon={<Headphones className="text-yellow-500" />} 
                title="Dedicated Support" 
                desc="Skip the line with 24/7 dedicated support for any technical or booking issues."
            />
        </div>

        {/* Exclusive Branding Section */}
        <motion.div 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-yellow-500/20 text-center"
        >
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-bold text-white mb-4 italic">The Gold Standard of Digital Health</h3>
            <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
                As a Premium member, you are part of a select group receiving the highest quality of digital medical service available today.
            </p>
        </motion.div>
      </div>
    </div>
  );
};

const PerkCard = ({ icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="p-8 rounded-2xl bg-slate-900 border border-yellow-500/10 hover:border-yellow-500/30 transition-all group"
    >
        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-6 transition-colors group-hover:bg-yellow-500/20">
            {icon}
        </div>
        <h3 className="text-xl font-serif font-bold text-yellow-50 mb-3">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-light text-sm">{desc}</p>
    </motion.div>
);

export default PremiumPerks;