import { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, Calendar, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Desktop Profile Dropdown
  const dropdownRef = useRef(null);

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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded">MC</span> MediConnect
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary font-medium">Home</Link>
            <Link to="/doctors" className="text-slate-600 hover:text-primary font-medium">Find Doctors</Link>
            
            {user ? (
              <div className="relative ml-4" ref={dropdownRef}>
                {/* User Toggle Button */}
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 text-slate-700 font-medium hover:text-primary transition focus:outline-none"
                >
                  <div className="bg-slate-100 p-2 rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <span>Hi, {user.fullName || "User"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-xs text-slate-500 uppercase font-bold">Account</p>
                        <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                    >
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    
                    <Link 
                      to="/my-appointments" 
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary"
                    >
                      <Calendar className="h-4 w-4" /> My Appointments
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 mt-1"
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium">Login</Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition shadow-lg shadow-teal-500/30">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-primary">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4 shadow-lg">
          <Link to="/" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/doctors" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Find Doctors</Link>
          
          {user ? (
            <div className="border-t border-slate-100 pt-4 mt-2 space-y-3">
               <div className="flex items-center gap-3 mb-2">
                 <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <User className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="font-semibold text-slate-900">{user.fullName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                 </div>
               </div>
               
               <Link to="/profile" className="flex items-center gap-2 text-slate-600" onClick={() => setIsOpen(false)}>
                  <User className="h-4 w-4" /> Edit Profile
               </Link>
               
               <Link to="/my-appointments" className="flex items-center gap-2 text-slate-600" onClick={() => setIsOpen(false)}>
                  <Calendar className="h-4 w-4" /> My Appointments
               </Link>

               <button 
                onClick={handleLogout}
                className="w-full text-left text-red-600 font-medium pt-2 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
              <Link to="/login" className="text-center w-full py-2 border border-slate-200 rounded-lg font-medium" onClick={() => setIsOpen(false)}>Login</Link>
              <Link to="/register" className="text-center w-full py-2 bg-primary text-white rounded-lg font-medium" onClick={() => setIsOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;