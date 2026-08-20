import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Loader2, Activity, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import GradientText from '../components/ui/GradientText';

const Login = () => {
  const navigate = useNavigate();

  const goHome = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  const { theme } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, formData);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success("Welcome Back!");
        window.location.href = '/dashboard'; 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        toast.error("Google login failed to retrieve credential token.");
        return;
      }
      const res = await axios.post(`${backendUrl}/api/auth/google-login`, {
        token: credentialResponse.credential
      });
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success("Google Login Successful!");
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error("Google Login Error:", err);
      const message = err.response?.data?.message || err.message || "Google Auth Failed";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ParticleBackground particleCount={30} color="cyan" speed={0.3} />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full"
      >
        <div className="glass-card p-8 sm:p-10 border border-[var(--border-primary)]">
          {/* Back to Home */}
          <motion.button
            onClick={goHome}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </motion.button>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-glow-cyan">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[var(--text-primary)]">
                Welcome Back
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Sign in to <GradientText gradient="primary">MediConnect</GradientText>
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  onChange={handleChange}
                  required
                  className="glass-input w-full pl-11 pr-4"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-[10px] font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                  required
                  className="glass-input w-full pl-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              type="submit"
              className="w-full py-4 rounded-xl font-semibold flex justify-center items-center gap-2 text-white gradient-primary shadow-glow-cyan disabled:opacity-50 transition-all"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium">or continue with</span>
            <div className="flex-1 h-px bg-[var(--border-primary)]" />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={(error) => {
                console.error("Google OAuth Button Error:", error);
                toast.error("Google Login Popup Failed or Blocked");
              }}
              theme={theme === 'dark' || theme === 'premium' ? "filled_black" : "outline"}
              shape="pill"
              size="large"
            />
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-500 hover:text-cyan-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;