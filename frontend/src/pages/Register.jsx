import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { User, Stethoscope, Lock, Mail, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: '',
    consultationFee: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      toast.success("Registration Successful!");
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100"
      >
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary/10 flex items-center justify-center rounded-full">
            <User className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Join MediConnect today</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           {/* Role Selection Toggles */}
           <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, role: 'patient' })} 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Patient
            </button>
            <button 
              type="button" 
              onClick={() => setFormData({ ...formData, role: 'doctor' })} 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${formData.role === 'doctor' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Doctor
            </button>
          </div>

          <div className="space-y-4">
            <InputWithIcon icon={<User />} name="fullName" placeholder="Full Name" onChange={handleChange} autoComplete="name" />
            <InputWithIcon icon={<Mail />} name="email" type="email" placeholder="Email Address" onChange={handleChange} autoComplete="email" />
            <InputWithIcon icon={<Lock />} name="password" type="password" placeholder="Password" onChange={handleChange} autoComplete="new-password" />
            
            {/* Show extra fields ONLY if Doctor is selected */}
            {formData.role === 'doctor' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Stethoscope className="h-5 w-5 text-slate-400" />
                   </div>
                   <select name="specialization" onChange={handleChange} className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm" required>
                     <option value="">Select Specialization</option>
                     <option value="General Physician">General Physician</option>
                     <option value="Cardiologist">Cardiologist</option>
                     <option value="Dermatologist">Dermatologist</option>
                     <option value="Neurologist">Neurologist</option>
                   </select>
                </div>
                <InputWithIcon icon={<CreditCard />} name="consultationFee" type="number" placeholder="Consultation Fee ($)" onChange={handleChange} />
              </motion.div>
            )}
          </div>

          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-teal-700 shadow-lg shadow-primary/30">
            Sign Up with Email
          </button>
        </form>

        {/* Google Sign Up */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or sign up with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            text="signup_with"
            onSuccess={async (credentialResponse) => {
              try {
                // Pass the Selected Role to the Backend!
                console.log("Register Page Sending Role:", formData.role);
                await googleLogin(credentialResponse, formData.role); 
                
                toast.success(`Account Created as ${formData.role.toUpperCase()}!`);
                navigate('/');
              } catch (err) {
                console.error(err);
                toast.error("Google Sign Up Failed");
              }
            }}
            onError={() => toast.error("Google Sign Up Failed")}
            theme="filled_blue"
            shape="pill"
            width="320"
          />
        </div>

        <div className="text-center text-sm mt-6">
          <span className="text-slate-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-primary hover:text-teal-700">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
};

// Helper Component for cleaner code
const InputWithIcon = ({ icon, ...props }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <div className="text-slate-400 h-5 w-5">{icon}</div>
    </div>
    <input 
      {...props} 
      required 
      className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-shadow" 
    />
  </div>
);

export default Register;