import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, Calendar } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

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
              <div className="flex items-center gap-6">
                {/* --- NEW LINK: MY APPOINTMENTS --- */}
                <Link 
                  to="/my-appointments" 
                  className="flex items-center gap-2 text-slate-600 hover:text-primary font-medium"
                >
                  <Calendar className="h-4 w-4" /> My Appointments
                </Link>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                  <span className="text-sm font-semibold text-slate-900 capitalize">
                    Hi, {user.fullName || "User"}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 hover:text-red-600 transition"
                  >
                    Logout
                  </button>
                </div>
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
            <>
              <Link 
                to="/my-appointments" 
                className="block text-primary font-bold flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="h-4 w-4" /> My Appointments
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left text-red-600 font-medium pt-2 border-t border-slate-100 mt-2"
              >
                Logout ({user.name})
              </button>
            </>
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