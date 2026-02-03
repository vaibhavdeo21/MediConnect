import { useEffect, useState, useContext } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Crown, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti'; // Optional: npm install react-confetti

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const sessionId = searchParams.get('session_id');
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${backendUrl}/api/payment/success`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          // Update global context state to Premium
          updateUser({ is_premium: true });
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error("Verification failed", err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [sessionId, backendUrl, updateUser]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden relative">
      {status === 'success' && <Confetti numberOfPieces={200} recycle={false} colors={['#fbbf24', '#f59e0b', '#10b981']} />}
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-yellow-500/20 p-10 rounded-3xl shadow-2xl text-center relative z-10"
      >
        {status === 'verifying' && (
          <div className="py-10">
            <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-serif text-yellow-50 font-bold tracking-wide">Finalizing Your Luxury Experience</h2>
            <p className="text-slate-400 mt-2">Securing your premium credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="relative inline-block mb-6">
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="bg-yellow-500 p-4 rounded-full relative z-10"
                >
                    <Crown className="h-10 w-10 text-slate-900 fill-slate-900" />
                </motion.div>
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-yellow-500 rounded-full"
                ></motion.div>
            </div>

            <h1 className="text-3xl font-serif font-bold text-yellow-50 mb-4 tracking-tight">Welcome to the <span className="text-yellow-500 uppercase italic">Elite.</span></h1>
            <p className="text-slate-400 font-light mb-8 leading-relaxed">
                Your subscription is confirmed. You now have full access to our Black & Gold theme, Priority Scheduling, and 24/7 AI Health Assistance.
            </p>

            <div className="space-y-4">
                <Link to="/dashboard" className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-600/20">
                    Enter Premium Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-yellow-500 font-bold tracking-widest uppercase">
                    <Sparkles className="h-3 w-3" /> Active Membership
                </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="py-6">
            <div className="bg-red-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif text-white font-bold mb-2">Verification Error</h2>
            <p className="text-slate-400 mb-8">We couldn't confirm your payment session. Please contact support if your bank was charged.</p>
            <Link to="/dashboard" className="text-emerald-500 font-bold hover:underline">Return to Home</Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const XCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default PaymentSuccess;