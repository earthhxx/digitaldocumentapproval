"use client";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

export interface User {
  userId: string;
  fullName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const router = useRouter();

  const logout = () => {
    document.cookie = "auth_token=; path=/; max-age=0"; // ลบ cookie
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
