import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('normal'); 

  const backendUrl = import.meta.env.VITE_API_URL;

  // Helper to normalize user data (maps snake_case from DB to camelCase for Frontend)
  const normalizeUserData = (data) => {
    return {
      ...data,
      fullName: data.full_name || data.fullName || 'User'
    };
  };

  // Function to pull freshest data from the server
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const normalizedData = normalizeUserData(res.data);
      
      // Update states and storage
      localStorage.setItem("user", JSON.stringify(normalizedData));
      setUser({ token, ...normalizedData });
      
      if (normalizedData.is_premium) {
        setTheme('premium');
      } else {
        setTheme('normal');
      }
    } catch (err) {
      console.error("Failed to sync user data with server", err);
    }
  }, [backendUrl]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser({ token, ...parsedUser });
          if (parsedUser.is_premium) setTheme('premium');
          
          // Verify status with server in the background
          await refreshUser();
        } catch (e) {
          console.error("Error parsing saved user");
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [refreshUser]);

  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    const normalizedUser = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    
    setUser({ token: res.data.token, ...normalizedUser });
    if (normalizedUser.is_premium) setTheme('premium');
    
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${backendUrl}/api/auth/register`, userData);
    const normalizedUser = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    
    setUser({ token: res.data.token, ...normalizedUser });
    if (normalizedUser.is_premium) setTheme('premium');
  };

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
      register, 
      logout, 
      updateUser, 
      refreshUser,
      loading 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};