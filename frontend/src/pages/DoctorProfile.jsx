import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, CreditCard, Stethoscope, Award, Briefcase } from 'lucide-react';

const DoctorProfile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    specialization: '',
    consultationFee: '',
    experience: '',
    qualifications: ''
  });

  // Load current data (so they don't overwrite with blanks)
  useEffect(() => {
    // Ideally, you fetch the current profile from backend here.
    // For now, we will start blank or rely on what we have.
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      await axios.put(
        `${backendUrl}/api/doctors/profile`, 
        formData, 
        { headers: { Authorization: token } }
      );

      toast.success("Profile Updated Successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'doctor') {
    return <div className="p-10 text-center">Access Denied. Doctors Only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100">
        <div className="bg-primary px-8 py-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6" /> Edit Doctor Profile
          </h1>
          <p className="text-teal-100 mt-1">Update your professional details so patients can find you.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Specialization */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Specialization
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">Select Specialization</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
              </select>
            </div>

            {/* Consultation Fee */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Consultation Fee ($)
              </label>
              <input
                type="number"
                name="consultationFee"
                value={formData.consultationFee}
                onChange={handleChange}
                placeholder="e.g. 50"
                required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Years of Experience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g. 8"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Qualifications */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Qualifications
              </label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD"
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;