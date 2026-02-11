import { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Crown, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import Confetti from 'react-confetti';
import { toast } from 'react-toastify';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useContext(AuthContext);
  
  const [status, setStatus] = useState('verifying'); 
  const sessionId = searchParams.get('session_id');
  const backendUrl = import.meta.env.VITE_API_URL;
  
  // Use a Ref to ensure the API call only happens ONCE even in React StrictMode
  const hasCalledAPI = useRef(false);

  useEffect(() => {
    const verifyPayment = async () => {
      // Guard clause: stop if no session, or if already verifying/finished
      if (!sessionId || hasCalledAPI.current) return;

      try {
        hasCalledAPI.current = true; // Lock the execution immediately
        const token = localStorage.getItem("token");
        
        const res = await axios.post(
          `${backendUrl}/api/payment/success`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          // Sync with DB to update is_premium and theme globally
          if (refreshUser) {
            await refreshUser();
          }
          setStatus('success');
          toast.success("Elite Status Activated!");
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error("Verification failed", err);
        setStatus('error');
        toast.error("Could not verify payment.");
      }
    };

    verifyPayment();
  }, [sessionId, backendUrl, refreshUser]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-hidden relative">
      {status === 'success' && (
        <Confetti 
          numberOfPieces={200} 
          recycle={false} 
          colors={['#fbbf24', '#f59e0b', '#10b981']} 
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
      
      {/* Luxury Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-slate-900 border border-yellow-500/20 p-10 rounded-3xl shadow-2xl text-center relative z-10"
      >
        {status === 'verifying' && (
          <div className="py-10 text-center">
            <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-serif text-yellow-50 font-bold tracking-wide">Finalizing Your Luxury Experience</h2>
            <p className="text-slate-400 mt-2 italic">Securing your premium credentials...</p>
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

            <h1 className="text-3xl font-serif font-bold text-yellow-50 mb-4 tracking-tight">
              Welcome to the <span className="text-yellow-500 uppercase italic text-4xl">Elite</span>
            </h1>
            <p className="text-slate-400 font-light mb-8 leading-relaxed text-sm">
                Your subscription is confirmed. You now have full access to our Black & Gold theme, Priority Scheduling, and 24/7 AI Health Assistance.
            </p>

            <div className="space-y-4">
                <Link to="/dashboard" className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-yellow-600/20">
                    Enter Premium Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
                <div className="flex items-center justify-center gap-2 text-[10px] text-yellow-500 font-bold tracking-widest uppercase">
                    <Sparkles className="h-3 w-3" /> Active Elite Membership
                </div>
            </div>
          </>
        )}

        {status === 'error' && (
          <div className="py-6">
            <div className="bg-red-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-serif text-white font-bold mb-2">Verification Failed</h2>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              We couldn't confirm your session. If your bank was charged, please refresh the page or contact support.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()} 
                className="text-white bg-slate-800 py-3 rounded-xl hover:bg-slate-700 transition-all font-bold text-sm"
              >
                Retry Verification
              </button>
              <Link to="/subscribe" className="text-yellow-500 font-bold hover:underline text-sm">Return to Subscription</Link>
            </div>
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