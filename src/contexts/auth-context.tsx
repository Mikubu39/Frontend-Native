/**
 * Authentication Context
 *
 * Provides authentication state throughout the app.
 * Wrap your root layout with <AuthProvider> and use the useAuth() hook.
 *
 * Example:
 *   const { user, isAuthenticated, signIn, signOut } = useAuth();
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async (email: string, _password: string) => {
    setIsLoading(true);
    try {
      setUser({
        id: "1",
        email: email || "user@example.com",
        displayName: email ? email.split('@')[0] : "User",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, _password: string, displayName: string) => {
    setIsLoading(true);
    try {
      setUser({
        id: "1",
        email: email || "user@example.com",
        displayName: displayName || "User",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
