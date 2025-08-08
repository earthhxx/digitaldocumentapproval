// contexts/AuthContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type AuthData = {
  userId: number;
  username: string;
  role: string;
  permissions: string[];
};

type AuthContextType = {
  user: AuthData | null;
  login: (data: AuthData) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthData | null>(null);

  const login = (data: AuthData) => setUser(data);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
