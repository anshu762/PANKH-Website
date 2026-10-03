"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  MessageCircle,
  Save,
  Filter,
  Stethoscope,
  ChevronDown,
  Warehouse,
  ExternalLink,
  Edit2,
  User,
  ArrowRight,
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

  const redCount = alerts.filter((a) => a.severity === "RED").length;
  const amberCount = alerts.filter((a) => a.severity === "AMBER").length;
  const escalatedCount = alerts.filter((a) => a.escalated || a.linkedCase).length;

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Executive Surveillance Header & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Total Queue
            </span>
            <ShieldAlert className="h-4 w-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-pankh-clay mt-1.5">
            {alerts.length}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Active surveillance alerts
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-red-50/50 border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-900">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              RED Urgent
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-red-700 mt-1.5">
            {redCount}
          </div>
          <p className="text-[10px] text-red-800/80 mt-1">
            Mortality / feed crash
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              AMBER Watch
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1.5">
            {amberCount}
          </div>
          <p className="text-[10px] text-amber-800/80 mt-1">
            Sub-clinical deviations
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Vet Escalated
            </span>
            <Stethoscope className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1.5">
            {escalatedCount}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Referred to specialist
          </p>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-pankh-clay">
              High-Risk Sentinel Alerts Feed ({filtered.length})
            </h3>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              Ranked by elapsed time since detection across Punjab commercial sheds
            </p>
          </div>
        </div>

        {/* Severity Filter Toggle */}
        <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-semibold self-start sm:self-auto border border-stone-200/80">
          <button
            type="button"
            onClick={() => setSeverityFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px]",
              severityFilter === "ALL"
                ? "bg-white text-pankh-clay shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            )}
          >
            All ({alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("RED")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              severityFilter === "RED"
                ? "bg-red-600 text-white shadow-2xs font-bold"
                : "text-red-700 hover:bg-red-100/50"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            RED ({redCount})
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter("AMBER")}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all cursor-pointer font-mono text-[11px] flex items-center gap-1.5",
              severityFilter === "AMBER"
                ? "bg-amber-600 text-white shadow-2xs font-bold"
                : "text-amber-800 hover:bg-amber-100/50"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            AMBER ({amberCount})
          </button>
        </div>
      </div>

      {/* 3. Alerts Feed Cards */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const cleanPhone = alert.farmerPhone.replace(/\D/g, "");
          const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
            `Sat Sri Akal ${alert.farmerName} ji, Pankh Operations desk se call/message kar rahe hain regarding your poultry flock in ${alert.farmName}. Sentinel alert trigger hua hai: ${alert.reason}.`
          )}`;

          return (
            <div
              key={alert.id}
              className={cn(
                "p-5 sm:p-6 rounded-3xl border bg-white shadow-2xs space-y-4 transition-all relative overflow-hidden",
                alert.severity === "RED"
                  ? "border-red-300/80 hover:border-red-400"
                  : "border-amber-300/80 hover:border-amber-400"
              )}
            >
              {/* Alert Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-xs font-mono px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs",
                      alert.severity === "RED"
                        ? "bg-red-100 text-red-950 border border-red-300"
                        : "bg-amber-100 text-amber-950 border border-amber-300"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        alert.severity === "RED"
                          ? "bg-red-600 animate-pulse"
                          : "bg-amber-600"
                      )}
                    />
                    {alert.severity} URGENT
                  </span>

                  <div>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-pankh-clay">
                      {alert.farmName}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-mono">
                      District: <strong className="text-stone-700">{alert.district}</strong> • Farmer: {alert.farmerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0">
                  <div className="flex items-center gap-1.5 text-stone-500 font-mono bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
                    <Clock className="h-3.5 w-3.5 text-stone-400" />
                    <span>{alert.hoursAgo}h ago</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase",
                        alert.acknowledged
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      )}
                    >
                      Ack: {alert.acknowledged ? "YES" : "PENDING"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alert Content & Clinical Triggers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Clinical Reason Box */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-500 uppercase font-mono tracking-wider">
                    Identified Clinical Risk Reason
                  </span>
                  <p className="text-stone-900 font-medium leading-relaxed font-sans text-xs sm:text-sm">
                    {alert.reason}
                  </p>
                </div>

                {/* Linked Vet Case Box */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 space-y-1.5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-amber-800" />
                      Linked Specialist Escalation
                    </span>

                    {alert.linkedCase ? (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-pankh-clay font-mono text-xs">
                            Case Status: {alert.linkedCase.status}
                          </span>
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            SPECIALIST ASSIGNED
                          </span>
                        </div>
                        {alert.linkedCase.assignedVetLabName && (
                          <p className="text-[11px] text-stone-600">
                            Attending Doctor / Lab: <strong>{alert.linkedCase.assignedVetLabName}</strong>
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-[11px] mt-1 leading-relaxed">
                        Farmer has not yet connected with a veterinarian. Direct phone escalation is strongly recommended.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar & Contact Shortcuts */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${alert.farmerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-colors shadow-2xs"
                  >
                    <Phone className="h-3.5 w-3.5 text-amber-800" />
                    <span>Call Farmer ({alert.farmerPhone})</span>
                  </a>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/farmers`}
                    className="text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                  >
                    <span>Farmer Shed Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Admin Internal Resolution Note */}
              <div className="pt-3 border-t border-stone-100">
                {activeEditingId === alert.id ? (
                  <div className="space-y-2.5">
                    <textarea
                      rows={2}
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Enter administrative resolution notes (e.g. called farmer, advised water sanitation, Dr. Kaur attending at 3 PM)..."
                      className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveEditingId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveNote(alert.id)}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>{isSaving ? "Saving..." : "Save Note"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs bg-stone-50/60 p-3 rounded-xl border border-stone-200/80">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="font-bold text-stone-600 text-[11px] shrink-0 font-mono">
                        Admin Note:
                      </span>
                      <span className="text-stone-700 italic text-[11px] truncate">
                        {alert.adminNotes || "No internal administrative note recorded yet."}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStartNote(alert)}
                      className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>{alert.adminNotes ? "Edit" : "Add Note"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
            <CheckCircle2 className="h-9 w-9 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-serif">
              No active alerts matching your filter criteria
            </p>
            <p className="text-stone-500">
              All monitored poultry flocks are currently operating within safe biosecurity thresholds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
