import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock, Calendar, Save, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, theme, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const isPremium = theme === 'premium';
  const isDoctor = user?.role === 'doctor';

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone_number: '', specialization: '', 
    consultation_fee: '', availability: '', address: '', dob: ''
  });

  const [schedule, setSchedule] = useState({ startDay: 'Mon', endDay: 'Fri', startTime: '09:00', endTime: '17:00' });
  const backendUrl = import.meta.env.VITE_API_URL;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      } catch (err) { toast.error("Failed to load profile"); } 
      finally { setLoading(false); }
    };
    if (user) fetchProfile();
  }, [user, backendUrl]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleScheduleChange = (field, value) => {
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);
    const formatTime = (time) => {
      if (!time) return "";
      const [hour, minute] = time.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      return `${formattedHour}:${minute} ${ampm}`;
    };
    const finalString = `${newSchedule.startDay} - ${newSchedule.endDay}, ${formatTime(newSchedule.startTime)} - ${formatTime(newSchedule.endTime)}`;
    setFormData(prev => ({ ...prev, availability: finalString }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/users/profile`, formData, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(isDoctor ? "Practice Settings Updated" : "Profile Updated");
      updateUser({ fullName: formData.full_name, phone: formData.phone_number });
    } catch (err) { toast.error("Update Failed"); }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-950 ${isDoctor ? 'text-cyan-400' : 'text-yellow-500'}`}>
      Syncing Practitioner Data...
    </div>
  );

  const bgClass = (isDoctor || isPremium) ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
  const cardClass = isDoctor ? "bg-slate-900 border-cyan-500/10 shadow-2xl shadow-cyan-500/5" : isPremium ? "bg-slate-900 border-yellow-500/10 shadow-2xl" : "bg-white border-slate-100 shadow-xl";
  const inputClass = (isDoctor || isPremium) ? "bg-slate-800 border-white/5 text-white focus:ring-2" : "bg-white border-slate-200 text-slate-900 focus:ring-emerald-500/20";
  const accentHex = isDoctor ? "ring-cyan-500/20" : "ring-yellow-500/20";

  return (
    <div className={`min-h-screen py-24 px-4 transition-colors duration-500 ${bgClass}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden border ${cardClass}`}>
        <div className={`px-8 py-10 flex items-center justify-between ${isDoctor ? 'bg-cyan-900/10 border-b border-cyan-500/10' : isPremium ? 'bg-slate-800/50' : 'bg-slate-900 text-white'}`}>
            <div className="text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3 ${isDoctor ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                    {isDoctor ? 'Practitioner Account' : 'Elite Account'}
                </div>
                <h1 className="text-3xl font-serif font-bold tracking-tight">{isDoctor ? 'Practice Settings' : 'My Profile'}</h1>
            </div>
            <div className={`p-4 rounded-2xl ${isDoctor ? 'bg-cyan-500 text-slate-950' : isPremium ? 'bg-yellow-500 text-slate-950' : 'bg-white/10'}`}>
                <User className="h-8 w-8 text-white" />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input name="full_name" value={formData.full_name} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all ${inputClass} ${accentHex}`} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email (Read Only)</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input value={formData.email} disabled className={`w-full pl-12 pr-4 py-4 rounded-2xl border cursor-not-allowed ${isDoctor || isPremium ? 'bg-slate-950 border-white/5 text-slate-600' : 'bg-slate-100 text-slate-400'}`} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Contact Number</label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input name="phone_number" value={formData.phone_number} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none transition-all ${inputClass} ${accentHex}`} />
                    </div>
                </div>
            </div>

            <hr className={isDoctor ? "border-cyan-500/10" : isPremium ? "border-white/5" : "border-slate-100"} />

            {isDoctor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Specialization</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input name="specialization" value={formData.specialization} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border ${inputClass} ${accentHex}`} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Consultation Fee (₹)</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input type="number" name="consultation_fee" value={formData.consultation_fee} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border ${inputClass} ${accentHex}`} />
                        </div>
                    </div>
                    <div className={`col-span-full p-6 rounded-3xl border ${isDoctor ? 'bg-slate-800/50 border-cyan-500/10' : 'bg-slate-50 border-slate-200'}`}>
                        <label className={`text-sm font-bold flex items-center gap-2 mb-4 ${isDoctor ? 'text-cyan-400' : 'text-slate-700'}`}><Clock className="h-4 w-4" /> Practice Hours Builder</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['startDay', 'endDay'].map(field => (
                                <select key={field} value={schedule[field]} onChange={(e) => handleScheduleChange(field, e.target.value)} className={`p-3 rounded-xl border ${isDoctor ? 'bg-slate-900 border-white/10 text-white' : 'bg-white'}`}>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            ))}
                            <input type="time" value={schedule.startTime} onChange={(e) => handleScheduleChange('startTime', e.target.value)} className={`p-3 rounded-xl border ${isDoctor ? 'bg-slate-900 border-white/10 text-white' : 'bg-white'}`} />
                            <input type="time" value={schedule.endTime} onChange={(e) => handleScheduleChange('endTime', e.target.value)} className={`p-3 rounded-xl border ${isDoctor ? 'bg-slate-900 border-white/10 text-white' : 'bg-white'}`} />
                        </div>
                        <div className={`mt-4 p-3 rounded-xl text-xs font-bold border ${isDoctor ? 'bg-slate-950 border-cyan-500/10 text-cyan-500' : 'bg-white text-slate-600'}`}>
                           PREVIEW: {formData.availability || "Not Configured"}
                        </div>
                    </div>
                </div>
            )}

            {!isDoctor && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border ${inputClass} ${accentHex}`} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Residential Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                            <input name="address" value={formData.address} onChange={handleChange} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border ${inputClass} ${accentHex}`} />
                        </div>
                    </div>
                </div>
            )}

            <button type="submit" className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${isDoctor ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-500/20' : isPremium ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-yellow-500/20' : 'bg-slate-950 text-white hover:bg-emerald-600'}`}>
                <Save className="h-5 w-5" /> {isDoctor ? 'Sync Professional Data' : 'Save Profile Changes'}
            </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;