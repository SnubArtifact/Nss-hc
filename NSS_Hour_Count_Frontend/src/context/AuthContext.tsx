import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
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
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
