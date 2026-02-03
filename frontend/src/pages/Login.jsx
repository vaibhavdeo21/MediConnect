import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back.");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Visual Side */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden lg:flex w-1/2 bg-emerald-950 relative items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 p-12 max-w-lg">
            <h2 className="text-5xl font-serif font-bold text-white mb-6 leading-tight">Welcome <br/><span className="text-emerald-400">Back.</span></h2>
            <p className="text-slate-300 text-lg font-light">Your health journey continues here. Access your secure portal.</p>
        </div>
      </motion.div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-8">Sign In</h1>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                <InputGroup icon={<Mail />} type="email" name="email" placeholder="Email Address" onChange={handleChange} />
                <div>
                    <InputGroup icon={<Lock />} type="password" name="password" placeholder="Password" onChange={handleChange} />
                    <div className="text-right mt-2"><Link to="/forgot-password" class="text-xs font-bold text-emerald-600 hover:underline">Forgot Password?</Link></div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-slate-900 text-white h-12 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight className="h-4 w-4" /></>}
                </motion.button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400">Or</span></div>
            </div>

            <div className="flex justify-center">
                <GoogleLogin onSuccess={(r) => googleLogin(r)} onError={() => toast.error("Failed")} theme="outline" shape="pill" width="320" />
            </div>

            <p className="text-center mt-8 text-slate-500 text-sm">
                New here? <Link to="/register" className="font-bold text-slate-900 hover:text-emerald-600">Create an account</Link>
            </p>
        </motion.div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon, ...props }) => (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">{icon}</div>
      <input {...props} required className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium" />
    </div>
);

export default Login;