"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import LoginScreen from "@/components/LoginScreen";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "loading") {
    return <div className="flex-1" />;
  }

  if (status === "unauthenticated") {
    return <LoginScreen />;
  }

  return (
    <>
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </>
  );
}
