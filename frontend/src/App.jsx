import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, motion } from 'framer-motion';

// Layout Components
import Navbar from './components/Navbar';

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

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin" />
        </div>
        <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">
          Initializing...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Page transition wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const location = useLocation();

  // Pages where we hide the Navbar
  const hideNavbar = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-500">
      {!hideNavbar && <Navbar />}

      <main className={!hideNavbar ? 'pt-[var(--nav-height)]' : ''}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/doctors" element={<PageWrapper><Doctors /></PageWrapper>} />
            <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
            <Route path="/departments" element={<PageWrapper><Departments /></PageWrapper>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/activity" element={
              <ProtectedRoute><PageWrapper><ActivityLog /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><PageWrapper><Profile /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/my-appointments" element={
              <ProtectedRoute><PageWrapper><MyAppointments /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute><PageWrapper><WalletPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/subscribe" element={
              <ProtectedRoute><PageWrapper><Subscribe /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/payment-success" element={<PageWrapper><PaymentSuccess /></PageWrapper>} />
            <Route path="/premium-perks" element={<PageWrapper><PremiumPerks /></PageWrapper>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
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
        newestOnTop
        closeOnClick
        pauseOnHover
      />
      <AppContent />
    </>
  );
}

export default App;