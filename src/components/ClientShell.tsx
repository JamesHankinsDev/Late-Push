"use client";

import { ReactNode } from "react";
import { AuthProvider, useAuthContext } from "@/components/AuthProvider";
import Nav from "@/components/ui/Nav";

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-concrete-700 border-t-skate-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-concrete-400 font-display text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  return (
    <>
      <Nav />
      <main className="md:ml-56 pb-20 md:pb-0 relative z-10 min-h-screen">
        {children}
      </main>
    </>
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShellInner>{children}</ShellInner>
    </AuthProvider>
  );
}
