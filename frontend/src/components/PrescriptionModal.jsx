import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, FileText, Printer, Loader2, Pill, Stethoscope } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Modal from './ui/Modal';

const PrescriptionModal = ({ isOpen, onClose, appointment, userRole }) => {
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen && appointment) {
      const fetchPrescription = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${backendUrl}/api/prescriptions/${appointment.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data) {
            setMedicines(res.data.medicines);
            setInstructions(res.data.instructions);
          }
        } catch (err) {
          setMedicines('');
          setInstructions('');
        }
      };
      fetchPrescription();
    }
  }, [isOpen, appointment, backendUrl]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/prescriptions`, 
        { appointmentId: appointment.id, medicines, instructions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Prescription Saved!");
      onClose();
    } catch (err) {
      toast.error("Failed to save");
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Medical Prescription" size="lg">
      <div className="space-y-5">
        {/* Patient Details */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Patient</p>
            <p className="font-semibold text-[var(--text-primary)]">{appointment?.patient_name || "Unknown"}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Date</p>
            <p className="font-semibold text-[var(--text-primary)]">{appointment ? new Date(appointment.appointment_date).toLocaleDateString() : ''}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Doctor</p>
            <p className="font-semibold text-[var(--text-primary)]">{userRole === 'doctor' ? 'You' : appointment?.doctor_name}</p>
          </div>
        </div>

        {/* Medicines */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <Pill className="h-3 w-3 text-emerald-500" /> Medicines / Rx
          </label>
          {userRole === 'doctor' ? (
            <textarea className="glass-input w-full min-h-[100px] resize-none" 
              placeholder="e.g. Paracetamol 500mg - Twice a day (After food)" 
              value={medicines} onChange={(e) => setMedicines(e.target.value)} />
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {medicines || "No medicines prescribed yet."}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <Stethoscope className="h-3 w-3 text-cyan-500" /> Instructions
          </label>
          {userRole === 'doctor' ? (
            <textarea className="glass-input w-full min-h-[80px] resize-none"
              placeholder="e.g. Drink plenty of water, rest for 2 days."
              value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          ) : (
            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
              {instructions || "No specific instructions."}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {userRole === 'patient' && (
            <button onClick={() => window.print()}
              className="flex-1 py-3 rounded-xl font-semibold glass border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] flex items-center justify-center gap-2">
              <Printer className="h-4 w-4" /> Print
            </button>
          )}
          {userRole === 'doctor' && (
            <motion.button whileTap={{ scale: 0.99 }} onClick={handleSave} disabled={loading}
              className="flex-1 py-3 rounded-xl font-semibold gradient-primary text-white shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Save Prescription</>}
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PrescriptionModal;