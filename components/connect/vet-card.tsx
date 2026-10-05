"use client";

import React from "react";
import { VetLabDistanceResult } from "@/types/connect";
import { useLanguage } from "@/hooks/use-language";
import {
  Phone,
  MessageSquare,
  Navigation,
  Share2,
  CheckCircle,
  Video,
  Clock,
  MapPin,
} from "lucide-react";

interface VetCardProps {
  vet: VetLabDistanceResult;
  onShareCase?: (vet: VetLabDistanceResult) => void;
  canShare?: boolean;
}

export function VetCard({ vet, onShareCase, canShare = true }: VetCardProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;

  const typeColorMap = {
    VET: "bg-blue-50 text-blue-800 border-blue-200",
    LAB: "bg-purple-50 text-purple-800 border-purple-200",
    ASSOCIATION: "bg-amber-50 text-amber-800 border-amber-200",
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
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          vet.name + " " + vet.address
        )}`;

  const cleanPhone = vet.phone.replace(/[^0-9+]/g, "");
  const cleanWhatsapp = (vet.whatsapp || vet.phone).replace(/[^0-9]/g, "");

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                typeColorMap[vet.type] || typeColorMap.VET
              }`}
            >
              {typeLabelMap[vet.type]}
            </span>
            {vet.verified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>{t.verifiedBadge}</span>
              </span>
            )}
          </div>

          {vet.teleconsult && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 shrink-0">
              <Video className="w-3 h-3 text-orange-600" />
              <span>{t.teleconsultBadge}</span>
            </span>
          )}
        </div>

        {/* Title and Distance */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-pankh-clay truncate">
              {vet.name}
            </h4>
            {vet.qualification && (
              <p className="text-xs text-stone-500 truncate mt-0.5 font-medium">
                {vet.qualification}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center bg-stone-100 px-2.5 py-1 rounded-xl border border-stone-200/80">
              <span className="text-xs font-extrabold text-orange-600 font-mono">
                {vet.distanceKm} km
              </span>
              <span className="text-[10px] text-stone-500 ml-1 font-mono">
                ({vet.durationMinutes}m)
              </span>
            </div>
          </div>
        </div>

        {/* Address and Hours */}
        <div className="space-y-1 text-xs text-stone-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-relaxed">{vet.address}</span>
          </div>

          {vet.hours && (
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500 pt-0.5">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{vet.hours}</span>
            </div>
          )}
        </div>

        {/* Specializations */}
        {vet.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {vet.specializations.slice(0, 4).map((spec, i) => (
              <span
                key={i}
                className="text-[10px] font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-lg border border-stone-200"
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons Section */}
      <div className="pt-3 border-t border-stone-100 space-y-2">
        {/* 1. Contact & Navigation Row (3 Equal Balanced Buttons) */}
        <div className="grid grid-cols-3 gap-2">
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-stone-200 bg-white hover:bg-blue-50/50 hover:border-blue-200 text-xs font-semibold text-stone-700 transition-colors min-h-[40px] truncate"
            title={t.callAction}
          >
            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">{t.callAction}</span>
          </a>

          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-xs font-semibold text-emerald-800 transition-colors min-h-[40px] truncate"
            title={t.whatsappAction}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{t.whatsappAction}</span>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border border-stone-200 bg-white hover:bg-purple-50/50 hover:border-purple-200 text-xs font-semibold text-stone-700 transition-colors min-h-[40px] truncate"
            title={t.directionsAction}
          >
            <Navigation className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">{t.directionsAction}</span>
          </a>
        </div>

        {/* 2. Prominent Primary Action: Share Case Summary */}
        {canShare && onShareCase && (
          <button
            type="button"
            onClick={() => onShareCase(vet)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-2xs active:scale-[0.99] min-h-[42px] cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t.shareCaseAction}</span>
          </button>
        )}
      </div>
    </div>
  );
}
