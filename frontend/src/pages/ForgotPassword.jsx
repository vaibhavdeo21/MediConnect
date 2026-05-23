import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Key, Lock, Eye, EyeOff, XCircle, CheckCircle, ArrowRight, Loader2, Activity, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

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
  const backendUrl = import.meta.env.VITE_API_URL;

  const passwordsMatch = newPassword === confirmPassword;
  const showMismatchError = confirmPassword.length > 0 && !passwordsMatch;
  const showMatchSuccess = confirmPassword.length > 0 && passwordsMatch;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/forgot-password`, { email });
      toast.success("OTP sent to your email!");
      setStage(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/verify-otp`, { email, otp });
      toast.success("OTP Verified!");
      setStage(3);
    } catch (err) {
      toast.error("Invalid OTP");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return toast.error("Passwords do not match!");
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword });
      toast.success("Password Changed Successfully!");
      navigate('/login');
    } catch (err) {
      toast.error("Failed to reset password");
    } finally { setLoading(false); }
  };

  const stages = [
    { num: 1, label: 'Email Entry' },
    { num: 2, label: 'OTP Validation' },
    { num: 3, label: 'Key Reset' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ParticleBackground particleCount={25} color="cyan" speed={0.3} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-md w-full">
        <div className="glass-card p-8 sm:p-10 border border-[var(--border-primary)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-glow-red">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">Reset Password</h1>
              <p className="text-xs text-[var(--text-muted)]">
                <GradientText gradient="primary">Security Protocol</GradientText>
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-8">
            {stages.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  stage >= s.num ? 'gradient-primary text-white shadow-glow-cyan' : 'glass border border-[var(--border-primary)] text-[var(--text-muted)]'
                }`}>
                  {stage > s.num ? <CheckCircle className="h-4 w-4" /> : s.num}
                </div>
                {i < stages.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${stage > s.num ? 'bg-cyan-500' : 'bg-[var(--border-primary)]'}`} />
                )}
              </div>
            ))}
          </div>

          <p className="text-sm text-[var(--text-muted)] mb-6">
            {stage === 1 && "Enter your registered email to receive a 6-digit code."}
            {stage === 2 && "Enter the verification code sent to your email."}
            {stage === 3 && "Create your new secure password."}
          </p>

          {/* Stage 1: Email */}
          {stage === 1 && (
            <form className="space-y-5" onSubmit={handleSendOtp}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input type="email" required className="glass-input w-full pl-11 pr-4" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <motion.button whileTap={{ scale: 0.99 }} disabled={loading} className="w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 gradient-primary text-white shadow-glow-cyan disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Send OTP <ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </form>
          )}

          {/* Stage 2: OTP */}
          {stage === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOtp}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Key className="h-4 w-4" />
                </div>
                <input type="text" required className="glass-input w-full pl-11 pr-4 text-center tracking-[0.5em] text-xl font-bold font-mono-code" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
              </div>
              <motion.button whileTap={{ scale: 0.99 }} disabled={loading} className="w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 gradient-primary text-white shadow-glow-cyan disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Verify OTP <ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </form>
          )}

          {/* Stage 3: New Password */}
          {stage === 3 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input type={showPassword ? 'text' : 'password'} required className="glass-input w-full pl-11 pr-12" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} required className={`glass-input w-full pl-11 pr-12 ${showMismatchError ? 'border-red-500' : ''}`} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  {(showMismatchError || showMatchSuccess) && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {showMatchSuccess ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                    </div>
                  )}
                </div>
                {showMismatchError && <p className="text-xs text-red-500 mt-1.5 ml-1 animate-pulse">Passwords do not match</p>}
              </div>
              <motion.button whileTap={{ scale: 0.99 }} disabled={loading || showMismatchError} className="w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 gradient-primary text-white shadow-glow-cyan disabled:opacity-50">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Reset Password <ArrowRight className="h-4 w-4" /></>}
              </motion.button>
            </form>
          )}

          {/* Back to Login */}
          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;