"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Edit2,
  History,
  CheckCircle2,
  X,
  Save,
  ArrowRight,
  Info,
  Sliders,
  Clock,
  User,
  AlertTriangle,
} from "lucide-react";
import { AdminAlertRuleItem } from "@/types/admin";
import { updateAlertRuleAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

interface AlertRulesViewProps {
  initialRules: AdminAlertRuleItem[];
}

export function AlertRulesView({ initialRules }: AlertRulesViewProps) {
  const [rules, setRules] = useState<AdminAlertRuleItem[]>(initialRules);
  const [editingRule, setEditingRule] = useState<AdminAlertRuleItem | null>(null);
  const [newValueInput, setNewValueInput] = useState<number | string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "history">("rules");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleOpenEdit = (rule: AdminAlertRuleItem) => {
    setEditingRule(rule);
    setNewValueInput(rule.thresholdValue);
    setFeedbackMsg(null);
  };

  const handleSaveThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const val = Number(newValueInput);
    if (isNaN(val) || val < 0) {
      setFeedbackMsg({ type: "error", text: "Please enter a valid non-negative number." });
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg(null);

    const res = await updateAlertRuleAction(editingRule.id, val);
    setIsSubmitting(false);

    if (res.success) {
      // Update local state
      const nowIso = new Date().toISOString();
      setRules((prev) =>
        prev.map((r) => {
          if (r.id === editingRule.id) {
            const newHistoryItem = {
              id: "temp-" + Date.now(),
              previousValue: r.thresholdValue,
              newValue: val,
              changedBy: "You (Admin)",
              changedAt: nowIso,
            };
            return {
              ...r,
              thresholdValue: val,
              updatedAt: nowIso,
              history: [newHistoryItem, ...r.history],
            };
          }
          return r;
        })
      );
      setEditingRule(null);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Failed to update threshold" });
    }
  };

  // Compile all history items across all rules
  const allHistory = rules.flatMap((r) =>
    r.history.map((h) => ({
      ...h,
      ruleName: r.name,
      thresholdKey: r.thresholdKey,
    }))
  ).sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime());

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              Sentinel Risk Rules & Engine Thresholds
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Audit-Enforced
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Configure risk trigger limits for automated disease alerts. Every change is immutably logged to AlertRuleHistory.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/60 border border-border rounded-lg text-sm">
          <button
            onClick={() => setActiveTab("rules")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors",
              activeTab === "rules"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sliders className="w-4 h-4" />
            Active Thresholds ({rules.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md font-medium transition-colors",
              activeTab === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="w-4 h-4" />
            Audit Trail ({allHistory.length})
          </button>
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3 text-xs sm:text-sm text-foreground">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-primary">Veterinary Protocol Compliance: </span>
          Adjusting these parameters changes the sensitivity of the early warning system across all registered poultry farms.
          Lowering thresholds increases early alerts; raising them requires greater mortality or drop in feed/water to trigger Sentinel escalation.
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "rules" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.length === 0 ? (
            <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border rounded-xl">
              <ShieldAlert className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-base font-medium">No Sentinel rules registered in database</p>
              <p className="text-xs text-muted-foreground mt-1">
                Run database seed or execute Sentinel migrations to initialize rules.
              </p>
            </div>
          ) : (
            rules.map((rule) => {
              const lastChange = rule.history[0];
              const isRedTrigger = rule.name.toLowerCase().includes("red") || rule.thresholdKey.includes("red");

              return (
                <div
                  key={rule.id}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/40 transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span
                          className={cn(
                            "text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold",
                            isRedTrigger
                              ? "bg-red-500/10 text-red-500 border border-red-500/20"
                              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          )}
                        >
                          {rule.thresholdKey}
                        </span>
                        <h3 className="font-semibold text-foreground text-sm leading-snug pt-1">
                          {rule.name}
                        </h3>
                      </div>
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                        {rule.editable ? "Editable" : "Locked"}
                      </span>
                    </div>

                    {/* Threshold Value Display */}
                    <div className="pt-2 pb-1 border-y border-border/50 flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">Trigger Value:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-mono font-bold text-foreground tracking-tight">
                          {rule.thresholdValue}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {rule.thresholdKey.includes("pct") || rule.thresholdKey.includes("drop") || rule.thresholdKey.includes("mortality") ? "%" : "pts"}
                        </span>
                      </div>
                    </div>

                    {/* Last Change Audit Summary */}
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span>Last updated: {new Date(rule.updatedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      {rule.updatedBy && (
                        <div className="flex items-center gap-1.5 truncate">
                          <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span className="truncate">By: {rule.updatedBy}</span>
                        </div>
                      )}
                      {lastChange && (
                        <div className="text-[11px] text-muted-foreground/80 font-mono pt-1">
                          Previous: {lastChange.previousValue} → {lastChange.newValue}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {rule.history.length} audit {rule.history.length === 1 ? "entry" : "entries"}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(rule)}
                      disabled={!rule.editable}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border shadow-sm",
                        rule.editable
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent"
                          : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60"
                      )}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit Threshold
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Complete Audit History Table */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Complete Alert Rule History Audit Log
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              Total {allHistory.length} audit records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-4 py-3">Timestamp (IST)</th>
                  <th className="px-4 py-3">Rule Name & Key</th>
                  <th className="px-4 py-3">Change Transition</th>
                  <th className="px-4 py-3">Authorized Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-muted-foreground">
                      No historical updates logged yet. Changes will record automatically.
                    </td>
                  </tr>
                ) : (
                  allHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground font-mono whitespace-nowrap">
                        {new Date(item.changedAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div>{item.ruleName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          {item.thresholdKey}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                            {item.previousValue}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold border border-primary/20">
                            {item.newValue}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-foreground">
                        {item.changedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">
                  Update Sentinel Risk Threshold
                </h3>
              </div>
              <button
                onClick={() => setEditingRule(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="p-5 space-y-4">
              {feedbackMsg && (
                <div
                  className={cn(
                    "p-3 rounded-lg text-xs font-medium border flex items-center gap-2",
                    feedbackMsg.type === "error"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  )}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {feedbackMsg.text}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Rule Name</label>
                <div className="text-sm font-semibold text-foreground">
                  {editingRule.name}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  Key: {editingRule.thresholdKey}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-muted/40 rounded-lg border border-border text-center">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground block">
                    Current Threshold
                  </span>
                  <span className="text-xl font-mono font-bold text-foreground">
                    {editingRule.thresholdValue}
                  </span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-muted-foreground block">
                    New Threshold
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newValueInput}
                    onChange={(e) => setNewValueInput(e.target.value)}
                    className="w-full px-3 py-2 text-center text-lg font-mono font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 2.5"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 text-[11px] text-amber-500">
                Notice: Modifying this value immediately takes effect for all active batches and records an immutable entry with your admin identity.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  disabled={isSubmitting}
                  className="px-3 py-2 text-xs font-medium border border-border rounded-lg text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSubmitting ? "Saving..." : "Confirm & Log Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
