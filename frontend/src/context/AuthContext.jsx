import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const backendUrl = import.meta.env.VITE_API_URL; 

  useEffect(() => {
    // Check if we have a token AND saved user data
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      setUser({ token, ...JSON.parse(savedUser) });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // 2. USE IT HERE (Template Literal)
    const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser({ token: res.data.token, ...res.data.user });
    return res.data;
  };

  const register = async (userData) => {
    // 3. USE IT HERE TOO
    const res = await axios.post(`${backendUrl}/api/auth/register`, userData);
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
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