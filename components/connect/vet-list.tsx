"use client";

import { useState, useMemo } from "react";
import { VetLabDistanceResult } from "@/types/connect";
import { VetLabType } from "@prisma/client";
import { useLanguage } from "@/hooks/use-language";
import { VetCard } from "./vet-card";
import { Search, Filter, Video, Stethoscope, FlaskConical, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VetListProps {
  vets: VetLabDistanceResult[];
  onShareCase?: (vet: VetLabDistanceResult) => void;
  canShare?: boolean;
}

export function VetList({ vets, onShareCase, canShare = true }: VetListProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;

  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [teleconsultOnly, setTeleconsultOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVets = useMemo(() => {
    return vets.filter((v) => {
      // Type filter
      if (selectedType !== "ALL" && v.type !== selectedType) {
        return false;
      }
      // Teleconsult filter
      if (teleconsultOnly && !v.teleconsult) {
        return false;
      }
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = v.name.toLowerCase().includes(q);
        const inAddress = v.address.toLowerCase().includes(q);
        const inSpec = v.specializations.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inAddress && !inSpec) {
          return false;
        }
      }
      return true;
    });
  }, [vets, selectedType, teleconsultOnly, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by specialist, city (Ludhiana, Patiala...) or illness..."
            className="pl-9 text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 min-h-[42px]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedType("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[38px] whitespace-nowrap cursor-pointer ${
              selectedType === "ALL"
                ? "bg-stone-900 text-white font-bold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {t.filterAll}
          </button>
          <button
            type="button"
            onClick={() => setSelectedType(VetLabType.VET)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[38px] whitespace-nowrap cursor-pointer ${
              selectedType === VetLabType.VET
                ? "bg-blue-600 text-white font-bold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>{t.filterVets}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType(VetLabType.LAB)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[38px] whitespace-nowrap cursor-pointer ${
              selectedType === VetLabType.LAB
                ? "bg-purple-600 text-white font-bold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{t.filterLabs}</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedType(VetLabType.ASSOCIATION)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 min-h-[38px] whitespace-nowrap cursor-pointer ${
              selectedType === VetLabType.ASSOCIATION
                ? "bg-amber-600 text-white font-bold shadow-2xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.filterAssoc}</span>
          </button>

          {/* Teleconsult Toggle */}
          <button
            type="button"
            onClick={() => setTeleconsultOnly(!teleconsultOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors min-h-[38px] whitespace-nowrap cursor-pointer ${
              teleconsultOnly
                ? "bg-orange-50 border-orange-300 text-orange-800 font-bold shadow-2xs"
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Teleconsult Only</span>
          </button>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredVets.length === 0 ? (
        <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 text-center">
          <Filter className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-60" />
          <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">
            No specialists match your criteria
          </h4>
          <p className="text-xs text-stone-500 mt-1">
            Try adjusting your search query or selecting "All Specialists".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredVets.map((vet) => (
            <VetCard
              key={vet.id}
              vet={vet}
              onShareCase={onShareCase}
              canShare={canShare}
            />
          ))}
        </div>
      )}
    </div>
  );
}
