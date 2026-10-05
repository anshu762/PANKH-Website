"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OnboardingInput } from "@/schemas/onboarding";
import { useLanguage } from "@/hooks/use-language";
import { CheckCircle2, ChevronLeft, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { OnboardingFlockPreview } from "./onboarding-flock-preview";

interface StepFlockSetupProps {
  form: UseFormReturn<OnboardingInput>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function StepFlockSetup({
  form,
  onBack,
  isSubmitting,
}: StepFlockSetupProps) {
  const { t } = useLanguage();
  const o = t.onboarding;

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedProdType = watch("productionType");
  const selectedBreed = watch("breed");
  const startingBirds = watch("startingBirds");
  const placementDate = watch("placementDate");

  const breedOptions =
    selectedProdType === "BROILER"
      ? ["Cobb 500", "Ross 308", "Hubbard", "Vencobb 430"]
      : ["BV 300", "Bovans White", "Hy-Line Brown", "Lohmann"];

  const presetCounts = [1000, 3000, 5000, 10000];

  return (
    <div className="space-y-6">
      {/* 1. Production Type & Breed Selection */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-2">
            {o.productionTypeLabel}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "BROILER",
                title: o.productionBroiler,
                desc: "Meat production (~38 - 42 days cycle)",
              },
              {
                id: "LAYER",
                title: o.productionLayer,
                desc: "Commercial egg production (~72 weeks)",
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setValue("productionType", p.id as "BROILER" | "LAYER");
                  setValue("breed", p.id === "BROILER" ? "Cobb 500" : "BV 300");
                  setValue(
                    "birdType",
                    p.id === "BROILER" ? "Commercial Broiler" : "Commercial Layer"
                  );
                }}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[90px] cursor-pointer",
                  selectedProdType === p.id
                    ? "border-pankh-marigold bg-amber-50/60 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-sm text-pankh-clay">
                    {p.title}
                  </span>
                  {selectedProdType === p.id && (
                    <CheckCircle2 className="h-4 w-4 text-pankh-marigold" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-2">
            {o.breedLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {breedOptions.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setValue("breed", b)}
                className={cn(
                  "px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer",
                  selectedBreed === b
                    ? "border-pankh-marigold bg-amber-100/80 text-pankh-clay font-bold shadow-2xs"
                    : "border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                )}
              >
                {b}
              </button>
            ))}
          </div>
          {errors.breed && (
            <p className="text-xs text-rose-600 mt-1">{errors.breed.message}</p>
          )}
        </div>
      </div>

      {/* 2. Flock Placement Numbers & Date */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs sm:text-sm font-bold text-pankh-clay">
              {o.startingBirdsLabel}
            </label>
            <div className="flex items-center gap-1.5">
              {presetCounts.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setValue("startingBirds", num)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 font-semibold border border-stone-200 cursor-pointer"
                >
                  {num.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <input
            type="number"
            {...register("startingBirds", { valueAsNumber: true })}
            onFocus={(e) => e.target.select()}
            placeholder="3000"
            className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-mono font-medium"
          />
          {errors.startingBirds && (
            <p className="text-xs text-rose-600 mt-1">
              {errors.startingBirds.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-1.5">
            {o.placementDateLabel}
          </label>
          <input
            type="date"
            {...register("placementDate")}
            className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-sans font-medium"
          />
          {errors.placementDate && (
            <p className="text-xs text-rose-600 mt-1">
              {errors.placementDate.message}
            </p>
          )}
        </div>
      </div>

      {/* 3. Live Agrarian Projections Card */}
      <OnboardingFlockPreview
        birdCount={startingBirds}
        productionType={selectedProdType}
        breed={selectedBreed}
        placementDate={placementDate}
      />

      {/* Step 2 Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-13 px-5 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{o.backButton}</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 h-13 rounded-2xl bg-pankh-marigold hover:bg-amber-600 text-white font-bold text-sm sm:text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>{o.saving}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>{o.finishButton}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
