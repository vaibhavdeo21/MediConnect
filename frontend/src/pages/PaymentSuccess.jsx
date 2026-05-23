import { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, Loader2, Sparkles, XCircle, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const { refreshUser } = useContext(AuthContext);
  const [status, setStatus] = useState('verifying'); 
  const sessionId = searchParams.get('session_id');
  const backendUrl = import.meta.env.VITE_API_URL;
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId || hasCalledAPI.current) return;
      try {
        hasCalledAPI.current = true;
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${backendUrl}/api/payment/success`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          if (refreshUser) await refreshUser();
          setStatus('success');
          toast.success("Premium Activated!");
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
        toast.error("Verification failed.");
      }
    };
    verifyPayment();
  }, [sessionId, backendUrl, refreshUser]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card max-w-md w-full p-10 text-center relative z-10 border border-[var(--border-primary)]"
      >
        {status === 'verifying' && (
          <div className="py-10">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-amber-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin" />
              <div className="absolute inset-3 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Crown className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">Verifying Payment</h2>
            <p className="text-sm text-[var(--text-muted)]">Securing your premium credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="relative inline-block mb-6"
            >
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 rounded-2xl shadow-glow-amber relative z-10">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-amber-500/30 rounded-2xl"
              />
            </motion.div>

            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">
              Welcome to <span className="text-amber-500">Premium</span>
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
              Your subscription is confirmed. You now have full access to AI Health Assistant, Priority Scheduling, and VIP perks.
            </p>

            <Link to="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-xl transition-all">
              Enter Dashboard <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-amber-500 font-bold tracking-widest uppercase">
              <Sparkles className="h-3 w-3" /> Active Premium Member
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="py-6">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/10 rounded-2xl flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">Verification Failed</h2>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
              We couldn't confirm your payment. If charged, please retry or contact support.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => window.location.reload()}
                className="w-full py-3 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4" /> Retry
              </button>
              <Link to="/subscribe" className="text-sm font-semibold text-cyan-500 hover:text-cyan-400">Back to Plans</Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;