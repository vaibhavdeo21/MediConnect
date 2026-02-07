import { useState } from 'react';
import axios from 'axios';
import { X, Star } from 'lucide-react';
import { toast } from 'react-toastify';

const ReviewModal = ({ isOpen, onClose, doctorId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0); // For star hover effect
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    if (rating === 0) return toast.warning("Please select a star rating");
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${backendUrl}/api/doctors/review`,
        { doctorId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review Submitted!");
      onSuccess(); // Callback to refresh parent
      onClose();
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="text-lg font-bold">Rate Your Experience</h3>
          <button onClick={onClose}><X className="h-6 w-6" /></button>
        </div>

        <div className="p-6">
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(rating)}
              >
                <Star 
                  className={`h-8 w-8 ${star <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                />
              </button>
            ))}
          </div>

          <textarea
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            rows="4"
            placeholder="Write your review here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          ></textarea>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 bg-primary text-white py-2 rounded-lg font-bold hover:bg-teal-700 transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;