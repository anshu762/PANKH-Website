"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookOpen,
  Filter,
  ShieldCheck,
  MessageSquare,
  Search,
  Flag,
  Check,
  X,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Info,
} from "lucide-react";
import { AdminAiReviewItem } from "@/types/admin";
import { markAiMessageReviewedAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

interface AiReviewViewProps {
  initialMessages: AdminAiReviewItem[];
}

export function AiReviewView({ initialMessages }: AiReviewViewProps) {
  const [messages, setMessages] = useState<AdminAiReviewItem[]>(initialMessages);
  const [filterMode, setFilterMode] = useState<"all" | "negative" | "flagged">("negative");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<AdminAiReviewItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"REVIEWED" | "FLAGGED_UNSAFE" | "DISMISSED">("REVIEWED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Statistics
  const negativeCount = messages.filter((m) => m.isNegativeFeedback).length;
  const groundedCount = messages.filter((m) => m.sourceIds.length > 0).length;
  const groundedRate = messages.length > 0 ? Math.round((groundedCount / messages.length) * 100) : 0;

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (filterMode === "negative" && !m.isNegativeFeedback) return false;
    if (filterMode === "flagged" && (!m.feedback || !m.feedback.includes("FLAGGED"))) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.content.toLowerCase().includes(q) ||
      m.farmerName.toLowerCase().includes(q) ||
      m.sourceTitles.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleOpenReview = (msg: AdminAiReviewItem, defaultStatus: "REVIEWED" | "FLAGGED_UNSAFE") => {
    setSelectedMessage(msg);
    setReviewStatus(defaultStatus);
    setReviewNotes("");
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    setIsSubmitting(true);
    const res = await markAiMessageReviewedAction(selectedMessage.id, reviewStatus, reviewNotes);
    setIsSubmitting(false);

    if (res.success) {
      const updatedFeedback = `${reviewStatus}${reviewNotes ? `: ${reviewNotes}` : ""}`;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, feedback: updatedFeedback, isNegativeFeedback: reviewStatus === "FLAGGED_UNSAFE" }
            : m
        )
      );
      setSelectedMessage(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Strict Compliance Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <p className="font-bold font-serif text-sm">
            Hard Safety Rule 1 & 2 Auditing Protocol
          </p>
          <p className="leading-relaxed text-stone-700">
            Pankh AI is strictly forbidden from claiming confirmed disease diagnoses. Every answer must follow the 6-part structure:
            <strong> Answer → Why → What to do now → Ask → Escalate → Source</strong>. Ensure citations came from actual GADVASU/ICAR retrieval.
          </p>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-red-900">
              Negative Feedback
            </span>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-red-700">
            {negativeCount}
          </div>
          <p className="text-[11px] text-stone-500">
            "Not helpful" or farmer follow-up flags
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-emerald-900">
              RAG Grounding Rate
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700">
            {groundedRate}%
          </div>
          <p className="text-[11px] text-stone-500">
            {groundedCount} of {messages.length} grounded in approved sources
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-amber-900">
              Total Audited Sample
            </span>
            <Sparkles className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-3xl font-bold font-mono text-pankh-clay">
            {messages.length}
          </div>
          <p className="text-[11px] text-stone-500">
            Recent farmer queries & assistant responses
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search answers, farmer name, or cited sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-semibold border border-stone-200/80">
          <button
            type="button"
            onClick={() => setFilterMode("negative")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              filterMode === "negative"
                ? "bg-red-600 text-white shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Negative Queue ({negativeCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              filterMode === "all"
                ? "bg-white text-pankh-clay shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <MessageSquare className="h-3 w-3" />
            <span>All Messages ({messages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("flagged")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              filterMode === "flagged"
                ? "bg-amber-600 text-white shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Flag className="h-3 w-3" />
            <span>Flagged Unsafe</span>
          </button>
        </div>
      </div>

      {/* 4. Messages Queue List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
            <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-serif">
              No AI responses pending review in this view
            </p>
            <p className="text-stone-500">
              {filterMode === "negative"
                ? "Zero negative farmer feedback reported currently."
                : "No messages matching your search criteria."}
            </p>
          </div>
        ) : (
          filteredMessages.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-5 sm:p-6 rounded-3xl border bg-white shadow-2xs space-y-4 transition-all",
                item.isNegativeFeedback
                  ? "border-red-300/80 hover:border-red-400"
                  : "border-stone-200/90 hover:border-stone-300"
              )}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 font-serif font-bold text-xs flex items-center justify-center">
                    {item.farmerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-pankh-clay font-serif">
                      {item.farmerName}
                    </span>
                    {item.farmerPhone && (
                      <span className="text-stone-400 font-mono text-[11px] ml-1.5">
                        ({item.farmerPhone})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-stone-500 font-mono">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-stone-100 text-stone-700 border border-stone-200 font-bold">
                    Mode: {item.inputMode}
                  </span>

                  {item.feedback && (
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border",
                        item.feedback.includes("FLAGGED")
                          ? "bg-red-100 text-red-900 border-red-300"
                          : item.feedback.includes("REVIEWED")
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      )}
                    >
                      {item.feedback}
                    </span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans space-y-2">
                <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                  Assistant Response to Farmer
                </div>
                <div className="whitespace-pre-wrap">{item.content}</div>
              </div>

              {/* Citations Grounding Trace */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-amber-800" />
                  <span className="text-[11px] font-bold text-stone-600 font-mono">
                    Retrieved Knowledge Sources ({item.sourceTitles.length}):
                  </span>
                  {item.sourceTitles.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.sourceTitles.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-red-600 font-mono font-bold">
                      Zero citations recorded (Ungrounded fallback)
                    </span>
                  )}
                </div>

                {/* Triage Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenReview(item, "REVIEWED")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Mark Safe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenReview(item, "FLAGGED_UNSAFE")}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-900 text-xs font-bold border border-red-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Flag className="h-3.5 w-3.5 text-red-700" />
                    <span>Flag Unsafe</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Review Dialog Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FAF9F5] rounded-3xl border border-stone-300 w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-800" />
                <h3 className="font-serif font-bold text-base text-pankh-clay">
                  Audit AI Message & Triage
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 font-mono uppercase">
                  Review Determination
                </label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                >
                  <option value="REVIEWED">REVIEWED — Clinically safe and verified</option>
                  <option value="FLAGGED_UNSAFE">FLAGGED_UNSAFE — Violates clinical safety / diagnostic claim</option>
                  <option value="DISMISSED">DISMISSED — Spurious or invalid feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 font-mono uppercase">
                  Audit Note & Corrective Action
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Explain why this response was flagged or approved. If unsafe, note whether knowledge base chunk needs updating..."
                  className="w-full p-3 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving Audit..." : "Submit Determination"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
