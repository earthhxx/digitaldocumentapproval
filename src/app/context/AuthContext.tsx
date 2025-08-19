"use client";
import { createContext, useContext, useState, useEffect } from "react";
import  { jwtDecode }from "jwt-decode";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  fullName: string;
  username?: string; // optional
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
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      const userData: User = {
        userId: decoded.userId,
        fullName: decoded.fullName,
        roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles],
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      router.push('/')
    } catch (error) {
      console.error("Invalid token during login", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated, isLoading }}
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
