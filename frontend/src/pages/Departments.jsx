import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, Brain, Stethoscope, Pill, Microscope, Activity, 
  Baby, Eye, Bone, Scissors, Zap, ShieldAlert, ArrowRight, Sparkles
} from 'lucide-react';

const departments = [
  { name: 'Cardiology', icon: <Heart />, desc: 'Heart health, hypertension, and vascular diseases.', symptoms: 'Chest pain, palpitations' },
  { name: 'Neurology', icon: <Brain />, desc: 'Brain, spinal cord, and nervous system disorders.', symptoms: 'Headaches, numbness, seizures' },
  { name: 'Dermatology', icon: <Stethoscope />, desc: 'Skin, hair, and nail treatments.', symptoms: 'Rashes, acne, hair fall' },
  { name: 'Pediatrics', icon: <Baby />, desc: 'Child healthcare and developmental wellness.', symptoms: 'Child fever, vaccinations' },
  { name: 'Psychiatry', icon: <Pill />, desc: 'Mental health, anxiety, and behavioral therapy.', symptoms: 'Stress, sleep issues, mood swings' },
  { name: 'Orthopedics', icon: <Bone />, desc: 'Bone, joint, and musculoskeletal care.', symptoms: 'Fractures, back pain, arthritis' },
  { name: 'Ophthalmology', icon: <Eye />, desc: 'Comprehensive eye care and vision correction.', symptoms: 'Blurry vision, eye irritation' },
  { name: 'Gastroenterology', icon: <Zap />, desc: 'Digestive system and liver health.', symptoms: 'Acidity, bloating, stomach pain' },
  { name: 'General Surgery', icon: <Scissors />, desc: 'Minor and major surgical consultations.', symptoms: 'Hernia, appendicitis' },
  { name: 'Emergency', icon: <ShieldAlert />, desc: 'Immediate care for critical health situations.', symptoms: 'Accidents, acute trauma' },
  { name: 'Pathology', icon: <Microscope />, desc: 'Diagnostic testing and lab reports analysis.', symptoms: 'Lab result interpretation' },
  { name: 'Physiotherapy', icon: <Activity />, desc: 'Rehabilitation and physical recovery.', symptoms: 'Post-op recovery, muscle pain' },
];

const Departments = () => {
  const { theme } = useContext(AuthContext);
  const isPremium = theme === 'premium';

  // --- Dynamic Theme Classes ---
  const bgClass = isPremium ? "bg-slate-950" : "bg-slate-50";
  const cardClass = isPremium 
    ? "bg-slate-900 border-yellow-500/10 shadow-[0_4px_20px_rgba(251,191,36,0.05)] hover:border-yellow-500/40" 
    : "bg-white border-slate-100 shadow-sm hover:border-emerald-500 hover:shadow-xl";
  const textMain = isPremium ? "text-white" : "text-slate-900";
  const textMuted = isPremium ? "text-slate-400" : "text-slate-500";
  const accentColor = isPremium ? "text-yellow-500" : "text-emerald-600";
  const iconBg = isPremium ? "bg-yellow-500/10" : "bg-slate-50";

  return (
    <div className={`min-h-screen pt-24 pb-20 px-4 transition-colors duration-500 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          {isPremium && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-4"
            >
              <Sparkles className="h-3 w-3" /> Elite Access
            </motion.div>
          )}
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-4xl md:text-6xl font-serif font-bold mb-6 ${textMain}`}
          >
            Medical Departments
          </motion.h1>
          <p className={`max-w-2xl mx-auto text-lg ${textMuted}`}>
            Choose a specialty to find the right expert for your health needs. 
            All our doctors are verified and board-certified.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`p-8 rounded-[2.5rem] border transition-all group relative overflow-hidden ${cardClass}`}
            >
              {/* Subtle Premium Glow Effect */}
              {isPremium && (
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>
              )}

              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors mb-6 ${iconBg} ${isPremium ? 'text-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-950' : 'text-slate-400 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                {dept.icon}
              </div>
              
              <h3 className={`text-2xl font-serif font-bold mb-3 ${textMain}`}>{dept.name}</h3>
              <p className={`text-sm mb-4 leading-relaxed ${textMuted}`}>{dept.desc}</p>
              
              <div className={`p-4 rounded-xl mb-6 ${isPremium ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <span className={`text-[10px] uppercase font-bold tracking-widest block mb-1 ${isPremium ? 'text-yellow-500/50' : 'text-slate-400'}`}>
                  Common Symptoms
                </span>
                <p className={`text-xs font-medium ${isPremium ? 'text-slate-300' : 'text-slate-600'}`}>
                  {dept.symptoms}
                </p>
              </div>

              <Link 
                to={`/doctors?specialty=${dept.name}`}
                className={`inline-flex items-center gap-2 font-bold text-sm group-hover:gap-4 transition-all ${accentColor}`}
              >
                Find Specialists <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Departments;