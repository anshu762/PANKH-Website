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
  ShieldCheck,
  Check,
} from "lucide-react";
import { AdminAlertRuleItem } from "@/types/admin";
import { updateAlertRuleAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

interface AlertRulesViewProps {
  initialRules: AdminAlertRuleItem[];
}

function getRuleMeta(thresholdKey: string): { unit: string; description: string } {
  if (thresholdKey.includes("MORTALITY")) {
    return { unit: "%", description: "Daily flock mortality percentage threshold" };
  }
  if (thresholdKey.includes("PERCENT") || thresholdKey.includes("DROP")) {
    return { unit: "%", description: "Percentage deviation drop compared to expected baseline" };
  }
  if (thresholdKey.includes("CELSIUS") || thresholdKey.includes("TEMP")) {
    return { unit: "°C", description: "Shed ambient temperature limit" };
  }
  if (thresholdKey.includes("WEIGHT")) {
    return { unit: "pts", description: "Engine weight contribution in risk scoring formula" };
  }
  if (thresholdKey.includes("THRESHOLD") || thresholdKey.includes("SCORE")) {
    return { unit: "pts", description: "Composite risk score trigger boundary (0-100)" };
  }
  return { unit: "", description: "Sentinel risk evaluation parameter" };
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
              changedBy: "Operations Admin",
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Protocol Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <p className="font-bold font-serif text-sm">
            Sentinel Biosecurity Governance & Immutable Audit Logging
          </p>
          <p className="leading-relaxed text-stone-700">
            Threshold adjustments directly alter the automated disease risk scoring pipeline across all registered poultry sheds in Punjab.
            Every modification is immutably timestamped in the audit log for clinical verification.
          </p>
        </div>
      </div>

      {/* 2. Top Header & Tab Switcher */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              Sentinel Risk Rules & Engine Thresholds
            </h3>
            <p className="text-[11px] text-stone-500">
              Deterministic rule limits evaluated before AI synthesis
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-semibold border border-stone-200/80">
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              activeTab === "rules"
                ? "bg-white text-pankh-clay shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <Sliders className="h-3 w-3 text-amber-800" />
            <span>Active Thresholds ({rules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              activeTab === "history"
                ? "bg-white text-pankh-clay shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            <History className="h-3 w-3 text-amber-800" />
            <span>Audit Trail Log ({allHistory.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Content: Rules Grid or History Log */}
      {activeTab === "rules" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => {
            const isRedTrigger = rule.name.toLowerCase().includes("red") || rule.thresholdKey.includes("red");
            const lastChange = rule.history[0];
            const meta = getRuleMeta(rule.thresholdKey);

            return (
              <div
                key={rule.id}
                className="p-5 rounded-3xl bg-white border border-stone-200/90 hover:border-amber-300/80 shadow-2xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cn(
                        "text-[9px] font-mono px-2 py-0.5 rounded-md font-bold uppercase border",
                        isRedTrigger
                          ? "bg-red-100 text-red-900 border-red-300"
                          : "bg-amber-100 text-amber-900 border-amber-300"
                      )}
                    >
                      {rule.thresholdKey}
                    </span>

                    <span className="text-[10px] font-mono text-stone-500">
                      {rule.editable ? "CONFIGURABLE" : "LOCKED"}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-serif font-bold text-base text-pankh-clay leading-snug">
                      {rule.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  {/* Trigger value badge */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-stone-200/80 flex items-baseline justify-between">
                    <span className="text-xs text-stone-500 font-mono">Trigger Threshold:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-mono font-bold text-pankh-clay">
                        {rule.thresholdValue}
                      </span>
                      <span className="text-xs font-mono text-stone-600 font-bold">
                        {meta.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Audit Meta & Edit Button */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] font-mono text-stone-400 truncate">
                    {lastChange ? (
                      <span>Updated {new Date(lastChange.changedAt).toLocaleDateString()}</span>
                    ) : (
                      <span>Baseline default</span>
                    )}
                  </div>

                  {rule.editable && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(rule)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3 text-amber-800" />
                      <span>Configure</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Audit Trail History Table */
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-amber-800" />
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Immutable Rule Audit Trail Log ({allHistory.length})
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-3">Rule Name</th>
                  <th className="py-3 px-3">Threshold Key</th>
                  <th className="py-3 px-3">Change Transition</th>
                  <th className="py-3 px-3">Auditor</th>
                  <th className="py-3 px-3 text-right">Timestamp (IST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono text-xs">
                {allHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-3.5 px-3 font-sans font-bold text-pankh-clay">
                      {item.ruleName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                        {item.thresholdKey}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 line-through">
                          {item.previousValue}
                        </span>
                        <ArrowRight className="h-3 w-3 text-stone-400" />
                        <span className="font-bold text-amber-800">
                          {item.newValue}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-stone-700">
                      {item.changedBy}
                    </td>
                    <td className="py-3.5 px-3 text-right text-stone-500 text-[11px]">
                      {new Date(item.changedAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Edit Threshold Modal */}
      {editingRule && (() => {
        const editingMeta = getRuleMeta(editingRule.thresholdKey);
        return (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#FAF9F5] rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-amber-800" />
                  <h3 className="font-serif font-bold text-base text-pankh-clay">
                    Configure Risk Threshold
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveThreshold} className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-bold uppercase">
                    {editingRule.thresholdKey}
                  </span>
                  <h4 className="font-serif font-bold text-base text-pankh-clay mt-1">
                    {editingRule.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {editingMeta.description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <label className="text-xs font-bold text-stone-700 font-mono uppercase block">
                    New Threshold Limit ({editingMeta.unit})
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="any"
                      required
                      value={newValueInput}
                      onChange={(e) => setNewValueInput(e.target.value)}
                      className="flex-1 p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-base font-mono font-bold focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-xs font-mono font-bold text-stone-500">
                      {editingMeta.unit}
                    </span>
                  </div>
                </div>

              {feedbackMsg && (
                <div
                  className={cn(
                    "p-3 rounded-xl text-xs font-semibold",
                    feedbackMsg.type === "error"
                      ? "bg-red-50 text-red-900 border border-red-200"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                  )}
                >
                  {feedbackMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? "Updating..." : "Save & Log Change"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
