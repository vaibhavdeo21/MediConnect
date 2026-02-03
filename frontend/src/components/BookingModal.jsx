import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const BookingModal = ({ isOpen, onClose, doctor }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);

  const backendUrl = import.meta.env.VITE_API_URL;
  const daysMap = { "Sun": 0, "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6 };

  // --- HELPER: GENERATE 15-MINUTE SLOTS ---
  const generateTimeSlots = (availabilityString) => {
    const defaultStart = "09:00 AM";
    const defaultEnd = "05:00 PM";
    let startStr = defaultStart;
    let endStr = defaultEnd;

    if (availabilityString && availabilityString.includes(',')) {
      const timePart = availabilityString.split(',')[1].trim();
      const times = timePart.split('-');
      if (times.length === 2) {
        startStr = times[0].trim();
        endStr = times[1].trim();
      }
    }

    const parseToMinutes = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const startMinutes = parseToMinutes(startStr);
    const endMinutes = parseToMinutes(endStr);
    const slots = [];
    for (let m = startMinutes; m < endMinutes; m += 15) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      const minStr = min < 10 ? '0' + min : min;
      slots.push(`${hour12}:${minStr} ${ampm}`);
    }
    return slots;
  };

  // --- NEW: CHECK IF SELECTED DATE MATCHES DOCTOR'S DAYS ---
  const checkDayAvailability = (selectedDate) => {
    if (!doctor.availability || !selectedDate) return true;

    // Parse "Mon - Wed, ..."
    const dayPart = doctor.availability.split(',')[0].trim();
    const dayRange = dayPart.split('-').map(d => d.trim());

    if (dayRange.length === 2) {
      const startDayNum = daysMap[dayRange[0]];
      const endDayNum = daysMap[dayRange[1]];
      const selectedDayNum = new Date(selectedDate).getDay();

      // Handle ranges that wrap around Sunday if necessary, 
      // but for Mon-Wed (1 to 3), it checks if selectedDay is between 1 and 3
      if (startDayNum <= endDayNum) {
        return selectedDayNum >= startDayNum && selectedDayNum <= endDayNum;
      } else {
        // Range wraps around week (e.g., Sat - Tue)
        return selectedDayNum >= startDayNum || selectedDayNum <= endDayNum;
      }
    }
    return true;
  };

  useEffect(() => {
    if (doctor) {
      const slots = generateTimeSlots(doctor.availability);
      setTimeSlots(slots);
      setTime(slots[0]);
    }
  }, [doctor]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    
    if (!checkDayAvailability(selectedDate)) {
      toast.error(`Doctor is only available ${doctor.availability.split(',')[0]}`, {
        icon: <AlertCircle className="text-red-500" />
      });
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!checkDayAvailability(date)) {
      return toast.error("Please select a day the doctor is available.");
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/appointments/book`, 
        { doctorId: doctor.id, appointmentDate: date, appointmentTime: time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Appointment Booked Successfully!");
      onClose();
    } catch (err) {
      toast.error("Booking Failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-primary px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-bold">Book Appointment</h3>
            <p className="text-sm opacity-90">Dr. {doctor.full_name}</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition"><X className="h-6 w-6" /></button>
        </div>

        <form onSubmit={handleBooking} className="p-6 space-y-5">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-medium border border-blue-100 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Working Hours: {doctor.availability}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={handleDateChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg outline-none ${!checkDayAvailability(date) ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Select Time Slot</label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <select 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white appearance-none"
                required
              >
                {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !checkDayAvailability(date)}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-primary transition disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? "Processing..." : <><CheckCircle className="h-5 w-5" /> Confirm Booking</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;