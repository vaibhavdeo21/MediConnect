import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme State
  const [theme, setTheme] = useState('normal'); // 'normal' or 'premium'

  const backendUrl = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser({ token, ...parsedUser });
      // Set Theme based on persisted user data
      if (parsedUser.is_premium) setTheme('premium');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    
    setUser({ token: res.data.token, ...res.data.user });
    
    // Update Theme immediately
    if (res.data.user.is_premium) setTheme('premium');
    
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${backendUrl}/api/auth/register`, userData);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ token: res.data.token, ...res.data.user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTheme('normal'); // Reset theme
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      const newUser = { ...prevUser, ...updatedData };
      localStorage.setItem("user", JSON.stringify(newUser));
      if (newUser.is_premium) setTheme('premium');
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, theme, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};