"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema, OnboardingInput } from "@/schemas/onboarding";
import { completeFarmOnboarding } from "@/actions/onboarding";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { OnboardingHeader } from "./onboarding-header";
import { StepIndicators } from "./step-indicators";
import { StepFarmProfile } from "./step-farm-profile";
import { StepFlockSetup } from "./step-flock-setup";

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

  const form = useForm<OnboardingInput>({
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

  const { setValue, watch, trigger, handleSubmit } = form;
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
      // ignore
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
      // ignore
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

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between selection:bg-pankh-marigold selection:text-white">
      {/* Top Header */}
      <OnboardingHeader />

      {/* Main Wizard Form */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-2xl">
        <StepIndicators step={step} onStepClick={setStep} />

        {serverError && (
          <div className="p-4 mb-6 text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StepFarmProfile
                  form={form}
                  onNext={handleNextStep}
                  gpsLoading={gpsLoading}
                  gpsSuccess={gpsSuccess}
                  onDetectGps={handleDetectLocation}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <StepFlockSetup
                  form={form}
                  onBack={() => setStep(1)}
                  isSubmitting={isSubmitting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </main>

      {/* Subtle Agrarian Footer */}
      <footer className="border-t border-stone-200/80 py-6 text-center text-xs text-stone-500 bg-white/50">
        Pankh • Punjab Poultry Farm Support Platform • Data Secured Under Indian Extension Protocols
      </footer>
    </div>
  );
}
