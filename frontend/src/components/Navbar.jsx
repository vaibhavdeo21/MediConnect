import { Link } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              MediConnect
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-primary transition font-medium">Home</Link>
            <Link to="/doctors" className="text-slate-600 hover:text-primary transition font-medium">Find Doctors</Link>
            
            {!user ? (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium">Login</Link>
                <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-teal-700 transition shadow-lg shadow-primary/30">
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-slate-700">Hi, {user.email}</span>
                <button onClick={logout} className="text-red-500 font-medium hover:underline">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link to="/" className="block py-2 text-slate-600">Home</Link>
              <Link to="/doctors" className="block py-2 text-slate-600">Find Doctors</Link>
              {!user ? (
                <>
                  <Link to="/login" className="block py-2 text-slate-600">Login</Link>
                  <Link to="/register" className="block py-2 text-primary font-bold">Get Started</Link>
                </>
              ) : (
                 <button onClick={logout} className="block py-2 text-red-500">Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;