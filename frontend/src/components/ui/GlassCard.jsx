import { motion } from 'framer-motion';

const variantStyles = {
  default: {
    border: 'border-[var(--border-primary)]',
    hoverBorder: 'hover:border-[var(--accent-cyan)]/20',
    glow: 'hover:shadow-glow-cyan',
  },
  cyan: {
    border: 'border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/40',
    glow: 'shadow-glow-cyan',
  },
  purple: {
    border: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40',
    glow: 'shadow-glow-purple',
  },
  amber: {
    border: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    glow: 'shadow-glow-amber',
  },
  red: {
    border: 'border-red-500/20',
    hoverBorder: 'hover:border-red-500/40',
    glow: 'shadow-glow-red',
  },
  green: {
    border: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    glow: 'shadow-glow-green',
  },
};

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const GlassCard = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
  glow = false,
  onClick,
  padding = 'md',
}) => {
  const styles = variantStyles[variant] || variantStyles.default;
  const pad = paddingMap[padding] || paddingMap.md;

  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      whileTap={onClick ? { scale: 0.995 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`
        glass-card ${pad}
        border ${styles.border}
        ${hover ? styles.hoverBorder : ''}
        ${glow ? styles.glow : ''}
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
