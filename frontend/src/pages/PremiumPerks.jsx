import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Gift, Copy, Check, Share2, Users } from 'lucide-react';
import { toast } from 'react-toastify';

const PremiumPerks = () => {
  const { user, theme } = useContext(AuthContext);
  const [referralData, setReferralData] = useState({ code: '', count: 0 });
  const [copied, setCopied] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  const isDark = theme === 'dark';

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

  return (
    <div className={`min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans selection:bg-yellow-500/30 transition-colors duration-500 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="max-w-5xl mx-auto">
        
        {/* --- NEW REFERRAL DASHBOARD SECTION --- */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={`mt-20 p-1 rounded-[2.5rem] bg-gradient-to-br ${isDark ? 'from-yellow-500/20 via-slate-900 to-yellow-600/20' : 'from-yellow-500/30 via-white to-yellow-600/30'}`}
        >
            <div className={`backdrop-blur-xl p-8 md:p-12 rounded-[2.4rem] border flex flex-col md:flex-row items-center justify-between gap-12 ${isDark ? 'bg-slate-900/90 border-yellow-500/10' : 'bg-white/90 border-yellow-500/20 shadow-xl'}`}>
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-yellow-500/20">
                        <Gift className="h-3 w-3" /> Exclusive Rewards
                    </div>
                    <h2 className={`text-3xl font-serif font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Refer a Friend, <br/>Earn <span className="text-yellow-500 italic">Gold Credit.</span>
                    </h2>
                    <p className={`font-light text-sm max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Invite your inner circle. For every successful premium upgrade, both you and your friend receive ₹200 wallet credit.
                    </p>
                </div>

                <div className="w-full md:w-auto flex flex-col items-center gap-6">
                    {/* The Code Box */}
                    <div className={`border p-6 rounded-3xl w-full md:w-80 shadow-2xl ${isDark ? 'bg-slate-950 border-yellow-500/20' : 'bg-white border-yellow-200'}`}>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-3">Your Unique Code</p>
                        <div className={`flex items-center justify-between p-3 rounded-xl border group ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                            <span className="font-mono text-xl font-bold text-yellow-500 tracking-tighter">
                                {referralData.referral_code || "GENERATING..."}
                            </span>
                            <button onClick={copyToClipboard} className="p-2 hover:bg-black/5 rounded-lg transition-colors text-slate-400 hover:text-yellow-500">
                                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className={`text-2xl font-serif font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{referralData.referral_count || 0}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Successful Invites</p>
                        </div>
                        <div className={`w-[1px] h-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                        <div className="text-center">
                            <p className="text-2xl font-serif font-bold text-yellow-500">₹{(referralData.referral_count || 0) * 200}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Earned Credits</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumPerks;