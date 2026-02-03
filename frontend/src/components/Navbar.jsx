import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, Calendar, LogOut, ChevronDown, Crown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Desktop Profile Dropdown
  const dropdownRef = useRef(null);

  const isPremium = theme === 'premium';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Dynamic Theme Styles ---
  const navClass = isPremium 
    ? "bg-slate-950 border-b border-yellow-500/20 shadow-[0_4px_20px_rgba(251,191,36,0.1)]" 
    : "bg-white shadow-md border-b border-slate-100";

  const logoClass = isPremium ? "text-yellow-500" : "text-primary";
  const linkClass = isPremium ? "text-slate-300 hover:text-yellow-400" : "text-slate-600 hover:text-primary";
  const dropdownClass = isPremium ? "bg-slate-900 border-yellow-500/20 text-yellow-50" : "bg-white border-slate-100 text-slate-900";

  return (
    <nav className={`${navClass} sticky top-0 z-[100] transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-serif font-bold ${logoClass} flex items-center gap-2 tracking-tight`}>
              <span className={`${isPremium ? 'bg-yellow-500 text-slate-950' : 'bg-primary text-white'} px-2 py-0.5 rounded shadow-lg`}>MC</span> 
              MediConnect
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors`}>Home</Link>
            <Link to="/doctors" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors`}>Find Doctors</Link>
            
            {user ? (
              <div className="flex items-center gap-6">
                {/* Premium Perks Link (Only for Premium Users) */}
                {isPremium && (
                    <Link to="/premium-perks" className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-tighter bg-yellow-500/10 px-3 py-1.5 rounded-full border border-yellow-500/20 animate-pulse">
                        <Sparkles className="h-3 w-3" /> Elite Perks
                    </Link>
                )}

                {/* Upgrade Button (Only for Normal Patients) */}
                {!isPremium && user.role === 'patient' && (
                    <Link to="/subscribe" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition shadow-lg">
                        <Crown className="h-4 w-4 text-yellow-400" /> Upgrade
                    </Link>
                )}

                <div className="relative" ref={dropdownRef}>
                    <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className={`flex items-center gap-3 font-bold text-sm transition focus:outline-none ${isPremium ? 'text-yellow-50' : 'text-slate-700 hover:text-primary'}`}
                    >
                    <div className={`p-2 rounded-full border-2 ${isPremium ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-100 border-transparent'}`}>
                        <User className={`h-5 w-5 ${isPremium ? 'text-yellow-500' : 'text-slate-500'}`} />
                    </div>
                    <span className="hidden lg:block">Hi, {user.fullName || "User"}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {showProfileMenu && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border py-3 ${dropdownClass}`}
                        >
                            <div className={`px-5 py-3 border-b mb-2 ${isPremium ? 'border-yellow-500/10' : 'border-slate-100'}`}>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Authorized Access</p>
                                <p className="text-sm font-serif font-bold truncate">{user.email}</p>
                            </div>
                            
                            <DropdownItem to="/profile" icon={<User className="h-4 w-4" />} label="My Profile" onClick={() => setShowProfileMenu(false)} isPremium={isPremium} />
                            <DropdownItem to="/my-appointments" icon={<Calendar className="h-4 w-4" />} label="Schedule" onClick={() => setShowProfileMenu(false)} isPremium={isPremium} />
                            
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-500/5 transition-colors mt-2">
                                <LogOut className="h-4 w-4" /> Sign Out
                            </button>
                        </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <Link to="/login" className={`${linkClass} font-bold text-sm uppercase tracking-widest`}>Login</Link>
                <Link to="/register" className={`${isPremium ? 'bg-yellow-500 text-slate-950 shadow-yellow-500/20' : 'bg-primary text-white shadow-teal-500/30'} px-6 py-2.5 rounded-full font-bold text-sm transition shadow-lg`}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={isPremium ? 'text-yellow-500' : 'text-slate-600'}>
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`md:hidden border-t py-6 px-6 space-y-6 shadow-2xl overflow-hidden ${isPremium ? 'bg-slate-900 border-yellow-500/10' : 'bg-white border-slate-100'}`}
            >
            <Link to="/" className={`block font-bold text-sm uppercase tracking-widest ${linkClass}`} onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/doctors" className={`block font-bold text-sm uppercase tracking-widest ${linkClass}`} onClick={() => setIsOpen(false)}>Find Doctors</Link>
            
            {user ? (
                <div className={`pt-6 border-t ${isPremium ? 'border-yellow-500/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4 mb-6">
                        <div className={`p-3 rounded-full ${isPremium ? 'bg-yellow-500/20' : 'bg-primary/10'}`}>
                            <User className={`h-6 w-6 ${isPremium ? 'text-yellow-500' : 'text-primary'}`} />
                        </div>
                        <div>
                            <p className={`font-serif font-bold ${isPremium ? 'text-white' : 'text-slate-900'}`}>{user.fullName}</p>
                            <p className={`text-xs ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <Link to="/profile" className={`flex items-center gap-3 font-bold text-sm ${linkClass}`} onClick={() => setIsOpen(false)}><User className="h-4 w-4" /> Profile</Link>
                        <Link to="/my-appointments" className={`flex items-center gap-3 font-bold text-sm ${linkClass}`} onClick={() => setIsOpen(false)}><Calendar className="h-4 w-4" /> Appointments</Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 font-bold text-sm text-red-500 pt-2"><LogOut className="h-4 w-4" /> Sign Out</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                <Link to="/login" className={`text-center py-3 rounded-xl font-bold border ${isPremium ? 'border-yellow-500/30 text-yellow-500' : 'border-slate-200 text-slate-700'}`} onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className={`text-center py-3 rounded-xl font-bold shadow-lg ${isPremium ? 'bg-yellow-500 text-slate-950' : 'bg-primary text-white'}`} onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
            )}
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// Sub-component for Dropdown Items to keep luxury look
const DropdownItem = ({ to, icon, label, onClick, isPremium }) => (
    <Link 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors ${isPremium ? 'hover:bg-yellow-500/5 text-slate-300 hover:text-yellow-400' : 'hover:bg-slate-50 text-slate-700 hover:text-primary'}`}
    >
      {icon} {label}
    </Link>
);

export default Navbar;