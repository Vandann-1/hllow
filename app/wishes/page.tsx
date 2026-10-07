"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Filter,
  User,
  Heart,
  ChevronDown,
  Download,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import WishDownloadModal from "@/components/WishDownloadModal";

interface WishItem {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
  status: "ACTIVE" | "IN_PROGRESS" | "COMPLETED" | "PERMANENTLY_ADOPTED";
  createdById: string;
  targetUserId: string;
  createdBy: { id: string; name: string; username: string };
  targetUser: { id: string; name: string; username: string };
}

export default function WishesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [myWishes, setMyWishes] = useState<WishItem[]>([]);
  const [partnerWishes, setPartnerWishes] = useState<WishItem[]>([]);
  const [partnerLocked, setPartnerLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filters
  const [tab, setTab] = useState<"all" | "mine" | "partner">("all");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // Rule break modal
  const [selectedWishForBreak, setSelectedWishForBreak] = useState<WishItem | null>(null);
  const [breakReason, setBreakReason] = useState("");
  const [isSubmittingBreak, setIsSubmittingBreak] = useState(false);

  // Download Keepsake Modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const fetchWishes = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      const res = await fetch("/api/wishes");
      if (res.ok) {
        const data = await res.json();
        setMyWishes(data.myWishes || []);
        setPartnerWishes(data.partnerWishes || []);
        setPartnerLocked(data.partnerLocked);
      }
    } catch {
      // error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleUpdateStatus = async (wishId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/wishes/${wishId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMyWishes((prev) =>
          prev.map((w) => (w.id === wishId ? { ...w, status: newStatus as any } : w))
        );
        setPartnerWishes((prev) =>
          prev.map((w) => (w.id === wishId ? { ...w, status: newStatus as any } : w))
        );
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleRecordRuleBreak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWishForBreak || !breakReason.trim()) return;

    setIsSubmittingBreak(true);
    try {
      const res = await fetch("/api/fund/rule-break", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedWishForBreak.targetUserId,
          wishId: selectedWishForBreak.id,
          reason: breakReason.trim(),
          amount: 100,
        }),
      });

      if (res.ok) {
        setSelectedWishForBreak(null);
        setBreakReason("");
        alert("Rule break recorded! ₹100 added to Relationship Fund.");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to record rule break");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmittingBreak(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  // Combined wishes depending on tab
  let currentList: WishItem[] = [];
  if (tab === "all") {
    currentList = [...myWishes, ...partnerWishes];
  } else if (tab === "mine") {
    currentList = myWishes;
  } else {
    currentList = partnerWishes;
  }

  // Apply filters
  if (statusFilter !== "ALL") {
    currentList = currentList.filter((w) => w.status === statusFilter);
  }
  if (categoryFilter !== "ALL") {
    currentList = currentList.filter((w) => w.category === categoryFilter);
  }

  const partnerName = partner?.name || "Muskaan";
  const myName = user?.name || "You";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PERMANENTLY_ADOPTED":
        return {
          label: "Adopted Forever 🌱",
          color: "border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300",
        };
      case "COMPLETED":
        return {
          label: "Completed 🎉",
          color: "border-wine-500/40 bg-rose-50 dark:bg-wine-950/40 text-wine-800 dark:text-rose-300",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress ✨",
          color: "border-amber-500/40 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300",
        };
      default:
        return {
          label: "Active",
          color: "border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-night-850 text-gray-700 dark:text-gray-300",
        };
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HEADER BANNER */}
        <div className="rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300 font-bold">
                Our Relationship Rulebook
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                20 Sacred Wishes
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200 transition shadow-sm"
                title="Download or Print Wishes for the future"
              >
                <Download className="h-4 w-4 text-wine-600 dark:text-rose-400" />
                <span>Download Keepsake</span>
              </button>

              <div className="flex items-center gap-1.5 rounded-xl border border-wine-500/30 bg-rose-50 dark:bg-wine-950/60 px-3 py-1.5 text-xs text-wine-800 dark:text-rose-200">
                <ShieldCheck className="h-4 w-4 text-wine-600 dark:text-wine-400" />
                <span>Locked &amp; Sealed</span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            10 wishes crafted by {myName} for {partnerName}, and 10 wishes crafted by {partnerName} for {myName}. Every broken wish adds ₹100 to your shared fund.
          </p>

          {/* Partner pending warning if partner not locked */}
          {!partnerLocked && (
            <div className="mt-4 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-semibold">{partnerName}&apos;s wishes are not locked yet.</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300/80 mt-0.5">
                Her wishes will be revealed as soon as she logs in and completes onboarding.
              </p>
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-night-900/60 p-1.5 text-xs font-semibold shadow-sm dark:shadow-none">
          <button
            onClick={() => setTab("all")}
            className={`rounded-xl py-2.5 transition ${
              tab === "all"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All ({myWishes.length + partnerWishes.length})
          </button>

          <button
            onClick={() => setTab("mine")}
            className={`rounded-xl py-2.5 transition ${
              tab === "mine"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            By {myName} ({myWishes.length})
          </button>

          <button
            onClick={() => setTab("partner")}
            className={`rounded-xl py-2.5 transition ${
              tab === "partner"
                ? "bg-wine-700 text-white shadow-glow-wine"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            By {partnerName} ({partnerWishes.length})
          </button>
        </div>

        {/* FILTER CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-gray-500 pr-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-night-850 px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="PERMANENTLY_ADOPTED">Adopted Forever</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-night-850 px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Love">Love</option>
            <option value="Communication">Communication</option>
            <option value="Trust">Trust</option>
            <option value="Time">Time</option>
            <option value="Emotional">Emotional</option>
            <option value="Effort">Effort</option>
            <option value="Fun">Fun</option>
            <option value="Improvement">Improvement</option>
          </select>
        </div>

        {/* WISHES LIST */}
        <div className="space-y-4">
          {currentList.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-white/5 bg-white/60 dark:bg-night-900/40 p-8 text-center text-xs text-gray-500">
              No wishes found matching your selected filters.
            </div>
          ) : (
            currentList.map((wish) => {
              const badge = getStatusBadge(wish.status);

              return (
                <div
                  key={wish.id}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 shadow-lg backdrop-blur-xl transition hover:border-wine-300 dark:hover:border-white/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-wine-600 dark:text-wine-400">
                        #{String(wish.order).padStart(2, "0")}
                      </span>
                      <h3 className="font-semibold text-base text-gray-900 dark:text-white">
                        {wish.title}
                      </h3>
                    </div>

                    <span
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Creator & Target Tag */}
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>
                      Crafted by{" "}
                      <span className="text-wine-700 dark:text-rose-300 font-medium">
                        {wish.createdBy.name}
                      </span>{" "}
                      for{" "}
                      <span className="text-gray-900 dark:text-white font-medium">
                        {wish.targetUser.name}
                      </span>
                    </span>
                    <span>·</span>
                    <span className="rounded bg-gray-100 dark:bg-night-850 px-1.5 py-0.5 border border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400">
                      {wish.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-3 text-xs text-gray-700 dark:text-gray-300 leading-relaxed pl-1">
                    {wish.description}
                  </p>

                  {/* Status Toggle & Rule Break actions */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-white/5 pt-3">
                    {/* Status Changer */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-500">Status:</span>
                      <select
                        value={wish.status}
                        onChange={(e) => handleUpdateStatus(wish.id, e.target.value)}
                        className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-2 py-1 text-[11px] text-gray-900 dark:text-white focus:outline-none"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="IN_PROGRESS">In Progress ✨</option>
                        <option value="COMPLETED">Completed 🎉</option>
                        <option value="PERMANENTLY_ADOPTED">Permanently Adopted 🌱</option>
                      </select>
                    </div>

                    {/* Record Rule Break Button */}
                    <button
                      onClick={() => setSelectedWishForBreak(wish)}
                      className="flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition"
                    >
                      <AlertCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                      <span>Broken? +₹100 Fine</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* RULE BREAK MODAL FOR SPECIFIC WISH */}
      {selectedWishForBreak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-white/10">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-400 font-bold">
                  RULE VIOLATION
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                  Wish #{String(selectedWishForBreak.order).padStart(2, "0")}: {selectedWishForBreak.title}
                </h3>
              </div>
              <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">+₹100</span>
            </div>

            <form onSubmit={handleRecordRuleBreak} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Responsible Partner:
                </label>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 p-2.5 text-xs text-gray-900 dark:text-white font-medium">
                  {selectedWishForBreak.targetUser.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  What happened? (Reason)
                </label>
                <textarea
                  value={breakReason}
                  onChange={(e) => setBreakReason(e.target.value)}
                  rows={3}
                  placeholder={`Explain what happened regarding "${selectedWishForBreak.title}"`}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
                />
              </div>

              <div className="rounded-xl border border-amber-300 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 p-3 text-[11px] text-amber-800 dark:text-amber-200">
                This will reset your rule streak and deposit ₹100 into your shared Relationship Fund.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWishForBreak(null)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBreak}
                  className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmittingBreak ? "Recording..." : "Record Fine (₹100)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WISH DOWNLOAD / EXPORT MODAL */}
      <WishDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        wishes={[...myWishes, ...partnerWishes]}
        user={user}
        partner={partner}
      />

      <BottomNav />
    </div>
  );
}
