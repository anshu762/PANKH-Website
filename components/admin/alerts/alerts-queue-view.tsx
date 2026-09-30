"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MessageSquare,
  Save,
  Filter,
  Stethoscope,
  ChevronDown,
} from "lucide-react";
import { AdminHighRiskAlertItem } from "@/types/admin";
import { addAlertAdminNoteAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

interface AlertsQueueViewProps {
  initialAlerts: AdminHighRiskAlertItem[];
}

export function AlertsQueueView({ initialAlerts }: AlertsQueueViewProps) {
  const [alerts, setAlerts] = useState<AdminHighRiskAlertItem[]>(initialAlerts);
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "RED" | "AMBER">("ALL");
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filtered = alerts.filter((a) => {
    if (severityFilter !== "ALL" && a.severity !== severityFilter) return false;
    return true;
  });

  const handleStartNote = (alert: AdminHighRiskAlertItem) => {
    setActiveEditingId(alert.id);
    setNoteDraft(alert.adminNotes || "");
  };

  const handleSaveNote = async (alertId: string) => {
    setIsSaving(true);
    const res = await addAlertAdminNoteAction(alertId, noteDraft);
    setIsSaving(false);
    if (res.success) {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, adminNotes: noteDraft } : a))
      );
      setActiveEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              High-Risk Sentinel Alerts Queue ({filtered.length})
            </h3>
            <p className="text-[11px] text-stone-500">
              Sorted by elapsed time since trigger. Showing active flock disease risks across Punjab.
            </p>
          </div>
        </div>

        {/* Severity Filter Toggle */}
        <div className="inline-flex rounded-xl bg-stone-100 p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setSeverityFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
              severityFilter === "ALL" ? "bg-white text-pankh-clay shadow-2xs" : "text-stone-600"
            )}
          >
            All Alerts ({initialAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("RED")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
              severityFilter === "RED" ? "bg-red-600 text-white shadow-2xs" : "text-red-700"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-red-400" />
            RED Alerts Only
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("AMBER")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1",
              severityFilter === "AMBER" ? "bg-amber-600 text-white shadow-2xs" : "text-amber-700"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            AMBER Alerts Only
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filtered.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "p-5 rounded-3xl border bg-white shadow-2xs space-y-4 transition-all",
              alert.severity === "RED" ? "border-red-300" : "border-amber-300"
            )}
          >
            {/* Alert Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-mono px-3 py-1 rounded-full font-bold uppercase",
                    alert.severity === "RED"
                      ? "bg-red-100 text-red-950 border border-red-300"
                      : "bg-amber-100 text-amber-950 border border-amber-300"
                  )}
                >
                  {alert.severity} RISK
                </span>
                <div>
                  <h4 className="font-bold text-sm text-pankh-clay">
                    {alert.farmName} — {alert.farmerName}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-mono">
                    District: {alert.district} • Contact: {alert.farmerPhone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-stone-500 font-mono">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{alert.hoursAgo}h ago</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded font-bold",
                      alert.acknowledged
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-600"
                    )}
                  >
                    Ack: {alert.acknowledged ? "YES" : "NO"}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded font-bold",
                      alert.escalated
                        ? "bg-purple-100 text-purple-900 border border-purple-200"
                        : "bg-stone-100 text-stone-600"
                    )}
                  >
                    Escalated: {alert.escalated ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>

            {/* Alert Content & Clinical Triggers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase font-mono">
                  Identified Clinical Risk Reason
                </span>
                <p className="text-stone-800 font-medium leading-relaxed">
                  {alert.reason}
                </p>
              </div>

              {/* Expert / Vet Escalation State */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase font-mono flex items-center gap-1">
                    <Stethoscope className="h-3.5 w-3.5 text-indigo-700" />
                    Linked Expert Case Status
                  </span>
                  {alert.linkedCase ? (
                    <div className="mt-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-pankh-clay">
                          Status: {alert.linkedCase.status}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Assigned
                        </span>
                      </div>
                      {alert.linkedCase.assignedVetLabName && (
                        <p className="text-[11px] text-stone-600">
                          Specialist: <strong>{alert.linkedCase.assignedVetLabName}</strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-stone-500 text-[11px] mt-1">
                      Farmer has not initiated a veterinary referral case yet. Follow-up phone call recommended.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Internal Resolution Note */}
            <div className="pt-2 border-t border-stone-100">
              {activeEditingId === alert.id ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Enter administrative resolution notes (e.g. called farmer, verified vet attended, biosecurity advice given)..."
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveEditingId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSaveNote(alert.id)}
                      className="px-4 py-1.5 rounded-lg bg-pankh-indigo hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{isSaving ? "Saving..." : "Save Note"}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-600 text-[11px]">Admin Note:</span>
                    <span className="text-stone-700 italic text-[11px]">
                      {alert.adminNotes || "No internal administrative note recorded."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartNote(alert)}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{alert.adminNotes ? "Edit Note" : "+ Add Note"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <p>No active alerts matching your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
