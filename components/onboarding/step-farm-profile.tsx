"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { OnboardingInput } from "@/schemas/onboarding";
import { useLanguage } from "@/hooks/use-language";
import {
  Warehouse,
  Wind,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepFarmProfileProps {
  form: UseFormReturn<OnboardingInput>;
  onNext: () => void;
  gpsLoading: boolean;
  gpsSuccess: boolean;
  onDetectGps: () => void;
}

export function StepFarmProfile({
  form,
  onNext,
  gpsLoading,
  gpsSuccess,
  onDetectGps,
}: StepFarmProfileProps) {
  const { t } = useLanguage();
  const o = t.onboarding;

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const selectedFarmType = watch("farmType");
  const selectedVent = watch("ventilationType");
  const lat = watch("latitude");
  const lng = watch("longitude");

  return (
    <div className="space-y-6">
      {/* 1. Farm Name & Location Group */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-1.5">
            {o.farmNameLabel}
          </label>
          <input
            {...register("farmName")}
            placeholder="e.g. Dhillon Broiler Farm"
            className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-medium"
          />
          {errors.farmName && (
            <p className="text-xs text-rose-600 mt-1">{errors.farmName.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs sm:text-sm font-bold text-pankh-clay">
              {o.locationLabel}
            </label>
            <button
              type="button"
              onClick={onDetectGps}
              disabled={gpsLoading}
              className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold hover:text-amber-950 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-amber-700" />
              <span>{gpsLoading ? "Detecting GPS..." : o.pinLocationButton}</span>
            </button>
          </div>
          <input
            {...register("location")}
            placeholder="e.g. Samrala, Ludhiana, Punjab"
            className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-medium"
          />
          {errors.location && (
            <p className="text-xs text-rose-600 mt-1">{errors.location.message}</p>
          )}

          {gpsSuccess && lat && lng && (
            <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>
                GPS Pinned: {lat}, {lng} (Helps local weather alerts)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Shed Structure & Capacity Group */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-2">
            {o.farmTypeLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: "Open Shed",
                title: o.farmTypeOpen,
                desc: "Natural ventilation with wire-mesh and lime-wash walls",
              },
              {
                id: "Closed Environment",
                title: o.farmTypeEC,
                desc: "Sealed tunnel-ventilated shed with automated cooling pads",
              },
            ].map((ft) => (
              <button
                key={ft.id}
                type="button"
                onClick={() => setValue("farmType", ft.id)}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between min-h-[100px] cursor-pointer",
                  selectedFarmType === ft.id
                    ? "border-pankh-marigold bg-amber-50/60 shadow-xs"
                    : "border-stone-200 hover:border-stone-300 bg-white"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-serif font-bold text-sm text-pankh-clay">
                    {ft.title}
                  </span>
                  {selectedFarmType === ft.id && (
                    <CheckCircle2 className="h-4 w-4 text-pankh-marigold" />
                  )}
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  {ft.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-1.5">
              {o.capacityLabel}
            </label>
            <input
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              placeholder="3000"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-mono font-medium"
            />
            {errors.capacity && (
              <p className="text-xs text-rose-600 mt-1">{errors.capacity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-1.5">
              {o.shedCountLabel}
            </label>
            <input
              type="number"
              {...register("shedCount", { valueAsNumber: true })}
              placeholder="1"
              className="w-full h-12 px-4 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm text-stone-900 transition-all font-mono font-medium"
            />
            {errors.shedCount && (
              <p className="text-xs text-rose-600 mt-1">{errors.shedCount.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-pankh-clay mb-1.5">
            {o.ventilationLabel}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              "Tunnel Ventilation",
              "Natural Cross Ventilation",
              "Exhaust Fans + Foggers",
            ].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setValue("ventilationType", v)}
                className={cn(
                  "px-3 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer",
                  selectedVent === v
                    ? "border-pankh-marigold bg-amber-100/70 text-pankh-clay font-bold shadow-2xs"
                    : "border-stone-200 text-stone-600 hover:border-stone-300 bg-white"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1 CTA */}
      <button
        type="button"
        onClick={onNext}
        className="w-full h-13 rounded-2xl bg-pankh-marigold hover:bg-amber-600 text-white font-bold text-sm sm:text-base shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>{o.nextButton}</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
