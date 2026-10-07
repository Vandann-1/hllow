"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Plus,
  Lock,
  Heart,
  Calendar,
  Sparkles,
  Smile,
  X,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

interface LetterItem {
  id: string;
  title: string;
  content: string;
  senderId: string;
  receiverId: string;
  unlockDate?: string | null;
  isRead: boolean;
  reaction?: string | null;
  createdAt: string;
  isLocked?: boolean;
  sender: { id: string; name: string; username: string };
  receiver: { id: string; name: string; username: string };
}

const PRESET_TITLES = [
  "💌 Open When You Miss Me",
  "💌 Open When We Fight",
  "💌 Open On Our Anniversary",
  "💌 Open On Your Birthday",
  "💌 When You Think I Don't Love You",
  "💌 Open When You've Had a Rough Day",
  "💌 Open When You Can't Sleep",
];

const REACTIONS = ["❤️", "🥰", "🥹", "💋", "🫂", "✨"];

export default function LettersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);

  // Write modal
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [title, setTitle] = useState(PRESET_TITLES[0]);
  const [customTitle, setCustomTitle] = useState("");
  const [content, setContent] = useState("");
  const [lockUntilDate, setLockUntilDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLetters = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const authData = await authRes.json();
      setUser(authData.user);
      setPartner(authData.partner);

      const res = await fetch("/api/letters");
      if (res.ok) {
        const data = await res.json();
        setLetters(data.letters || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleWriteLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title === "CUSTOM" ? customTitle.trim() : title;
    if (!finalTitle || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          content: content.trim(),
          unlockDate: lockUntilDate || undefined,
        }),
      });

      if (res.ok) {
        setShowWriteModal(false);
        setContent("");
        setLockUntilDate("");
        setTitle(PRESET_TITLES[0]);
        setCustomTitle("");
        fetchLetters();
      } else {
        alert("Failed to send letter");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLetter = async (letter: LetterItem) => {
    setSelectedLetter(letter);
    if (!letter.isRead && letter.receiverId === user?.id && !letter.isLocked) {
      try {
        await fetch(`/api/letters/${letter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markRead: true }),
        });
        setLetters((prev) =>
          prev.map((l) => (l.id === letter.id ? { ...l, isRead: true } : l))
        );
      } catch {
        // ignore
      }
    }
  };

  const handleAddReaction = async (reactionEmoji: string) => {
    if (!selectedLetter) return;
    try {
      await fetch(`/api/letters/${selectedLetter.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: reactionEmoji }),
      });
      setSelectedLetter({ ...selectedLetter, reaction: reactionEmoji });
      setLetters((prev) =>
        prev.map((l) =>
          l.id === selectedLetter.id ? { ...l, reaction: reactionEmoji } : l
        )
      );
    } catch {
      // ignore
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
            <span className="text-[11px] uppercase tracking-widest text-wine-600 dark:text-rose-300 font-bold">
              SEALED WITH LOVE
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
              Love Letters 💌
            </h1>
          </div>

          <button
            onClick={() => setShowWriteModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 px-3.5 py-2 text-xs font-semibold text-white shadow-glow-wine transition hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>+ Write Letter</span>
          </button>
        </div>

        {/* LETTERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {letters.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-gray-200 dark:border-white/5 bg-white/80 dark:bg-night-900/60 p-8 sm:p-10 text-center text-xs text-gray-500 dark:text-gray-400">
              <Mail className="mx-auto h-8 w-8 text-wine-600 dark:text-wine-400 mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">No letters have been written yet.</p>
              <p className="mt-1">Write your partner a secret letter to read when they miss you!</p>
            </div>
          ) : (
            letters.map((letter) => {
              const isLocked = letter.isLocked;
              const isMeSender = letter.senderId === user?.id;

              return (
                <div
                  key={letter.id}
                  onClick={() => handleOpenLetter(letter)}
                  className={`group relative cursor-pointer overflow-hidden rounded-3xl border p-5 transition duration-300 ${
                    isLocked
                      ? "border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-night-900/60 hover:border-amber-400"
                      : "border-gray-200 dark:border-white/10 bg-white/90 dark:bg-night-900/80 hover:border-wine-300 dark:hover:border-wine-500/40 shadow-sm dark:shadow-xl"
                  }`}
                >
                  {/* Wax Seal icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 dark:bg-gradient-to-br dark:from-wine-800 dark:to-wine-950 border border-rose-300 dark:border-wine-500/40 text-wine-700 dark:text-rose-300 shadow-sm dark:shadow-glow-wine">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                        {new Date(letter.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {letter.reaction && (
                        <span className="text-sm">{letter.reaction}</span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 font-serif text-base font-bold text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-200 transition">
                    {letter.title}
                  </h3>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 pt-2">
                    <span>
                      {isMeSender ? `To ${letter.receiver.name}` : `From ${letter.sender.name}`}
                    </span>

                    {isLocked ? (
                      <span className="text-amber-600 dark:text-amber-400 font-mono">
                        🔒 Unlocks on {new Date(letter.unlockDate!).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-wine-600 dark:text-rose-300 group-hover:underline font-medium">
                        Tap to read →
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL: READ LETTER */}
      {selectedLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-rose-300 dark:border-wine-500/40 bg-white dark:bg-gradient-to-b dark:from-night-900 dark:via-night-900 dark:to-night-950 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedLetter(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Letter Header */}
            <div className="text-center pb-4 border-b border-gray-200 dark:border-white/10">
              <span className="inline-block h-8 w-8 rounded-full bg-rose-100 dark:bg-wine-950 border border-rose-300 dark:border-wine-600/40 text-center leading-8 text-sm mb-2">
                💌
              </span>
              <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
                {selectedLetter.title}
              </h2>
              <p className="text-xs text-wine-600 dark:text-rose-300 mt-1">
                Written with devotion by {selectedLetter.sender?.name}
              </p>
            </div>

            {/* Content Body */}
            <div className="my-6 max-h-72 overflow-y-auto rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-night-850/60 p-5 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-serif whitespace-pre-line italic">
              {selectedLetter.content}
            </div>

            {/* Reaction picker if recipient */}
            <div className="border-t border-gray-200 dark:border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Leave a reaction:</span>
                <div className="flex items-center gap-2">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      className={`h-8 w-8 rounded-xl text-sm transition hover:scale-125 ${
                        selectedLetter.reaction === emoji
                          ? "bg-rose-200 dark:bg-wine-900 border border-wine-500"
                          : "bg-gray-100 dark:bg-night-850 hover:bg-gray-200 dark:hover:bg-white/5"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WRITE LETTER */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-300 dark:border-wine-500/40 bg-white dark:bg-night-900 p-6 sm:p-8 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-4">
              💌 Write a Love Letter
            </h3>

            <form onSubmit={handleWriteLetter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Envelope Topic
                </label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-wine-500"
                >
                  {PRESET_TITLES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="CUSTOM">✏️ Custom Topic...</option>
                </select>
              </div>

              {title === "CUSTOM" && (
                <div>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title..."
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-wine-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Letter Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  placeholder="Pour your heart out. They will read this when they need you most..."
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-wine-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Schedule / Lock Until Date (Optional)
                </label>
                <input
                  type="date"
                  value={lockUntilDate}
                  onChange={(e) => setLockUntilDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  Leave blank to make immediately readable.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-wine-700 to-rose-600 py-2.5 text-xs font-semibold text-white shadow-glow-wine hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "Sealing..." : "Seal Letter ❤️"}
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
