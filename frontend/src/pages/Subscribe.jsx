import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Check, Star, Shield, Zap, Crown, Loader2, X } from 'lucide-react'; // Added X here
import { toast } from 'react-toastify';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const Subscribe = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleCheckout = async (planType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // 1. Get the Checkout URL from your backend
      const res = await axios.post(
        `${backendUrl}/api/payment/create-checkout-session`,
        { planType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Simply redirect the window to the Stripe-hosted page
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        toast.error("Failed to create payment session");
      }

    } catch (err) {
      console.error("Checkout Error:", err);
      toast.error(err.response?.data?.error || "Could not initiate payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-20 px-4 font-sans">
      <div className="max-w-5xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-widest mb-6">
          <Crown className="h-3 w-3 fill-yellow-600" /> Premium Access
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
          Upgrade to <span className="text-emerald-700 italic">Premium</span>
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Basic Plan */}
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-900 mb-2">Basic</h3>
          <div className="text-4xl font-serif font-bold mb-8">₹0 <span className="text-sm font-sans text-slate-400 font-normal">/ month</span></div>

          <ul className="space-y-4 mb-10 flex-1">
            <PerkItem label="Standard Scheduling" active />
            <PerkItem label="Basic Health Records" active />
            <PerkItem label="Email Support" active />
            <PerkItem label="AI Health Assistant" active={false} />
          </ul>
          <button disabled className="w-full py-4 rounded-xl font-bold bg-slate-100 text-slate-400 cursor-not-allowed">Current Plan</button>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-950 p-10 rounded-3xl border border-yellow-500/30 shadow-2xl relative flex flex-col transform hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 px-4 py-1 text-[10px] font-black uppercase tracking-tighter rounded-bl-xl">Elite</div>

          <h3 className="text-xl font-bold text-yellow-500 mb-2">Elite Premium</h3>
          <div className="text-4xl font-serif font-bold text-white mb-8">₹1,599 <span className="text-sm font-sans text-slate-500 font-normal">/ month</span></div>

          <ul className="space-y-4 mb-10 flex-1">
            <PerkItem label="Priority Scheduling" active isPremium />
            <PerkItem label="AI Health Assistant" active isPremium />
            <PerkItem label="Luxury Dark/Gold Theme" active isPremium />
            <PerkItem label="Priority Video Support" active isPremium />
          </ul>

          <button
            onClick={() => handleCheckout('monthly')}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg shadow-yellow-600/20 transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Upgrade to Elite"}
          </button>
        </div>
      </div>
    </div>
  );
};

const PerkItem = ({ label, active, isPremium }) => (
  <li className={`flex items-center gap-3 text-sm ${active ? (isPremium ? 'text-slate-300' : 'text-slate-600') : 'text-slate-400 opacity-40'}`}>
    {active ? (
      <Check className={`h-4 w-4 ${isPremium ? 'text-yellow-500' : 'text-emerald-600'}`} />
    ) : (
      <X className="h-4 w-4 text-slate-400" /> // Now X is defined!
    )}
    {label}
  </li>
);

// Helper Icons

export default Subscribe;