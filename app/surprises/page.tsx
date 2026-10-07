"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Gift,
  Plus,
  Lock,
  Unlock,
  Sparkles,
  Calendar,
  Clock,
  Heart,
  PartyPopper,
  Video,
  Image as ImageIcon,
  FileText,
  MapPin,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface SurpriseItem {
  id: string;
  title: string;
  type: "MESSAGE" | "PHOTO" | "LETTER" | "DATE_PLAN" | "GIFT_NOTE" | "VIDEO";
  content: string;
  creatorId: string;
  receiverId: string;
  unlockDate: string;
  isOpened: boolean;
  isLocked?: boolean;
  creator: { id: string; name: string; username: string };
  receiver: { id: string; name: string; username: string };
}

const SURPRISE_TYPES = [
  { value: "MESSAGE", label: "💬 Secret Note", icon: FileText },
  { value: "DATE_PLAN", label: "🌹 Secret Date Plan", icon: MapPin },
  { value: "GIFT_NOTE", label: "🎁 Hidden Gift Clue", icon: Gift },
  { value: "PHOTO", label: "📸 Secret Photo Memory", icon: ImageIcon },
  { value: "VIDEO", label: "🎥 Video Link", icon: Video },
];

export default function SurprisesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [surprises, setSurprises] = useState<SurpriseItem[]>([]);
  const [selectedSurprise, setSelectedSurprise] = useState<SurpriseItem | null>(null);

  // Add surprise modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<any>("MESSAGE");
  const [content, setContent] = useState("");
  const [unlockDate, setUnlockDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSurprises = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      const res = await fetch("/api/surprises");
      if (res.ok) {
        const data = await res.json();
        setSurprises(data.surprises || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurprises();
  }, []);

  const handleAddSurprise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !unlockDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/surprises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          content: content.trim(),
          unlockDate,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle("");
        setContent("");
        setUnlockDate("");
        fetchSurprises();
      } else {
        alert("Failed to hide surprise");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealSurprise = async (surprise: SurpriseItem) => {
    if (surprise.isLocked) return;

    setSelectedSurprise(surprise);

    if (!surprise.isOpened) {
      confetti({
        particleCount: 110,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#be123c", "#fb7185"],
      });

      try {
        await fetch(`/api/surprises/${surprise.id}`, { method: "PATCH" });
        setSurprises((prev) =>
          prev.map((s) => (s.id === surprise.id ? { ...s, isOpened: true } : s))
        );
      } catch {
        // ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-night-950">
        <Heart className="h-8 w-8 text-wine-500 animate-ping" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <Navbar user={user} partner={partner} />

      <main className="mx-auto max-w-2xl px-3.5 sm:px-4 pt-6 sm:pt-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              TIME-LOCKED VAULT
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              Surprise Vault 🎁
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-glow-gold transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>+ Hide a Surprise</span>
          </button>
        </div>

        {/* VAULT ITEMS */}
        <div className="space-y-4">
          {surprises.length === 0 ? (
            <div className="rounded-3xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-night-900/60 p-8 sm:p-10 text-center text-xs text-gray-500 dark:text-gray-400">
              <Gift className="mx-auto h-8 w-8 text-amber-500 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">The vault is currently empty.</p>
              <p className="mt-1">Hide a secret gift or romantic date plan locked until a future date!</p>
            </div>
          ) : (
            surprises.map((item) => {
              const isLocked = item.isLocked;

              return (
                <div
                  key={item.id}
                  onClick={() => handleRevealSurprise(item)}
                  className={`group relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition duration-300 ${
                    isLocked
                      ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/50 dark:bg-gradient-to-br dark:from-night-900 dark:via-amber-950/20 dark:to-night-950 cursor-not-allowed"
                      : "border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 hover:border-amber-400 dark:hover:border-amber-500/40 cursor-pointer shadow-sm dark:shadow-xl"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                          isLocked
                            ? "bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse"
                            : "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-300"
                        }`}
                      >
                        {isLocked ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <PartyPopper className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-bold">
                          {isLocked ? "🔒 LOCKED SURPRISE" : "🎉 UNLOCKED & READY"}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <span className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-2 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                      {item.type}
                    </span>
                  </div>

                  {/* Locked Banner vs Reveal text */}
                  {isLocked ? (
                    <div className="mt-4 rounded-2xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/80 dark:bg-amber-950/30 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                      <p className="font-semibold">🎁 SOMETHING IS WAITING FOR YOU</p>
                      <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1">
                        🔒 Unlocks on:{" "}
                        <span className="font-mono font-bold text-amber-800 dark:text-white">
                          {new Date(item.unlockDate).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      <span>Click to open this surprise! ✨</span>
                      <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                        From {item.creator.name}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL: VIEW UNLOCKED SURPRISE */}
      {selectedSurprise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-amber-400 dark:border-amber-500/50 bg-white dark:bg-night-900 p-6 sm:p-8 text-center shadow-2xl">
            <button
              onClick={() => setSelectedSurprise(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 text-3xl shadow-glow-gold mb-4 animate-bounce">
              🎁
            </div>

            <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
              {selectedSurprise.title}
            </h3>
            <p className="text-xs text-amber-600 dark:text-amber-300 mt-1 font-medium">
              Prepared for you by {selectedSurprise.creator?.name} ❤️
            </p>

            <div className="my-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 p-5 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed font-serif">
              {selectedSurprise.content}
            </div>

            <button
              onClick={() => setSelectedSurprise(null)}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 py-3 text-xs font-semibold text-white shadow-glow-gold transition hover:opacity-95"
            >
              Keep Close to My Heart ❤️
            </button>
          </div>
        </div>
      )}

      {/* MODAL: HIDE A SURPRISE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-4">
              🎁 Hide a Secret Surprise
            </h3>

            <form onSubmit={handleAddSurprise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Surprise Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Birthday Staycation Reveal!"
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Surprise Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                >
                  {SURPRISE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Unlock Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                  required
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Content remains strictly encrypted and hidden until this date.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Secret Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Write the hidden clue, date itinerary, or secret link..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-2.5 text-xs font-semibold text-white shadow-glow-gold hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Locking..." : "Lock in Vault 🔒"}
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
