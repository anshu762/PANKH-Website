"use client";

import React, { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { updateFarmerProfile } from "@/actions/farmer";
import { SupportedLanguage } from "@/lib/i18n/types";
import {
  User,
  Warehouse,
  Layers,
  Globe,
  Check,
  Edit2,
  Save,
  X,
  Phone,
  MapPin,
  Calendar,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface FarmerProfileViewProps {
  farmer: any;
  farm: any;
  batch: any;
}

export function FarmerProfileView({
  farmer,
  farm,
  batch,
}: FarmerProfileViewProps) {
  const { t, lang, setLanguage } = useLanguage();
  const p = t.profile;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [name, setName] = useState(farmer?.user?.name || "");
  const [phone, setPhone] = useState(farmer?.user?.phone || "");
  const [village, setVillage] = useState(farmer?.village || "");
  const [district, setDistrict] = useState(farmer?.district || "");
  const [state, setState] = useState(farmer?.state || "Punjab");

  const handleLanguageChange = async (newLang: SupportedLanguage) => {
    setLanguage(newLang);

    const enumMap: Record<
      SupportedLanguage,
      "PUNJABI" | "ENGLISH" | "HINDI" | "HINGLISH"
    > = {
      pa: "PUNJABI",
      en: "ENGLISH",
      hi: "HINDI",
      hinglish: "HINGLISH",
    };

    await updateFarmerProfile({ preferredLanguage: enumMap[newLang] });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      await updateFarmerProfile({
        name,
        phone,
        village,
        district,
        state,
      });
      setIsSaving(false);
      setIsEditing(false);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div key={lang} className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
            {p.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            {p.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs sm:text-sm font-semibold text-stone-700 transition-colors shadow-2xs self-start sm:self-auto min-h-[40px]"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              <span>{p.cancel}</span>
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 text-primary" />
              <span>{p.editProfile}</span>
            </>
          )}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{p.savedSuccess}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* Card 1: Farmer Personal Details                          */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
            <User className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
            {p.farmerDetails}
          </h2>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pankh-clay">
                  {p.name}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pankh-clay">
                  {p.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pankh-clay">
                  {p.village}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-pankh-clay">
                  {p.district}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-stone-300 bg-background text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-primary hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? p.saving : p.saveChanges}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 block text-xs">{p.name}</span>
              <span className="font-bold text-pankh-clay text-base">
                {farmer?.user?.name || "Farmer"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">{p.phone}</span>
              <span className="font-semibold text-pankh-clay">
                {farmer?.user?.phone || "Not provided"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">{p.village}</span>
              <span className="font-semibold text-pankh-clay">
                {farmer?.village}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">
                {p.district} / {p.state}
              </span>
              <span className="font-semibold text-pankh-clay">
                {farmer?.district}, {farmer?.state || "Punjab"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* Card 2: Farm & Shed Structure                            */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Warehouse className="h-5 w-5" />
          </div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
            {p.farmDetails}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-stone-500 block text-xs">{p.farmName}</span>
            <span className="font-bold text-pankh-clay text-sm sm:text-base">
              {farm?.name || "Pankh Farm"}
            </span>
          </div>
          <div>
            <span className="text-stone-500 block text-xs">{p.capacity}</span>
            <span className="font-semibold text-pankh-clay">
              {farm?.capacity?.toLocaleString()} birds
            </span>
          </div>
          <div>
            <span className="text-stone-500 block text-xs">{p.sheds}</span>
            <span className="font-semibold text-pankh-clay">
              {farm?.shedCount || 1} Sheds
            </span>
          </div>
          <div>
            <span className="text-stone-500 block text-xs">{p.ventilation}</span>
            <span className="font-semibold text-pankh-clay">
              {farm?.ventilationType || "Tunnel"}
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Card 3: Active Flock Batch                               */}
      {/* ======================================================== */}
      {batch && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
            <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-800">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
              {p.batchDetails}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-stone-500 block text-xs">{p.breed}</span>
              <span className="font-bold text-pankh-clay">
                {batch.breed} ({batch.birdType})
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">{p.production}</span>
              <span className="font-semibold text-pankh-clay">
                {batch.productionType === "BROILER" ? "Broiler (Meat)" : "Layer (Eggs)"}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">{p.startingBirds}</span>
              <span className="font-semibold text-pankh-clay">
                {batch.startingBirds?.toLocaleString()} birds
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-xs">{p.placementDate}</span>
              <span className="font-semibold text-pankh-clay">
                {new Date(batch.placementDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* Card 4: Language & Interface Preferences                 */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
          <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-800">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
              {p.languagePreferences}
            </h2>
            <span className="text-xs text-stone-500">
              Switch entire app language across all devices
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { code: "pa" as const, title: "ਪੰਜਾਬੀ", subtitle: "Punjabi (Gurmukhi)" },
            { code: "en" as const, title: "English", subtitle: "International English" },
            { code: "hi" as const, title: "हिन्दी", subtitle: "Standard Hindi" },
            { code: "hinglish" as const, title: "Hinglish", subtitle: "Farmer Conversational" },
          ].map((item) => {
            const isSelected = lang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleLanguageChange(item.code)}
                className={`p-4 rounded-xl border text-left transition-all min-h-[72px] flex items-center justify-between ${
                  isSelected
                    ? "border-primary bg-amber-50/70 ring-2 ring-primary/40 shadow-xs"
                    : "border-stone-200 bg-stone-50/60 hover:bg-stone-100"
                }`}
              >
                <div>
                  <span className={`text-sm font-bold block ${isSelected ? "text-primary" : "text-pankh-clay"}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-stone-500 block">
                    {item.subtitle}
                  </span>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Sign Out Card                                            */}
      {/* ======================================================== */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-2 px-5 h-11 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/15 text-destructive text-xs sm:text-sm font-semibold transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{p.logout}</span>
        </button>
      </div>
    </div>
  );
}
