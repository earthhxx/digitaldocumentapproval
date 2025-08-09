"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {jwtDecode} from "jwt-decode";

type User = {
  userId: number;
  username: string;
  roles: string[];
  exp?: number; // JWT expiration (optional)
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // โหลด token จาก localStorage ตอนเปิดหน้า
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: User = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Invalid token", error);
        localStorage.removeItem("token");
      }
    }
  }, []);

  // sync state ระหว่างหลายแท็บ
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: User = jwtDecode(token);
          setUser(decoded);
        } catch (error) {
          console.error("Invalid token", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    try {
      const decoded: User = jwtDecode(token);
      setUser(decoded);
    } catch (error) {
      console.error("Invalid token", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
