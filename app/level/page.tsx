"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Sparkles,
  Heart,
  CheckCircle2,
  Calendar,
  Flame,
  Mail,
  BookOpen,
  Coins,
  ShieldCheck,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { calculateLevel, calculateTogetherTime, LEVELS } from "@/lib/relationship";

export default function LevelPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [coupleSettings, setCoupleSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    wishesCompleted: 0,
    wishesAdopted: 0,
    totalMemories: 0,
    totalLetters: 0,
    fundCollected: 0,
    bestStreak: 0,
  });

  const fetchData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);
      setCoupleSettings(authData.coupleSettings);

      // Fetch Wishes
      const wishRes = await fetch("/api/wishes");
      const wishData = await wishRes.json();
      const allWishes = [...(wishData.myWishes || []), ...(wishData.partnerWishes || [])];
      const completed = allWishes.filter((w: any) => w.status === "COMPLETED").length;
      const adopted = allWishes.filter((w: any) => w.status === "PERMANENTLY_ADOPTED").length;

      // Fetch Memories
      const memRes = await fetch("/api/memories");
      const memData = await memRes.json();

      // Fetch Letters
      const letRes = await fetch("/api/letters");
      const letData = await letRes.json();

      // Fetch Fund
      const fundRes = await fetch("/api/fund");
      const fundData = await fundRes.json();

      setStats({
        wishesCompleted: completed,
        wishesAdopted: adopted,
        totalMemories: (memData.memories || []).length,
        totalLetters: (letData.letters || []).length,
        fundCollected: fundData.totalCollected || 0,
        bestStreak: fundData.bestStreak || 0,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  const xp = coupleSettings?.xp || 0;
  const levelData = calculateLevel(xp);
  const together = calculateTogetherTime(coupleSettings?.relationshipStartDate || "2025-12-18");

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HERO LEVEL CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-300 dark:border-amber-500/30 bg-white/95 dark:bg-gradient-to-b dark:from-night-900/95 dark:via-amber-950/20 dark:to-night-950/95 p-5 sm:p-8 text-center shadow-2xl backdrop-blur-2xl transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-wine-600" />
          <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-amber-400/10 dark:bg-amber-500/15 blur-3xl pointer-events-none" />

          {/* Level Badge Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-rose-500 text-white shadow-glow-gold mb-4">
            <Trophy className="h-10 w-10 text-white" />
          </div>

          <span className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
            MUTUAL PROGRESSION
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-1">
            Level {levelData.level}: {levelData.title}
          </h1>

          <p className="mt-2 text-xs text-gray-600 dark:text-rose-200/90 max-w-md mx-auto">
            {LEVELS.find((l) => l.level === levelData.level)?.description}
          </p>

          {/* XP Progress Bar */}
          <div className="mt-6 max-w-sm mx-auto">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
              <span>{xp} Total XP</span>
              <span>Next Level: {levelData.nextLevelXp} XP</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-night-800 border border-gray-200 dark:border-white/5">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700"
                style={{ width: `${levelData.progressPercent}%` }}
              />
            </div>
            <span className="mt-2 block text-[11px] text-gray-500 font-mono">
              {levelData.progressPercent}% Completed to Level {Math.min(5, levelData.level + 1)}
            </span>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/60 p-3 text-xs text-gray-600 dark:text-gray-400">
            🤝 <span className="text-wine-700 dark:text-rose-200 font-semibold">Two Souls, One Score:</span> You and {partner?.name} progress together as a unified couple.
          </div>
        </div>

        {/* ALL TIERS ROADMAP */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
            Journey of 5 Levels
          </h2>

          <div className="space-y-3">
            {LEVELS.map((lvl) => {
              const isCurrent = lvl.level === levelData.level;
              const isUnlocked = xp >= lvl.minXp;

              return (
                <div
                  key={lvl.level}
                  className={`flex items-start gap-4 rounded-2xl border p-4 transition ${
                    isCurrent
                      ? "border-amber-400 dark:border-amber-500/50 bg-amber-50/60 dark:bg-amber-950/20 shadow-glow-gold"
                      : isUnlocked
                      ? "border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-night-850/60"
                      : "border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-night-950/50 opacity-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold font-serif ${
                      isCurrent
                        ? "bg-amber-500 text-white dark:text-black"
                        : isUnlocked
                        ? "bg-rose-100 dark:bg-wine-900 text-wine-800 dark:text-rose-300 border border-rose-200 dark:border-wine-600/40"
                        : "bg-gray-200 dark:bg-night-800 text-gray-500 dark:text-gray-600"
                    }`}
                  >
                    {lvl.level}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                        {lvl.title}
                      </h3>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                        {lvl.minXp} XP
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {lvl.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMPREHENSIVE RELATIONSHIP STATISTICS */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
            📊 Relationship Statistics
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <Calendar className="mx-auto h-5 w-5 text-wine-600 dark:text-wine-400 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {together.totalDays}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Days Together
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {stats.wishesCompleted + stats.wishesAdopted}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Wishes Fulfilled
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <Flame className="mx-auto h-5 w-5 text-orange-500 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {stats.bestStreak}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Best Rule Streak
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <BookOpen className="mx-auto h-5 w-5 text-rose-500 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {stats.totalMemories}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Story Memories
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <Mail className="mx-auto h-5 w-5 text-wine-500 dark:text-rose-300 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {stats.totalLetters}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Love Letters
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/70 p-4 text-center">
              <Coins className="mx-auto h-5 w-5 text-amber-500 mb-1" />
              <span className="text-2xl font-bold font-serif text-gray-900 dark:text-white">
                ₹{stats.fundCollected}
              </span>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                Total Fund Raised
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
