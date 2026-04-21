"use client";

import { useAuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Eyebrow, HazardTape } from "@/components/ui/primitives";

export default function Home() {
  const { user, profile, loading, signIn, signUp, signInWithGoogle } =
    useAuthContext();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const landingRoute = () =>
    profile && !profile.onboardedAt ? "/onboarding" : "/dashboard";

  useEffect(() => {
    if (!loading && user && profile) {
      router.push(landingRoute());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading, router]);

  if (loading || user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
      // Routing handled by the effect once profile is loaded.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithGoogle();
      // Routing handled by the effect.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 20px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              fontFamily: "var(--hammer)",
              fontSize: 72,
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              color: "var(--paper)",
            }}
          >
            LATE
            <span
              style={{
                color: "var(--hazard)",
                display: "inline-block",
                transform: "skewX(-8deg)",
                margin: "0 2px",
              }}
            >
              /
            </span>
            PUSH
          </div>
          <div
            style={{
              width: 120,
              height: 4,
              background: "var(--hazard)",
              transform: "skewX(-12deg)",
              margin: "8px auto 16px",
            }}
          />
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper-dim)",
            }}
          >
            Never too late to push
          </div>
        </div>

        <HazardTape thin />

        {/* Auth card */}
        <div
          className="card-dark"
          style={{
            padding: 28,
            marginTop: 28,
            borderColor: "var(--ink-3)",
            background: "var(--ink-2)",
          }}
        >
          <Eyebrow>{isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}</Eyebrow>

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 16, marginTop: 18 }}
          >
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@email.com"
                autoComplete="email"
                style={inputStyle}
              />
            </Field>
            <Field
              label="Password"
              hint={isSignUp ? "At least 6 characters" : undefined}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isSignUp ? "new-password" : "current-password"}
                style={inputStyle}
              />
            </Field>

            {error && (
              <div
                className="mono"
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--coral)",
                  padding: "8px 10px",
                  border: "1px solid var(--coral)",
                  borderRadius: 4,
                }}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {submitting
                ? "Loading…"
                : isSignUp
                ? "Create account →"
                : "Sign in →"}
            </Button>
          </form>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "20px 0 14px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "var(--ink-3)",
              }}
            />
            <span className="label">OR</span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "var(--ink-3)",
              }}
            />
          </div>

          <Button
            variant="ghost"
            onClick={handleGoogle}
            style={{
              width: "100%",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px dashed var(--ink-3)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="mono"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--paper-dim)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {isSignUp
                ? "← Already have an account? Sign in"
                : "New here? Create an account →"}
            </button>
          </div>
        </div>

        {/* Footer tagline */}
        <div
          className="mono"
          style={{
            marginTop: 24,
            textAlign: "center",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--paper-dim)",
            lineHeight: 1.6,
          }}
        >
          No gatekeeping. No judgment.
          <br />
          Everyone starts at day one.
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--paper-dim)",
          }}
        >
          {label}
        </span>
        {hint && <span className="label">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--ink)",
  border: "1px solid var(--ink-3)",
  borderRadius: "var(--r-s)",
  padding: "10px 12px",
  color: "var(--paper)",
  fontFamily: "var(--body)",
  fontSize: 14,
  outline: "none",
};
