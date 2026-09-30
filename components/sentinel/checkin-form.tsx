"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { CheckinUnitToggle } from "./checkin-unit-toggle";
import { CheckinSymptomChips } from "./checkin-symptom-chips";
import {
  ShieldAlert,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Camera,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  Minus,
  Plus,
  Sun,
  Thermometer,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CheckinFormProps {
  batch: {
    id: string;
    birdType: string;
    breed: string;
    productionType: "BROILER" | "LAYER" | string;
    currentBirds: number;
    startingBirds: number;
    placementDate?: Date | string;
  };
  farm: {
    name: string;
    shedCount: number;
  };
  weather?: any;
}

export function CheckinForm({ batch, farm, weather }: CheckinFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t.sentinel;

  // Calculate flock day
  let flockDay = 21;
  if (batch.placementDate) {
    const placed = new Date(batch.placementDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24));
    flockDay = Math.max(1, diff + 1);
  }

  const storageKey = `pankh_sentinel_draft_${batch.id}`;

  // Form State
  const [mortality, setMortality] = useState<number>(0);
  const [feedValue, setFeedValue] = useState<string>("");
  const [feedUnit, setFeedUnit] = useState<"KG" | "BAGS">("KG");
  const [waterValue, setWaterValue] = useState<string>("");
  const [waterUnknown, setWaterUnknown] = useState<boolean>(false);
  const [eggValue, setEggValue] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [shedTemp, setShedTemp] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status & Feedback State
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Hard Rule #7: Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.mortality === "number") setMortality(parsed.mortality);
        if (parsed.feedValue !== undefined) setFeedValue(parsed.feedValue);
        if (parsed.feedUnit) setFeedUnit(parsed.feedUnit);
        if (parsed.waterValue !== undefined) setWaterValue(parsed.waterValue);
        if (parsed.waterUnknown !== undefined) setWaterUnknown(parsed.waterUnknown);
        if (parsed.eggValue !== undefined) setEggValue(parsed.eggValue);
        if (Array.isArray(parsed.selectedSymptoms)) setSelectedSymptoms(parsed.selectedSymptoms);
        if (parsed.shedTemp !== undefined) setShedTemp(parsed.shedTemp);
        if (parsed.notes !== undefined) setNotes(parsed.notes);
        if (parsed.photoPreview) setPhotoPreview(parsed.photoPreview);
        setDraftRestored(true);
      }
    } catch (e) {
      console.warn("Could not parse saved check-in draft:", e);
    }
  }, [storageKey]);

  // 2. Hard Rule #7: Persist draft to localStorage as user edits
  useEffect(() => {
    try {
      const draft = {
        mortality,
        feedValue,
        feedUnit,
        waterValue,
        waterUnknown,
        eggValue,
        selectedSymptoms,
        shedTemp,
        notes,
        photoPreview,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch (e) {
      console.warn("Could not save check-in draft to localStorage:", e);
    }
  }, [
    storageKey,
    mortality,
    feedValue,
    feedUnit,
    waterValue,
    waterUnknown,
    eggValue,
    selectedSymptoms,
    shedTemp,
    notes,
    photoPreview,
  ]);

  // Symptoms catalog
  const symptomItems = [
    {
      id: "cough/sneeze",
      label: s.symptomCough,
      subLabel: "ਖੰਘ / ਛਿੱਕਾਂ",
    },
    {
      id: "loose droppings",
      label: s.symptomDroppings,
      subLabel: "ਪਤਲੀ ਵਿੱਠ",
    },
    {
      id: "sleepy birds",
      label: s.symptomSleepy,
      subLabel: "ਸੁਸਤ ਚੂਚੇ",
    },
    {
      id: "reduced appetite",
      label: s.symptomAppetite,
      subLabel: "ਘੱਟ ਦਾਣਾ",
    },
    {
      id: "weakness",
      label: s.symptomWeakness,
      subLabel: "ਲੱਤਾਂ ਦੀ ਕਮਜ਼ੋਰੀ",
    },
    {
      id: "unusual deaths",
      label: s.symptomDeaths,
      subLabel: "ਅਚਾਨਕ ਮੌਤਾਂ",
      isHighRisk: true,
    },
  ];

  // Validation
  const isMortalityInvalid = mortality > batch.currentBirds || mortality < 0;

  // Photo handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isMortalityInvalid) {
      setErrorMessage(s.mortalityMaxError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        mortality: Number(mortality) || 0,
        feedKg: feedValue ? parseFloat(feedValue) : null,
        feedUnit,
        waterLitres: waterUnknown ? null : waterValue ? parseFloat(waterValue) : null,
        waterUnknown,
        eggCount: batch.productionType === "LAYER" && eggValue ? parseInt(eggValue) : null,
        symptoms: selectedSymptoms,
        shedTemp: shedTemp ? parseFloat(shedTemp) : null,
        notes: notes.trim() || null,
        mediaUrl: photoPreview ? null : null,
      };

      const res = await fetch("/api/sentinel/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit check-in");
      }

      // Hard rule #7: Clear draft after confirmed success
      localStorage.removeItem(storageKey);

      // Redirect to Sentinel alert screen
      router.push("/dashboard/sentinel");
      router.refresh();
    } catch (err: any) {
      console.error("Check-in submission failed:", err);
      setErrorMessage(
        err.message || "Network error. Your draft remains saved locally. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      {/* 1. Header & Fast Progress Banner */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/sentinel"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-pankh-clay transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sentinel</span>
        </Link>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold font-mono">
          <Clock className="h-3.5 w-3.5 text-emerald-700" />
          {s.checkin60sBadge}
        </span>
      </div>

      <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
            {s.checkinTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            {s.checkinSubtitle}
          </p>

          {/* Active Flock Pill */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
              {farm.name}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
              Day {flockDay} • {batch.breed}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300">
              {batch.currentBirds.toLocaleString()} Live Birds
            </span>
          </div>
        </div>

        {/* Draft Restored Banner */}
        {draftRestored && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{s.draftRestored}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(storageKey);
                setDraftRestored(false);
                setMortality(0);
                setFeedValue("");
                setWaterValue("");
                setSelectedSymptoms([]);
                setShedTemp("");
                setNotes("");
              }}
              className="text-[11px] font-bold underline hover:text-amber-950"
            >
              Reset Form
            </button>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-xs text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Network / Submission Error:</span>
                <p>{errorMessage}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              {isSubmitting ? "Retrying..." : "Retry Submission"}
            </button>
          </div>
        )}

        <div className="space-y-5 divide-y divide-stone-100">
          {/* ======================================================== */}
          {/* 1. Mortality Today                                       */}
          {/* ======================================================== */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="mortality-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay"
              >
                {s.mortalityLabel} <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] font-mono text-stone-400">
                Max: {batch.currentBirds}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMortality(Math.max(0, mortality - 1))}
                className="h-12 w-12 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shrink-0"
              >
                <Minus className="h-5 w-5" />
              </button>

              <input
                id="mortality-input"
                type="number"
                min="0"
                max={batch.currentBirds}
                value={mortality}
                onChange={(e) => setMortality(parseInt(e.target.value) || 0)}
                className={cn(
                  "flex-1 h-12 px-4 rounded-xl border-2 text-center text-lg font-mono font-bold transition-all outline-hidden",
                  isMortalityInvalid
                    ? "border-red-500 bg-red-50 text-red-900"
                    : "border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay"
                )}
                placeholder={s.mortalityPlaceholder}
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMortality(Math.min(batch.currentBirds, mortality + 1))
                }
                className="h-12 w-12 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {isMortalityInvalid && (
              <p className="text-xs font-semibold text-red-600 mt-1">
                {s.mortalityMaxError}
              </p>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. Feed Intake & Unit Toggle                             */}
          {/* ======================================================== */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="feed-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay"
              >
                {s.feedLabel}
              </label>

              <CheckinUnitToggle
                unit={feedUnit}
                onChange={(u) => setFeedUnit(u)}
                kgLabel={s.feedUnitKg}
                bagsLabel={s.feedUnitBags}
              />
            </div>

            <div className="relative">
              <input
                id="feed-input"
                type="number"
                step="any"
                min="0"
                value={feedValue}
                onChange={(e) => setFeedValue(e.target.value)}
                placeholder={s.feedPlaceholder}
                className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay text-sm sm:text-base font-mono font-semibold transition-all outline-hidden"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-stone-400 font-mono pointer-events-none">
                {feedUnit === "KG" ? "kg" : "bags (~50kg each)"}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. Water Intake & "Don't know" Toggle                     */}
          {/* ======================================================== */}
          <div className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="water-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay"
              >
                {s.waterLabel}
              </label>

              <button
                type="button"
                onClick={() => {
                  setWaterUnknown(!waterUnknown);
                  if (!waterUnknown) setWaterValue("");
                }}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border min-h-[36px]",
                  waterUnknown
                    ? "bg-amber-100 border-amber-300 text-amber-950 font-bold"
                    : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                )}
              >
                {s.waterUnknownToggle}
              </button>
            </div>

            <div className="relative">
              <input
                id="water-input"
                type="number"
                step="any"
                min="0"
                disabled={waterUnknown}
                value={waterValue}
                onChange={(e) => setWaterValue(e.target.value)}
                placeholder={waterUnknown ? "Not recorded today" : s.waterPlaceholder}
                className={cn(
                  "w-full h-12 px-4 rounded-xl border-2 text-sm sm:text-base font-mono font-semibold transition-all outline-hidden",
                  waterUnknown
                    ? "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
                    : "border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay"
                )}
              />
              {!waterUnknown && (
                <span className="absolute right-4 top-3 text-xs font-bold text-stone-400 font-mono pointer-events-none">
                  Litres
                </span>
              )}
            </div>
            {waterUnknown && (
              <p className="text-[11px] text-stone-500 italic">
                Water intake omitted for today. This will not penalize your flock's risk score.
              </p>
            )}
          </div>

          {/* ======================================================== */}
          {/* 4. Egg Production (Layers only)                          */}
          {/* ======================================================== */}
          {batch.productionType === "LAYER" && (
            <div className="pt-4 space-y-2">
              <label
                htmlFor="egg-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay block"
              >
                {s.eggLabel}
              </label>
              <div className="relative">
                <input
                  id="egg-input"
                  type="number"
                  min="0"
                  value={eggValue}
                  onChange={(e) => setEggValue(e.target.value)}
                  placeholder={s.eggPlaceholder}
                  className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay text-sm sm:text-base font-mono font-semibold transition-all outline-hidden"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-stone-400 font-mono pointer-events-none">
                  Eggs
                </span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. Tappable Symptoms Chips                               */}
          {/* ======================================================== */}
          <div className="pt-4 space-y-2.5">
            <div>
              <span className="text-xs sm:text-sm font-bold text-pankh-clay block">
                {s.symptomsTitle}
              </span>
              <p className="text-[11px] text-stone-500">{s.symptomsDesc}</p>
            </div>

            <CheckinSymptomChips
              items={symptomItems}
              selectedSymptoms={selectedSymptoms}
              onChange={setSelectedSymptoms}
            />
          </div>

          {/* ======================================================== */}
          {/* 6. Shed Temperature (Distinct from outside weather)      */}
          {/* ======================================================== */}
          <div className="pt-4 space-y-3">
            {/* Ambient Outdoor Weather Context */}
            {weather && (
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-600 shrink-0" />
                    Outside Ambient Weather ({weather.condition})
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                    {weather.temp}°C • {weather.humidity}% RH
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1.5 border-t border-amber-200/60">
                  <span className="flex items-center gap-1">
                    Heat Index (THI):{" "}
                    <strong
                      className={cn(
                        "font-mono px-1.5 py-0.2 rounded",
                        weather.heatRisk === "EMERGENCY"
                          ? "bg-red-100 text-red-800"
                          : weather.heatRisk === "DANGER"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {weather.thi} ({weather.heatRisk})
                    </strong>
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    {weather.source || (weather.isEstimated ? "Estimated Baseline" : "Live OWM")}
                  </span>
                </div>
                {weather.recommendation && (
                  <p className="text-[11px] text-amber-900/90 italic">
                    💡 {weather.recommendation}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="temp-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay flex items-center gap-1.5"
              >
                <Thermometer className="h-4 w-4 text-pankh-clay" />
                <span>{s.shedTempLabel} (Indoor Reading)</span>
              </label>
              <p className="text-[11px] text-stone-500">{s.shedTempDesc}</p>
            </div>

            <div className="relative">
              <input
                id="temp-input"
                type="number"
                step="0.1"
                min="10"
                max="55"
                value={shedTemp}
                onChange={(e) => setShedTemp(e.target.value)}
                placeholder="e.g. 31.5"
                className="w-full h-12 px-4 rounded-xl border-2 border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay text-sm sm:text-base font-mono font-semibold transition-all outline-hidden"
              />
              <span className="absolute right-4 top-3 text-xs font-bold text-stone-400 font-mono pointer-events-none">
                °C
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 7. Optional Notes & Photo                                */}
          {/* ======================================================== */}
          <div className="pt-4 space-y-3">
            <div>
              <label
                htmlFor="notes-input"
                className="text-xs sm:text-sm font-bold text-pankh-clay block"
              >
                {s.notesLabel}
              </label>
              <textarea
                id="notes-input"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={s.notesPlaceholder}
                className="w-full p-3 rounded-xl border-2 border-stone-200 focus:border-pankh-marigold bg-white text-pankh-clay text-xs sm:text-sm transition-all outline-hidden mt-1.5 resize-none"
              />
            </div>

            <div>
              <span className="text-xs font-bold text-pankh-clay block">
                {s.photoLabel}
              </span>
              <p className="text-[11px] text-stone-500">{s.photoOptional}</p>

              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-700 cursor-pointer transition-colors">
                  <Camera className="h-4 w-4 text-stone-500" />
                  <span>Attach Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-stone-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute inset-0 bg-black/50 text-white text-[10px] font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-100">
          <button
            type="submit"
            disabled={isSubmitting || isMortalityInvalid}
            className={cn(
              "w-full h-14 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer",
              isSubmitting || isMortalityInvalid
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-pankh-marigold hover:bg-amber-600 active:scale-[0.99]"
            )}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{s.submittingCheckin}</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5" />
                <span>{s.submitCheckin}</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-stone-400 text-center mt-2.5">
            {s.draftSaved}
          </p>
        </div>
      </div>
    </form>
  );
}
