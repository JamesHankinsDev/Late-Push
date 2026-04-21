"use client";

import { useAuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
      // The effect above routes once profile is loaded.
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
      // The effect above routes once profile is loaded.
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      setError(msg.replace("Firebase: ", "").replace(/\(auth\/.*\)/, "").trim());
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Hero */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-bold text-skate-lime tracking-tighter leading-none">
            LATE
            <br />
            <span className="text-white">PUSH</span>
          </h1>
          <p className="text-concrete-400 text-sm mt-3 max-w-xs mx-auto">
            Structured skateboarding for adults who have jobs, responsibilities,
            and bones that take longer to heal.
          </p>
        </div>

        {/* Auth form */}
        <div className="bg-concrete-900 border border-concrete-700 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-skate-lime"
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-concrete-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-concrete-800 border border-concrete-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-skate-lime"
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <p className="text-xs text-skate-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-skate-lime text-concrete-950 font-display font-bold text-sm hover:bg-skate-lime/90 transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Loading..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-concrete-700" />
            <span className="text-xs text-concrete-500">or</span>
            <div className="flex-1 h-px bg-concrete-700" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full py-2.5 rounded-lg bg-concrete-800 border border-concrete-700 text-white font-medium text-sm hover:bg-concrete-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          </button>

          <p className="text-center mt-4">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-xs text-concrete-400 hover:text-skate-cyan transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </p>
        </div>

        <p className="text-center text-[10px] text-concrete-600 mt-6">
          No gatekeeping. No &quot;you&apos;re too old.&quot; Just structure and progression.
        </p>
      </div>
    </div>
  );
}
