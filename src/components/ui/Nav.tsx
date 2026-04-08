"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthContext } from "@/components/AuthProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/tricks", label: "Tricks", icon: "🛹" },
  { href: "/sessions/new", label: "Log Session", icon: "+" },
  { href: "/sessions", label: "Sessions", icon: "📝" },
  { href: "/spots", label: "Spots", icon: "📍" },
];

export default function Nav() {
  const pathname = usePathname();
  const { profile, signOut } = useAuthContext();

  if (!profile) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-concrete-900 border-r border-concrete-700 z-40">
        <div className="p-4 border-b border-concrete-700">
          <Link href="/dashboard" className="block">
            <h1 className="font-display text-xl font-bold text-skate-lime tracking-tight">
              GROWN &<br />ROLLING
            </h1>
          </Link>
        </div>

        <div className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "text-skate-lime bg-concrete-800 border-r-2 border-skate-lime"
                  : "text-concrete-300 hover:text-white hover:bg-concrete-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-concrete-700">
          <p className="text-xs text-concrete-400 mb-2 truncate">
            {profile.displayName}
          </p>
          <button
            onClick={signOut}
            className="text-xs text-concrete-500 hover:text-skate-red transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-concrete-900 border-t border-concrete-700 z-40 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "text-skate-lime"
                  : "text-concrete-400"
              }`}
            >
              <span className={`text-lg ${item.label === "Log Session" ? "bg-skate-lime text-concrete-950 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
