import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_API_URL;
  
  // Theme: dark/light — stored in localStorage, applied via data-theme attribute
  const [theme, setTheme] = useState(localStorage.getItem('theme_mode') || 'dark');

  // Apply theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme_mode', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const normalizeUserData = (data) => {
    return {
      ...data,
      fullName: data.full_name || data.fullName || 'User',
    };
  };

  // Refresh user from server
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

  // Initialize
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

  // Login
  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    const normalizedUser = normalizeUserData(res.data.user);

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser({ token: res.data.token, ...normalizedUser });
    return res.data;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Update user state
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
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};