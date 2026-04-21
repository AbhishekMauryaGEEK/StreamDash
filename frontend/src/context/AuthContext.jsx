import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkLoggedIn = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users/current-user");
      // Extract user object regardless of how backend nests it
      const userData = res.data?.data?.user || res.data?.data || res.data;

      if (userData && (userData._id || userData.id)) {
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    setUser(null);
    // Hard clear everything
    localStorage.clear(); 
    // The actual redirect happens in the component or via a window reload
  };
  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, checkLoggedIn,logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
