import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const { login, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      toast.success("Login Successful!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                name="email"
                type="email"
                required
                placeholder="Email Address"
                onChange={handleChange}
                autoComplete="email"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                name="password"
                type="password"
                required
                placeholder="Password"
                onChange={handleChange}
                autoComplete="current-password"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm transition-shadow"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-primary hover:text-teal-700 hover:underline transition"
            >
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-lg shadow-primary/30"
          >
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center">
          <GoogleLogin
            text="signin_with"
            onSuccess={async (credentialResponse) => {
              try {
                // Role defaults to patient if not specified, which is fine for login
                await googleLogin(credentialResponse);
                toast.success("Google Login Successful!");
                navigate('/');
              } catch (err) {
                console.error(err);
                toast.error("Google Login Failed");
              }
            }}
            onError={() => {
              toast.error("Google Login Failed");
            }}
            theme="filled_blue"
            shape="pill"
            width="320"
          />
        </div>

        <div className="text-center text-sm mt-6">
          <span className="text-slate-600">Don't have an account? </span>
          <Link to="/register" className="font-medium text-primary hover:text-teal-700">
            Register now
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;