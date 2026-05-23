import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Check, Crown, Loader2, X, Sparkles, Zap, Shield, Bot } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';

const Subscribe = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleCheckout = async (planType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${backendUrl}/api/payment/create-checkout-session`,
        { planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const basicFeatures = [
    { label: 'Standard Scheduling', active: true },
    { label: 'Basic Health Records', active: true },
    { label: 'Email Support', active: true },
    { label: 'AI Health Assistant', active: false },
    { label: 'Priority Queue', active: false },
    { label: 'VIP Badge', active: false },
  ];

  const premiumFeatures = [
    { label: 'Priority Scheduling', active: true },
    { label: 'Full Health Records', active: true },
    { label: 'AI Health Assistant', active: true },
    { label: 'VIP Doctor Badge', active: true },
    { label: 'Priority Video Support', active: true },
    { label: 'Referral Rewards', active: true },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Crown className="h-3 w-3 fill-amber-500" /> Premium Access
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)]">
            Upgrade to <GradientText gradient="accent">Premium</GradientText>
          </h1>
          <p className="text-[var(--text-muted)] mt-3 max-w-md mx-auto">
            Unlock AI-powered insights, priority scheduling, and VIP access to top specialists.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Basic Plan */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard hover={false} padding="lg" className="h-full flex flex-col">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-1">Basic</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-bold text-[var(--text-primary)]">₹0</span>
                  <span className="text-sm text-[var(--text-muted)]">/ month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {basicFeatures.map(f => (
                  <li key={f.label} className={`flex items-center gap-3 text-sm ${f.active ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)] opacity-40'}`}>
                    {f.active ? <Check className="h-4 w-4 text-cyan-500 shrink-0" /> : <X className="h-4 w-4 shrink-0" />}
                    {f.label}
                  </li>
                ))}
              </ul>

              <button disabled className="w-full py-3.5 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-muted)] cursor-not-allowed">
                Current Plan
              </button>
            </GlassCard>
          </motion.div>

          {/* Premium Plan */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-0.5 rounded-2xl bg-gradient-to-b from-amber-500/50 to-amber-500/10 h-full shadow-glow-amber">
              <GlassCard hover={false} padding="lg" className="h-full flex flex-col !rounded-[0.9rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                  Recommended
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-amber-500 mb-1">Elite Premium</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-[var(--text-primary)]">₹1,599</span>
                    <span className="text-sm text-[var(--text-muted)]">/ month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {premiumFeatures.map(f => (
                    <li key={f.label} className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                      <Check className="h-4 w-4 text-amber-500 shrink-0" />
                      {f.label}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>
                    <Zap className="h-4 w-4 fill-white" /> Upgrade to Elite
                  </>}
                </motion.button>
              </GlassCard>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
          {[
            { icon: Bot, label: 'AI-Powered Analysis', color: 'text-cyan-500' },
            { icon: Zap, label: 'Instant Priority', color: 'text-amber-500' },
            { icon: Shield, label: 'Premium Support', color: 'text-purple-500' },
          ].map(item => (
            <div key={item.label} className="text-center p-4">
              <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
              <p className="text-xs font-semibold text-[var(--text-muted)]">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscribe;