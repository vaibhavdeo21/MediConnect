import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import ForgotPassword from './pages/ForgotPassword';
import Departments from './pages/Departments';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import WalletPage from './pages/Wallet';

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { user, theme } = useContext(AuthContext);
  const isPremium = theme === 'premium';
  const isDoctor = user?.role === 'doctor';

  // Restoration of the background logic: Doctor OR Premium gets dark mode
  const getGlobalBg = () => {
    if (isDoctor || isPremium) return "bg-slate-950";
    return "bg-white";
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${getGlobalBg()}`}>
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes (Logged-in Only) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/activity" element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          } />

          <Route path="/departments" element={
            <ProtectedRoute>
              <Departments />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/my-appointments" element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          } />

          <Route path="/wallet" element={
            <ProtectedRoute>
              <WalletPage />
            </ProtectedRoute>
          } />
          
          <Route path="/subscribe" element={
            <ProtectedRoute>
              <Subscribe />
            </ProtectedRoute>
          } />

          {/* Misc Routes - Restored Payment and Perks */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/premium-perks" element={<PremiumPerks />} />

          {/* Catch-all: Redirect unknown URLs to Home */}
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
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppContent />
    </>
  );
}

export default App;