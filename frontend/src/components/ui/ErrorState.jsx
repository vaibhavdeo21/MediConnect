import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import NeonButton from './NeonButton';
import { clsx } from 'clsx';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className
      )}
    >
      {/* Error icon with red glow */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className={clsx(
          'w-20 h-20 rounded-2xl flex items-center justify-center mb-6',
          'bg-red-500/10 border border-red-500/20',
          'shadow-glow-red'
        )}
      >
        <AlertTriangle
          size={36}
          className="text-red-400"
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Title */}
      <h3 className="text-lg font-display font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {/* Message */}
      <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6 leading-relaxed">
        {message}
      </p>

      {/* Retry button */}
      {onRetry && (
        <NeonButton
          variant="danger"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
        >
          Try Again
        </NeonButton>
      )}
    </motion.div>
  );
}
