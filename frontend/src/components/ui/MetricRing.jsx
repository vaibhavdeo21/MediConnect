import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  cyan: { stroke: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
  purple: { stroke: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
  green: { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
  red: { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  amber: { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
};

const MetricRing = ({
  value = 0,
  size = 80,
  strokeWidth = 6,
  color = 'cyan',
  label = '',
  className = '',
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const rafRef = useRef(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const colors = colorMap[color] || colorMap.cyan;

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setAnimatedValue(value * easeOutCubic(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-primary)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              filter: `drop-shadow(0 0 6px ${colors.bg})`,
              transition: 'stroke-dashoffset 0.1s ease',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold font-mono-code text-[var(--text-primary)]">
            {Math.round(animatedValue)}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </span>
      )}
    </div>
  );
};

export default MetricRing;
