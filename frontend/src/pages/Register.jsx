import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, UserCircle, ArrowRight, Gift, Loader2, Stethoscope, Eye, EyeOff, CheckCircle, XCircle, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

const Register = () => {
  const { theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: 'patient', referralCode: ''
  });

  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMatchResult = formData.confirmPassword.length > 0;
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return toast.error("Passwords do not match!");
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/register`, formData);
      if (res.data.token && res.data.user) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success("Account Created!");
        window.location.href = '/dashboard';
      } else {
        toast.success("Registration Successful! Please Login.");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration Failed");
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendUrl}/api/auth/google-login`, {
        token: credentialResponse.credential,
        role: formData.role,
        referralCode: formData.referralCode
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        toast.success("Google Registration Successful!");
        window.location.href = '/dashboard';
      }
    } catch (err) {
      toast.error("Google Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-primary)] relative overflow-hidden">
      <div className="absolute inset-0">
        <ParticleBackground particleCount={30} color="purple" speed={0.3} />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg w-full"
      >
        <div className="glass-card p-8 sm:p-10 border border-[var(--border-primary)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-glow-purple">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">Create Account</h1>
              <p className="text-xs text-[var(--text-muted)]">Join <GradientText gradient="primary">MediConnect</GradientText></p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setFormData({ ...formData, role: 'patient' })}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  formData.role === 'patient'
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-500'
                    : 'border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                }`}>
                <UserCircle className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Patient</p>
                  <p className="text-[9px] uppercase tracking-wider opacity-60">Personal</p>
                </div>
              </button>
              <button type="button" onClick={() => setFormData({ ...formData, role: 'doctor' })}
                className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                  formData.role === 'doctor'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-500'
                    : 'border-[var(--border-primary)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                }`}>
                <Stethoscope className="h-5 w-5" />
                <div className="text-left">
                  <p className="text-sm font-semibold">Doctor</p>
                  <p className="text-[9px] uppercase tracking-wider opacity-60">Clinical</p>
                </div>
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField icon={User} name="fullName" placeholder="Full Name" onChange={handleChange} required />
              <InputField icon={Mail} name="email" type="email" placeholder="Email Address" onChange={handleChange} required autoComplete="email" />
              
              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create Password" autoComplete="new-password"
                  onChange={handleChange} required className="glass-input w-full pl-11 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirm Password"
                  onChange={handleChange} required
                  className={`glass-input w-full pl-11 pr-12 ${showMatchResult && !passwordsMatch ? 'border-red-500' : ''}`} />
                {showMatchResult && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {passwordsMatch ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                )}
              </div>

              <InputField icon={Gift} name="referralCode" placeholder="Invite Code (Optional)" onChange={handleChange} className="md:col-span-2" />
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading || (showMatchResult && !passwordsMatch)}
              type="submit"
              className={`w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-white shadow-lg disabled:opacity-50 transition-all ${
                formData.role === 'doctor'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 shadow-glow-purple'
                  : 'gradient-primary shadow-glow-cyan'
              }`}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium">or continue with</span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Auth Failed")}
              theme={theme === 'dark' ? "filled_black" : "outline"} shape="pill" size="large" />
          </div>

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({ icon: Icon, className = '', ...props }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
      <Icon className="h-4 w-4" />
    </div>
    <input {...props} className="glass-input w-full pl-11 pr-4" />
  </div>
);

export default Register;