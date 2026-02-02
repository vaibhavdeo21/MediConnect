import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock, Calendar, Save } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    specialization: '',
    consultation_fee: '',
    availability: '', // This will be the final string sent to DB
    address: '',
    dob: ''
  });

  // Helpers for the Availability Builder
  const [schedule, setSchedule] = useState({
    startDay: 'Mon',
    endDay: 'Fri',
    startTime: '09:00',
    endTime: '17:00'
  });

  const backendUrl = import.meta.env.VITE_API_URL;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // 1. Fetch Profile Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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

  // 2. Handle Text Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Handle Schedule Dropdown Changes
  const handleScheduleChange = (field, value) => {
    // Update local schedule state
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);

    // Format Time to 12-Hour (e.g., 13:00 -> 01:00 PM)
    const formatTime = (time) => {
      if (!time) return "";
      const [hour, minute] = time.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12; // Convert 0 to 12
      return `${formattedHour}:${minute} ${ampm}`;
    };

    // Construct the final string: "Mon - Fri, 09:00 AM - 05:00 PM"
    const finalString = `${newSchedule.startDay} - ${newSchedule.endDay}, ${formatTime(newSchedule.startTime)} - ${formatTime(newSchedule.endTime)}`;
    
    // Update the main formData
    setFormData(prev => ({ ...prev, availability: finalString }));
  };

  // 4. Update Profile (Submit)
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

      updateUser({ 
        fullName: formData.full_name, 
        phone: formData.phone_number 
      });

    } catch (err) {
      console.error(err);
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

                    {/* NEW AVAILABILITY BUILDER */}
                    <div className="col-span-full bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Availability Settings
                        </label>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            {/* Days Selection */}
                            <div>
                                <label className="text-xs text-slate-500 font-semibold uppercase">From Day</label>
                                <select 
                                    className="w-full p-2 border rounded mt-1 bg-white"
                                    value={schedule.startDay}
                                    onChange={(e) => handleScheduleChange('startDay', e.target.value)}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-semibold uppercase">To Day</label>
                                <select 
                                    className="w-full p-2 border rounded mt-1 bg-white"
                                    value={schedule.endDay}
                                    onChange={(e) => handleScheduleChange('endDay', e.target.value)}
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Time Selection */}
                            <div>
                                <label className="text-xs text-slate-500 font-semibold uppercase">Start Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-2 border rounded mt-1 bg-white"
                                    value={schedule.startTime}
                                    onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-semibold uppercase">End Time</label>
                                <input 
                                    type="time" 
                                    className="w-full p-2 border rounded mt-1 bg-white"
                                    value={schedule.endTime}
                                    onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Preview of what will be saved */}
                        <div className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-200 mt-2">
                            <span className="font-bold">Preview:</span> {formData.availability || "Please select days and times"}
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