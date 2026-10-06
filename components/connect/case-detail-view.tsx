"use client";

import { useState } from "react";
import { CaseWithRelations, CaseSummaryPayload, VetLabDistanceResult } from "@/types/connect";
import { CaseStatus } from "@prisma/client";
import { useLanguage } from "@/hooks/use-language";
import { CaseTrackerStepper } from "./case-tracker-stepper";
import { VetCard } from "./vet-card";
import { ConsentModal } from "./consent-modal";
import { updateCaseStatusAction, sendCaseSummaryAction } from "@/actions/connect";
import {
  Calendar,
  CheckCircle2,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CaseDetailViewProps {
  caseRecord: CaseWithRelations;
  summaryPayload: CaseSummaryPayload;
  nearbyVets: VetLabDistanceResult[];
}

export function CaseDetailView({
  caseRecord: initialCase,
  summaryPayload,
  nearbyVets,
}: CaseDetailViewProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;

  const [currentCase, setCurrentCase] = useState<CaseWithRelations>(initialCase);
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<CaseStatus | null>(null);
  const [selectedVetForConsent, setSelectedVetForConsent] =
    useState<VetLabDistanceResult | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryPayload.formattedWhatsAppText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn("Failed to copy:", e);
    }
  };

  const handleUpdateStatus = async (newStatus: CaseStatus) => {
    try {
      setUpdatingStatus(newStatus);
      const res = await updateCaseStatusAction({
        caseId: currentCase.id,
        status: newStatus,
      });

      if (res.success && res.caseRecord) {
        setCurrentCase(res.caseRecord as CaseWithRelations);
        setActionSuccessMsg(`Case status successfully updated to "${newStatus}".`);
        setTimeout(() => setActionSuccessMsg(null), 5000);
      } else {
        alert(res.error || "Failed to update case status");
      }
    } catch (err: any) {
      alert(err.message || "Failed to update case status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleConfirmDispatch = async (preferredChannel: "WHATSAPP" | "SMS") => {
    if (!selectedVetForConsent) return;

    const res = await sendCaseSummaryAction({
      caseId: currentCase.id,
      vetLabId: selectedVetForConsent.id,
      consentGiven: true,
      preferredChannel,
    });

    if (res.success && res.caseRecord) {
      setCurrentCase(res.caseRecord as CaseWithRelations);
      setActionSuccessMsg(
        `Case summary dispatched to ${selectedVetForConsent.name} via ${preferredChannel}.`
      );
      setTimeout(() => setActionSuccessMsg(null), 8000);
      return res.result;
    } else {
      alert(res.error || "Failed to dispatch summary");
      return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Back button & Title */}
      <div>
        <Link
          href="/dashboard/connect"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-orange-600 mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Connect Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                Case #{currentCase.id.slice(-8).toUpperCase()}
              </span>
              <span className="text-xs text-stone-600 dark:text-stone-300">
                Batch: {currentCase.batch.breed} (Day {summaryPayload.batch.ageDays})
              </span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
              Veterinary Escalation Record
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopySummary}
              className="text-xs flex items-center gap-1.5 min-h-[40px]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied WhatsApp Text</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Case Text</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
            {actionSuccessMsg}
          </p>
        </div>
      )}

      {/* Stepper */}
      <CaseTrackerStepper
        currentStatus={currentCase.status}
        createdAt={currentCase.createdAt}
        assignedVetName={currentCase.assignedVetLab?.name}
      />

      {/* Mandatory Non-Diagnosis Disclaimer (Hard Rule #1) */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-950 dark:text-amber-200">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block text-stone-900 dark:text-stone-100 mb-0.5">
            Pankh Clinical Boundary Protocol (Hard Rule #1)
          </strong>
          <span>{summaryPayload.disclaimer}</span>
        </div>
      </div>

      {/* Farmer Status Update Actions (Brief requirement #7) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2">
          {t.statusUpdateTitle}
        </h3>
        <p className="text-xs text-stone-700 dark:text-stone-300 mb-4">
          Keep your case log current as the veterinarian reviews and treats your flock:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={
              updatingStatus !== null ||
              currentCase.status === CaseStatus.APPOINTMENT ||
              currentCase.status === CaseStatus.ADVICE_RECEIVED ||
              currentCase.status === CaseStatus.RESOLVED
            }
            onClick={() => handleUpdateStatus(CaseStatus.APPOINTMENT)}
            className={`flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl transition-all min-h-[46px] ${
              currentCase.status === CaseStatus.APPOINTMENT
                ? "bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                : "hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>{t.statusActionAppointment}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={
              updatingStatus !== null ||
              currentCase.status === CaseStatus.ADVICE_RECEIVED ||
              currentCase.status === CaseStatus.RESOLVED
            }
            onClick={() => handleUpdateStatus(CaseStatus.ADVICE_RECEIVED)}
            className={`flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl transition-all min-h-[46px] ${
              currentCase.status === CaseStatus.ADVICE_RECEIVED
                ? "bg-purple-50 border-purple-400 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300"
                : "hover:border-purple-400 hover:bg-purple-50/50"
            }`}
          >
            <FileText className="w-4 h-4 text-purple-600" />
            <span>{t.statusActionAdvice}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={updatingStatus !== null || currentCase.status === CaseStatus.RESOLVED}
            onClick={() => handleUpdateStatus(CaseStatus.RESOLVED)}
            className={`flex items-center justify-center gap-2 p-3 text-xs font-bold rounded-xl transition-all min-h-[46px] ${
              currentCase.status === CaseStatus.RESOLVED
                ? "bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                : "hover:border-emerald-400 hover:bg-emerald-50/50"
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{t.statusActionResolved}</span>
          </Button>
        </div>
      </div>

      {/* Case Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Flock Overview & Reported Symptoms */}
        <div className="space-y-5">
          {/* Flock Card */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Flock & Farm Context
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-stone-600 dark:text-stone-400 block">Breed / Type</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {summaryPayload.batch.breed} ({summaryPayload.batch.type})
                </span>
              </div>
              <div>
                <span className="text-stone-600 dark:text-stone-400 block">Age</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  Day {summaryPayload.batch.ageDays}
                </span>
              </div>
              <div>
                <span className="text-stone-600 dark:text-stone-400 block">Current Population</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  {summaryPayload.batch.currentBirds.toLocaleString("en-IN")} /{" "}
                  {summaryPayload.batch.startingBirds.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-stone-600 dark:text-stone-400 block">Livability</span>
                <span className="font-bold text-emerald-600">
                  {summaryPayload.batch.livabilityPct}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
              <span className="text-stone-600 dark:text-stone-400 block">Location</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {[summaryPayload.farmer.village, summaryPayload.farmer.tehsil, summaryPayload.farmer.district]
                  .filter(Boolean)
                  .join(", ")}, Punjab
              </span>
            </div>
          </div>

          {/* Observed Symptoms */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Reported Symptoms & Observations
            </h4>
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-lg text-xs italic text-stone-800 dark:text-stone-200">
              "{summaryPayload.symptoms.farmerDescription}"
            </div>

            {summaryPayload.symptoms.normalizedSymptoms.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Observed Signals:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {summaryPayload.symptoms.normalizedSymptoms.map((sym, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-medium"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 7-Day Trend Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3">
              Flock 7-Day Vital Trends
            </h4>

            {summaryPayload.metricsTrend.length === 0 ? (
              <p className="text-xs text-stone-600 dark:text-stone-400 py-6 text-center">
                No daily health logs recorded yet for this batch.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 px-2">Mortality</th>
                      <th className="py-2 px-2">Feed (kg)</th>
                      <th className="py-2 px-2">Water (L)</th>
                      <th className="py-2 pl-2">Temp (°C)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {summaryPayload.metricsTrend.map((row, i) => (
                      <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                        <td className="py-2 pr-2 font-medium text-stone-800 dark:text-stone-200">
                          {row.date}
                        </td>
                        <td className="py-2 px-2 font-bold text-stone-900 dark:text-stone-100">
                          {row.mortality}
                        </td>
                        <td className="py-2 px-2 text-stone-700 dark:text-stone-300">
                          {row.feedKg !== null ? `${row.feedKg}` : "—"}
                        </td>
                        <td className="py-2 px-2 text-stone-700 dark:text-stone-300">
                          {row.waterLitres !== null ? `${row.waterLitres}` : "—"}
                        </td>
                        <td className="py-2 pl-2 text-stone-700 dark:text-stone-300">
                          {row.shedTemp !== null ? `${row.shedTemp}°` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Assigned Specialist or Action */}
          <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
            {currentCase.assignedVetLab ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-600 dark:text-stone-400 uppercase tracking-wider block">
                    Assigned Specialist
                  </span>
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {currentCase.assignedVetLab.name}
                  </span>
                </div>
                <a
                  href={`tel:${currentCase.assignedVetLab.phone}`}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Call Specialist
                </a>
              </div>
            ) : (
              <div className="text-xs text-stone-600 dark:text-stone-400">
                Not yet dispatched. Select a specialist from the directory below to share this summary.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Formatted Summary Preview Block */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-sm space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-stone-800">
          <span className="text-stone-400 font-sans text-xs font-bold uppercase tracking-wider">
            WhatsApp Transmission Preview
          </span>
          <span className="text-stone-500 font-sans text-[11px]">
            Format: Standard WhatsApp Markdown
          </span>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed max-h-60 overflow-y-auto">
          {summaryPayload.formattedWhatsAppText}
        </pre>
      </div>

      {/* Matched Nearby Specialists */}
      <div className="space-y-4 pt-4 border-t border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            {currentCase.assignedVetLab
              ? "Other Nearby Punjab Specialists"
              : "Select a Specialist to Dispatch This Case"}
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
            Ranked by driving road distance from your farm.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {nearbyVets.map((vet) => (
            <VetCard
              key={vet.id}
              vet={vet}
              onShareCase={(v) => {
                setSelectedVetForConsent(v);
                setIsConsentModalOpen(true);
              }}
              canShare={true}
            />
          ))}
        </div>
      </div>

      {/* Consent Modal */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        onConfirm={handleConfirmDispatch}
        selectedVet={selectedVetForConsent}
        farmerLocation={`${summaryPayload.farmer.village}, ${summaryPayload.farmer.district}`}
        batchName={summaryPayload.batch.name}
      />
    </div>
  );
}
