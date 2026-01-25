import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_API_URL;
  
  // Theme strictly handles visual preference (dark/light)
  const [theme, setTheme] = useState(localStorage.getItem('theme_mode') || 'dark');

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme_mode', newTheme);
  };

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
      const res = await axios.get(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const normalizedData = normalizeUserData(res.data);

      localStorage.setItem("user", JSON.stringify(normalizedData));
      setUser({ token, ...normalizedData });
      
      // Removed the logic that overwrote 'theme' with 'premium'
      // The Premium status is now rightfully read from 'normalizedData.is_premium'
    } catch (err) {
      console.error("Failed to sync user data", err);
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  // --- 2. INITIALIZATION ---
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
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
    return res.data;
  };

  // --- 4. LOGOUT FUNCTION ---
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Optional: Reset to dark on logout if desired, or keep user preference
    // setTheme('dark'); 
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const mergedData = { ...prevUser, ...updatedData };
      const newUser = normalizeUserData(mergedData);
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      theme,
      toggleTheme,
      setTheme,
      login,
      logout,
      updateUser,
      refreshUser,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};