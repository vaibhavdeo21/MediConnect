import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Briefcase, IndianRupee, Clock, Calendar, Save, ChevronDown, X, AlertCircle, FileText, Activity, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';
import GradientText from '../components/ui/GradientText';
import Modal from '../components/ui/Modal';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [activeField, setActiveField] = useState(null);
  const [showUndertaking, setShowUndertaking] = useState(false);

  const isDoctor = user?.role === 'doctor';
  const isPremium = user?.is_premium;

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone_number: '', specialization: '',
    consultation_fee: '', availability: '', address: '', dob: '',
    is_emergency: false
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
          dob: res.data.dob ? res.data.dob.split('T')[0] : '',
          is_emergency: res.data.is_emergency || false
        });
      } catch (err) { toast.error("Failed to load profile"); }
      finally { setLoading(false); }
    };
    if (user) fetchProfile();
  }, [user, backendUrl]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmergencyToggle = () => {
    if (!formData.is_emergency) {
      setShowUndertaking(true);
    } else {
      setFormData(prev => ({ ...prev, is_emergency: false }));
    }
  };

  const confirmUndertaking = () => {
    setFormData(prev => ({ ...prev, is_emergency: true }));
    setShowUndertaking(false);
    toast.success("Emergency Status Enabled");
  };

  const handleScheduleChange = (field, value) => {
    const newSchedule = { ...schedule, [field]: value };
    setSchedule(newSchedule);
    const formatTime = (time) => {
      if (!time) return "";
      const [hour, minute] = time.split(':');
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      return `${h % 12 || 12}:${minute} ${ampm}`;
    };
    setFormData(prev => ({ ...prev, availability: `${newSchedule.startDay} - ${newSchedule.endDay}, ${formatTime(newSchedule.startTime)} - ${formatTime(newSchedule.endTime)}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${backendUrl}/api/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile Updated");
      updateUser({ full_name: formData.full_name, phone_number: formData.phone_number, is_emergency: formData.is_emergency });
    } catch (err) { toast.error("Update Failed"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] py-8 px-4 transition-colors duration-500">
      {/* Emergency Undertaking Modal */}
      <Modal isOpen={showUndertaking} onClose={() => setShowUndertaking(false)} title="Emergency Service Undertaking" size="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500 rounded-xl text-white shadow-glow-red">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-[var(--text-primary)]">Declaration</h3>
            <p className="text-xs text-[var(--text-muted)]">Please read carefully before enabling</p>
          </div>
        </div>
        <div className="space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
          <p>I, <strong className="text-[var(--text-primary)]">{formData.full_name}</strong>, hereby declare:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>I consent to being listed as an <strong>Emergency-Ready Practitioner</strong>.</li>
            <li>I will respond to emergency bookings within the <strong>10-minute window</strong>.</li>
            <li>My "Active/Inactive" status will accurately reflect my availability.</li>
            <li>Failure to respond will result in <strong>₹1,000 penalty</strong> and reliability score reduction.</li>
            <li>Repeated violations may lead to platform suspension.</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowUndertaking(false)} className="flex-1 py-3 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">Cancel</button>
          <button onClick={confirmUndertaking} className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white shadow-glow-red hover:bg-red-600">I Agree & Enable</button>
        </div>
      </Modal>

      {/* Field Edit Modal */}
      <Modal isOpen={!!activeField} onClose={() => setActiveField(null)} title={`Edit ${activeField?.label || ''}`} size="sm">
        {activeField && (
          <div>
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500">{activeField.icon}</div>
              <input autoFocus type={activeField.type} name={activeField.name}
                value={formData[activeField.name]} onChange={handleChange}
                className="glass-input w-full pl-12 pr-4 text-lg" />
            </div>
            <button onClick={() => setActiveField(null)}
              className="w-full py-3.5 rounded-xl font-semibold gradient-primary text-white shadow-glow-cyan">
              Done
            </button>
          </div>
        )}
      </Modal>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <GlassCard hover={false} padding="none" className="overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-[var(--border-primary)] flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest mb-3 glass border border-cyan-500/20 text-cyan-500">
                {isDoctor ? 'Practitioner' : isPremium ? 'Premium' : 'Standard'} Account
              </span>
              <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">
                {isDoctor ? 'Practice' : 'My'} <GradientText gradient="primary">Settings</GradientText>
              </h1>
            </div>
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-glow-cyan">
              <User className="h-7 w-7" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Emergency Toggle (Doctor Only) */}
            {isDoctor && (
              <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${
                formData.is_emergency ? 'bg-red-500/5 border-red-500/30 shadow-glow-red' : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)]'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl transition-all ${formData.is_emergency ? 'bg-red-500 text-white shadow-glow-red' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${formData.is_emergency ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>Emergency Response</h3>
                    <p className="text-xs text-[var(--text-muted)]">Appear in Priority Emergency list</p>
                  </div>
                </div>
                <button type="button" onClick={handleEmergencyToggle}
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${formData.is_emergency ? 'bg-red-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-primary)]'}`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${formData.is_emergency ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            )}

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ProfileField label="Full Name" name="full_name" icon={<User className="h-4 w-4" />} value={formData.full_name} onClick={() => setActiveField({ label: 'Full Name', name: 'full_name', icon: <User className="h-5 w-5" />, type: 'text' })} />
              <ProfileField label="Email" name="email" icon={<Mail className="h-4 w-4" />} value={formData.email} readOnly />
              <ProfileField label="Phone" name="phone_number" icon={<Phone className="h-4 w-4" />} value={formData.phone_number} onClick={() => setActiveField({ label: 'Phone', name: 'phone_number', icon: <Phone className="h-5 w-5" />, type: 'tel' })} />
            </div>

            <hr className="border-[var(--border-subtle)]" />

            {/* Doctor Fields */}
            {isDoctor && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">Specialization</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                      <select name="specialization" value={formData.specialization} onChange={handleChange}
                        className="glass-input w-full pl-11 pr-10 appearance-none cursor-pointer">
                        <option value="">Select Specialty</option>
                        {["General Physician", "Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Psychiatrist", "Orthopedic Surgeon", "Gynecologist", "Ophthalmologist"].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
                    </div>
                  </div>
                  <ProfileField label="Consultation Fee (₹)" name="consultation_fee" icon={<IndianRupee className="h-4 w-4" />} value={formData.consultation_fee} onClick={() => setActiveField({ label: 'Consultation Fee', name: 'consultation_fee', icon: <IndianRupee className="h-5 w-5" />, type: 'number' })} />
                </div>

                {/* Schedule Builder */}
                <div className="p-5 rounded-2xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  <label className="text-sm font-bold flex items-center gap-2 mb-4 text-cyan-500">
                    <Clock className="h-4 w-4" /> Practice Hours Builder
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['startDay', 'endDay'].map(field => (
                      <select key={field} value={schedule[field]} onChange={(e) => handleScheduleChange(field, e.target.value)} className="glass-input text-sm">
                        {days.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ))}
                    <input type="time" value={schedule.startTime} onChange={(e) => handleScheduleChange('startTime', e.target.value)} className="glass-input text-sm" />
                    <input type="time" value={schedule.endTime} onChange={(e) => handleScheduleChange('endTime', e.target.value)} className="glass-input text-sm" />
                  </div>
                  <div className="mt-3 p-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-cyan-500 bg-cyan-500/5 border border-cyan-500/10">
                    Preview: {formData.availability || "Not Configured"}
                  </div>
                </div>
              </div>
            )}

            {/* Patient Fields */}
            {!isDoctor && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <ProfileField label="Date of Birth" name="dob" icon={<Calendar className="h-4 w-4" />} value={formData.dob} onClick={() => setActiveField({ label: 'Date of Birth', name: 'dob', icon: <Calendar className="h-5 w-5" />, type: 'date' })} />
                <ProfileField label="Address" name="address" icon={<MapPin className="h-4 w-4" />} value={formData.address} onClick={() => setActiveField({ label: 'Address', name: 'address', icon: <MapPin className="h-5 w-5" />, type: 'text' })} />
              </div>
            )}

            {/* Submit */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
              className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 gradient-primary text-white shadow-glow-cyan">
              <Save className="h-5 w-5" /> Save Changes
            </motion.button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

const ProfileField = ({ label, icon, value, readOnly, onClick }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] ml-1">{label}</label>
    <div className={`relative ${!readOnly ? 'cursor-pointer group' : ''}`} onClick={!readOnly ? onClick : undefined}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-cyan-500 transition-colors">{icon}</div>
      <input value={value || ''} readOnly placeholder={`No ${label.toLowerCase()} set`}
        className={`glass-input w-full pl-11 pr-4 pointer-events-none ${readOnly ? 'opacity-50' : ''}`} />
    </div>
  </div>
);

export default Profile;