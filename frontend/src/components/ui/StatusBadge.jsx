import { motion } from 'framer-motion';

const statusConfig = {
  Pending: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    dot: 'bg-amber-500',
    defaultPulse: true,
  },
  Confirmed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    defaultPulse: false,
  },
  Cancelled: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    defaultPulse: false,
  },
  Completed: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-500',
    dot: 'bg-cyan-500',
    defaultPulse: false,
  },
  Expired: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    dot: 'bg-red-500',
    defaultPulse: false,
  },
  Emergency: {
    bg: 'bg-red-500/15',
    text: 'text-red-500',
    dot: 'bg-red-500',
    defaultPulse: true,
    glow: true,
  },
  Online: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    dot: 'bg-emerald-500',
    defaultPulse: true,
  },
  Offline: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    defaultPulse: false,
  },
};

const sizes = {
  sm: { badge: 'px-2 py-0.5 text-[10px]', dot: 'w-1.5 h-1.5' },
  md: { badge: 'px-3 py-1 text-xs', dot: 'w-2 h-2' },
};

const StatusBadge = ({ status, size = 'md', pulse, className = '' }) => {
  const config = statusConfig[status] || statusConfig.Pending;
  const sizeConfig = sizes[size] || sizes.md;
  const showPulse = pulse !== undefined ? pulse : config.defaultPulse;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full
        ${config.bg} ${config.text} ${sizeConfig.badge}
        ${config.glow ? 'shadow-glow-red' : ''}
        ${className}
      `}
    >
      <span className={`${sizeConfig.dot} rounded-full ${config.dot} ${showPulse ? 'animate-pulse' : ''}`} />
      {status}
    </motion.span>
  );
};

export default StatusBadge;
