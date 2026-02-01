import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';      
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => <div className="p-20 text-center text-2xl">Dashboard Coming Soon...</div>;

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </AuthProvider>
  );
}

export default App;