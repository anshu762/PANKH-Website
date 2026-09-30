"use client";

import { VetLabDistanceResult } from "@/types/connect";
import { useLanguage } from "@/hooks/use-language";
import { Phone, MessageSquare, Navigation, Share2, CheckCircle, Video, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VetCardProps {
  vet: VetLabDistanceResult;
  onShareCase?: (vet: VetLabDistanceResult) => void;
  canShare?: boolean;
}

export function VetCard({ vet, onShareCase, canShare = true }: VetCardProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;

  const typeColorMap = {
    VET: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900",
    LAB: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900",
    ASSOCIATION:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
  };

  const typeLabelMap = {
    VET: "Veterinarian",
    LAB: "Diagnostic Lab",
    ASSOCIATION: "Poultry Association",
  };

  // Google Maps navigation url
  const mapsUrl =
    vet.latitude && vet.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${vet.latitude},${vet.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vet.name + " " + vet.address)}`;

  const cleanPhone = vet.phone.replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (vet.whatsapp || vet.phone).replace(/[^0-9]/g, "");

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                typeColorMap[vet.type] || typeColorMap.VET
              }`}
            >
              {typeLabelMap[vet.type]}
            </span>
            {vet.verified && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="w-3 h-3" />
                <span>{t.verifiedBadge}</span>
              </span>
            )}
          </div>

          {vet.teleconsult && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
              <Video className="w-3 h-3" />
              <span>{t.teleconsultBadge}</span>
            </span>
          )}
        </div>

        {/* Title and Distance */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mt-1">
          <div>
            <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {vet.name}
            </h4>
            {vet.qualification && (
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                {vet.qualification}
              </p>
            )}
          </div>
          <div className="sm:text-right shrink-0">
            <div className="inline-block bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
              <span className="text-sm font-extrabold text-orange-600 dark:text-orange-400">
                {vet.distanceKm} km
              </span>
              <span className="text-xs text-stone-700 dark:text-stone-300 ml-1">
                ({vet.durationMinutes} min)
              </span>
            </div>
          </div>
        </div>

        {/* Address and Hours */}
        <p className="text-xs text-stone-700 dark:text-stone-300 mt-2 line-clamp-2">
          {vet.address}
        </p>

        {vet.hours && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-300 mt-1.5">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span>{vet.hours}</span>
          </div>
        )}

        {/* Specializations */}
        {vet.specializations.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {vet.specializations.map((spec, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors min-h-[44px]"
        >
          <Phone className="w-3.5 h-3.5 text-blue-600" />
          <span>{t.callAction}</span>
        </a>

        <a
          href={`https://wa.me/${cleanWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors min-h-[44px]"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.whatsappAction}</span>
        </a>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors min-h-[44px]"
        >
          <Navigation className="w-3.5 h-3.5 text-purple-600" />
          <span>{t.directionsAction}</span>
        </a>

        {canShare && onShareCase && (
          <Button
            type="button"
            onClick={() => onShareCase(vet)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors min-h-[44px]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.shareCaseAction}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
