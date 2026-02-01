import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read the URL from .env (e.g., http://localhost:5000)
  const backendUrl = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
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

  // FIX: Accept 'role' here
  const googleLogin = async (credentialResponse, role) => {
    console.log("AuthContext Sending Role:", role); // Debug Log

    const res = await axios.post(`${backendUrl}/api/auth/google`, {
      token: credentialResponse.credential,
      role: role || 'patient' // Send role to backend
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

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};