"use client";

import { useState } from "react";
import { ShieldCheck, AlertCircle, Phone, MapPin, Activity, Check, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { VetLabDistanceResult } from "@/types/connect";
import { Button } from "@/components/ui/button";

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (preferredChannel: "WHATSAPP" | "SMS") => Promise<void>;
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

  if (!isOpen || !selectedVet) return null;

  const handleAuthorize = async () => {
    try {
      setSubmitting(true);
      await onConfirm(channel);
      onClose();
    } catch (err) {
      console.error("Consent dispatch failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
      >
        {/* Header with Vermilion / Shield Accent */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="consent-title" className="text-lg font-bold">
                {t.consentModalTitle}
              </h2>
              <p className="text-xs text-orange-100 mt-0.5">
                Pankh Section 11 Farmer Data Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-white/80 hover:text-white rounded-lg p-1 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 rounded-xl p-3.5 text-xs text-orange-900 dark:text-orange-200 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <span>{t.consentModalDesc}</span>
          </div>

          {/* Specialist Summary */}
          <div className="bg-stone-50 dark:bg-stone-800/50 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Recipient Specialist
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                {selectedVet.name}
              </h4>
              <span className="text-xs font-semibold text-orange-600">
                {selectedVet.distanceKm} km away
              </span>
            </div>
            <p className="text-xs text-stone-700 dark:text-stone-300 mt-0.5">
              {selectedVet.qualification || selectedVet.address}
            </p>
          </div>

          {/* Shared Data Disclosure */}
          <div>
            <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider mb-2">
              {t.consentSummaryDataPoints}
            </h5>
            <ul className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 dark:text-stone-100">{t.consentPhonePoint}</strong>
                  {farmerLocation ? ` (${farmerLocation})` : ""}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 dark:text-stone-100">{t.consentFlockPoint}</strong>
                  {batchName ? ` [Batch: ${batchName}]` : ""}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-900 dark:text-stone-100">{t.consentTrendsPoint}</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Non-diagnosis disclaimer label:{" "}
                  <em className="text-stone-700 dark:text-stone-300 font-serif">"{t.disclaimerLabel}"</em>
                </span>
              </li>
            </ul>
          </div>

          {/* Channel Selector */}
          <div className="pt-2">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1.5">
              Transmission Channel
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("WHATSAPP")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  channel === "WHATSAPP"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                }`}
              >
                <span>WhatsApp (Recommended)</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("SMS")}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  channel === "SMS"
                    ? "border-orange-600 bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-bold"
                    : "border-stone-200 dark:border-stone-800 text-stone-600 hover:bg-stone-50 dark:hover:bg-stone-800"
                }`}
              >
                <span>SMS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 dark:bg-stone-800/80 px-6 py-4 flex flex-col sm:flex-row gap-2.5 sm:justify-end border-t border-stone-200 dark:border-stone-800">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="min-h-[44px]"
          >
            {t.consentCancelBtn}
          </Button>
          <Button
            type="button"
            onClick={handleAuthorize}
            disabled={submitting}
            className="min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transmitting...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>{t.consentAuthorizeBtn}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
