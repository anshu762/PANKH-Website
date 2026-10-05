"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X, Loader2, Stethoscope, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CustomSelect } from "@/components/ui/custom-select";
import { createFarmerCaseAction } from "@/actions/connect";
import { useRouter } from "next/navigation";

interface BatchOption {
  id: string;
  name: string;
  breed: string;
  currentBirds: number;
}

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  batches: BatchOption[];
  defaultBatchId?: string;
  onCaseCreated?: (newCase: any) => void;
}

const COMMON_SYMPTOMS = [
  "Coughing / Sneezing (ਛਿੱਕਾਂ)",
  "Watery / Green Droppings (ਪਤਲੀਆਂ ਬਿੱਠਾਂ)",
  "Lethargic / Sleepy Birds (ਸੁਸਤ ਪੰਛੀ)",
  "Feed Intake Dropped (ਦਾਣਾ ਘਟਿਆ)",
  "Water Intake Dropped (ਪਾਣੀ ਘਟਿਆ)",
  "Sudden Mortality Spike (ਅਚਾਨਕ ਮੌਤਾਂ)",
  "Facial Swelling (ਮੂੰਹ ਦੀ ਸੋਜ)",
  "Leg Weakness / Paralysis (ਲੱਤਾਂ ਦੀ ਕਮਜ਼ੋਰੀ)",
];

const DRAFT_STORAGE_KEY = "pankh_connect_new_case_draft";

export function NewCaseModal({
  isOpen,
  onClose,
  batches,
  defaultBatchId,
  onCaseCreated,
}: NewCaseModalProps) {
  const router = useRouter();
  const { t: dict } = useLanguage();
  const t = dict.connect;

  const [batchId, setBatchId] = useState(defaultBatchId || batches[0]?.id || "");
  const [description, setDescription] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Restore draft from localStorage on mount (Hard Rule #7)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.batchId) setBatchId(parsed.batchId);
        if (parsed.description) setDescription(parsed.description);
        if (Array.isArray(parsed.selectedSymptoms)) setSelectedSymptoms(parsed.selectedSymptoms);
      }
    } catch (e) {
      console.warn("Failed to restore case draft:", e);
    }
  }, []);

  // Persist draft to localStorage on changes (Hard Rule #7)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (description || selectedSymptoms.length > 0) {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ batchId, description, selectedSymptoms })
        );
      }
    } catch (e) {
      console.warn("Failed to persist case draft:", e);
    }
  }, [batchId, description, selectedSymptoms]);

  if (!isOpen) return null;

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.length < 5) {
      setErrorMessage("Please describe the flock condition (at least 5 characters).");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);

      const res = await createFarmerCaseAction({
        batchId: batchId || batches[0]?.id,
        symptomsDescription: description.trim(),
        selectedSymptoms,
      });

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      // Clear draft on successful submission
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {}

      setDescription("");
      setSelectedSymptoms([]);

      if (onCaseCreated && res.caseRecord) {
        onCaseCreated(res.caseRecord);
      }

      onClose();
      if (res.caseRecord?.id) {
        router.push(`/dashboard/connect/${res.caseRecord.id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create escalation case.");
    } finally {
      setSubmitting(false);
    }
  };

  const batchOptions = batches.map((b) => ({
    value: b.id,
    label: `${b.name} (${b.breed})`,
    sublabel: `${b.currentBirds.toLocaleString("en-IN")} birds • Active Flock`,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#FAF9F5] rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Pankh warm aesthetic */}
        <div className="bg-white px-5 sm:px-6 py-4 sm:py-5 border-b border-stone-200/80 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0 shadow-2xs">
              <Stethoscope className="w-5 h-5 text-orange-700" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-pankh-clay tracking-tight">
                {t.farmerNewCaseTitle}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t.needExpertHelpSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-stone-400 hover:text-stone-700 rounded-xl p-1.5 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-red-800 shadow-2xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Batch Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">
              {t.farmerNewCaseBatchLabel}
            </label>
            <CustomSelect
              value={batchId}
              onChange={setBatchId}
              options={batchOptions}
              placeholder="Select active batch..."
            />
          </div>

          {/* Symptoms Description */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1.5">
              {t.farmerNewCaseSymptomsLabel}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.farmerNewCaseSymptomsPlaceholder}
              rows={3}
              required
              className="w-full text-xs sm:text-sm rounded-xl border-stone-300 focus:border-amber-500 focus:ring-amber-500/20 resize-none bg-white shadow-2xs"
            />
          </div>

          {/* Symptom Chips */}
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-2">
              Select Observed Symptoms (Tap to toggle):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-orange-600 border-orange-600 text-white font-bold shadow-2xs"
                        : "bg-white border-stone-200 hover:border-amber-400 text-stone-700 hover:bg-stone-50"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 border-t border-stone-200/80">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[42px] rounded-xl text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-[42px] rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2 shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Case...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>{t.farmerNewCaseSubmit}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
