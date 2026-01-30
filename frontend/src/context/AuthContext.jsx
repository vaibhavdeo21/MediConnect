import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // In a real app, you would validate the token here
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post("/api/auth/register", userData);
    localStorage.setItem("token", res.data.token);
    setUser({ token: res.data.token, ...res.data.user });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};