"use client";

import { useState, useEffect } from "react";
import { PlusCircle, X, Loader2, Stethoscope, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-stone-900 dark:bg-stone-950 p-5 text-white flex items-start justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600/30 border border-orange-500/50 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {t.farmerNewCaseTitle}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {t.needExpertHelpSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-stone-400 hover:text-white rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Batch Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              {t.farmerNewCaseBatchLabel}
            </label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-orange-500"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.breed}) — {b.currentBirds.toLocaleString("en-IN")} birds
                </option>
              ))}
            </select>
          </div>

          {/* Symptoms Description */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-1">
              {t.farmerNewCaseSymptomsLabel}
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.farmerNewCaseSymptomsPlaceholder}
              rows={4}
              required
              className="w-full text-sm resize-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Symptom Chips */}
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 block mb-2">
              Select Observed Symptoms (Tap to toggle):
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => toggleSymptom(sym)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-orange-600 border-orange-600 text-white font-semibold"
                        : "bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2"
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
