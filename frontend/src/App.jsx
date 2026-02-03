import { Routes, Route, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

// Page Components
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import Profile from './pages/Profile';
import MyAppointments from './pages/MyAppointments';
import Subscribe from './pages/Subscribe';
import PaymentSuccess from './pages/PaymentSuccess';
import PremiumPerks from './pages/PremiumPerks';

const AppContent = () => {
  const location = useLocation();
  const { theme } = useContext(AuthContext);
  const isPremium = theme === 'premium';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isPremium ? 'bg-slate-950' : 'bg-white'}`}>
      <Navbar />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/premium-perks" element={<PremiumPerks />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
      {/* No <Router> here anymore! */}
      <AppContent />
    </>
  );
}

export default App;