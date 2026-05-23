import { useState } from 'react';
import axios from 'axios';
import { Star, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Modal from './ui/Modal';

const ReviewModal = ({ isOpen, onClose, doctorId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async () => {
    if (rating === 0) return toast.warning("Please select a star rating");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${backendUrl}/api/doctors/review`, { doctorId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review Submitted!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to submit review");
    } finally { setLoading(false); }
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Experience" size="sm">
      <div className="space-y-6">
        {/* Stars */}
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button key={star} type="button" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(rating)}>
                <Star className={`h-9 w-9 transition-colors ${
                  star <= (hover || rating) ? 'fill-amber-400 text-amber-400' : 'text-[var(--border-primary)]'
                }`} />
              </motion.button>
            ))}
          </div>
          <p className="text-sm font-semibold text-amber-500 h-5">{labels[hover || rating] || ''}</p>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Your Review</label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-[var(--text-muted)]" />
            <textarea className="glass-input w-full pl-11 pr-4 min-h-[100px] resize-none" rows="4"
              placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
        </div>

        {/* Submit */}
        <motion.button whileTap={{ scale: 0.99 }} onClick={handleSubmit} disabled={loading}
          className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg disabled:opacity-50">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Star className="h-4 w-4 fill-white" /> Submit Review</>}
        </motion.button>
      </div>
    </Modal>
  );
};

export default ReviewModal;