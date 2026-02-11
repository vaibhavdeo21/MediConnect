import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, FileText, Printer } from 'lucide-react';
import { toast } from 'react-toastify';

const PrescriptionModal = ({ isOpen, onClose, appointment, userRole }) => {
  const [medicines, setMedicines] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL;

  // 1. Load Prescription Data when Modal Opens
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
            // If patient, always view only. If doctor, view only if they didn't just click "edit"
            if (userRole === 'patient') setViewOnly(true);
          }
        } catch (err) {
          // No prescription found yet, that's fine for doctors (they will create one)
          setMedicines('');
          setInstructions('');
          if (userRole === 'patient') setViewOnly(true); // Should not happen if logic is correct
        }
      };
      fetchPrescription();
    }
  }, [isOpen, appointment, backendUrl, userRole]);

  // 2. Save Prescription (Doctor Only)
  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/prescriptions`,
        { 
          appointmentId: appointment.id,
          medicines,
          instructions
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Prescription Saved!");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-400" />
            <h2 className="text-lg font-bold">Medical Prescription</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Patient Details Header */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-500 text-xs uppercase font-semibold">Patient</p>
              <p className="font-bold text-slate-900">{appointment.patient_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-semibold">Date</p>
              <p className="font-bold text-slate-900">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 text-xs uppercase font-semibold">Doctor</p>
              <p className="font-bold text-slate-900">
                {userRole === 'doctor' ? 'You' : appointment.doctor_name}
              </p>
            </div>
          </div>

          {/* Medicines Field */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Medicines / Rx</label>
            {userRole === 'doctor' ? (
              <textarea 
                className="w-full border-2 border-slate-200 rounded-lg p-3 focus:border-primary outline-none min-h-[100px]"
                placeholder="e.g. Paracetamol 500mg - Twice a day (After food)"
                value={medicines}
                onChange={(e) => setMedicines(e.target.value)}
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-slate-800 whitespace-pre-wrap">
                {medicines || "No medicines prescribed yet."}
              </div>
            )}
          </div>

          {/* Instructions Field */}
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Instructions / Advice</label>
            {userRole === 'doctor' ? (
              <textarea 
                className="w-full border-2 border-slate-200 rounded-lg p-3 focus:border-primary outline-none min-h-[80px]"
                placeholder="e.g. Drink plenty of water, rest for 2 days."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-600 whitespace-pre-wrap">
                {instructions || "No specific instructions."}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          
          {userRole === 'patient' && (
             <button 
               onClick={() => window.print()} 
               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium"
             >
               <Printer className="h-4 w-4" /> Print
             </button>
          )}

          {userRole === 'doctor' && (
            <button 
              onClick={handleSave} 
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-70"
            >
              <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Prescription"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PrescriptionModal;