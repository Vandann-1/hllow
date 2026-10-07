"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Flame,
  Coins,
  Calendar,
  ListChecks,
  BookOpen,
  Mail,
  Gift,
  Trophy,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles,
  AlertCircle,
  PartyPopper,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { calculateTogetherTime, calculateLevel } from "@/lib/relationship";

interface DashboardData {
  user: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string | null;
    wishesLocked: boolean;
  };
  partner: {
    id: string;
    name: string;
    username: string;
    profilePhoto?: string | null;
    wishesLocked: boolean;
  };
  coupleSettings: {
    relationshipStartDate: string;
    level: number;
    xp: number;
    currentStreak: number;
    bestStreak: number;
    fundBalance: number;
  };
  wishesSummary: {
    total: number;
    completed: number;
    inProgress: number;
  };
  nearestDate: {
    title: string;
    emoji: string;
    daysLeft: number;
    formattedDate: string;
  } | null;
  contributions: {
    vandan: number;
    muskaan: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good Day");
  const [togetherTime, setTogetherTime] = useState({
    years: 0,
    months: 0,
    days: 0,
    formattedString: "Loading...",
  });

  // Modal for quick rule break recording
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleUser, setRuleUser] = useState("");
  const [ruleReason, setRuleReason] = useState("");
  const [ruleWishId, setRuleWishId] = useState("");
  const [allWishes, setAllWishes] = useState<Array<{ id: string; order: number; title: string }>>([]);
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();

      // Check if user has locked wishes, if not redirect to onboarding
      if (!authData.user.wishesLocked) {
        router.push("/onboarding");
        return;
      }

      // Fetch wishes
      const wishRes = await fetch("/api/wishes");
      const wishData = await wishRes.json();

      const combinedWishes = [
        ...(wishData.myWishes || []),
        ...(wishData.partnerWishes || []),
      ];
      setAllWishes(combinedWishes);

      const completedCount = combinedWishes.filter(
        (w: any) => w.status === "COMPLETED" || w.status === "PERMANENTLY_ADOPTED"
      ).length;
      const inProgressCount = combinedWishes.filter(
        (w: any) => w.status === "IN_PROGRESS"
      ).length;

      // Fetch Fund
      const fundRes = await fetch("/api/fund");
      const fundData = await fundRes.json();

      let vandanContributed = 0;
      let muskaanContributed = 0;
      if (fundData.contributions) {
        for (const c of fundData.contributions) {
          if (c.username === "vandan") vandanContributed = c.amount;
          if (c.username === "muskaan") muskaanContributed = c.amount;
        }
      }

      // Fetch Dates
      const dateRes = await fetch("/api/dates");
      const dateData = await dateRes.json();

      const dashboardPayload: DashboardData = {
        user: authData.user,
        partner: authData.partner,
        coupleSettings: authData.coupleSettings,
        wishesSummary: {
          total: combinedWishes.length,
          completed: completedCount,
          inProgress: inProgressCount,
        },
        nearestDate: dateData.nearest || null,
        contributions: {
          vandan: vandanContributed,
          muskaan: muskaanContributed,
        },
      };

      setData(dashboardPayload);
      setRuleUser(authData.user.id);

      // Calculate time together
      const startDate = authData.coupleSettings?.relationshipStartDate || "2025-12-18";
      setTogetherTime(calculateTogetherTime(startDate));
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Determine greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("Good Morning");
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon");
    else if (hour >= 17 && hour < 22) setGreeting("Good Evening");
    else setGreeting("Good Night");

    fetchDashboardData();
  }, []);

  const handleRecordRuleBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleReason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    setIsSubmittingRule(true);
    try {
      const res = await fetch("/api/fund/rule-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: ruleUser,
          wishId: ruleWishId || null,
          reason: ruleReason.trim(),
          amount: 100,
        }),
      });

      if (res.ok) {
        setShowRuleModal(false);
        setRuleReason("");
        setRuleWishId("");
        fetchDashboardData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record rule break");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmittingRule(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  const { user, partner, coupleSettings, wishesSummary, nearestDate, contributions } = data;
  const levelInfo = calculateLevel(coupleSettings?.xp || 0);

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HERO SECTION: GREETING & TOGETHER COUNTER */}
        <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/95 dark:bg-gradient-to-b dark:from-night-900/90 dark:to-night-950/90 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-200">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-400/10 dark:bg-wine-700/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Personalized Greeting */}
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300/80 font-semibold">
                Our Private Sanctuary
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {greeting}, {user.name} ❤️
              </h1>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                You &amp; {partner.name}
              </p>
            </div>

            <div className="flex -space-x-3 overflow-hidden rounded-full p-1 bg-gray-100 dark:bg-night-800 border border-gray-200 dark:border-white/10">
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-wine-500 bg-rose-100 dark:bg-wine-950">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold text-wine-700 dark:text-wine-300">
                    {user.name[0]}
                  </span>
                )}
              </div>
              <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-rose-400 bg-rose-50 dark:bg-night-850">
                {partner.profilePhoto ? (
                  <img src={partner.profilePhoto} alt={partner.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-bold text-wine-600 dark:text-rose-300">
                    {partner.name[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="my-5 sm:my-6 h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-white/10 to-transparent" />

          {/* TOGETHER COUNTER */}
          <div className="text-center py-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
              Official Start: 18 December (The Proposal ❤️💍)
            </span>

            {/* Prominent Counter */}
            <div className="mt-3 flex items-center justify-center gap-3 sm:gap-6">
              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {togetherTime.years}
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-wine-600 dark:text-rose-300/80 font-medium">
                  {togetherTime.years === 1 ? "Year" : "Years"}
                </span>
              </div>

              <span className="text-xl text-wine-500 font-light">·</span>

              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {togetherTime.months}
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-wine-600 dark:text-rose-300/80 font-medium">
                  {togetherTime.months === 1 ? "Month" : "Months"}
                </span>
              </div>

              <span className="text-xl text-wine-500 font-light">·</span>

              <div className="flex flex-col items-center">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {togetherTime.days}
                </span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-wine-600 dark:text-rose-300/80 font-medium">
                  {togetherTime.days === 1 ? "Day" : "Days"}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic font-serif">
              ❤️ Together for {togetherTime.formattedString}
            </p>
          </div>
        </div>

        {/* STATS MATRIX: LEVEL, WISHES, STREAK, FUND */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* 1. RELATIONSHIP LEVEL */}
          <Link
            href="/level"
            className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/70 p-4 transition hover:border-wine-400 dark:hover:border-wine-500/40 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-wine-700 dark:text-rose-200">RELATIONSHIP LEVEL</span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Level {levelInfo.level}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{levelInfo.title}</p>
            {/* XP bar */}
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-night-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-400"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </Link>

          {/* 2. WISHES PROGRESS */}
          <Link
            href="/wishes"
            className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/70 p-4 transition hover:border-wine-400 dark:hover:border-wine-500/40 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-wine-700 dark:text-rose-200">OUR WISHES</span>
              <ListChecks className="h-4 w-4 text-wine-600 dark:text-wine-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {wishesSummary.completed} / {wishesSummary.total}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {wishesSummary.completed === wishesSummary.total
                ? "All wishes fulfilled! ❤️"
                : `${wishesSummary.inProgress} in progress`}
            </p>
            {/* Progress bar */}
            <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-night-800">
              <div
                className="h-full bg-gradient-to-r from-wine-600 to-rose-500"
                style={{
                  width: `${
                    wishesSummary.total > 0
                      ? (wishesSummary.completed / wishesSummary.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </Link>

          {/* 3. RULE STREAK */}
          <div className="relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/70 p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-orange-600 dark:text-rose-200">RULE STREAK</span>
              <Flame className="h-4 w-4 text-orange-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {coupleSettings?.currentStreak || 0}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Days</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Best Streak: <span className="text-gray-800 dark:text-gray-300 font-medium">{coupleSettings?.bestStreak || 0} Days</span>
            </p>
          </div>

          {/* 4. RELATIONSHIP FUND */}
          <Link
            href="/fund"
            className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/70 p-4 transition hover:border-amber-400 dark:hover:border-wine-500/40 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-amber-600 dark:text-rose-200">RELATIONSHIP FUND</span>
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                ₹{coupleSettings?.fundBalance || 0}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-1">
              V: ₹{contributions.vandan} · M: ₹{contributions.muskaan}
            </p>
          </Link>
        </div>

        {/* NEXT SPECIAL DAY COUNTDOWN BANNER */}
        {nearestDate && (
          <Link
            href="/dates"
            className="group block overflow-hidden rounded-2xl border border-rose-300 dark:border-wine-500/20 bg-rose-50/70 dark:bg-gradient-to-r dark:from-wine-950/60 dark:via-night-900/70 dark:to-night-900/70 p-4 sm:p-5 transition hover:border-wine-500/40 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-wine-900/50 text-2xl border border-rose-200 dark:border-wine-600/30 shadow-sm">
                  {nearestDate.emoji}
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-wine-700 dark:text-rose-300 font-bold">
                    NEXT SPECIAL DAY
                  </span>
                  <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-200 transition">
                    {nearestDate.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{nearestDate.formattedDate}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-serif text-2xl font-bold text-wine-600 dark:text-wine-400">
                  {nearestDate.daysLeft}
                </span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {nearestDate.daysLeft === 0 ? "Today! 🎉" : "Days Left"}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* QUICK ACTION: RECORD RULE BREAK */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-night-900/50 p-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Rule Broken?</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Add ₹100 fine to the shared fund</p>
            </div>
          </div>

          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 px-3.5 py-2 text-xs font-medium text-white transition shadow-glow-wine"
          >
            <PlusCircle className="h-3.5 w-3.5 text-white" />
            <span>Record (₹100)</span>
          </button>
        </div>

        {/* PRIMARY EXPLORATION SHORTCUTS */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold px-1">
            Explore Our World
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/story"
              className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-4 transition hover:border-wine-400 dark:hover:border-wine-500/30 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-wine-600 dark:text-wine-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">OUR STORY</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/wishes"
              className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-4 transition hover:border-wine-400 dark:hover:border-wine-500/30 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3">
                <ListChecks className="h-5 w-5 text-wine-600 dark:text-wine-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">VIEW WISHES</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/dates"
              className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-4 transition hover:border-wine-400 dark:hover:border-wine-500/30 shadow-sm dark:shadow-none"
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-wine-600 dark:text-wine-400" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">OUR DATES</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* SECONDARY ROW: LETTERS & SURPRISES */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/letters"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-4 transition hover:border-rose-400 dark:hover:border-rose-500/30 shadow-sm dark:shadow-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 dark:bg-wine-950 border border-rose-200 dark:border-wine-500/30 text-rose-600 dark:text-rose-400">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Love Letters</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Open when you miss me</p>
            </div>
          </Link>

          <Link
            href="/surprises"
            className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-4 transition hover:border-amber-400 dark:hover:border-amber-500/30 shadow-sm dark:shadow-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Surprise Vault</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Secret locked gifts</p>
            </div>
          </Link>
        </div>
      </main>

      {/* MODAL: RECORD RULE BREAK */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  🚨 Record Rule Break
                </h3>
              </div>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">+₹100 Fine</span>
            </div>

            <form onSubmit={handleRecordRuleBreak} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Who broke the rule?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRuleUser(user.id)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      ruleUser === user.id
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {user.name} (Me)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRuleUser(partner.id)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      ruleUser === partner.id
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {partner.name}
                  </button>
                </div>
              </div>

              {allWishes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Which wish was broken? (Optional)
                  </label>
                  <select
                    value={ruleWishId}
                    onChange={(e) => setRuleWishId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-wine-500"
                  >
                    <option value="">General Relationship Rule</option>
                    {allWishes.map((w) => (
                      <option key={w.id} value={w.id}>
                        Wish #{String(w.order).padStart(2, "0")}: {w.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Reason / What happened?
                </label>
                <textarea
                  value={ruleReason}
                  onChange={(e) => setRuleReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Disappeared for 3 hours during an argument without saying anything"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
                />
              </div>

              <div className="rounded-xl border border-amber-300 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-3 text-[11px] text-amber-800 dark:text-amber-200">
                ⚠️ Adding this will reset your current rule streak of{" "}
                <span className="font-bold">{coupleSettings?.currentStreak || 0} days</span> to 0,
                and deposit ₹100 into your shared Relationship Fund.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRule}
                  className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingRule ? "Recording..." : "Record Fine (₹100)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
