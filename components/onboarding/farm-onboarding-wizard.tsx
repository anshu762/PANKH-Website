"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  onboardingSchema,
  OnboardingInput,
  farmStepSchema,
  batchStepSchema,
} from "@/schemas/onboarding";
import { useLanguage } from "@/hooks/use-language";
import { completeFarmOnboarding } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import {
  Warehouse,
  Wind,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageSelector } from "@/components/common/language-selector";
import Link from "next/link";

interface FarmOnboardingWizardProps {
  initialFarmerName?: string;
  initialVillage?: string;
  initialDistrict?: string;
}

export function FarmOnboardingWizard({
  initialFarmerName = "",
  initialVillage = "",
  initialDistrict = "",
}: FarmOnboardingWizardProps) {
  const { t, lang } = useLanguage();
  const o = t.onboarding;
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const defaultLocation = [initialVillage, initialDistrict]
    .filter(Boolean)
    .join(", ");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      farmName: initialFarmerName
        ? `${initialFarmerName}'s Poultry Farm`
        : "Kisan Poultry Farm",
      location: defaultLocation || "Punjab",
      latitude: null,
      longitude: null,
      farmType: "Open Shed",
      capacity: 3000,
      shedCount: 1,
      ventilationType: "Tunnel Ventilation",
      birdType: "Commercial Broiler",
      breed: "Cobb 500",
      productionType: "BROILER",
      placementDate: todayStr,
      startingBirds: 3000,
    },
    mode: "onBlur",
  });

  const currentValues = watch();

  // Restore draft from localStorage (Rule #7)
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem("pankh_onboarding_draft");
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.farmName) setValue("farmName", parsed.farmName);
        if (parsed.location) setValue("location", parsed.location);
        if (parsed.latitude) setValue("latitude", parsed.latitude);
        if (parsed.longitude) setValue("longitude", parsed.longitude);
        if (parsed.farmType) setValue("farmType", parsed.farmType);
        if (parsed.capacity) setValue("capacity", parsed.capacity);
        if (parsed.shedCount) setValue("shedCount", parsed.shedCount);
        if (parsed.ventilationType)
          setValue("ventilationType", parsed.ventilationType);
        if (parsed.birdType) setValue("birdType", parsed.birdType);
        if (parsed.breed) setValue("breed", parsed.breed);
        if (parsed.productionType)
          setValue("productionType", parsed.productionType);
        if (parsed.placementDate)
          setValue("placementDate", parsed.placementDate);
        if (parsed.startingBirds)
          setValue("startingBirds", parsed.startingBirds);
      }
    } catch {
      // ignore JSON errors
    }
  }, [setValue]);

  // Persist draft to localStorage on any field change (Rule #7)
  useEffect(() => {
    try {
      localStorage.setItem(
        "pankh_onboarding_draft",
        JSON.stringify(currentValues)
      );
    } catch {
      // ignore storage quota errors
    }
  }, [currentValues]);

  // GPS Pin Location Helper
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setValue("latitude", lat);
        setValue("longitude", lng);
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleNextStep = async () => {
    // Validate Step 1 fields
    const isStep1Valid = await trigger([
      "farmName",
      "location",
      "farmType",
      "capacity",
      "shedCount",
      "ventilationType",
    ]);

    if (isStep1Valid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (values: OnboardingInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await completeFarmOnboarding(values);
      if (res?.error) {
        setServerError(res.error);
        setIsSubmitting(false);
        return;
      }

      // Clear draft upon successful creation
      try {
        localStorage.removeItem("pankh_onboarding_draft");
      } catch {
        // ignore
      }

      router.push("/dashboard");
    } catch (err) {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedFarmType = currentValues.farmType;
  const selectedProdType = currentValues.productionType;
  const selectedVent = currentValues.ventilationType;

  return (
    <div className="min-h-screen bg-pankh-paper flex flex-col justify-between selection:bg-pankh-marigold selection:text-white">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="container mx-auto px-4 h-16 max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-pankh-clay flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
              ਪੰ
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-pankh-clay">
              {t.common.platformName}
            </span>
          </Link>
          <LanguageSelector variant="pill" />
        </div>
      </header>

      {/* Main Wizard Container */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        {/* Progress Bar & Badges */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100/80 text-amber-900 font-medium">
              <Sparkles className="h-3 w-3 text-amber-700" />
              {o.badge}
            </span>
            <span className="text-stone-500 font-mono">
              Step {step} of 2
            </span>
          </div>

          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300 rounded-full"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>

          <div className="pt-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
              {step === 1 ? o.step1Title : o.step2Title}
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              {step === 1 ? o.step1Desc : o.step2Desc}
            </p>
          </div>
        </div>

        {serverError && (
          <div className="p-3 mb-6 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
            {serverError}
          </div>
        )}

        {/* Form Wizard */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs"
              >
                {/* Farm Name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-pankh-clay flex items-center justify-between">
                    <span>{o.farmNameLabel}</span>
                    <span className="text-xs text-stone-500 font-normal">
                      Required
                    </span>
                  </label>
                  <input
                    type="text"
                    {...register("farmName")}
                    placeholder={o.farmNamePlaceholder}
                    className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.farmName && (
                    <p className="text-xs text-destructive">
                      {errors.farmName.message}
                    </p>
                  )}
                </div>

                {/* Location + GPS */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-pankh-clay">
                    {o.locationLabel}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      {...register("location")}
                      placeholder={o.locationPlaceholder}
                      className="flex-1 h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={gpsLoading}
                      className="inline-flex items-center justify-center gap-1.5 px-4 h-12 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors shrink-0"
                    >
                      <MapPin className="h-4 w-4 text-amber-700" />
                      <span>
                        {gpsLoading
                          ? "Detecting..."
                          : gpsSuccess
                          ? o.locationPinned
                          : o.pinLocationButton}
                      </span>
                    </button>
                  </div>
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                {/* Farm Structure Type (Large Tap Cards) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-pankh-clay">
                    {o.farmTypeLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "Open Shed",
                        label: o.farmTypeOpen,
                        desc: "Natural airflow with curtains",
                      },
                      {
                        id: "Environment Controlled (EC)",
                        label: o.farmTypeEC,
                        desc: "Full automated climate pads",
                      },
                      {
                        id: "Semi-EC / Deep Litter",
                        label: o.farmTypeSemiEC,
                        desc: "Exhaust fans & partial pads",
                      },
                    ].map((type) => {
                      const isSelected = selectedFarmType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setValue("farmType", type.id)}
                          className={`p-4 rounded-xl border text-left transition-all min-h-[90px] flex flex-col justify-between ${
                            isSelected
                              ? "border-primary bg-amber-50/70 ring-2 ring-primary/40 shadow-xs"
                              : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/80"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <Warehouse
                              className={`h-5 w-5 ${
                                isSelected ? "text-primary" : "text-stone-500"
                              }`}
                            />
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold block text-pankh-clay">
                              {type.label}
                            </span>
                            <span className="text-[11px] text-stone-500 block leading-tight mt-0.5">
                              {type.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.farmType && (
                    <p className="text-xs text-destructive">
                      {errors.farmType.message}
                    </p>
                  )}
                </div>

                {/* Capacity & Shed Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay">
                      {o.capacityLabel}
                    </label>
                    <input
                      type="number"
                      {...register("capacity", { valueAsNumber: true })}
                      placeholder={o.capacityPlaceholder}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.capacity && (
                      <p className="text-xs text-destructive">
                        {errors.capacity.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay">
                      {o.shedCountLabel}
                    </label>
                    <input
                      type="number"
                      {...register("shedCount", { valueAsNumber: true })}
                      min={1}
                      max={50}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.shedCount && (
                      <p className="text-xs text-destructive">
                        {errors.shedCount.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ventilation Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-pankh-clay">
                    {o.ventilationLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: "Tunnel Ventilation", label: o.ventilationTunnel },
                      { id: "Curtains / Natural", label: o.ventilationNatural },
                      { id: "Exhaust Fans", label: o.ventilationFans },
                    ].map((vent) => {
                      const isSelected = selectedVent === vent.id;
                      return (
                        <button
                          key={vent.id}
                          type="button"
                          onClick={() => setValue("ventilationType", vent.id)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all min-h-[48px] flex items-center justify-between ${
                            isSelected
                              ? "border-primary bg-amber-50 text-primary font-bold shadow-xs"
                              : "border-stone-200 bg-background text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          <span className="text-left leading-tight">
                            {vent.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>{o.nextButton}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs"
              >
                {/* Production Type Toggle (Broiler vs Layer) */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-pankh-clay">
                    {o.productionTypeLabel}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        id: "BROILER",
                        title: o.productionBroiler,
                        desc: o.productionBroilerDesc,
                        tag: "35-42 days",
                      },
                      {
                        id: "LAYER",
                        title: o.productionLayer,
                        desc: o.productionLayerDesc,
                        tag: "72+ weeks",
                      },
                    ].map((item) => {
                      const isSelected = selectedProdType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setValue(
                              "productionType",
                              item.id as "BROILER" | "LAYER"
                            );
                            if (item.id === "BROILER") {
                              setValue("breed", "Cobb 500");
                              setValue("birdType", "Commercial Broiler");
                            } else {
                              setValue("breed", "BV-300");
                              setValue("birdType", "Commercial Layer");
                            }
                          }}
                          className={`p-4 rounded-xl border text-left transition-all min-h-[96px] flex flex-col justify-between ${
                            isSelected
                              ? "border-primary bg-amber-50/70 ring-2 ring-primary/40 shadow-xs"
                              : "border-stone-200 bg-stone-50/50 hover:bg-stone-100/80"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold text-pankh-clay">
                              {item.title}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono font-medium">
                              {item.tag}
                            </span>
                          </div>
                          <span className="text-xs text-stone-600 leading-relaxed mt-1 block">
                            {item.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bird Category & Breed Presets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay">
                      {o.birdTypeLabel}
                    </label>
                    <input
                      type="text"
                      {...register("birdType")}
                      placeholder={o.birdTypePlaceholder}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.birdType && (
                      <p className="text-xs text-destructive">
                        {errors.birdType.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay">
                      {o.breedLabel}
                    </label>
                    <input
                      type="text"
                      {...register("breed")}
                      placeholder={o.breedPlaceholder}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.breed && (
                      <p className="text-xs text-destructive">
                        {errors.breed.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Breed Chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-stone-500 mr-1 font-medium">
                    Quick select:
                  </span>
                  {(selectedProdType === "BROILER"
                    ? ["Cobb 500", "Ross 308", "Hubbard", "Kuroiler", "Desi"]
                    : ["BV-300", "Bovans White", "Hy-Line", "Lohmann", "Desi"]
                  ).map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setValue("breed", chip)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors font-medium"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Placement Date & Starting Birds */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-stone-500" />
                      <span>{o.placementDateLabel}</span>
                    </label>
                    <input
                      type="date"
                      {...register("placementDate")}
                      defaultValue={todayStr}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.placementDate && (
                      <p className="text-xs text-destructive">
                        {errors.placementDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pankh-clay">
                      {o.startingBirdsLabel}
                    </label>
                    <input
                      type="number"
                      {...register("startingBirds", { valueAsNumber: true })}
                      placeholder={o.startingBirdsPlaceholder}
                      className="w-full h-12 px-3.5 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.startingBirds && (
                      <p className="text-xs text-destructive">
                        {errors.startingBirds.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Bird Count Chips */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-stone-500 mr-1 font-medium">
                    Flock size:
                  </span>
                  {[1000, 2500, 3000, 5000, 10000].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setValue("startingBirds", count)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors font-medium"
                    >
                      {count.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons (Back & Complete) */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="h-12 px-5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-700 font-semibold text-sm transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{o.backButton}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-amber-600 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>{o.saving}</span>
                    ) : (
                      <>
                        <span>{o.finishButton}</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Local Draft Status Notice (Rule #7) */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-stone-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{o.draftSaved}</span>
        </div>
      </main>
    </div>
  );
}
