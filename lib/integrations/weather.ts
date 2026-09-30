/**
 * Pankh Weather Integration & Poultry Microclimate Stress Engine
 *
 * Implements OpenWeatherMap API retrieval with in-memory TTL caching (3 hours)
 * and calculates the poultry Temperature-Humidity Index (THI) to assess heat-stress risk.
 *
 * Poultry THI Formula:
 * THI = 0.8 * T + (RH / 100) * (T - 14.4) + 46.4
 * Where T is Ambient Temp in °C and RH is Relative Humidity in %
 */

export type HeatStressLevel = "NORMAL" | "ALERT" | "DANGER" | "EMERGENCY";

export interface PoultryWeatherContext {
  temp: number; // Celsius
  humidity: number; // Percentage (0-100)
  windSpeed: number; // m/s
  condition: string; // e.g. "Haze", "Partly Cloudy", "Sunny"
  thi: number; // Temperature-Humidity Index
  heatRisk: HeatStressLevel;
  recommendation: string;
  source: string;
  isEstimated: boolean;
  fetchedAt: string; // ISO string
}

interface CacheEntry {
  data: PoultryWeatherContext;
  expiresAt: number;
}

// In-memory cache keyed by "lat,lon" or location string with 3-hour TTL
const weatherCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

/**
 * Calculates poultry-specific THI and returns heat-stress category + actionable flock guidance.
 */
export function calculatePoultryTHI(tempCelsius: number, humidityPercent: number): {
  thi: number;
  heatRisk: HeatStressLevel;
  recommendation: string;
} {
  const t = tempCelsius;
  const rh = Math.max(0, Math.min(100, humidityPercent));
  const rawThi = 0.8 * t + (rh / 100) * (t - 14.4) + 46.4;
  const thi = Number(rawThi.toFixed(1));

  if (thi < 74) {
    return {
      thi,
      heatRisk: "NORMAL",
      recommendation: "Comfortable ambient range for flock. Maintain routine shed cross-ventilation.",
    };
  } else if (thi < 78) {
    return {
      thi,
      heatRisk: "ALERT",
      recommendation: "Mild ambient heat stress. Inspect drinker line pressure and increase nipple water flow.",
    };
  } else if (thi < 84) {
    return {
      thi,
      heatRisk: "DANGER",
      recommendation:
        "High heat stress zone. Activate tunnel foggers and roof sprinklers between 11:30 AM and 4:30 PM. Provide Vitamin C / electrolytes in drinking water.",
    };
  } else {
    return {
      thi,
      heatRisk: "EMERGENCY",
      recommendation:
        "CRITICAL HEAT PROSTRATION RISK. Run continuous exhaust fans, flush hot water from pipes, and avoid feeding during peak afternoon temperatures.",
    };
  }
}

/**
 * Fallback baseline for Central Punjab poultry belt (Ludhiana / Khanna)
 * used when API keys are unconfigured or external network fails.
 */
function getPunjabBaselineWeather(locationLabel: string): PoultryWeatherContext {
  const fallbackTemp = 33.5;
  const fallbackHumidity = 48;
  const { thi, heatRisk, recommendation } = calculatePoultryTHI(
    fallbackTemp,
    fallbackHumidity
  );

  return {
    temp: fallbackTemp,
    humidity: fallbackHumidity,
    windSpeed: 2.8,
    condition: "Partly Cloudy • Central Punjab",
    thi,
    heatRisk,
    recommendation,
    source: `Punjab Agrarian Meteorological Baseline (${locationLabel})`,
    isEstimated: true,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetches hyper-local ambient weather for a farm using latitude/longitude or district.
 * Caches results in memory for 3 hours to respect API quotas.
 */
export async function getFarmWeather(
  latitude?: number | null,
  longitude?: number | null,
  district: string = "Ludhiana"
): Promise<PoultryWeatherContext> {
  const cacheKey =
    latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null
      ? `${latitude.toFixed(2)},${longitude.toFixed(2)}`
      : district.toLowerCase().trim();

  // 1. Check TTL cache
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // 2. Fallback if API key unconfigured
  if (!apiKey || apiKey.includes("your_") || apiKey.length < 10) {
    const fallback = getPunjabBaselineWeather(district);
    weatherCache.set(cacheKey, {
      data: fallback,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });
    return fallback;
  }

  // 3. Query OpenWeatherMap
  try {
    let url = "";
    if (
      latitude !== undefined &&
      latitude !== null &&
      longitude !== undefined &&
      longitude !== null
    ) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        district
      )},IN&units=metric&appid=${apiKey}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(
        `OpenWeatherMap returned ${res.status} for ${cacheKey}, using Punjab baseline.`
      );
      return getPunjabBaselineWeather(district);
    }

    const json = await res.json();
    const temp = Number(json.main?.temp ?? 32);
    const humidity = Number(json.main?.humidity ?? 50);
    const windSpeed = Number(json.wind?.speed ?? 2.5);
    const condition = json.weather?.[0]?.main || "Clear";

    const { thi, heatRisk, recommendation } = calculatePoultryTHI(temp, humidity);

    const result: PoultryWeatherContext = {
      temp,
      humidity,
      windSpeed,
      condition: `${condition} (${json.name || district})`,
      thi,
      heatRisk,
      recommendation,
      source: "OpenWeatherMap API",
      isEstimated: false,
      fetchedAt: new Date().toISOString(),
    };

    // Store in cache
    weatherCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return result;
  } catch (error) {
    console.error("OpenWeatherMap fetch failed, falling back to baseline:", error);
    const fallback = getPunjabBaselineWeather(district);
    weatherCache.set(cacheKey, {
      data: fallback,
      expiresAt: Date.now() + 15 * 60 * 1000, // short cache on network error
    });
    return fallback;
  }
}
