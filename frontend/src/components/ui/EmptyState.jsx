import { motion } from 'framer-motion';
import NeonButton from './NeonButton';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  description = '',
  action,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 opacity-80"
        >
          <Icon className="h-10 w-10 text-white" />
        </motion.div>
      )}

      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && (
        <NeonButton onClick={action.onClick} variant="primary" size="md">
          {action.label}
        </NeonButton>
      )}
    </motion.div>
  );
};

export default EmptyState;
