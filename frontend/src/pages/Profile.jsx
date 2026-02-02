import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock, Calendar, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    specialization: '',
    consultation_fee: '',
    availability: '',
    address: '',
    dob: ''
  });

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Populate form with existing data
        setFormData({
            full_name: res.data.full_name || '',
            email: res.data.email || '',
            phone_number: res.data.phone_number || '',
            specialization: res.data.specialization || '',
            consultation_fee: res.data.consultation_fee || '',
            availability: res.data.availability || '',
            address: res.data.address || '',
            dob: res.data.dob ? res.data.dob.split('T')[0] : '' 
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
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

  // 3. Update Profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${backendUrl}/api/users/profile`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile Updated Successfully!");
    } catch (err) {
      toast.error("Update Failed");
    }
  };

  if (loading) return <div className="text-center py-20">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary px-8 py-6 text-white flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">My Profile</h1>
                <p className="opacity-90">{user?.role === 'doctor' ? 'Doctor Account' : 'Patient Account'}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
                <User className="h-8 w-8 text-white" />
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email (Read Only)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input type="email" value={formData.email} disabled
                            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* DOCTOR SPECIFIC FIELDS */}
            {user?.role === 'doctor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input type="text" name="specialization" value={formData.specialization} onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fee</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div className="col-span-full">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Availability (e.g., Mon-Fri, 9AM-5PM)</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input type="text" name="availability" value={formData.availability} onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            )}

            {/* PATIENT SPECIFIC FIELDS */}
            {user?.role === 'patient' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                            <input type="text" name="address" value={formData.address} onChange={handleChange}
                                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-primary transition flex items-center justify-center gap-2">
                <Save className="h-5 w-5" /> Save Changes
            </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;