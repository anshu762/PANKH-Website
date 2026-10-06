"use client";

import { useState } from "react";
import {
  ShieldCheck,
  AlertCircle,
  Phone,
  Check,
  X,
  Loader2,
  MessageSquare,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { VetLabDistanceResult, SendCaseSummaryResult } from "@/types/connect";
import { Button } from "@/components/ui/button";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preferredChannel: "WHATSAPP" | "SMS") => Promise<SendCaseSummaryResult | any>;
  selectedVet: VetLabDistanceResult | null;
  farmerLocation?: string;
  batchName?: string;
}

export function ConsentModal({
  isOpen,
  onClose,
  onConfirm,
  selectedVet,
  farmerLocation,
  batchName,
}: ConsentModalProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;
  const [submitting, setSubmitting] = useState(false);
  const [channel, setChannel] = useState<"WHATSAPP" | "SMS">("WHATSAPP");
  const [dispatchedResult, setDispatchedResult] = useState<SendCaseSummaryResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !selectedVet) return null;

  const handleAuthorize = async () => {
    try {
      setSubmitting(true);
      const outcome = await onConfirm(channel);
      if (outcome && outcome.whatsappUrl) {
        setDispatchedResult(outcome);
        // Attempt programmatic window open
        try {
          window.open(outcome.whatsappUrl, "_blank", "noopener,noreferrer");
        } catch (e) {
          console.warn("Popup blocked, user can click Open in WhatsApp manually:", e);
        }
      } else {
        onClose();
      }
    } catch (err) {
      console.error("Consent dispatch failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopySummary = async () => {
    if (!dispatchedResult?.summaryText) return;
    try {
      await navigator.clipboard.writeText(dispatchedResult.summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.warn("Failed to copy:", e);
    }
  };

  const handleCloseModal = () => {
    setDispatchedResult(null);
    setCopied(false);
    onClose();
  };

  const cleanPhone = (selectedVet.whatsapp || selectedVet.phone).replace(/[^0-9+]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        {/* Header with Pankh Shield Theme */}
        <div className="bg-white px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-200/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 id="consent-title" className="text-base sm:text-lg font-serif font-bold text-pankh-clay tracking-tight">
                {dispatchedResult ? "Case Summary Ready to Share" : t.consentModalTitle}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {dispatchedResult
                  ? "Direct WhatsApp clinical escalation active"
                  : "Pankh Section 11 Farmer Data Protection"}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            disabled={submitting}
            className="text-stone-400 hover:text-stone-700 rounded-xl p-1.5 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Phase 1 (Consent Form) vs Phase 2 (Action Hub) */}
        {!dispatchedResult ? (
          <>
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="bg-orange-50/80 border border-orange-200/90 rounded-2xl p-3.5 text-xs text-orange-950 leading-relaxed flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <span>{t.consentModalDesc}</span>
              </div>

              {/* Specialist Summary */}
              <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                  Recipient Specialist
                </span>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <h4 className="font-bold text-stone-900 text-sm">
                    {selectedVet.name}
                  </h4>
                  <span className="text-xs font-semibold text-orange-600 shrink-0">
                    {selectedVet.distanceKm} km away
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {selectedVet.qualification || selectedVet.address}
                </p>
              </div>

              {/* Shared Data Disclosure */}
              <div>
                <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono mb-2">
                  {t.consentSummaryDataPoints}
                </h5>
                <ul className="space-y-2 text-xs text-stone-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">{t.consentPhonePoint}</strong>
                      {farmerLocation ? ` (${farmerLocation})` : ""}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">{t.consentFlockPoint}</strong>
                      {batchName ? ` [Batch: ${batchName}]` : ""}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-stone-900">{t.consentTrendsPoint}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Non-diagnosis disclaimer label:{" "}
                      <em className="text-stone-600 font-serif">"{t.disclaimerLabel}"</em>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Channel Selector */}
              <div className="pt-2">
                <span className="text-xs font-bold text-stone-700 block mb-1.5">
                  Transmission Channel
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel("WHATSAPP")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      channel === "WHATSAPP"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs ring-1 ring-emerald-500"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>WhatsApp (1-Click Share)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      channel === "SMS"
                        ? "border-orange-600 bg-orange-50 text-orange-900 font-bold shadow-2xs ring-1 ring-orange-500"
                        : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>Direct Copy / SMS</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="bg-white px-5 sm:px-6 py-4 flex flex-col sm:flex-row gap-2.5 sm:justify-end border-t border-stone-200/80">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={submitting}
                className="min-h-[42px] rounded-xl text-stone-600 hover:bg-stone-100"
              >
                {t.consentCancelBtn}
              </Button>
              <Button
                type="button"
                onClick={handleAuthorize}
                disabled={submitting}
                className="min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing Summary...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t.consentAuthorizeBtn}</span>
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Phase 2: Post-Authorization Interactive Hub */
          <div className="p-5 sm:p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1 shadow-2xs">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 mb-1">
                <Check className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-emerald-950 font-serif">
                Case Telemetry Authorized & Recorded!
              </h3>
              <p className="text-xs text-emerald-800">
                Case status updated to <strong>CONTACTED</strong> in Pankh audit log.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 text-xs text-stone-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900">{selectedVet.name}</span>
                <span className="text-[11px] font-mono text-stone-500">{cleanPhone}</span>
              </div>
              <p className="text-[11px] text-stone-500">
                A pre-filled clinical summary has been prepared. Click below to send or copy.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {dispatchedResult.whatsappUrl && (
                <a
                  href={dispatchedResult.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open in WhatsApp Now</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Summary</span>
                    </>
                  )}
                </button>

                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-blue-50/50 hover:border-blue-200 text-xs font-semibold text-stone-700 transition-colors cursor-pointer truncate"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Call Doctor</span>
                </a>
              </div>
            </div>

            {/* Dismiss Footer */}
            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <Button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto min-h-[38px] rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
