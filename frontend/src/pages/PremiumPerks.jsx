import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Crown, Gift, Copy, Check, Users, Wallet, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GradientText from '../components/ui/GradientText';

const PremiumPerks = () => {
  const { user } = useContext(AuthContext);
  const [referralData, setReferralData] = useState({ referral_code: '', referral_count: 0 });
  const [copied, setCopied] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/referral-data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReferralData(res.data);
      } catch (err) { console.error("Referral fetch failed"); }
    };
    fetchReferral();
  }, [backendUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralData.referral_code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const perks = [
    { icon: Sparkles, title: 'AI Health Assistant', desc: 'Get instant AI-powered health insights and symptom analysis', gradient: 'from-cyan-500 to-blue-500' },
    { icon: Crown, title: 'Priority Scheduling', desc: 'Skip the queue and get preferred appointment slots', gradient: 'from-amber-500 to-orange-500' },
    { icon: Users, title: 'VIP Badge', desc: 'Doctors see your premium status for prioritized care', gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Crown className="h-3 w-3 fill-amber-500" /> Premium Benefits
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--text-primary)]">
            Your <GradientText gradient="accent">Elite Perks</GradientText>
          </h1>
        </motion.div>

        {/* Perks Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {perks.map((perk, i) => {
            const Icon = perk.icon;
            return (
              <motion.div key={perk.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard className="text-center h-full">
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${perk.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">{perk.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{perk.desc}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Referral Section */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="p-0.5 rounded-2xl bg-gradient-to-r from-amber-500/30 via-transparent to-amber-500/30">
            <GlassCard hover={false} padding="lg" className="!rounded-[0.9rem]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-500/20">
                    <Gift className="h-3 w-3" /> Exclusive Rewards
                  </span>
                  <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
                    Refer a Friend, Earn <span className="text-amber-500">Gold Credit</span>
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
                    For every successful premium upgrade, both you and your friend receive ₹200 wallet credit.
                  </p>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center gap-6">
                  {/* Code Box */}
                  <div className="glass-card p-5 w-full md:w-80 !rounded-2xl">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center mb-3">Your Unique Code</p>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                      <span className="font-mono-code text-xl font-bold text-amber-500 tracking-wider">
                        {referralData.referral_code || "LOADING..."}
                      </span>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={copyToClipboard}
                        className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors text-[var(--text-muted)] hover:text-amber-500">
                        {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-[var(--text-primary)]">
                        <AnimatedCounter value={referralData.referral_count || 0} />
                      </p>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Invites</p>
                    </div>
                    <div className="w-px h-10 bg-[var(--border-primary)]" />
                    <div className="text-center">
                      <p className="text-2xl font-display font-bold text-amber-500">
                        <AnimatedCounter value={(referralData.referral_count || 0) * 200} prefix="₹" />
                      </p>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumPerks;