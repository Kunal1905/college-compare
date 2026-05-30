"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearSession,
  getStoredToken,
  getStoredUser,
  storeSession,
} from "@/lib/auth";
import type { AuthUser } from "@/types";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const syncSession = () => {
      setToken(getStoredToken());
      setUser(getStoredUser());
      setIsHydrated(true);
    };

    syncSession();
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const login = (nextToken: string, nextUser: AuthUser) => {
    storeSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isHydrated,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
