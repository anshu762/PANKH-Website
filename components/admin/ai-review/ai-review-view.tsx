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
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              AI Safety & Grounding Review Queue
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              Brief Sec 8.6
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Audit AI assistant answers, verify knowledge base retrieval traces, and triage negative farmer feedback.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search answers or sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wider font-mono">
              Negative Farmer Feedback
            </span>
            <div className="text-2xl font-mono font-bold text-foreground">{negativeCount}</div>
            <p className="text-[11px] text-muted-foreground">"Not helpful" or "Problem continuing"</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-500/40" />
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
              RAG Grounding Trace Rate
            </span>
            <div className="text-2xl font-mono font-bold text-foreground">{groundedRate}%</div>
            <p className="text-[11px] text-muted-foreground">{groundedCount} of {messages.length} grounded in approved sources</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
              Total Audited Sample
            </span>
            <div className="text-2xl font-mono font-bold text-foreground">{messages.length}</div>
            <p className="text-[11px] text-muted-foreground">Recent assistant messages sampled</p>
          </div>
          <Sparkles className="w-8 h-8 text-muted-foreground/30" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setFilterMode("negative")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            filterMode === "negative"
              ? "bg-red-500 text-white font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Negative Feedback Queue ({negativeCount})
        </button>
        <button
          onClick={() => setFilterMode("all")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            filterMode === "all"
              ? "bg-primary text-primary-foreground font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          All AI Conversations ({messages.length})
        </button>
        <button
          onClick={() => setFilterMode("flagged")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            filterMode === "flagged"
              ? "bg-amber-500 text-white font-semibold shadow-sm"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Flag className="w-3.5 h-3.5" />
          Flagged Unsafe
        </button>
      </div>

      {/* Review Queue List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl">
            <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500/40 mb-2" />
            <p className="text-base font-medium">No AI responses pending review in this view</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filterMode === "negative"
                ? "No negative farmer feedback reported currently."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          filteredMessages.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-xl border p-5 bg-card transition-all shadow-sm space-y-4",
                item.isNegativeFeedback
                  ? "border-red-500/40 bg-red-500/[0.02]"
                  : "border-border hover:border-primary/40"
              )}
            >
              {/* Top metadata row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                    <span>{item.farmerName}</span>
                    {item.farmerPhone && (
                      <span className="text-muted-foreground font-mono text-[11px]">
                        ({item.farmerPhone})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(item.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-muted text-muted-foreground">
                    Mode: {item.inputMode}
                  </span>
                </div>

                {/* Feedback / Review Status Badge */}
                <div className="flex items-center gap-2">
                  {item.feedback ? (
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 font-mono",
                        item.feedback.includes("FLAGGED")
                          ? "bg-red-500/10 text-red-500 border border-red-500/20"
                          : item.feedback.includes("REVIEWED")
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}
                    >
                      {item.feedback.includes("FLAGGED") ? (
                        <Flag className="w-3 h-3" />
                      ) : item.feedback.includes("REVIEWED") ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {item.feedback}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] text-muted-foreground bg-muted font-mono">
                      No Farmer Feedback
                    </span>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed bg-muted/20 p-3.5 rounded-lg border border-border/50 font-sans">
                {item.content}
              </div>

              {/* Source Trace (RAG Grounding) */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                  RAG Grounding Trace ({item.sourceIds.length} Sources Retained)
                </span>
                {item.sourceTitles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.sourceTitles.map((title, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-primary/10 text-primary border border-primary/20 font-medium"
                      >
                        <BookOpen className="w-3 h-3 opacity-70" />
                        {title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-500 font-mono italic">
                    ⚠️ No KnowledgeSource IDs recorded for this generation (un-grounded or general chitchat)
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-mono">
                  Conv ID: {item.conversationId.slice(0, 10)}...
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenReview(item, "REVIEWED")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 border border-emerald-600/20 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve (Safe)
                  </button>
                  <button
                    onClick={() => handleOpenReview(item, "FLAGGED_UNSAFE")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/10 text-red-600 hover:bg-red-600/20 border border-red-600/20 transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Flag Hallucination / Unsafe
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  Record AI Review Decision
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Decision Verdict</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("REVIEWED")}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors",
                      reviewStatus === "REVIEWED"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Verified Safe
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("FLAGGED_UNSAFE")}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors",
                      reviewStatus === "FLAGGED_UNSAFE"
                        ? "bg-red-500/10 border-red-500 text-red-500 font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Flag Unsafe
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("DISMISSED")}
                    className={cn(
                      "px-3 py-2 rounded-lg text-xs font-medium border text-center transition-colors",
                      reviewStatus === "DISMISSED"
                        ? "bg-muted border-foreground/30 text-foreground font-semibold"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Reviewer Notes / Action Required (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Verified retrieval trace is correct. Farmer question was asking about feed formulation outside guidelines."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  disabled={isSubmitting}
                  className="px-3 py-2 text-xs font-medium border border-border rounded-lg text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Review Decision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
