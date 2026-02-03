import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, Calendar, LogOut, ChevronDown, Crown, Sparkles, LayoutGrid, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout, theme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); 
  const [showProfileMenu, setShowProfileMenu] = useState(false); 
  const dropdownRef = useRef(null);

  const isPremium = theme === 'premium';
  const isDoctor = user?.role === 'doctor';

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme Logic: Doctor OR Premium gets the dark background
  const navClass = (isDoctor || isPremium) 
    ? "bg-slate-950 border-b border-white/5 shadow-2xl" 
    : "bg-white shadow-md border-b border-slate-100";

  const logoClass = isDoctor ? "text-cyan-400" : isPremium ? "text-yellow-500" : "text-primary";
  const linkClass = (isDoctor || isPremium) ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-primary";
  const dropdownClass = (isDoctor || isPremium) ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-100 text-slate-900";

  return (
    <nav className={`${navClass} sticky top-0 z-[100] transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-serif font-bold ${logoClass} flex items-center gap-2 tracking-tight`}>
              <span className={`${isDoctor ? 'bg-cyan-500' : isPremium ? 'bg-yellow-500' : 'bg-primary text-white'} px-2 py-0.5 rounded shadow-lg text-slate-950`}>MC</span> 
              MediConnect
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {/* Logic: Hide Home if user is logged in */}
            {!user && <Link to="/" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors`}>Home</Link>}
            
            {user ? (
              <div className="flex items-center gap-6">
                <Link to="/dashboard" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors`}>Dashboard</Link>
                
                {isDoctor ? (
                  <>
                    <Link to="/my-appointments" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors flex items-center gap-2`}>
                      <Calendar className="h-4 w-4 text-cyan-400" /> Schedule
                    </Link>
                    <Link to="/wallet" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors flex items-center gap-2`}>
                      <Wallet className="h-4 w-4 text-cyan-400" /> Earnings
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/doctors" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors`}>Find Doctors</Link>
                    <Link to="/departments" className={`${linkClass} font-bold text-sm uppercase tracking-widest transition-colors flex items-center gap-2`}>
                      <LayoutGrid className="h-4 w-4" /> Departments
                    </Link>
                  </>
                )}

                {/* Premium Perks (Only for Premium Patients) */}
                {isPremium && !isDoctor && (
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
                    <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={`flex items-center gap-3 font-bold text-sm transition focus:outline-none ${isDoctor || isPremium ? 'text-white' : 'text-slate-700 hover:text-primary'}`}>
                      <div className={`p-2 rounded-full border-2 ${isDoctor ? 'bg-cyan-500/10 border-cyan-500/50' : isPremium ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-slate-100 border-transparent'}`}>
                          <User className={`h-5 w-5 ${isDoctor ? 'text-cyan-400' : isPremium ? 'text-yellow-500' : 'text-slate-500'}`} />
                      </div>
                      <span className="hidden lg:block">Hi, {user.fullName?.split(' ')[0]}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={`absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl border py-3 ${dropdownClass}`}>
                            <div className={`px-5 py-3 border-b mb-2 ${isDoctor ? 'border-cyan-500/10' : isPremium ? 'border-yellow-500/10' : 'border-slate-100'}`}>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Authorized Access</p>
                                <p className="text-sm font-serif font-bold truncate">{user.email}</p>
                            </div>
                            <DropdownItem to="/profile" icon={<User className="h-4 w-4" />} label="My Profile" onClick={() => setShowProfileMenu(false)} isDark={isDoctor || isPremium} />
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
                <Link to="/doctors" className={`${linkClass} font-bold text-sm uppercase tracking-widest`}>Find Doctors</Link>
                <Link to="/login" className={`${linkClass} font-bold text-sm uppercase tracking-widest`}>Login</Link>
                <Link to="/register" className={`${isPremium ? 'bg-yellow-500 text-slate-950 shadow-yellow-500/20' : 'bg-primary text-white shadow-teal-500/30'} px-6 py-2.5 rounded-full font-bold text-sm transition shadow-lg`}>Sign Up</Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={isDoctor ? 'text-cyan-400' : isPremium ? 'text-yellow-500' : 'text-slate-600'}>
              {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className={`md:hidden border-t py-6 px-6 space-y-6 shadow-2xl overflow-hidden ${isDoctor || isPremium ? 'bg-slate-900 border-white/5' : 'bg-white'}`}>
            {!user && <Link to="/" className={`block font-bold text-sm uppercase tracking-widest ${linkClass}`} onClick={() => setIsOpen(false)}>Home</Link>}
            
            {user ? (
                <div className={`pt-6 border-t ${isDoctor ? 'border-cyan-500/10' : isPremium ? 'border-yellow-500/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-4 mb-6 text-left">
                        <div className={`p-3 rounded-full ${isDoctor ? 'bg-cyan-500/20' : isPremium ? 'bg-yellow-500/20' : 'bg-primary/10'}`}>
                            <User className={`h-6 w-6 ${isDoctor ? 'text-cyan-400' : isPremium ? 'text-yellow-500' : 'text-primary'}`} />
                        </div>
                        <div>
                            <p className={`font-serif font-bold ${isDoctor || isPremium ? 'text-white' : 'text-slate-900'}`}>{user.fullName}</p>
                            <p className={`text-xs text-slate-500`}>{user.email}</p>
                        </div>
                    </div>
                    <div className="space-y-4 text-left">
                        <Link to="/dashboard" className={`flex items-center gap-3 font-bold text-sm ${linkClass}`} onClick={() => setIsOpen(false)}><LayoutGrid className="h-4 w-4" /> Dashboard</Link>
                        
                        {!isDoctor && <Link to="/departments" className={`flex items-center gap-3 font-bold text-sm ${linkClass}`} onClick={() => setIsOpen(false)}><LayoutGrid className="h-4 w-4" /> Departments</Link>}
                        
                        <Link to="/profile" className={`flex items-center gap-3 font-bold text-sm ${linkClass}`} onClick={() => setIsOpen(false)}><User className="h-4 w-4" /> Profile</Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 font-bold text-sm text-red-500 pt-2"><LogOut className="h-4 w-4" /> Sign Out</button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/doctors" className={`block font-bold text-sm uppercase tracking-widest ${linkClass}`} onClick={() => setIsOpen(false)}>Find Doctors</Link>
                  <Link to="/login" className="text-center py-3 rounded-xl font-bold border border-slate-200 text-slate-700" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/register" className="text-center py-3 rounded-xl font-bold shadow-lg bg-primary text-white" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
            )}
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DropdownItem = ({ to, icon, label, onClick, isDark }) => (
    <Link to={to} onClick={onClick} className={`flex items-center gap-3 px-5 py-3 text-sm font-bold transition-colors ${isDark ? 'hover:bg-white/5 text-slate-300 hover:text-white' : 'hover:bg-slate-50 text-slate-700 hover:text-primary'}`}>
      {icon} {label}
    </Link>
);

export default Navbar;