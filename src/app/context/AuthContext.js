'use client';
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/verifyToken', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAuth(true);
        setUser(data.user);
      } else {
        setAuth(false);
        setUser(null);
      }
    } catch (err) {
      setAuth(false);
      setUser(null);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, user, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
