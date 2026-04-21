"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuthContext } from "@/components/AuthProvider";
import Nav from "@/components/ui/Nav";

function ShellInner({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext();
  const pathname = usePathname();
  const isFullscreenRoute = pathname === "/onboarding";

  // Short auth-unknown window only — once we know whether there's a user,
  // render the shell immediately. Profile/sessions load in parallel and
  // each page handles its own loading state for data-dependent sections.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 animate-spin"
            style={{
              width: 48,
              height: 48,
              border: "4px solid var(--ink-3)",
              borderTopColor: "var(--hazard)",
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              color: "var(--paper-dim)",
              fontFamily: "var(--display)",
              fontSize: 14,
              letterSpacing: "0.06em",
            }}
          >
            LOADING...
          </p>
        </div>
      </div>
    );
  }

  if (!user || isFullscreenRoute) {
    return <>{children}</>;
  }

  return (
    <div className="app">
      <Nav />
      <main className="main">
        <div className="main-inner">{children}</div>
      </main>
    </div>
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShellInner>{children}</ShellInner>
    </AuthProvider>
  );
}
