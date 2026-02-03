import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Stethoscope, Lock, Mail, CreditCard, Eye, EyeOff, CheckCircle, XCircle, ArrowRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    role: 'patient', specialization: '', consultationFee: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor' || roleParam === 'patient') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const passwordsMatch = formData.password === formData.confirmPassword;
  const showMismatchError = formData.confirmPassword.length > 0 && !passwordsMatch;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) return toast.error("Passwords do not match!");
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      toast.success("Account Created Successfully");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: LUXURY VISUAL */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        transition={{ duration: 0.8 }}
        className="hidden lg:flex w-5/12 bg-slate-900 relative items-center justify-center p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-emerald-900/30 mix-blend-multiply"></div>
        {/* Abstract Animated Background */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl"></motion.div>
        </div>

        <div className="relative z-10 space-y-8">
            <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                <Activity className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-5xl font-serif font-bold leading-tight">
                Elevate Your <br/> <span className="text-emerald-400 italic">Medical Journey.</span>
            </h1>
            <p className="text-slate-300 text-lg font-light leading-relaxed max-w-sm">
                Join an exclusive network of top-tier specialists and take control of your health with premium tools.
            </p>
            
            {/* Trust Badges */}
            <div className="flex gap-4 pt-4">
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-sm">Secure</div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-sm">Encrypted</div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-sm">Verified</div>
            </div>
        </div>
      </motion.div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-md w-full"
        >
            <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-slate-900">Create Account</h2>
                <p className="text-slate-500 mt-2">Sign up to access personalized care.</p>
            </div>

            {/* Role Switcher */}
            <div className="bg-slate-100 p-1.5 rounded-2xl relative mb-8 flex">
                <motion.div 
                    className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-md z-0"
                    initial={false}
                    animate={{ left: formData.role === 'patient' ? '6px' : '50%', width: 'calc(50% - 9px)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button type="button" onClick={() => setFormData({ ...formData, role: 'patient' })} className={`flex-1 relative z-10 py-3 text-sm font-bold rounded-xl transition-colors ${formData.role === 'patient' ? 'text-slate-900' : 'text-slate-500'}`}>Patient</button>
                <button type="button" onClick={() => setFormData({ ...formData, role: 'doctor' })} className={`flex-1 relative z-10 py-3 text-sm font-bold rounded-xl transition-colors ${formData.role === 'doctor' ? 'text-slate-900' : 'text-slate-500'}`}>Doctor</button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <InputGroup icon={<User />} name="fullName" placeholder="Full Name" onChange={handleChange} />
                <InputGroup icon={<Mail />} name="email" type="email" placeholder="Email Address" onChange={handleChange} />
                
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock className="h-5 w-5" /></div>
                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange} className="block w-full pl-12 pr-12 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:shadow-lg transition-all font-medium placeholder:text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-emerald-600 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>

                <AnimatePresence>
                    {formData.role === 'doctor' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600"><Stethoscope className="h-5 w-5" /></div>
                                <select name="specialization" required onChange={handleChange} className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all font-medium appearance-none">
                                    <option value="">Select Specialization</option>
                                    <option value="General Physician">General Physician</option>
                                    <option value="Cardiologist">Cardiologist</option>
                                    <option value="Dermatologist">Dermatologist</option>
                                    <option value="Neurologist">Neurologist</option>
                                </select>
                            </div>
                            <InputGroup icon={<CreditCard />} name="consultationFee" type="number" placeholder="Consultation Fee ($)" onChange={handleChange} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors"><Lock className={`h-5 w-5 ${showMismatchError ? 'text-red-500' : ''}`} /></div>
                    <input type={showPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} className={`block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 focus:bg-white focus:ring-2 transition-all font-medium ${showMismatchError ? 'focus:ring-red-100' : 'focus:ring-emerald-100'}`} />
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    disabled={showMismatchError}
                    type="submit" 
                    className="w-full bg-slate-900 text-white h-14 rounded-xl font-bold tracking-wide shadow-xl shadow-slate-900/20 hover:bg-emerald-600 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                    Create Account <ArrowRight className="h-5 w-5" />
                </motion.button>
            </form>

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-slate-400 font-medium">Or continue with</span></div>
            </div>
            
            <div className="flex justify-center">
                <GoogleLogin onSuccess={(r) => googleLogin(r, formData.role)} onError={() => toast.error("Failed")} theme="outline" shape="pill" size="large" width="300" />
            </div>

            <p className="text-center mt-8 text-slate-500 text-sm">Already a member? <Link to="/login" className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">Sign in</Link></p>
        </motion.div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">{icon}</div>
    <input {...props} required className="block w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 focus:shadow-lg transition-all duration-300 font-medium" />
  </div>
);

export default Register;