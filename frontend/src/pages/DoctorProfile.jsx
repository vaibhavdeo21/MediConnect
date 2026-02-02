import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { User, Stethoscope, CreditCard, Phone, MapPin, Award, FileText, Save, Loader, Clock } from 'lucide-react';

const DoctorProfile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    specialization: '',
    consultation_fee: '',
    phone_number: '',
    experience_years: '',
    address: '',
    bio: '',
    availability: '' // New State
  });

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/doctors/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user, backendUrl]);

  // 2. Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Save Changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/doctors/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-primary/10 p-6 flex items-center gap-4 border-b border-primary/20">
          <div className="bg-primary text-white p-3 rounded-full">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Doctor Profile</h1>
            <p className="text-slate-600">Manage your public information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <InputGroup icon={<User />} label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
            <InputGroup icon={<Stethoscope />} label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} />
            <InputGroup icon={<CreditCard />} label="Consultation Fee ($)" name="consultation_fee" type="number" value={formData.consultation_fee} onChange={handleChange} />
            <InputGroup icon={<Phone />} label="Phone Number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} placeholder="+1 234 567 890" />
            <InputGroup icon={<Award />} label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years || ''} onChange={handleChange} />
            <InputGroup icon={<MapPin />} label="Clinic Address" name="address" value={formData.address || ''} onChange={handleChange} />
            
            {/* NEW: Availability Field */}
            <InputGroup icon={<Clock />} label="Availability" name="availability" value={formData.availability || ''} onChange={handleChange} placeholder="e.g. Mon - Fri, 9 AM - 5 PM" />

          </div>

          {/* Bio - Full Width */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <FileText className="h-4 w-4 text-primary" /> Professional Bio
            </label>
            <textarea
              name="bio"
              rows="4"
              value={formData.bio || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              placeholder="Tell patients about your expertise..."
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-lg shadow-primary/30 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-5 w-5" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Component
const InputGroup = ({ icon, label, ...props }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
      <span className="text-primary">{icon}</span> {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
    />
  </div>
);

export default DoctorProfile;