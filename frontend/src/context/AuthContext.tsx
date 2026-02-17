import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  specificPosition?: string;
  departmentId?: number;
  hourCountDept: number;
  hourCountMeet: number;
  hourCountEvent: number;
  hourCountMisc: number;
  hourLogs?: any[];
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/auth/status");
      if (data) {
        setIsLoggedIn(true);
        setUser(data);
      }
    } catch (error) {
      console.error("Not authenticated");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const logout = () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    window.location.href = `${API_URL}/api/auth/logout`;
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, login, logout, refreshUser: checkAuth, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
