import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock, Calendar, Save, ChevronDown, X, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
    const { user, theme, updateUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [activeField, setActiveField] = useState(null);

    const isDoctor = user?.role === 'doctor';
    const isPremium = user?.is_premium;
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        full_name: '', email: '', phone_number: '', specialization: '',
        consultation_fee: '', availability: '', address: '', dob: ''
    });

    const [schedule, setSchedule] = useState({ startDay: 'Mon', endDay: 'Fri', startTime: '09:00', endTime: '17:00' });
    const backendUrl = import.meta.env.VITE_API_URL;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const bgClass = isDark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";
    const cardClass = isDoctor
        ? (isDark ? "bg-slate-900 border-white/5 shadow-2xl" : "bg-white border-blue-100 shadow-xl shadow-blue-900/5")
        : isPremium
            ? (isDark ? "bg-slate-900 border-yellow-500/20 shadow-2xl" : "bg-white border-yellow-100 shadow-xl shadow-yellow-900/5")
            : (isDark ? "bg-slate-900 border-emerald-500/10 shadow-2xl" : "bg-white border-emerald-100 shadow-xl shadow-emerald-900/5");

    const inputClass = isDark ? "bg-slate-800 border-white/5 text-white" : "bg-white border-slate-200 text-slate-900";

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
            await axios.put(`${backendUrl}/api/users/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Profile Updated");
            updateUser({ full_name: formData.full_name, phone_number: formData.phone_number });
        } catch (err) { toast.error("Update Failed"); }
    };

    const renderInput = (label, name, icon, type = "text", readOnly = false) => (
        <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
            <div className={`relative cursor-pointer group`} onClick={() => !readOnly && setActiveField({ label, name, icon, type })}>
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isDoctor ? 'group-hover:text-blue-500' : isPremium ? 'group-hover:text-yellow-500' : 'group-hover:text-emerald-500'
                } text-slate-400`}>
                    {icon}
                </div>
                <input name={name} value={formData[name] || ''} readOnly placeholder={`No ${label.toLowerCase()} set`} className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border transition-all pointer-events-none ${inputClass} ${readOnly ? 'opacity-50 grayscale' : ''}`} />
            </div>
        </div>
    );

    if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950 text-cyan-400' : 'bg-slate-50 text-blue-600'}`}>Syncing Data...</div>;

    return (
        <div className={`min-h-screen py-24 px-4 transition-colors duration-500 ${bgClass} relative text-left`}>
            {/* FOCUS MODE MODAL */}
            <AnimatePresence>
                {activeField && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveField(null)} className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`relative z-[1001] w-full max-w-lg p-10 rounded-[3rem] border shadow-2xl ${
                                isDoctor 
                                    ? (isDark ? "bg-slate-900 border-blue-500/20" : "bg-white border-blue-200 shadow-blue-900/10")
                                    : isPremium
                                        ? (isDark ? "bg-slate-900 border-yellow-500/20" : "bg-white border-yellow-200 shadow-yellow-900/10")
                                        : (isDark ? "bg-slate-900 border-emerald-500/20" : "bg-white border-emerald-200 shadow-emerald-900/10")
                            }`}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className={`text-2xl font-serif font-bold italic ${
                                    isDoctor && !isDark ? 'text-blue-700' : isPremium && !isDark ? 'text-yellow-700' : !isPremium && !isDark ? 'text-emerald-700' : ''
                                }`}>
                                    Editing {activeField.label}
                                </h3>
                                <button onClick={() => setActiveField(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="h-6 w-6 text-slate-400" />
                                </button>
                            </div>
                            <div className="relative mb-8">
                                <div className={`absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 ${
                                    isDoctor ? 'text-blue-500' : isPremium ? 'text-yellow-500' : 'text-emerald-500'
                                }`}>
                                    {activeField.icon}
                                </div>
                                <input
                                    autoFocus type={activeField.type} name={activeField.name}
                                    value={formData[activeField.name]} onChange={handleChange}
                                    className={`w-full pl-14 pr-6 py-5 rounded-2xl outline-none border-2 text-lg font-medium transition-all ${
                                        isDoctor ? 'border-blue-500 shadow-blue-500/10' : isPremium ? 'border-yellow-500 shadow-yellow-500/10' : 'border-emerald-500 shadow-emerald-500/10'
                                    } ${inputClass}`}
                                />
                            </div>
                            <button
                                onClick={() => setActiveField(null)}
                                className={`w-full py-5 text-white text-lg font-bold rounded-2xl shadow-xl transition-all ${
                                    isDoctor ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : isPremium ? 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-500/20' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20'
                                }`}
                            >
                                Done
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden border ${cardClass}`}>
                <div className={`px-8 py-10 flex items-center justify-between transition-colors duration-500 ${
                    isDark 
                        ? 'bg-slate-900 border-b border-white/5' 
                        : isDoctor 
                            ? 'bg-white border-b border-blue-50' 
                            : isPremium 
                                ? 'bg-yellow-50/50 border-b border-yellow-100' 
                                : 'bg-emerald-50/50 border-b border-emerald-100'
                }`}>
                    <div className="text-left">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3 ${
                            isDoctor 
                                ? (isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm') 
                                : isPremium 
                                    ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        }`}>
                            {isDoctor ? 'Practitioner Account' : isPremium ? 'Elite Account' : 'Standard Account'}
                        </div>
                        <h1 className={`text-3xl font-serif font-bold ${
                            !isDark && isDoctor ? 'text-blue-900' : !isDark && isPremium ? 'text-yellow-700' : !isDark && !isPremium ? 'text-emerald-800' : 'text-white'
                        }`}>
                            {isDoctor ? 'Practice Settings' : 'My Profile'}
                        </h1>
                    </div>
                    <div className={`p-4 rounded-2xl shadow-lg ${
                        isDoctor ? 'bg-blue-600 text-white' : isPremium ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                    }`}>
                        <User className="h-8 w-8" />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderInput("Full Name", "full_name", <User className="h-5 w-5" />)}
                        {renderInput("Email (Read Only)", "email", <Mail className="h-5 w-5" />, "email", true)}
                        {renderInput("Contact Number", "phone_number", <Phone className="h-5 w-5" />, "tel")}
                    </div>

                    <hr className={isDark ? "border-white/5" : "border-slate-100"} />

                    {isDoctor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Specialization</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <select name="specialization" value={formData.specialization} onChange={handleChange} className={`w-full pl-12 pr-10 py-4 rounded-2xl outline-none border appearance-none transition-all ${inputClass}`}>
                                        <option value="">Select Specialty</option>
                                        {["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Psychiatrist", "Orthopedic Surgeon", "Gynecologist", "Ophthalmologist"].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                                </div>
                            </div>
                            {renderInput("Consultation Fee (₹)", "consultation_fee", <IndianRupee className="h-5 w-5" />, "number")}

                            <div className={`col-span-full p-6 rounded-3xl border ${isDark ? 'bg-slate-800/50 border-white/5' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}>
                                <label className={`text-sm font-bold flex items-center gap-2 mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}><Clock className="h-4 w-4" /> Practice Hours Builder</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['startDay', 'endDay'].map(field => (
                                        <select key={field} value={schedule[field]} onChange={(e) => handleScheduleChange(field, e.target.value)} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            {days.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    ))}
                                    <input type="time" value={schedule.startTime} onChange={(e) => handleScheduleChange('startTime', e.target.value)} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm'}`} />
                                    <input type="time" value={schedule.endTime} onChange={(e) => handleScheduleChange('endTime', e.target.value)} className={`p-3 rounded-xl border ${isDark ? 'bg-slate-900 border-white/10 text-white' : 'bg-white border-slate-200 shadow-sm'}`} />
                                </div>
                                <div className={`mt-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-slate-950 border-cyan-500/10 text-cyan-500' : 'bg-white text-slate-600 shadow-sm'}`}>
                                    PREVIEW: {formData.availability || "Not Configured"}
                                </div>
                            </div>
                        </div>
                    )}

                    {!isDoctor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {renderInput("Date of Birth", "dob", <Calendar className="h-5 w-5" />, "date")}
                            {renderInput("Residential Address", "address", <MapPin className="h-5 w-5" />)}
                        </div>
                    )}

                    <button type="submit" className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl ${
                        isDoctor 
                            ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20' 
                            : isPremium 
                                ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-yellow-500/20' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'
                        }`}>
                        <Save className="h-5 w-5" /> Save Changes
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Profile;