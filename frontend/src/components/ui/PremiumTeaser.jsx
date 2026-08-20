import React from 'react';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PremiumTeaser = ({ title, description, icon: Icon, className = '' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden rounded-2xl glass-card premium-border group ${className}`}
  >
    {/* Blurred Backdrop */}
    <div className="absolute inset-0 bg-[var(--bg-secondary)] opacity-80 backdrop-blur-sm z-0 transition-all duration-300 group-hover:backdrop-blur-md group-hover:opacity-70" />

    {/* Content Container */}
    <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center h-full">
      
      {/* Icon with Golden Glow */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full premium-glow" />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg">
          <Lock className="w-8 h-8" />
        </div>
      </div>

      {/* Feature Title & Description */}
      <h3 className="text-xl font-bold mb-2 premium-gradient-text flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-amber-500" />}
        {title}
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
        {description}
      </p>

      {/* CTA Button */}
      <Link to="/subscribe">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Crown className="w-4 h-4" />
          Upgrade to Premium
          <ArrowRight className="w-4 h-4 ml-1" />
        </motion.button>
      </Link>
    </div>

    {/* Crown Decorations */}
    <Crown className="absolute -top-4 -right-4 w-24 h-24 text-amber-500/10 -rotate-12 pointer-events-none" />
    <Crown className="absolute -bottom-6 -left-6 w-32 h-32 text-amber-500/10 rotate-12 pointer-events-none" />
  </motion.div>
);

export default PremiumTeaser;
