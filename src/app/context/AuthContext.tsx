"use client";
// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

interface User {
  userId: string;
  fullName: string;
  username?: string; // ใช้ username ถ้าไม่มี fullName
  roles: string[];
}

interface DecodedToken {
  userId: string;
  fullName: string;
  roles: string | string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;  // รับแค่ token
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const isAuthenticated = !!token;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const userData = {
        userId: decoded.userId,
        fullName: decoded.fullName,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles],
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(token);
      setUser(userData);
    } catch {
      // handle error
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
