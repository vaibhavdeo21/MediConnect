import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, UserCircle, ArrowRight, ShieldCheck, Gift, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient',
    referralCode: '' // New referral logic
  });

  const backendUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/users/register`, formData);
      toast.success("Registration Successful! Please Login.");
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendUrl}/api/users/google-login`, {
        token: credentialResponse.credential,
        role: formData.role,
        referralCode: formData.referralCode // Pass referral code during Google signup too
      });
      localStorage.setItem('token', res.data.token);
      toast.success("Google Login Successful!");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Google Login Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100"
      >
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">Create Account</h2>
          <p className="mt-2 text-slate-500 font-light">Join the future of digital healthcare.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {/* Full Name */}
          <InputGroup 
            icon={<User />} 
            type="text" 
            name="fullName" 
            placeholder="Full Name" 
            onChange={handleChange} 
            required 
          />

          {/* Email */}
          <InputGroup 
            icon={<Mail />} 
            type="email" 
            name="email" 
            placeholder="Email Address" 
            autoComplete="email"
            onChange={handleChange} 
            required 
          />

          {/* Password */}
          <InputGroup 
            icon={<Lock />} 
            type="password" 
            name="password" 
            placeholder="Create Password" 
            autoComplete="new-password"
            onChange={handleChange} 
            required 
          />

          {/* Referral Code - Optional */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              <Gift className="h-5 w-5" />
            </div>
            <input
              type="text"
              name="referralCode"
              placeholder="Referral Code (Optional)"
              className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
              onChange={handleChange}
            />
          </div>

          {/* Role Selection */}
          <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <RoleButton 
              active={formData.role === 'patient'} 
              onClick={() => setFormData({...formData, role: 'patient'})} 
              label="Patient" 
              icon={<UserCircle className="h-4 w-4" />} 
            />
            <RoleButton 
              active={formData.role === 'doctor'} 
              onClick={() => setFormData({...formData, role: 'doctor'})} 
              label="Doctor" 
              icon={<ShieldCheck className="h-4 w-4" />} 
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all shadow-lg shadow-emerald-900/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Register Now"}
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium italic">or continue with</span></div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin 
            onSuccess={handleGoogleSuccess} 
            onError={() => toast.error("Google Auth Failed")}
            useOneTap
            shape="circle"
            theme="outline"
          />
        </div>

        <p className="text-center text-sm text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

// Helper Component for Inputs
const InputGroup = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
      {icon}
    </div>
    <input
      {...props}
      className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium"
    />
  </div>
);

// Helper Component for Role Toggle
const RoleButton = ({ active, onClick, label, icon }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
      active 
        ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' 
        : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon} {label}
  </button>
);

export default Register;