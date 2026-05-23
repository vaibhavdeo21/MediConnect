import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowRight, Shield, Zap, Brain, Video, Clock, Star,
  Heart, Activity, Stethoscope, Lock, CheckCircle2,
} from 'lucide-react';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const Home = () => {
  const { user } = useContext(AuthContext);

  const features = [
    { icon: Brain, title: 'AI Health Assistant', desc: 'Intelligent symptom analysis and health recommendations powered by advanced AI.', gradient: 'from-cyan-500 to-blue-600' },
    { icon: Video, title: 'Instant Teleconsult', desc: 'Connect with top specialists via HD video in under 60 seconds for emergencies.', gradient: 'from-purple-500 to-pink-600' },
    { icon: Shield, title: 'Emergency SOS', desc: '10-minute guaranteed response with full doctor accountability and auto-reassignment.', gradient: 'from-red-500 to-orange-600' },
    { icon: Clock, title: 'Smart Scheduling', desc: 'AI-optimized appointment slots with conflict detection and smart reminders.', gradient: 'from-emerald-500 to-cyan-600' },
    { icon: Lock, title: 'Secure Records', desc: 'Military-grade encrypted medical records with blockchain-verified prescriptions.', gradient: 'from-amber-500 to-red-500' },
    { icon: Heart, title: 'Premium Care', desc: 'Priority queuing, exclusive specialists, and personalized health tracking.', gradient: 'from-pink-500 to-purple-600' },
  ];

  const stats = [
    { value: '50K+', label: 'Patients Trust Us' },
    { value: '2,000+', label: 'Verified Doctors' },
    { value: '<60s', label: 'Emergency Response' },
    { value: '99.9%', label: 'Platform Uptime' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-[var(--nav-height)]">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <ParticleBackground particleCount={40} color="cyan" speed={0.5} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div {...fadeUp} className="mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/20 text-sm font-medium mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[var(--text-secondary)]">
                Next-Gen Healthcare Platform — Now Live
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6 text-[var(--text-primary)]">
              Healthcare,{' '}
              <GradientText gradient="primary" animate className="font-display">
                Reimagined
              </GradientText>
              <br />
              <span className="text-[var(--text-secondary)]">by Intelligence</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience the future of medical care with AI-powered diagnostics,
              instant teleconsultations, and a fully accountable emergency system
              that never lets you down.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? '/dashboard' : '/register'}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl text-base font-semibold gradient-primary text-white shadow-glow-cyan flex items-center gap-3 group"
                >
                  {user ? 'Go to Dashboard' : 'Start Free — No Card Needed'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/doctors">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-4 rounded-2xl text-base font-semibold glass border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-cyan-500/30 flex items-center gap-3"
                >
                  <Stethoscope className="h-5 w-5 text-cyan-500" />
                  Browse Doctors
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <p className="text-2xl sm:text-3xl font-display font-bold gradient-text-primary">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-[var(--text-muted)]/30 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-3 rounded-full bg-cyan-500 animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500 mb-4 block">
              Platform Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-primary)] mb-4">
              Everything You Need, <GradientText gradient="primary">Nothing You Don't</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Built for patients who demand excellence and doctors who deliver it.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className="glass-card p-8 group cursor-default"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Emergency Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 lg:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider mb-6">
                  <Zap className="h-3 w-3 fill-red-500" />
                  Emergency Protocol
                </div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-primary)] mb-4">
                  60-Second Emergency <GradientText gradient="accent">Response</GradientText>
                </h2>
                <p className="text-[var(--text-muted)] mb-8 leading-relaxed">
                  Our SOS system guarantees a doctor response within 10 minutes.
                  If they don't respond, automated penalties are applied and your request
                  is instantly reassigned to the next available specialist.
                </p>
                <div className="space-y-4">
                  {[
                    'Automatic 10-minute timeout enforcement',
                    'Penalty system: ₹1000 deduction for missed emergencies',
                    'Smart auto-reassignment to next available doctor',
                    'Full audit trail with real-time tracking',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-sm text-[var(--text-secondary)]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-72 h-72 rounded-3xl gradient-emergency p-1 shadow-glow-red"
                >
                  <div className="w-full h-full rounded-[1.4rem] bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center animate-emergency">
                      <Zap className="h-10 w-10 text-red-500 fill-red-500" />
                    </div>
                    <p className="text-2xl font-display font-bold text-red-500">SOS Active</p>
                    <p className="text-xs text-[var(--text-muted)] text-center">
                      Connecting to nearest specialist...
                    </p>
                    <div className="w-full h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                      <motion.div
                        animate={{ width: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-[var(--text-primary)] mb-4">
              Ready to Experience <GradientText gradient="primary" animate>The Future?</GradientText>
            </h2>
            <p className="text-[var(--text-muted)] mb-10 max-w-xl mx-auto">
              Join thousands of patients and doctors already using MediConnect
              for smarter, faster, and more accountable healthcare.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={user ? '/dashboard' : '/register'}>
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-5 rounded-2xl text-lg font-semibold gradient-primary text-white shadow-glow-cyan flex items-center gap-3"
                >
                  {user ? 'Dashboard' : 'Get Started Free'}
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-display font-bold text-[var(--text-primary)]">
              Medi<span className="gradient-text-primary">Connect</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
            <Link to="/departments" className="hover:text-[var(--text-primary)] transition-colors">Departments</Link>
            <Link to="/doctors" className="hover:text-[var(--text-primary)] transition-colors">Doctors</Link>
            <span>© 2026 MediConnect. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;