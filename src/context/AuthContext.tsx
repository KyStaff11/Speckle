"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SignUpInput, UserProfile } from "@/types/auth";
import * as auth from "@/lib/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  user: UserProfile | null;
  status: AuthStatus;
  signUp: (input: SignUpInput, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
  updateProfile: (updates: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    // localStorage is only available client-side, so the session loads post-mount.
    const session = auth.getSession();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(session);
    setStatus(session ? "authenticated" : "unauthenticated");
  }, []);

  const signUp = useCallback(async (input: SignUpInput, password: string) => {
    const profile = await auth.signUp(input, password);
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    const profile = await auth.logIn(email, password);
    setUser(profile);
    setStatus("authenticated");
  }, []);

  const logOut = useCallback(() => {
    auth.logOut();
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const updateProfile = useCallback(
    (updates: UserProfile) => {
      if (!user) return;
      auth.updateProfile(user.email, updates);
      setUser(updates);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, status, signUp, logIn, logOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
