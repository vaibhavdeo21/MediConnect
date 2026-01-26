import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, ArrowRight, Loader2, KeyRound, Undo2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AuthContext); 
  const [loading, setLoading] = useState(false);
  const isPremium = theme === 'premium';
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      toast.success("Welcome Back!");
      
      window.location.href = '/dashboard'; 

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // RESTORED ORIGINAL ENDPOINT
      const res = await axios.post(`${backendUrl}/api/auth/google-login`, {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      toast.success("Google Login Successful!");
      
      // RESTORED YOUR REDIRECT FIX
      window.location.href = '/dashboard';

    } catch (err) {
      toast.error("Google Auth Failed");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 font-sans transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`max-w-4xl w-full flex flex-col md:flex-row overflow-hidden rounded-[3rem] shadow-2xl border ${isPremium ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}>
        <div className={`md:w-1/3 p-12 text-white flex flex-col justify-between relative ${isPremium ? 'bg-slate-800' : 'bg-slate-950'}`}>
            <div className="relative z-10 text-left">
                <KeyRound className={`h-12 w-12 mb-6 ${isPremium ? 'text-yellow-500' : 'text-cyan-400'}`} />
                <h2 className="text-3xl font-serif font-bold leading-tight">Welcome <br/>Back.</h2>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">Secure access to your medical workspace.</p>
            </div>
            <Link to="/" className="relative z-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
               <Undo2 className="h-4 w-4" /> Home Page
            </Link>
        </div>

        <div className="md:w-2/3 p-10 md:p-12">
          <div className="text-left mb-10">
            <h2 className={`text-3xl font-serif font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>Sign In</h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative group text-left">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isPremium ? 'text-slate-600 group-focus-within:text-yellow-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                    <Mail className="h-5 w-5" />
                </div>
                <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required 
                  className={`block w-full pl-12 pr-4 py-4 rounded-xl transition-all font-medium border-0 outline-none ${isPremium ? 'bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500/20 placeholder:text-slate-600' : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400'}`} />
            </div>

            <div className="relative group text-left">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isPremium ? 'text-slate-600 group-focus-within:text-yellow-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                    <Lock className="h-5 w-5" />
                </div>
                <input name="password" type="password" autoComplete="current-password" placeholder="Password Key" onChange={handleChange} required 
                  className={`block w-full pl-12 pr-4 py-4 rounded-xl transition-all font-medium border-0 outline-none ${isPremium ? 'bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500/20 placeholder:text-slate-600' : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400'}`} />
            </div>
            
            <Link to="/forgot-password" className="block text-right text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors">Forgot Password?</Link>

            <button disabled={loading} className={`w-full py-5 rounded-2xl font-bold flex justify-center items-center gap-2 text-white ${isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-slate-950 hover:bg-emerald-700'}`}>
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Authorize Sign-In"} <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="my-10 flex items-center gap-4"><div className="flex-1 border-t border-slate-100"></div><span className="text-slate-400 text-sm">or</span><div className="flex-1 border-t border-slate-100"></div></div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Auth Failed")} theme={isPremium ? "filled_black" : "outline"} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;