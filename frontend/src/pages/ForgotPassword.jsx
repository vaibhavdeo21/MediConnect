import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Mail, Key, Lock, Eye, EyeOff, XCircle, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [stage, setStage] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_API_URL;

  // Validation Logic
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
    } finally {
      setLoading(false);
    }
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
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-600">
            {stage === 1 && "Enter your email to receive an OTP"}
            {stage === 2 && "Enter the OTP sent to your email"}
            {stage === 3 && "Create a new secure password"}
          </p>
        </div>

        {/* STAGE 1: EMAIL */}
        {stage === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-primary hover:bg-teal-700 shadow-lg">
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STAGE 2: OTP */}
        {stage === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary tracking-widest text-center text-xl"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-primary hover:bg-teal-700 shadow-lg">
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {/* STAGE 3: NEW PASSWORD */}
        {stage === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              
              {/* Password Field */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-primary"
                  onMouseEnter={() => setShowPassword(true)}
                  onMouseLeave={() => setShowPassword(false)}
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </div>
              </div>

              {/* Confirm Password Field with Validation */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${showMismatchError ? 'text-red-500' : 'text-slate-400'}`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 sm:text-sm transition-shadow
                      ${showMismatchError 
                        ? 'border-red-500 focus:ring-red-200 focus:border-red-500' 
                        : 'border-slate-300 focus:ring-primary focus:border-transparent'
                      }
                    `}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {/* Live Validation Messages */}
                {showMismatchError && (
                  <div className="flex items-center mt-1 text-xs text-red-500 animate-pulse">
                    <XCircle className="h-3 w-3 mr-1" />
                    Passwords do not match
                  </div>
                )}
                {showMatchSuccess && (
                  <div className="flex items-center mt-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Passwords match
                  </div>
                )}
              </div>

            </div>
            
            <button 
              type="submit" 
              disabled={loading || showMismatchError} 
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white transition-colors shadow-lg
                ${showMismatchError ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-teal-700 shadow-primary/30'}
              `}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;