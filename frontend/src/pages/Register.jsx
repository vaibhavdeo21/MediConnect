import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, UserCircle, ArrowRight, ShieldCheck, Gift, Loader2, Stethoscope, Sparkles, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Register = () => {
    const { theme } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // Eye reveal state
    const isPremium = theme === 'premium';

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '', // Added back
        role: 'patient',
        referralCode: ''
    });

    // Match validation logic
    const passwordsMatch = formData.password === formData.confirmPassword;
    const showMatchResult = formData.confirmPassword.length > 0;

    const backendUrl = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordsMatch) return toast.error("Passwords do not match!");

        setLoading(true);
        try {
            // 1. Post to the correct /api/auth/register endpoint
            const res = await axios.post(`${backendUrl}/api/auth/register`, formData);

            // 2. Save the session data exactly like your login logic does
            if (res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                toast.success("Account Created! Redirecting to Dashboard...");

                // 3. Use a hard redirect to ensure AuthContext picks up the new token
                window.location.href = '/dashboard';
            } else {
                // Fallback if your backend doesn't return the user object immediately
                toast.success("Registration Successful! Please Login.");
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration Failed");
        } finally {
            setLoading(false);
        }
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
            console.error(err);
            toast.error("Google Registration Failed");
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`max-w-4xl w-full flex flex-col md:flex-row overflow-hidden rounded-[3rem] shadow-2xl border ${isPremium ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'}`}
            >
                {/* Left Side: Brand Info (Kept identical to your version) */}
                <div className={`md:w-1/3 p-12 text-white flex flex-col justify-between relative overflow-hidden ${isPremium ? 'bg-slate-800' : 'bg-slate-900'}`}>
                    <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br pointer-events-none ${isPremium ? 'from-yellow-500/10' : 'from-emerald-500/10'}`}></div>
                    <div className="relative z-10 text-left">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 border ${isPremium ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                            <ShieldCheck className={`h-6 w-6 ${isPremium ? 'text-yellow-500' : 'text-emerald-400'}`} />
                        </div>
                        <h2 className="text-3xl font-serif font-bold leading-tight">Join the <br />Medical Elite.</h2>
                        <p className="mt-4 text-slate-400 text-sm leading-relaxed">Secure, efficient healthcare management for practitioners and patients.</p>
                    </div>
                    <div className="relative z-10 mt-12 md:mt-0 text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Registry Members</p>
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-slate-700"></div>)}
                            <div className={`h-8 w-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold ${isPremium ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600'}`}>+2k</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form (Restored your full logic + added features) */}
                <div className="md:w-2/3 p-10 md:p-12">
                    <div className="text-left mb-8">
                        <h2 className={`text-3xl font-serif font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>Create Account</h2>
                        <p className="text-slate-500 mt-2 font-light">Join the future of digital healthcare.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                onClick={() => setFormData({ ...formData, role: 'patient' })}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.role === 'patient'
                                    ? (isPremium ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-emerald-50 border-emerald-500 text-emerald-600')
                                    : 'bg-transparent border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <UserCircle className="h-6 w-6" />
                                <div className="text-left">
                                    <p className="font-bold text-sm">Patient</p>
                                    <p className="text-[9px] uppercase font-black tracking-widest opacity-60">Personal</p>
                                </div>
                            </div>

                            <div
                                onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.role === 'doctor'
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                    : 'bg-transparent border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <Stethoscope className="h-6 w-6" />
                                <div className="text-left">
                                    <p className="font-bold text-sm">Doctor</p>
                                    <p className="text-[9px] uppercase font-black tracking-widest opacity-60">Clinical</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InputGroup
                                icon={<User />}
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                onChange={handleChange}
                                required
                                isPremium={isPremium}
                            />
                            <InputGroup
                                icon={<Mail />}
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                autoComplete="email"
                                onChange={handleChange}
                                required
                                isPremium={isPremium}
                            />

                            {/* Password with Eye Toggle */}
                            <div className="relative group text-left">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isPremium ? 'text-slate-600 group-focus-within:text-yellow-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create Password"
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    required
                                    className={`block w-full pl-12 pr-12 py-4 rounded-xl transition-all font-medium border-0 outline-none ${isPremium ? 'bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500/20 placeholder:text-slate-600' : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400'}`}
                                />
                                <button type="button" onMouseEnter={() => setShowPassword(true)} onMouseLeave={() => setShowPassword(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500">
                                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>

                            {/* Confirm Password with Validation Marks */}
                            <div className="relative group text-left">
                                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isPremium ? 'text-slate-600 group-focus-within:text-yellow-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    onChange={handleChange}
                                    required
                                    className={`block w-full pl-12 pr-12 py-4 rounded-xl transition-all font-medium border-0 outline-none ${isPremium ? 'bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500/20' : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100'} ${showMatchResult && !passwordsMatch ? 'ring-2 ring-red-500/50' : ''}`}
                                />
                                {showMatchResult && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        {passwordsMatch ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                                    </div>
                                )}
                            </div>

                            <InputGroup
                                icon={<Gift />}
                                type="text"
                                name="referralCode"
                                placeholder="Invite Code (Optional)"
                                onChange={handleChange}
                                isPremium={isPremium}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (showMatchResult && !passwordsMatch)}
                            className={`w-full py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-xl ${formData.role === 'doctor'
                                ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/20'
                                : isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400' : 'bg-slate-950 text-white hover:bg-emerald-700'
                                }`}
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete Registration"}
                            {!loading && <ArrowRight className="h-5 w-5" />}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isPremium ? 'border-white/5' : 'border-slate-100'}`}></div></div>
                        <div className="relative flex justify-center text-sm"><span className={`px-4 font-medium italic ${isPremium ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>or enroll via</span></div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error("Google Auth Failed")}
                            useOneTap
                            shape="circle"
                            theme={isPremium ? "filled_black" : "outline"}
                        />
                    </div>

                    <p className={`text-center text-sm font-medium ${isPremium ? 'text-slate-500' : 'text-slate-500'}`}>
                        Already a member?{' '}
                        <Link to="/login" className={`${isPremium ? 'text-yellow-500' : 'text-emerald-600'} hover:underline font-bold underline-offset-4`}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

// Original InputGroup Helper (Theme-aware)
const InputGroup = ({ icon, isPremium, ...props }) => (
    <div className="relative group text-left">
        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isPremium ? 'text-slate-600 group-focus-within:text-yellow-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
            {icon}
        </div>
        <input
            {...props}
            className={`block w-full pl-12 pr-4 py-4 rounded-xl transition-all font-medium border-0 outline-none ${isPremium
                ? 'bg-slate-800 text-white focus:ring-2 focus:ring-yellow-500/20 placeholder:text-slate-600'
                : 'bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-100 placeholder:text-slate-400'
                }`}
        />
    </div>
);

export default Register;