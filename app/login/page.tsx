"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Lock, Sparkles, ArrowRight, ShieldCheck, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [selectedUser, setSelectedUser] = useState<"vandan" | "muskaan">("vandan");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelectUser = (user: "vandan" | "muskaan") => {
    setSelectedUser(user);
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUser,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Check onboarding state
      if (!data.user.wishesLocked) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-wine-700/15 dark:bg-wine-700/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-rose-500/15 dark:bg-wine-900/25 blur-3xl pointer-events-none" />

      {/* Floating Theme Toggle on Login Screen */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-200/60 dark:border-white/10 bg-white/80 dark:bg-night-900/80 text-gray-700 dark:text-gray-300 shadow-lg backdrop-blur-xl transition hover:scale-105"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-amber-400" />
          ) : (
            <Moon className="h-5 w-5 text-wine-600" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Luxury Card Container */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-200">
          {/* Subtle gold/rose top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wine-600 via-rose-400 to-amber-500" />

          {/* Header */}
          <div className="text-center pt-2">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-wine-900 via-wine-700 to-rose-600 shadow-glow-wine text-white mb-4 animate-pulse-glow">
              <Heart className="h-8 w-8 fill-white" />
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Vandan <span className="font-sans text-wine-600 dark:text-wine-400 text-2xl">×</span> Muskaan
            </h1>
            <p className="mt-1.5 text-xs uppercase tracking-widest text-wine-700 dark:text-rose-300/80 font-semibold">
              Private Two-Person World
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Strictly restricted to Vandan &amp; Muskaan. No third entries.
            </p>
          </div>

          {/* User Selection Pills */}
          <div className="mt-6 sm:mt-8">
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
              Who is entering today?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectUser("vandan")}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 transition duration-200 ${
                  selectedUser === "vandan"
                    ? "border-wine-500 bg-rose-50 dark:bg-wine-950/60 text-gray-900 dark:text-white shadow-glow-wine"
                    : "border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-night-850/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <span className="font-serif text-lg font-semibold">Vandan</span>
                <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">He / Him</span>
                {selectedUser === "vandan" && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-wine-600 text-[10px] text-white">
                    ✓
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSelectUser("muskaan")}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-4 transition duration-200 ${
                  selectedUser === "muskaan"
                    ? "border-wine-500 bg-rose-50 dark:bg-wine-950/60 text-gray-900 dark:text-white shadow-glow-wine"
                    : "border-gray-200 dark:border-white/10 bg-gray-50/60 dark:bg-night-850/50 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20"
                }`}
              >
                <span className="font-serif text-lg font-semibold">Muskaan</span>
                <span className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">She / Her</span>
                {selectedUser === "muskaan" && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-wine-600 text-[10px] text-white">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1"
              >
                Passcode
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your private passcode"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-4 py-3 pl-10 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
                  required
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 py-3.5 px-4 font-medium text-white shadow-glow-wine transition hover:opacity-95 disabled:opacity-50"
            >
              <span>{loading ? "Unlocking..." : `Enter as ${selectedUser === "vandan" ? "Vandan" : "Muskaan"} ❤️`}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-4">
            <ShieldCheck className="h-3.5 w-3.5 text-wine-500" />
            <span>Encrypted sanctuary · No public registration</span>
          </div>
        </div>
      </div>
    </main>
  );
}
