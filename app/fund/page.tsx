"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  Flame,
  AlertCircle,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  ShoppingBag,
  Heart,
  History,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface FundTransaction {
  id: string;
  type: "RULE_BREAK" | "SPENT" | "BONUS";
  amount: number;
  userId: string;
  reason: string;
  category?: string | null;
  date: string;
  user: { name: string; username: string };
  wish?: { order: number; title: string } | null;
}

const SPEND_CATEGORIES = [
  "Date",
  "Food",
  "Movie",
  "Gift",
  "Outing",
  "Birthday",
  "Anniversary",
  "Surprise",
];

export default function FundPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [balance, setBalance] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [contributions, setContributions] = useState<Array<{ name: string; username: string; amount: number }>>([]);
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "RULE_BREAK" | "SPENT">("ALL");

  // Modals
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showSpendModal, setShowSpendModal] = useState(false);

  // Form states
  const [breakUser, setBreakUser] = useState("");
  const [breakReason, setBreakReason] = useState("");
  const [breakWishId, setBreakWishId] = useState("");
  const [allWishes, setAllWishes] = useState<Array<{ id: string; order: number; title: string }>>([]);

  const [spendAmount, setSpendAmount] = useState("");
  const [spendCategory, setSpendCategory] = useState("Date");
  const [spendReason, setSpendReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFundData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);
      setBreakUser(authData.user.id);

      const fundRes = await fetch("/api/fund");
      if (fundRes.ok) {
        const fundData = await fundRes.json();
        setBalance(fundData.balance || 0);
        setCurrentStreak(fundData.currentStreak || 0);
        setBestStreak(fundData.bestStreak || 0);
        setContributions(fundData.contributions || []);
        setTransactions(fundData.transactions || []);
      }

      // Fetch wishes for dropdown
      const wishRes = await fetch("/api/wishes");
      if (wishRes.ok) {
        const wishData = await wishRes.json();
        const combined = [...(wishData.myWishes || []), ...(wishData.partnerWishes || [])];
        setAllWishes(combined);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundData();
  }, []);

  const handleRecordRuleBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fund/rule-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: breakUser,
          wishId: breakWishId || null,
          reason: breakReason.trim(),
          amount: 100,
        }),
      });

      if (res.ok) {
        setShowBreakModal(false);
        setBreakReason("");
        setBreakWishId("");
        fetchFundData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordSpend = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(spendAmount);
    if (!amt || amt <= 0 || !spendReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fund/spend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          category: spendCategory,
          reason: spendReason.trim(),
        }),
      });

      if (res.ok) {
        setShowSpendModal(false);
        setSpendAmount("");
        setSpendReason("");
        fetchFundData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to spend");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  const vandanContrib = contributions.find((c) => c.username === "vandan")?.amount || 0;
  const muskaanContrib = contributions.find((c) => c.username === "muskaan")?.amount || 0;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === "ALL") return true;
    return t.type === filterType;
  });

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HERO FUND CARD */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-300 dark:border-amber-500/25 bg-white/95 dark:bg-gradient-to-b dark:from-night-900/90 dark:to-night-950/90 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl transition-colors duration-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-wine-600" />
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-300 font-bold">
              ❤️ OUR RELATIONSHIP FUND
            </span>

            {/* Giant Balance */}
            <div className="mt-3 flex items-center justify-center gap-1 font-serif text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
              <span>₹</span>
              <span>{balance}</span>
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Shared treasury built from love &amp; accountability
            </p>

            {/* Contribution Breakdown */}
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/80 p-3.5 text-center shadow-sm dark:shadow-none">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Vandan Contributed</span>
                <p className="font-serif text-lg font-bold text-wine-700 dark:text-rose-200 mt-0.5">
                  ₹{vandanContrib}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/80 p-3.5 text-center shadow-sm dark:shadow-none">
                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Muskaan Contributed</span>
                <p className="font-serif text-lg font-bold text-wine-700 dark:text-rose-200 mt-0.5">
                  ₹{muskaanContrib}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowBreakModal(true)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-700 to-wine-700 px-6 py-3.5 text-xs font-semibold text-white shadow-glow-wine transition hover:scale-[1.02]"
              >
                <AlertCircle className="h-4 w-4 text-rose-300" />
                <span>Record Rule Break (+₹100)</span>
              </button>

              <button
                onClick={() => setShowSpendModal(true)}
                disabled={balance <= 0}
                className="flex items-center justify-center gap-2 rounded-2xl border border-amber-400 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-6 py-3.5 text-xs font-semibold text-amber-800 dark:text-amber-200 transition hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-40"
              >
                <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Spend for a Date (-₹)</span>
              </button>
            </div>
          </div>
        </div>

        {/* RULE STREAK SECTION */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-500/30 text-orange-600 dark:text-orange-400">
                <Flame className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-orange-600 dark:text-orange-300 font-bold">
                  🔥 RULE STREAK
                </span>
                <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStreak} DAYS
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">Best Streak</span>
              <p className="font-serif text-lg font-semibold text-amber-600 dark:text-amber-400">
                {bestStreak} Days
              </p>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 pt-3">
            Track consecutive days without any broken wishes. Breaking a rule resets the streak to 0 and adds ₹100 to the fund.
          </p>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-wine-600 dark:text-wine-400" />
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                Transaction History
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-100 dark:bg-night-850 p-1 text-[11px]">
              <button
                onClick={() => setFilterType("ALL")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  filterType === "ALL" ? "bg-wine-700 text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("RULE_BREAK")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  filterType === "RULE_BREAK" ? "bg-wine-700 text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Fines
              </button>
              <button
                onClick={() => setFilterType("SPENT")}
                className={`rounded-lg px-2.5 py-1 transition ${
                  filterType === "SPENT" ? "bg-wine-700 text-white" : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Spent
              </button>
            </div>
          </div>

          {/* List of transactions */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-400">
                No transactions recorded yet.
              </p>
            ) : (
              filteredTransactions.map((tx) => {
                const isDeposit = tx.type === "RULE_BREAK" || tx.type === "BONUS";
                return (
                  <div
                    key={tx.id}
                    className="flex items-start justify-between rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-night-850/60 p-4 text-xs transition hover:border-gray-200 dark:hover:border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                          isDeposit
                            ? "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {tx.user?.name}
                          </span>
                          {tx.wish && (
                            <span className="rounded bg-white dark:bg-night-900 border border-gray-200 dark:border-white/10 px-1.5 py-0.2 text-[10px] text-wine-700 dark:text-rose-300">
                              Wish #{String(tx.wish.order).padStart(2, "0")}
                            </span>
                          )}
                          {tx.category && (
                            <span className="rounded bg-white dark:bg-night-900 border border-gray-200 dark:border-white/10 px-1.5 py-0.2 text-[10px] text-amber-700 dark:text-amber-300">
                              {tx.category}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                          {tx.reason}
                        </p>

                        <span className="mt-1 block text-[10px] text-gray-400">
                          {new Date(tx.date).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono text-sm font-bold shrink-0 ml-2 ${
                        isDeposit ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {isDeposit ? `+₹${tx.amount}` : `-₹${tx.amount}`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* MODAL: RECORD RULE BREAK */}
      {showBreakModal && (
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

            <form onSubmit={handleRecordRuleBreak} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Who broke the rule?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBreakUser(user.id)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      breakUser === user.id
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {user.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBreakUser(partner.id)}
                    className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                      breakUser === partner.id
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-950 text-gray-900 dark:text-white"
                        : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {partner.name}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Which wish was broken? (Optional)
                </label>
                <select
                  value={breakWishId}
                  onChange={(e) => setBreakWishId(e.target.value)}
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

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Reason / What happened?
                </label>
                <textarea
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  rows={3}
                  placeholder="e.g. Broke promise to inform before sleeping"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Record Fine (₹100)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SPEND FUND */}
      {showSpendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white">
                  🥂 Spend from Fund
                </h3>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Available: ₹{balance}</span>
            </div>

            <form onSubmit={handleRecordSpend} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Amount to Spend (₹)
                </label>
                <input
                  type="number"
                  max={balance}
                  min={1}
                  value={spendAmount}
                  onChange={(e) => setSpendAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Category
                </label>
                <select
                  value={spendCategory}
                  onChange={(e) => setSpendCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  {SPEND_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Where was it used? (Note)
                </label>
                <textarea
                  value={spendReason}
                  onChange={(e) => setSpendReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Candlelight pasta dinner & waffles!"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSpendModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-xs font-semibold text-white shadow-glow-gold hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Recording..." : "Deduct & Enjoy ❤️"}
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
