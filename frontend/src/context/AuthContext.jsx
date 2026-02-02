import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read the URL from .env
  const backendUrl = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      // Ensure we parse the user correctly
      setUser({ token, ...JSON.parse(savedUser) });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post(`${backendUrl}/api/auth/register`, userData);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ token: res.data.token, ...res.data.user });
  };

  const googleLogin = async (credentialResponse, role) => {
    console.log("AuthContext Sending Role:", role); 

    const res = await axios.post(`${backendUrl}/api/auth/google`, {
      token: credentialResponse.credential,
      role: role || 'patient'
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // --- NEW FUNCTION: The Missing Piece ---
  const updateUser = (updatedData) => {
    setUser((prevUser) => {
      if (!prevUser) return null; // Safety check
      
      // 1. Merge existing user data with the new updates
      const newUser = { ...prevUser, ...updatedData };
      
      // 2. Save to LocalStorage (so it persists on refresh)
      // Note: We don't save the token inside the 'user' key in localStorage, usually just the details
      // But based on your code structure, this is safe:
      localStorage.setItem("user", JSON.stringify(newUser));
      
      // 3. Update State
      return newUser;
    });
  };

  return (
    // Add 'updateUser' to the value object below
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};