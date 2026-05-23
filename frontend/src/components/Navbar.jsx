import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Menu, X, LogOut, User, Wallet, Bell,
  Sun, Moon, Calendar, Search, Shield, LayoutDashboard,
  Zap, Crown, Settings, Heart, FileText, ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, theme, toggleTheme, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';
  const isPremium = user?.is_premium;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = user ? (
    isDoctor ? [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/my-appointments', label: 'Appointments', icon: Calendar },
      { to: '/wallet', label: 'Earnings', icon: Wallet },
    ] : isAdmin ? [
      { to: '/dashboard', label: 'Command Center', icon: Shield },
      { to: '/my-appointments', label: 'Appointments', icon: Calendar },
    ] : [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/doctors', label: 'Find Doctors', icon: Search },
      { to: '/my-appointments', label: 'Appointments', icon: Calendar },
      { to: '/wallet', label: 'Wallet', icon: Wallet },
    ]
  ) : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'glass-nav' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[var(--nav-height)]">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow-cyan">
                <Activity className="h-5 w-5 text-white" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold tracking-tight text-[var(--text-primary)]">
                Medi<span className="gradient-text-primary">Connect</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)] -mt-0.5">
                Healthcare OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(link.to)
                      ? 'text-[var(--accent-cyan)] bg-cyan-500/10'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {isActive(link.to) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-secondary)]"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {user && (
              <>
                {/* Premium Badge */}
                {isPremium && (
                  <Link to="/premium-perks" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                    <Crown className="h-3 w-3 fill-amber-500" />
                    Premium
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      profileOpen ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                      isDoctor ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                      : isPremium ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                      : 'bg-gradient-to-br from-cyan-500 to-purple-500'
                    }`}>
                      {user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight truncate max-w-[100px]">
                        {isDoctor ? 'Dr. ' : ''}{user.fullName?.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] capitalize">
                        {user.role}
                      </p>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-[var(--text-muted)] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 glass-card p-2 border border-[var(--border-primary)] shadow-premium"
                      >
                        {/* User Info */}
                        <div className="px-3 py-3 border-b border-[var(--border-subtle)] mb-2">
                          <p className="text-sm font-semibold text-[var(--text-primary)]">
                            {isDoctor ? 'Dr. ' : ''}{user.fullName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                        </div>

                        {/* Links */}
                        <DropdownLink to="/profile" icon={User} label="Profile" />
                        <DropdownLink to="/wallet" icon={Wallet} label={isDoctor ? 'Earnings' : 'Wallet'} />
                        <DropdownLink to="/activity" icon={FileText} label="Activity Log" />
                        {isPremium && <DropdownLink to="/premium-perks" icon={Crown} label="Premium Perks" />}

                        <div className="border-t border-[var(--border-subtle)] my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {!user && (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl text-sm font-semibold gradient-primary text-white shadow-glow-cyan hover:shadow-lg transition-all">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-[var(--border-primary)] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.to) ? 'text-[var(--accent-cyan)] bg-cyan-500/10' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}

              {!user && (
                <>
                  <div className="border-t border-[var(--border-subtle)] my-3" />
                  <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold gradient-primary text-white">
                    Get Started
                  </Link>
                </>
              )}

              {user && (
                <>
                  <div className="border-t border-[var(--border-subtle)] my-3" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DropdownLink = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

export default Navbar;