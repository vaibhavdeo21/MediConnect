import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('normal'); 

  const backendUrl = import.meta.env.VITE_API_URL;

  const normalizeUserData = (data) => {
    return {
      ...data,
      fullName: data.full_name || data.fullName || 'User'
    };
  };

  // --- 1. REFRESH USER (Server Sync) ---
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Ensure your backend server.js has app.use('/api/users', userRoutes)
      const res = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const normalizedData = normalizeUserData(res.data);
      
      localStorage.setItem("user", JSON.stringify(normalizedData));
      setUser({ token, ...normalizedData });
      
      if (normalizedData.is_premium || normalizedData.role === 'doctor') {
        setTheme('premium');
      } else {
        setTheme('normal');
      }
    } catch (err) {
      console.error("Failed to sync user data", err);
      // If token is invalid (401), clear it
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // --- 2. INITIALIZATION (The Fix) ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      
      // FIX: If we have a token, we MUST try to fetch the user, 
      // even if 'savedUser' is missing from localStorage.
      if (token) {
        await refreshUser();
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshUser]);

  // --- 3. LOGIN FUNCTION ---
  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    const normalizedUser = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    
    setUser({ token: res.data.token, ...normalizedUser });
    if (normalizedUser.is_premium) setTheme('premium');
    
    return res.data;
  };

  // --- 4. LOGOUT FUNCTION ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTheme('normal');
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = normalizeUserData({ ...prevUser, ...updatedData });
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.is_premium) setTheme('premium');
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      theme, 
      setTheme, 
      login, 
      logout, 
      updateUser, 
      refreshUser, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};