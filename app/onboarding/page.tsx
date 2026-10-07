"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Lock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  PartyPopper,
  Users,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import WishDownloadModal from "@/components/WishDownloadModal";

interface Wish {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
}

interface UserData {
  id: string;
  name: string;
  username: string;
  wishesLocked: boolean;
}

interface PartnerData {
  id: string;
  name: string;
  username: string;
  wishesLocked: boolean;
}

const CATEGORIES = [
  { value: "Love", label: "❤️ Love" },
  { value: "Communication", label: "💬 Communication" },
  { value: "Trust", label: "🤝 Trust" },
  { value: "Time", label: "🕐 Time" },
  { value: "Emotional", label: "🫂 Emotional" },
  { value: "Effort", label: "🎁 Effort" },
  { value: "Fun", label: "😂 Fun" },
  { value: "Improvement", label: "🌱 Improvement" },
];

export default function OnboardingPage() {
  const router = useRouter();

  // Step state: 0: Welcome, 1: Intro/Philosophy, 2: Add Wishes Form, 3: Review, 4: Locked
  const [step, setStep] = useState<number>(0);
  const [user, setUser] = useState<UserData | null>(null);
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form fields for ONE wish at a time (Starts completely clean for manual typing)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Love");
  const [formError, setFormError] = useState("");
  const [isSubmittingWish, setIsSubmittingWish] = useState(false);
  const [showToastAdded, setShowToastAdded] = useState(false);

  // Lock Modal
  const [showLockModal, setShowLockModal] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Download Keepsake Modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Fetch initial auth & wishes
  const loadData = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      // If already locked, set step to 4
      if (authData.user.wishesLocked) {
        setStep(4);
      }

      // Fetch wishes
      const wishRes = await fetch("/api/wishes");
      if (wishRes.ok) {
        const wishData = await wishRes.json();
        setWishes(wishData.myWishes || []);
        if (wishData.myLocked) {
          setStep(4);
        } else if (wishData.myWishes.length > 0 && step === 0) {
          // If already started adding wishes previously
          setStep(2);
        }
      }
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle adding a single wish manually
  const handleAddWish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !description.trim() || !category) {
      setFormError("Title, description, and category are all required.");
      return;
    }

    if (wishes.length >= 10) {
      setFormError("You have already reached the maximum of 10 wishes.");
      return;
    }

    setIsSubmittingWish(true);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to add wish.");
        setIsSubmittingWish(false);
        return;
      }

      // Add to local wishes list and reset form cleanly for next wish
      setWishes((prev) => [...prev, data.wish]);
      setTitle("");
      setDescription("");
      setCategory("Love");
      setShowToastAdded(true);
      setTimeout(() => setShowToastAdded(false), 2500);
    } catch {
      setFormError("Network error while saving wish.");
    } finally {
      setIsSubmittingWish(false);
    }
  };

  // Handle delete wish before locking
  const handleDeleteWish = async (id: string) => {
    try {
      const res = await fetch(`/api/wishes?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWishes((prev) => {
          const filtered = prev.filter((w) => w.id !== id);
          return filtered.map((w, index) => ({ ...w, order: index + 1 }));
        });
      }
    } catch {
      // ignore
    }
  };

  // Lock wishes permanently
  const handleConfirmLock = async () => {
    setIsLocking(true);
    try {
      const res = await fetch("/api/wishes/lock", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to lock wishes.");
        setIsLocking(false);
        return;
      }

      setShowLockModal(false);
      setStep(4);

      // Trigger celebratory confetti
      confetti({
        particleCount: 130,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#be123c", "#fb7185", "#f59e0b", "#fda4af"],
      });
    } catch {
      alert("Error locking wishes.");
    } finally {
      setIsLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <div className="flex flex-col items-center gap-3">
          <Heart className="h-8 w-8 text-wine-500 animate-ping" />
          <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Entering your sanctuary...
          </p>
        </div>
      </div>
    );
  }

  const partnerName = partner?.name || "Muskaan";
  const myName = user?.name || "You";

  return (
    <div className="min-h-screen pb-16">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-xl px-3.5 sm:px-4 pt-6 sm:pt-10">
        {/* STEP 0: WELCOME SCREEN */}
        {step === 0 && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wine-600 via-rose-400 to-amber-500" />

            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-wine-900 via-wine-700 to-rose-600 shadow-glow-wine text-white mb-6">
              <Heart className="h-10 w-10 fill-white animate-pulse" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              ❤️ VANDAN × MUSKAAN
            </h1>

            <p className="mt-3 font-serif text-xl sm:text-2xl text-wine-600 dark:text-rose-200 italic">
              Welcome to your little world.
            </p>

            <div className="my-6 space-y-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
              <p>Before we begin...</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                Let&apos;s create something together.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-2 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 px-8 py-4 font-medium text-white shadow-glow-wine transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* STEP 1: PHILOSOPHY & INTRO */}
        {step === 1 && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wine-600 via-rose-400 to-amber-500" />

            <div className="inline-flex items-center gap-2 rounded-full border border-wine-500/30 bg-rose-50 dark:bg-wine-950/60 px-4 py-1.5 text-xs text-wine-700 dark:text-rose-300 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Step 1 of 2: The Foundation</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              You each get 10 wishes.
            </h2>

            <div className="rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/70 dark:bg-night-850/60 p-5 sm:p-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed text-left space-y-3 mb-8">
              <p className="font-semibold text-wine-800 dark:text-rose-200">
                10 things you want {partnerName} to:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-gray-700 dark:text-gray-300">
                <li><span className="text-gray-900 dark:text-white font-medium">Improve</span> when disagreements happen</li>
                <li><span className="text-gray-900 dark:text-white font-medium">Continue</span> doing because you love it</li>
                <li><span className="text-gray-900 dark:text-white font-medium">Remember</span> even in busy days</li>
                <li><span className="text-gray-900 dark:text-white font-medium">Or do more often</span> to make you smile</li>
              </ul>
              <div className="pt-3 border-t border-gray-200/60 dark:border-white/5 text-xs text-gray-500 dark:text-gray-400 italic">
                Your wishes will become part of your shared relationship rulebook and history.
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setStep(0)}
                className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-6 py-3.5 text-sm text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/5"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 px-8 py-3.5 font-medium text-white shadow-glow-wine transition hover:scale-[1.02]"
              >
                <span>Create My 10 Wishes ❤️</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MANUAL WISH CREATION (ONE FORM AT A TIME) */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Header with Counter & Progress Bar */}
            <div className="rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
                    YOUR WISHES FOR {partnerName.toUpperCase()}
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {String(wishes.length + (wishes.length < 10 ? 1 : 0)).padStart(2, "0")} / 10
                  </h2>
                </div>

                <div className="text-right">
                  <span className="text-xs font-medium text-wine-600 dark:text-rose-300">
                    {wishes.length === 10 ? "Ready to Review!" : `${10 - wishes.length} wishes remaining`}
                  </span>
                  <div className="mt-1 flex items-center justify-end font-mono text-sm font-bold text-wine-600 dark:text-wine-400">
                    {wishes.length} / 10
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-night-800 border border-gray-200 dark:border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-wine-700 via-wine-500 to-rose-400 transition-all duration-500"
                  style={{ width: `${(wishes.length / 10) * 100}%` }}
                />
              </div>

              {/* Toast when wish added */}
              {showToastAdded && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-wine-950/70 p-3 text-xs text-emerald-800 dark:text-rose-200 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-wine-400" />
                  <span>❤️ Wish Added! {String(wishes.length).padStart(2, "0")} / 10 Complete</span>
                </div>
              )}
            </div>

            {/* FORM CONTAINER: ONLY IF < 10 WISHES */}
            {wishes.length < 10 ? (
              <div className="rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-8 shadow-xl backdrop-blur-2xl">
                <form onSubmit={handleAddWish} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Wish Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Better Communication"
                      maxLength={60}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-white dark:bg-night-900 text-gray-900 dark:text-white">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="What do you want your partner to improve or do?"
                      maxLength={300}
                      className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-wine-500 focus:outline-none focus:ring-1 focus:ring-wine-500"
                      required
                    />
                    <div className="mt-1 flex justify-between text-[11px] text-gray-500">
                      <span>Type your heartfelt wish sincerely.</span>
                      <span>{description.length}/300</span>
                    </div>
                  </div>

                  {formError && (
                    <div className="rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
                      {formError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingWish}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 py-3.5 font-medium text-white shadow-glow-wine transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{isSubmittingWish ? "Saving Wish..." : "+ Add Wish"}</span>
                  </button>
                </form>
              </div>
            ) : (
              /* When 10 wishes are complete */
              <div className="rounded-3xl border border-rose-300 dark:border-wine-500/30 bg-rose-50/80 dark:bg-gradient-to-b dark:from-wine-950/70 dark:to-night-900/90 p-8 text-center shadow-2xl backdrop-blur-2xl">
                <PartyPopper className="mx-auto h-12 w-12 text-wine-600 dark:text-wine-400 mb-3" />
                <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                  10 / 10 WISHES COMPLETE ❤️
                </h3>
                <p className="mt-2 text-sm text-wine-800 dark:text-rose-200">
                  You have crafted all 10 wishes for {partnerName}.
                </p>
                <button
                  onClick={() => setStep(3)}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 px-8 py-3.5 font-medium text-white shadow-glow-wine transition hover:scale-105"
                >
                  <span>Review My Wishes →</span>
                </button>
              </div>
            )}

            {/* WISH CARDS (SHOW WHAT HAS BEEN ADDED) */}
            {wishes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
                    Added Wishes ({wishes.length}/10)
                  </span>
                  {wishes.length === 10 && (
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs text-wine-600 dark:text-wine-400 hover:underline font-semibold"
                    >
                      Review All 10 →
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {wishes.map((w) => (
                    <div
                      key={w.id}
                      className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-night-900/70 p-4 transition hover:border-wine-400 dark:hover:border-white/20 shadow-sm dark:shadow-none"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-wine-600 dark:text-wine-400">
                            {String(w.order).padStart(2, "0")}
                          </span>
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {w.title}
                          </h4>
                          <span className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-2 py-0.5 text-[10px] text-wine-700 dark:text-rose-300">
                            {w.category}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteWish(w.id)}
                          title="Remove wish"
                          className="p-1 text-gray-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed pl-6">
                        {w.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: REVIEW SCREEN */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-rose-200/60 dark:border-white/10 bg-white/90 dark:bg-night-900/80 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl">
              <div className="text-center pb-6 border-b border-gray-200/60 dark:border-white/10">
                <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white">
                  ❤️ YOUR 10 WISHES
                </h2>
                <p className="mt-1 text-xs text-wine-600 dark:text-rose-300">
                  Carefully written for {partnerName}
                </p>
              </div>

              {/* List of 10 wishes */}
              <div className="mt-6 space-y-3">
                {wishes.map((w) => (
                  <div
                    key={w.id}
                    className="rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50/70 dark:bg-night-850/60 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-wine-600 dark:text-wine-400">
                          {String(w.order).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {w.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
                        {w.category}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600 dark:text-gray-300 pl-6 leading-relaxed">
                      {w.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Solemn Warning */}
              <div className="mt-8 rounded-2xl border border-rose-200 dark:border-wine-500/20 bg-rose-50 dark:bg-wine-950/40 p-4 text-center">
                <p className="text-xs text-wine-800 dark:text-rose-200 leading-relaxed font-medium">
                  These wishes will become part of your relationship rulebook.
                  <br />
                  <span className="text-gray-900 dark:text-white font-semibold">
                    Once locked, they cannot be changed.
                  </span>
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-6 py-3.5 text-sm text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  ← Go Back
                </button>
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 px-5 py-3.5 text-sm font-semibold text-rose-800 dark:text-rose-200 transition hover:bg-rose-100 dark:hover:bg-rose-900/60"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Wishes</span>
                </button>
                <button
                  onClick={() => setShowLockModal(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 px-8 py-3.5 font-semibold text-white shadow-glow-wine transition hover:scale-[1.02]"
                >
                  <Lock className="h-4 w-4" />
                  <span>🔒 LOCK MY 10 WISHES</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LOCKED CONFIRMATION SCREEN */}
        {step === 4 && (
          <div className="relative overflow-hidden rounded-3xl border border-rose-300 dark:border-wine-500/30 bg-white/95 dark:bg-night-900/90 p-6 sm:p-10 text-center shadow-2xl backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-wine-600 via-rose-400 to-amber-500" />

            <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-wine-800 to-wine-600 shadow-glow-wine text-white mb-6">
              <Lock className="h-10 w-10 text-white" />
            </div>

            <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔒 10 WISHES LOCKED
            </h2>

            <p className="font-serif text-lg text-wine-700 dark:text-rose-200 italic">
              Your wishes are now part of your relationship story.
            </p>
            <p className="text-2xl mt-1">❤️</p>

            {/* Partner status card */}
            <div className="my-8 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850/80 p-5 sm:p-6 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200/60 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {myName}&apos;s 10 Wishes
                  </span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  ✓ LOCKED
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {partner?.wishesLocked ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-gray-400 dark:border-gray-600 flex items-center justify-center text-[10px] text-gray-500">
                      ⋯
                    </div>
                  )}
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {partnerName}&apos;s 10 Wishes
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold ${
                    partner?.wishesLocked ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {partner?.wishesLocked ? "✓ LOCKED" : "⏳ PENDING"}
                </span>
              </div>

              {!partner?.wishesLocked && (
                <div className="rounded-xl bg-gray-100 dark:bg-night-900/60 p-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Now {partnerName} gets her turn. Have {partnerName} log in with her passcode to create and seal her 10 wishes.
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={() => setShowDownloadModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/40 py-3.5 font-semibold text-rose-800 dark:text-rose-200 transition hover:bg-rose-100 dark:hover:bg-rose-900/60 shadow-sm"
              >
                <Download className="h-4 w-4 text-wine-600 dark:text-rose-400" />
                <span>Download Wishes Keepsake (PDF / Text)</span>
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-wine-700 via-wine-600 to-rose-600 py-4 font-semibold text-white shadow-glow-wine transition hover:scale-[1.01]"
              >
                <span>Enter Main Dashboard ❤️</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {!partner?.wishesLocked && (
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    router.push("/login");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-3 text-xs text-gray-600 dark:text-gray-400 transition hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Users className="h-4 w-4 text-wine-500" />
                  <span>Log Out (Allow {partnerName} to Log In)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* CONFIRMATION MODAL */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-500/40 text-rose-600 dark:text-rose-400 mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
              ⚠️ ONE LAST THING
            </h3>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Your 10 wishes are about to be locked.
            </p>

            <div className="my-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-night-850 p-4 text-left text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <p className="font-semibold text-wine-700 dark:text-rose-300">After locking:</p>
              <ul className="space-y-1.5 list-disc pl-4 text-gray-600 dark:text-gray-400">
                <li>They <span className="text-gray-900 dark:text-white font-medium">cannot be edited</span></li>
                <li>They <span className="text-gray-900 dark:text-white font-medium">cannot be replaced</span></li>
                <li>They become part of your relationship history</li>
              </ul>
            </div>

            <p className="font-serif text-lg font-medium text-gray-900 dark:text-white mb-6">
              Are you sure?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                disabled={isLocking}
                className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 transition hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmLock}
                disabled={isLocking}
                className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-3 text-xs font-semibold text-white shadow-glow-wine transition hover:opacity-90"
              >
                {isLocking ? "Locking..." : "YES — LOCK THEM ❤️"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WISH DOWNLOAD / EXPORT MODAL */}
      <WishDownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        wishes={wishes}
        user={user}
        partner={partner}
      />
    </div>
  );
}
