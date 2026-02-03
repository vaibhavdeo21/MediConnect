import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, Key, Lock, Eye, EyeOff, XCircle, CheckCircle, 
  ArrowRight, ShieldAlert, Loader2, Undo2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const { theme } = useContext(AuthContext);
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isPremium = theme === 'premium';
  const backendUrl = import.meta.env.VITE_API_URL;

  // --- Validation Logic ---
  const passwordsMatch = newPassword === confirmPassword;
  const showMismatchError = confirmPassword.length > 0 && !passwordsMatch;
  const showMatchSuccess = confirmPassword.length > 0 && passwordsMatch;

  // --- Stage 1: Send OTP ---
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
      toast.success("OTP sent to your email!");
      setStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Stage 2: Verify OTP ---
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/verify-otp`, { email, otp });
      toast.success("OTP Verified!");
      setStage(3);
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- Stage 3: Reset Password ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!passwordsMatch) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword });
      toast.success("Password Changed Successfully!");
      navigate('/login');
    } catch (err) {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // --- Dynamic Input Styles ---
  const inputClass = `block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none transition-all ${
    isPremium 
    ? "bg-slate-800 border-white/10 text-white focus:ring-2 focus:ring-yellow-500/20 placeholder:text-slate-500" 
    : "bg-slate-50 border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
  }`;

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-4xl w-full flex flex-col md:flex-row overflow-hidden rounded-[3rem] shadow-2xl border ${isPremium ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}
      >
        {/* Left Side: Identity & Security Panel */}
        <div className={`md:w-1/3 p-12 text-white flex flex-col justify-between relative overflow-hidden ${isPremium ? 'bg-slate-800' : 'bg-slate-900'}`}>
            <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br pointer-events-none ${isPremium ? 'from-yellow-500/10' : 'from-emerald-500/10'}`}></div>
            <div className="relative z-10 text-left">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border ${isPremium ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                    <ShieldAlert className={`h-6 w-6 ${isPremium ? 'text-yellow-500' : 'text-emerald-400'}`} />
                </div>
                <h2 className="text-3xl font-serif font-bold leading-tight">Security <br/>Protocol.</h2>
                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${stage >= 1 ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`}></div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${stage === 1 ? 'text-white' : 'text-slate-500'}`}>01. Email Entry</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${stage >= 2 ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-600'}`}></div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${stage === 2 ? 'text-white' : 'text-slate-500'}`}>02. OTP Validation</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${stage >= 3 ? 'bg-cyan-400 shadow-[0_0_8_px_#22d3ee]' : 'bg-slate-600'}`}></div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${stage === 3 ? 'text-white' : 'text-slate-500'}`}>03. Key Reset</p>
                  </div>
                </div>
            </div>
            <div className="relative z-10 mt-12 md:mt-0 text-left">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                   <Undo2 className="h-4 w-4" /> Back to Portal
                </Link>
            </div>
        </div>

        {/* Right Side: Logic Flow */}
        <div className="md:w-2/3 p-8 md:p-12 flex flex-col justify-center bg-transparent">
          <div className="text-left mb-10">
            <h2 className={`text-3xl font-serif font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>Reset Password</h2>
            <p className="mt-2 text-sm text-slate-500 font-light italic">
              {stage === 1 && "Enter your email to receive a 6-digit verification code."}
              {stage === 2 && "A code has been dispatched to your clinical email address."}
              {stage === 3 && "Verification successful. Please create your new secure access key."}
            </p>
          </div>

          {/* STAGE 1: EMAIL */}
          {stage === 1 && (
            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="relative group text-left">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${isPremium ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
                <input
                  type="email"
                  required
                  className={inputClass}
                  placeholder="Registered Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button disabled={loading} className={`w-full flex justify-center py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-slate-900 hover:bg-emerald-700'}`}>
                {loading ? "Processing..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* STAGE 2: OTP */}
          {stage === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="relative group text-left">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className={`h-5 w-5 ${isPremium ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
                <input
                  type="text"
                  required
                  className={`${inputClass} tracking-[0.5em] text-center text-xl font-bold`}
                  placeholder="XXXXXX"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button disabled={loading} className={`w-full flex justify-center py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-slate-900 hover:bg-emerald-700'}`}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          )}

          {/* STAGE 3: NEW PASSWORD */}
          {stage === 3 && (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              <div className="space-y-4">
                {/* Password Input */}
                <div className="relative group text-left">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${isPremium ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className={inputClass}
                    placeholder="New Secure Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-emerald-500"
                    onMouseEnter={() => setShowPassword(true)}
                    onMouseLeave={() => setShowPassword(false)}
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="text-left">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className={`h-5 w-5 ${showMismatchError ? 'text-red-500' : isPremium ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className={`${inputClass} ${showMismatchError ? 'border-red-500 focus:ring-red-200' : ''}`}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  
                  {/* Validation Messages */}
                  {showMismatchError && (
                    <div className="flex items-center mt-2 text-xs text-red-500 animate-pulse ml-1">
                      <XCircle className="h-3 w-3 mr-1" /> Passwords do not match
                    </div>
                  )}
                  {showMatchSuccess && (
                    <div className="flex items-center mt-2 text-xs text-green-600 ml-1">
                      <CheckCircle className="h-3 w-3 mr-1" /> Passwords match
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || showMismatchError} 
                className={`w-full flex justify-center py-4 rounded-xl font-bold text-white transition-all shadow-xl
                  ${showMismatchError ? 'bg-slate-400 cursor-not-allowed' : isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-slate-900 hover:bg-emerald-700 shadow-emerald-900/20'}
                `}
              >
                {loading ? "Updating Registry..." : "Reset Password"}
              </button>
            </form>
          )}

          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black opacity-30 italic">MediConnect Security Core</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;