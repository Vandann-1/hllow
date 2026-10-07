"use client";

import { useState } from "react";
import {
  X,
  Download,
  Printer,
  FileText,
  Copy,
  Check,
  Heart,
  ShieldCheck,
  Calendar,
  Sparkles,
  FileCode,
} from "lucide-react";

export interface WishItem {
  id: string;
  order: number;
  title: string;
  description: string;
  category: string;
  status?: string;
  createdById?: string;
  targetUserId?: string;
}

interface WishDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishes: WishItem[];
  user?: {
    id?: string;
    name?: string;
    username?: string;
  } | null;
  partner?: {
    id?: string;
    name?: string;
    username?: string;
  } | null;
  relationshipStartDate?: string;
}

export default function WishDownloadModal({
  isOpen,
  onClose,
  wishes,
  user,
  partner,
  relationshipStartDate = "2025-12-18",
}: WishDownloadModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUserName = user?.name || "Vandan";
  const partnerName = partner?.name || "Muskaan";

  // Separate wishes by creator if available
  const isVandanUser = user?.username?.toLowerCase() === "vandan";
  const vandanId = isVandanUser ? user?.id : partner?.id;
  const muskaanId = isVandanUser ? partner?.id : user?.id;

  const vandanWishes = wishes.filter((w) => w.createdById === vandanId);
  const muskaanWishes = wishes.filter((w) => w.createdById === muskaanId);

  // If createdById is not separated, fallback to current user wishes vs rest
  const list1 = vandanWishes.length > 0 ? vandanWishes : wishes.filter((w) => w.createdById === user?.id);
  const list2 = muskaanWishes.length > 0 ? muskaanWishes : wishes.filter((w) => w.createdById === partner?.id);

  // Generate plain text format
  const generateTextContent = () => {
    let out = "";
    out += "====================================================================\n";
    out += "             ❤️  VANDAN × MUSKAAN  ❤️\n";
    out += "          OUR SACRED RELATIONSHIP RULEBOOK & WISHES\n";
    out += "====================================================================\n\n";
    out += "✨ Key Milestone Dates:\n";
    out += "   • Connection Began:  18 November\n";
    out += "   • Official Proposal: 18 December 2025\n\n";
    out += "--------------------------------------------------------------------\n";
    out += " PART 1: 10 WISHES BY VANDAN (For Muskaan)\n";
    out += "--------------------------------------------------------------------\n";
    if (list1.length === 0) {
      out += "   (Pending creation / locking)\n\n";
    } else {
      list1.forEach((w, idx) => {
        out += `\n${String(idx + 1).padStart(2, "0")}. [${w.category}] ${w.title}\n`;
        out += `    ${w.description}\n`;
        if (w.status) out += `    Status: ${w.status}\n`;
      });
      out += "\n";
    }

    out += "--------------------------------------------------------------------\n";
    out += " PART 2: 10 WISHES BY MUSKAAN (For Vandan)\n";
    out += "--------------------------------------------------------------------\n";
    if (list2.length === 0) {
      out += "   (Pending creation / locking)\n\n";
    } else {
      list2.forEach((w, idx) => {
        out += `\n${String(idx + 1).padStart(2, "0")}. [${w.category}] ${w.title}\n`;
        out += `    ${w.description}\n`;
        if (w.status) out += `    Status: ${w.status}\n`;
      });
      out += "\n";
    }

    out += "====================================================================\n";
    out += " 💰 THE ₹100 RELATIONSHIP PACT\n";
    out += "====================================================================\n";
    out += "Whenever an agreed wish or rule is broken:\n";
    out += "• ₹100 is immediately added to our shared Relationship Fund.\n";
    out += "• The fund is exclusively reserved for our dates, romantic meals,\n";
    out += "  anniversaries, trips, and loving surprises together.\n\n";
    out += "Sealed with eternal love, honesty, and devotion.\n\n";
    out += "Signed:\n";
    out += "   Vandan:  _________________________\n";
    out += "   Muskaan: _________________________\n";
    out += "====================================================================\n";
    return out;
  };

  // Generate markdown format
  const generateMarkdownContent = () => {
    let out = "";
    out += "# ❤️ Vandan × Muskaan\n\n";
    out += "## Our Sacred Relationship Rulebook & Wishes\n\n";
    out += "> A private digital covenant created exclusively for two hearts.\n\n";
    out += "### 📅 Important Dates\n\n";
    out += "- **Connection Began:** 18 November ✨\n";
    out += "- **Official Proposal:** 18 December 2025 💍\n\n";
    out += "---\n\n";

    out += "### 🌹 Part 1: Wishes Crafted by Vandan (for Muskaan)\n\n";
    if (list1.length === 0) {
      out += "_Pending creation / locking._\n\n";
    } else {
      list1.forEach((w, idx) => {
        out += `#### ${idx + 1}. ${w.title} \`[${w.category}]\`\n`;
        out += `> ${w.description}\n\n`;
      });
    }

    out += "---\n\n";
    out += "### 🌷 Part 2: Wishes Crafted by Muskaan (for Vandan)\n\n";
    if (list2.length === 0) {
      out += "_Pending creation / locking._\n\n";
    } else {
      list2.forEach((w, idx) => {
        out += `#### ${idx + 1}. ${w.title} \`[${w.category}]\`\n`;
        out += `> ${w.description}\n\n`;
      });
    }

    out += "---\n\n";
    out += "### 💰 The ₹100 Rule-Breaking Covenant\n\n";
    out += "- **Penalty:** ₹100 per rule break contributed to our shared Relationship Fund.\n";
    out += "- **Purpose:** Used strictly for romantic dates, dining, gifts, and surprises.\n\n";
    out += "**Sealed forever:** Vandan & Muskaan ❤️\n";
    return out;
  };

  // Download file helper
  const triggerDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(filename);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Print as PDF / Opens printable parchment window
  const handlePrintPdf = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      window.print();
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Vandan × Muskaan — Relationship Rulebook</title>
        <style>
          @page {
            size: A4;
            margin: 18mm 16mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: 'Georgia', serif;
            color: #1f2937;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            line-height: 1.55;
          }
          .parchment {
            border: 2px solid #be123c;
            border-radius: 12px;
            padding: 28px 32px;
            background: #fffafa;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #fda4af;
            padding-bottom: 18px;
            margin-bottom: 22px;
          }
          .title {
            font-size: 26px;
            font-weight: bold;
            color: #881337;
            letter-spacing: 2px;
            margin: 0;
          }
          .subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #9f1239;
            margin-top: 6px;
            font-weight: 600;
          }
          .dates-bar {
            margin-top: 10px;
            display: inline-block;
            background: #ffe4e6;
            color: #9f1239;
            font-size: 12px;
            padding: 4px 14px;
            border-radius: 9999px;
            font-weight: 500;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #881337;
            border-bottom: 1px solid #fecdd3;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 12px;
          }
          .wishes-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .wish-card {
            background: #ffffff;
            border: 1px solid #fecdd3;
            border-left: 3px solid #be123c;
            border-radius: 6px;
            padding: 8px 10px;
            page-break-inside: avoid;
          }
          .wish-num {
            font-family: monospace;
            font-weight: bold;
            color: #be123c;
            margin-right: 6px;
          }
          .wish-title {
            font-weight: bold;
            font-size: 12px;
            color: #111827;
          }
          .wish-cat {
            float: right;
            font-size: 9px;
            background: #fff1f2;
            color: #be123c;
            padding: 2px 6px;
            border-radius: 4px;
            text-transform: uppercase;
          }
          .wish-desc {
            font-size: 11px;
            color: #4b5563;
            margin-top: 4px;
          }
          .pact-box {
            margin-top: 26px;
            padding: 12px 16px;
            background: #fff1f2;
            border: 1px dashed #be123c;
            border-radius: 8px;
            text-align: center;
            page-break-inside: avoid;
          }
          .pact-title {
            font-size: 12px;
            font-weight: bold;
            color: #881337;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .pact-text {
            font-size: 11px;
            color: #4b5563;
            margin-top: 4px;
          }
          .signatures {
            margin-top: 28px;
            display: flex;
            justify-content: space-around;
            text-align: center;
            page-break-inside: avoid;
          }
          .sig-line {
            width: 170px;
            border-top: 1px solid #4b5563;
            margin-top: 36px;
            padding-top: 6px;
            font-size: 12px;
            font-weight: bold;
            color: #111827;
          }
        </style>
      </head>
      <body>
        <div class="parchment">
          <div class="header">
            <h1 class="title">❤️ VANDAN × MUSKAAN ❤️</h1>
            <div class="subtitle">Our Sacred Relationship Rulebook &amp; Wishes</div>
            <div class="dates-bar">
              ✨ Connection Began: 18 November &nbsp;·&nbsp; 💍 Official Proposal: 18 December 2025
            </div>
          </div>

          <div class="section-title">🌹 Part 1: Wishes Crafted by Vandan (for Muskaan)</div>
          <div class="wishes-grid">
            ${
              list1.length === 0
                ? '<div style="font-size:12px;color:#9ca3af;font-style:italic;">Pending creation / locking</div>'
                : list1
                    .map(
                      (w, i) => `
              <div class="wish-card">
                <div>
                  <span class="wish-cat">${w.category}</span>
                  <span class="wish-num">${String(i + 1).padStart(2, "0")}</span>
                  <span class="wish-title">${w.title}</span>
                </div>
                <div class="wish-desc">${w.description}</div>
              </div>`
                    )
                    .join("")
            }
          </div>

          <div class="section-title">🌷 Part 2: Wishes Crafted by Muskaan (for Vandan)</div>
          <div class="wishes-grid">
            ${
              list2.length === 0
                ? '<div style="font-size:12px;color:#9ca3af;font-style:italic;">Pending creation / locking</div>'
                : list2
                    .map(
                      (w, i) => `
              <div class="wish-card">
                <div>
                  <span class="wish-cat">${w.category}</span>
                  <span class="wish-num">${String(i + 1).padStart(2, "0")}</span>
                  <span class="wish-title">${w.title}</span>
                </div>
                <div class="wish-desc">${w.description}</div>
              </div>`
                    )
                    .join("")
            }
          </div>

          <div class="pact-box">
            <div class="pact-title">💰 The ₹100 Relationship Covenant</div>
            <div class="pact-text">
              Every agreed wish or rule broken adds ₹100 directly to our shared Relationship Fund, dedicated solely to our dates, romantic moments, and surprises together.
            </div>
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line">Vandan</div>
              <div style="font-size: 10px; color: #9ca3af;">Signed with eternal love</div>
            </div>
            <div>
              <div class="sig-line">Muskaan</div>
              <div style="font-size: 10px; color: #9ca3af;">Signed with eternal love</div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateTextContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const totalWishes = wishes.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-rose-300 dark:border-white/10 bg-white dark:bg-night-900 p-5 sm:p-7 shadow-2xl transition-all my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-wine-700 to-rose-600 text-white shadow-glow-wine">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Download Relationship Rulebook
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Preserve your 20 sacred wishes for the future ❤️
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Preview Box */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="rounded-2xl border border-rose-200/80 dark:border-white/10 bg-rose-50/50 dark:bg-night-850/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-wine-700 dark:text-rose-300 flex items-center gap-1.5">
                <Heart className="h-4 w-4 fill-wine-500 text-wine-500" />
                Vandan &amp; Muskaan Rulebook
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {totalWishes} {totalWishes === 1 ? "Wish" : "Wishes"} Included
              </span>
            </div>

            <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
              <p>• <strong>Connection Began:</strong> 18 November</p>
              <p>• <strong>Official Proposal:</strong> 18 December 2025</p>
              <p>• <strong>Rule-Breaking Covenant:</strong> ₹100 per broken wish to Relationship Fund</p>
            </div>
          </div>

          {/* Download Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Printable PDF Keepsake */}
            <button
              onClick={handlePrintPdf}
              className="flex items-start gap-3 rounded-2xl border border-rose-300 dark:border-rose-500/30 bg-rose-50/80 dark:bg-wine-950/40 p-4 text-left transition hover:scale-[1.01] hover:border-wine-500 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-600 text-white shadow-glow-wine">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-300 transition">
                  Print or Save as PDF
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Elegant official parchment layout. Choose &quot;Save as PDF&quot; in the print dialog.
                </p>
              </div>
            </button>

            {/* Formatted Text File */}
            <button
              onClick={() =>
                triggerDownload(
                  "Vandan_and_Muskaan_Relationship_Rulebook.txt",
                  generateTextContent(),
                  "text/plain;charset=utf-8"
                )
              }
              className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 p-4 text-left transition hover:scale-[1.01] hover:border-gray-300 dark:hover:border-white/20 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white dark:bg-white/10">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-300 transition">
                  Download Text File (.txt)
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Clean keepsake document formatted with borders and pledges for easy offline reading.
                </p>
              </div>
            </button>

            {/* Markdown File */}
            <button
              onClick={() =>
                triggerDownload(
                  "Vandan_and_Muskaan_Relationship_Rulebook.md",
                  generateMarkdownContent(),
                  "text/markdown;charset=utf-8"
                )
              }
              className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 p-4 text-left transition hover:scale-[1.01] hover:border-gray-300 dark:hover:border-white/20 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-800 text-white dark:bg-white/10">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-300 transition">
                  Download Markdown (.md)
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Formatted Markdown with badges and quotes for Notion, Obsidian, or Notes.
                </p>
              </div>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyClipboard}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 p-4 text-left transition hover:scale-[1.01] hover:border-gray-300 dark:hover:border-white/20 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </div>
              <div>
                <h4 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white group-hover:text-wine-600 dark:group-hover:text-rose-300 transition">
                  {copied ? "Copied to Clipboard! ✓" : "Copy to Clipboard"}
                </h4>
                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
                  Copy the full list of wishes to paste into WhatsApp, Notes, or letter drafts.
                </p>
              </div>
            </button>
          </div>

          {/* Success Banner */}
          {downloadSuccess && (
            <div className="rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium animate-fadeIn">
              ✓ Successfully downloaded <strong>{downloadSuccess}</strong>! Keep it safe forever ✨
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-wine-500" />
            <span>Private keepsake for Vandan &amp; Muskaan</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-night-850 px-4 py-2 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
