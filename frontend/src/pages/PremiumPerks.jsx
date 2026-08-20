import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Gift, Copy, Check, Users, Sparkles, Bot, Zap, Star, Shield, Clock, CreditCard, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import GradientText from '../components/ui/GradientText';

const PremiumPerks = () => {
  const { user, isPremium, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [referralData, setReferralData] = useState({ referral_code: '', referral_count: 0 });
  const [copied, setCopied] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('perks');
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const [refRes, subRes, payRes] = await Promise.allSettled([
          axios.get(`${backendUrl}/api/users/referral-data`, { headers }),
          axios.get(`${backendUrl}/api/payment/subscription-status`, { headers }),
          axios.get(`${backendUrl}/api/payment/payment-history`, { headers }),
        ]);
        if (refRes.status === 'fulfilled') setReferralData(refRes.value.data);
        if (subRes.status === 'fulfilled') setSubscription(subRes.value.data);
        if (payRes.status === 'fulfilled') setPayments(payRes.value.data || []);
      } catch (err) { /* silently fail */ }
    };
    fetchData();
  }, [backendUrl]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralData.referral_code);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/payment/cancel-subscription`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Subscription cancelled. Access continues until expiry.");
      setShowCancelConfirm(false);
      if (refreshUser) await refreshUser();
      // Refresh subscription data
      const res = await axios.get(`${backendUrl}/api/payment/subscription-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscription(res.data);
    } catch (err) {
      toast.error("Failed to cancel subscription");
    } finally { setCancelLoading(false); }
  };

  const perks = [
    { icon: Bot, title: 'AI Health Assistant', desc: 'Unlimited AI-powered health consultations with full conversation history', gradient: 'from-cyan-500 to-blue-500' },
    { icon: Zap, title: 'Priority Emergency', desc: 'Skip the queue for emergency SOS appointments', gradient: 'from-red-500 to-orange-500' },
    { icon: Crown, title: 'VIP Badge', desc: 'Doctors see your premium status for prioritized care', gradient: 'from-amber-500 to-orange-500' },
    { icon: Star, title: 'Premium Theme', desc: 'Exclusive gold luxury theme with ambient animations', gradient: 'from-purple-500 to-pink-500' },
    { icon: Shield, title: '24/7 Support', desc: 'Priority customer support with faster response times', gradient: 'from-emerald-500 to-teal-500' },
    { icon: Gift, title: 'Referral Rewards', desc: 'Earn ₹200 wallet credit for every friend who upgrades', gradient: 'from-blue-500 to-indigo-500' },
  ];

  const tabs = [
    { id: 'perks', label: 'My Perks', icon: Sparkles },
    { id: 'referral', label: 'Referrals', icon: Gift },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4">
        <div className="text-center">
          <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">Premium Access Required</h2>
          <p className="text-[var(--text-muted)] mb-6">Upgrade to unlock perks, referrals, and billing management</p>
          <Link to="/subscribe" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold">
            <Crown className="h-4 w-4" /> Upgrade Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg premium-glow">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--text-primary)]">
            Your <span className="premium-gradient-text">Premium</span> Experience
          </h1>
          {subscription && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
              <Check className="h-3 w-3" /> Active until {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card inline-flex p-1 gap-1 !rounded-xl">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                    activeTab === tab.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}>
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'perks' && (
            <motion.div key="perks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid md:grid-cols-3 gap-5">
                {perks.map((perk, i) => {
                  const Icon = perk.icon;
                  return (
                    <motion.div key={perk.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
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
            </motion.div>
          )}

          {activeTab === 'referral' && (
            <motion.div key="referral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="p-0.5 rounded-2xl bg-gradient-to-r from-amber-500/30 via-transparent to-amber-500/30">
                <GlassCard hover={false} padding="lg" className="!rounded-[0.9rem]">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest mb-4 border border-amber-500/20">
                        <Gift className="h-3 w-3" /> Exclusive Rewards
                      </span>
                      <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-3">
                        Refer Friends, Earn <span className="text-amber-500">₹200</span> Each
                      </h2>
                      <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
                        Share your referral code. When a friend upgrades to Premium, you both receive ₹200 wallet credit instantly.
                      </p>
                    </div>

                    <div className="w-full md:w-auto flex flex-col items-center gap-6">
                      <div className="glass-card p-5 w-full md:w-80 !rounded-2xl">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest text-center mb-3">Your Referral Code</p>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                          <span className="font-mono text-xl font-bold text-amber-500 tracking-wider">
                            {referralData.referral_code || "LOADING..."}
                          </span>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={copyToClipboard}
                            className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors text-[var(--text-muted)] hover:text-amber-500">
                            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                          </motion.button>
                        </div>
                      </div>

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
          )}

          {activeTab === 'billing' && (
            <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {/* Active Subscription */}
              {subscription && (
                <GlassCard hover={false} padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Active Plan</p>
                      <h3 className="text-xl font-display font-bold text-amber-500">
                        {subscription.plan_type === 'annual' ? 'Elite Annual' : 'Elite Monthly'}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      subscription.status === 'cancelled' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {subscription.status === 'cancelled' ? 'Cancelled' : 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Amount</p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">₹{subscription.amount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                        {subscription.status === 'cancelled' ? 'Access Until' : 'Next Billing'}
                      </p>
                      <p className="text-lg font-bold text-[var(--text-primary)]">
                        {new Date(subscription.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  {subscription.status !== 'cancelled' && (
                    <button onClick={() => setShowCancelConfirm(true)}
                      className="text-sm text-red-500 hover:text-red-400 font-semibold">
                      Cancel Subscription
                    </button>
                  )}
                </GlassCard>
              )}

              {/* Payment History */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Payment History</h3>
                {payments.length === 0 ? (
                  <GlassCard hover={false} className="text-center py-8">
                    <CreditCard className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-[var(--text-muted)]">No payments yet</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <GlassCard key={p.id} hover={false} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.status === 'active' ? 'bg-emerald-500/10' : 'bg-[var(--bg-tertiary)]'}`}>
                            <CreditCard className={`h-4 w-4 ${p.status === 'active' ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                              {p.plan_type === 'annual' ? 'Elite Annual' : 'Elite Monthly'}
                            </p>
                            <p className="text-xs text-[var(--text-muted)]">{new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">₹{p.amount}</p>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowCancelConfirm(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card relative max-w-sm w-full p-6 z-10 text-center">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-display font-bold text-[var(--text-primary)] mb-2">Cancel Subscription?</h3>
                <p className="text-sm text-[var(--text-muted)] mb-6">
                  You'll keep access until your current billing period ends. You can re-subscribe anytime.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-3 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-secondary)]">
                    Keep Premium
                  </button>
                  <button onClick={handleCancelSubscription} disabled={cancelLoading}
                    className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white disabled:opacity-50 flex items-center justify-center gap-2">
                    {cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PremiumPerks;