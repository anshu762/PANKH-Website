import { VetLab, VetLabType } from "@prisma/client";
import { VetLabDistanceResult } from "@/types/connect";

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// Default central Punjab reference coordinate (Ludhiana) if farmer has not pinned precise coordinates
export const DEFAULT_PUNJAB_ORIGIN: GeoPoint = {
  latitude: 30.901,
  longitude: 75.8573,
};

// Punjab rural road tortuosity factor: accounts for rural link roads, canal crossings, and bypasses
export const ROAD_TORTUOSITY_FACTOR = 1.25;

// Average commercial transit speed in rural Punjab (km/h)
export const AVERAGE_RURAL_SPEED_KMH = 45;

/**
 * Calculates great-circle Haversine distance between two coordinates in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;

  // Apply road tortuosity factor to approximate driving distance
  return Math.round(straightLine * ROAD_TORTUOSITY_FACTOR * 10) / 10;
}

/**
 * Estimates travel duration in minutes based on distance and average rural road speed.
 */
export function estimateTravelMinutes(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return Math.round((distanceKm / AVERAGE_RURAL_SPEED_KMH) * 60);
}

interface DistanceMatrixElement {
  distance?: { text: string; value: number }; // value in meters
  duration?: { text: string; value: number }; // value in seconds
  status: string;
}

interface GoogleDistanceMatrixResponse {
  rows?: Array<{
    elements: DistanceMatrixElement[];
  }>;
  status: string;
}

/**
 * Queries Google Maps Distance Matrix API for accurate road driving distances and travel times.
 * If API key is missing or request fails/times out, returns null to trigger fallback.
 */
export async function fetchGoogleDistanceMatrix(
  origin: GeoPoint,
  destinations: GeoPoint[]
): Promise<Array<{ distanceKm: number; durationMinutes: number } | null> | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === "mock" || apiKey.includes("your-")) {
    return null;
  }

  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = destinations
      .map((d) => `${d.latitude},${d.longitude}`)
      .join("|");

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      originStr
    )}&destinations=${encodeURIComponent(destStr)}&mode=driving&region=in&key=${apiKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data: GoogleDistanceMatrixResponse = await response.json();
    if (data.status !== "OK" || !data.rows || data.rows.length === 0) return null;

    const elements = data.rows[0].elements;
    return elements.map((elem) => {
      if (
        elem.status === "OK" &&
        elem.distance?.value !== undefined &&
        elem.duration?.value !== undefined
      ) {
        return {
          distanceKm: Math.round((elem.distance.value / 1000) * 10) / 10,
          durationMinutes: Math.round(elem.duration.value / 60),
        };
      }
      return null;
    });
  } catch (error) {
    console.warn("⚠️ Google Maps Distance Matrix API query failed, using Haversine fallback:", error);
    return null;
  }
}

export interface RankOptions {
  radiusKm?: number;
  type?: VetLabType;
  teleconsultOnly?: boolean;
  searchSymptoms?: string[];
  limit?: number;
}

/**
 * Ranks VetLab records relative to origin using Google Maps Distance Matrix where available,
 * falling back to Haversine. Prioritizes:
 * 1. Within service radius
 * 2. Specialization match with current symptom signals
 * 3. Driving distance (closest first)
 * 4. Teleconsult capability
 */
export async function rankVetLabs(
  vetLabs: VetLab[],
  origin: GeoPoint = DEFAULT_PUNJAB_ORIGIN,
  options: RankOptions = {}
): Promise<VetLabDistanceResult[]> {
  const {
    radiusKm = 150,
    type,
    teleconsultOnly = false,
    searchSymptoms = [],
    limit = 5,
  } = options;

  // Filter basic constraints
  let candidates = vetLabs.filter((v) => v.verified);

  if (type) {
    candidates = candidates.filter((v) => v.type === type);
  }

  if (teleconsultOnly) {
    candidates = candidates.filter((v) => v.teleconsult);
  }

  if (candidates.length === 0) {
    return [];
  }

  // Collect candidate destination coordinates
  const destinations: GeoPoint[] = candidates.map((v) => ({
    latitude: v.latitude ?? origin.latitude,
    longitude: v.longitude ?? origin.longitude,
  }));

  // Try Google Maps Distance Matrix API
  const gMatrixResults = await fetchGoogleDistanceMatrix(origin, destinations);

  const results: VetLabDistanceResult[] = candidates.map((vet, idx) => {
    let distanceKm: number;
    let durationMinutes: number;
    let calculationMethod: "google_distance_matrix" | "haversine_formula";

    const gResult = gMatrixResults?.[idx];

    if (gResult) {
      distanceKm = gResult.distanceKm;
      durationMinutes = gResult.durationMinutes;
      calculationMethod = "google_distance_matrix";
    } else {
      const vLat = vet.latitude ?? origin.latitude;
      const vLng = vet.longitude ?? origin.longitude;
      distanceKm = calculateHaversineDistanceKm(
        origin.latitude,
        origin.longitude,
        vLat,
        vLng
      );
      durationMinutes = estimateTravelMinutes(distanceKm);
      calculationMethod = "haversine_formula";
    }

    const serviceRadius = vet.serviceRadiusKm ?? 80;
    const isWithinServiceRadius = distanceKm <= serviceRadius;

    // Calculate specialization match score
    let matchScore = 0;
    if (searchSymptoms.length > 0 && vet.specializations.length > 0) {
      const lowerSpecs = vet.specializations.map((s) => s.toLowerCase());
      for (const sym of searchSymptoms) {
        const symLower = sym.toLowerCase();
        for (const spec of lowerSpecs) {
          if (spec.includes(symLower) || symLower.includes(spec)) {
            matchScore += 10;
          }
        }
      }
    }

    // Proximity score: closer = higher score (100 - distanceKm capped at 0)
    matchScore += Math.max(0, 100 - distanceKm);

    // Boost if within stated service radius
    if (isWithinServiceRadius) {
      matchScore += 25;
    }

    // Boost teleconsult availability
    if (vet.teleconsult) {
      matchScore += 5;
    }

    return {
      ...vet,
      distanceKm,
      durationMinutes,
      isWithinServiceRadius,
      matchScore,
      calculationMethod,
    };
  });

  // Filter within max search radius unless too restrictive
  let filtered = results.filter((r) => r.distanceKm <= radiusKm);
  if (filtered.length === 0) {
    // If none within radiusKm, keep all results so the farmer is never left without any contact
    filtered = results;
  }

  // Sort by:
  // 1. isWithinServiceRadius (descending)
  // 2. matchScore (descending)
  // 3. distanceKm (ascending)
  filtered.sort((a, b) => {
    if (a.isWithinServiceRadius !== b.isWithinServiceRadius) {
      return a.isWithinServiceRadius ? -1 : 1;
    }
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.distanceKm - b.distanceKm;
  });

  return filtered.slice(0, limit);
}
