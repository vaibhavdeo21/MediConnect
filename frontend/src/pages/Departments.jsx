import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Heart, Brain, Stethoscope, Pill, Microscope, Activity, 
  Baby, Eye, Bone, Scissors, Zap, ShieldAlert, ArrowRight
} from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const departments = [
  { name: 'Cardiology', icon: Heart, desc: 'Heart health, hypertension, and vascular diseases.', symptoms: 'Chest pain, palpitations', gradient: 'from-red-500 to-pink-500' },
  { name: 'Neurology', icon: Brain, desc: 'Brain, spinal cord, and nervous system disorders.', symptoms: 'Headaches, numbness, seizures', gradient: 'from-purple-500 to-indigo-500' },
  { name: 'Dermatology', icon: Stethoscope, desc: 'Skin, hair, and nail treatments.', symptoms: 'Rashes, acne, hair fall', gradient: 'from-amber-500 to-orange-500' },
  { name: 'Pediatrics', icon: Baby, desc: 'Child healthcare and developmental wellness.', symptoms: 'Child fever, vaccinations', gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Psychiatry', icon: Pill, desc: 'Mental health, anxiety, and behavioral therapy.', symptoms: 'Stress, sleep issues, mood swings', gradient: 'from-violet-500 to-purple-500' },
  { name: 'Orthopedics', icon: Bone, desc: 'Bone, joint, and musculoskeletal care.', symptoms: 'Fractures, back pain, arthritis', gradient: 'from-emerald-500 to-teal-500' },
  { name: 'Ophthalmology', icon: Eye, desc: 'Comprehensive eye care and vision correction.', symptoms: 'Blurry vision, eye irritation', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Gastroenterology', icon: Zap, desc: 'Digestive system and liver health.', symptoms: 'Acidity, bloating, stomach pain', gradient: 'from-yellow-500 to-amber-500' },
  { name: 'General Surgery', icon: Scissors, desc: 'Minor and major surgical consultations.', symptoms: 'Hernia, appendicitis', gradient: 'from-slate-500 to-zinc-500' },
  { name: 'Emergency', icon: ShieldAlert, desc: 'Immediate care for critical health situations.', symptoms: 'Accidents, acute trauma', gradient: 'from-red-600 to-red-500' },
  { name: 'Pathology', icon: Microscope, desc: 'Diagnostic testing and lab reports analysis.', symptoms: 'Lab result interpretation', gradient: 'from-teal-500 to-emerald-500' },
  { name: 'Physiotherapy', icon: Activity, desc: 'Rehabilitation and physical recovery.', symptoms: 'Post-op recovery, muscle pain', gradient: 'from-green-500 to-emerald-500' },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const Departments = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div {...fadeUp} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 glass border border-cyan-500/20 text-cyan-500">
            <Stethoscope className="h-3 w-3" /> Specializations
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-[var(--text-primary)]">
            Medical <GradientText gradient="primary">Departments</GradientText>
          </h1>
          <p className="max-w-2xl mx-auto text-[var(--text-muted)]">
            Choose a specialty to find the right expert for your health needs. All our doctors are verified and board-certified.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <motion.div
                key={dept.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="glass-card p-7 group cursor-default"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7" />
                </div>
                
                <h3 className="text-xl font-display font-bold mb-2 text-[var(--text-primary)]">{dept.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{dept.desc}</p>
                
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] mb-5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block mb-1">Common Symptoms</span>
                  <p className="text-xs font-medium text-[var(--text-secondary)]">{dept.symptoms}</p>
                </div>

                <Link 
                  to={`/doctors?specialty=${dept.name}`}
                  className="inline-flex items-center gap-2 font-semibold text-sm text-cyan-500 group-hover:gap-3 transition-all"
                >
                  Find Specialists <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Departments;