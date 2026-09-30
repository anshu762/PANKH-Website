import { prisma } from "@/lib/db";
import { getFarmWeather, PoultryWeatherContext } from "@/lib/integrations/weather";

export class WeatherService {
  /**
   * Fetches weather context for a specific farmer's primary active farm.
   */
  async getWeatherForFarmer(userId: string): Promise<PoultryWeatherContext> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        farms: {
          take: 1,
          select: { latitude: true, longitude: true },
        },
      },
    });

    const farm = farmer?.farms[0];
    return getFarmWeather(
      farm?.latitude,
      farm?.longitude,
      farmer?.district || "Ludhiana"
    );
  }

  /**
   * Fetches weather context using farm coordinates or district directly.
   */
  async getWeatherForFarm(
    latitude?: number | null,
    longitude?: number | null,
    district: string = "Ludhiana"
  ): Promise<PoultryWeatherContext> {
    return getFarmWeather(latitude, longitude, district);
  }
}

export const weatherService = new WeatherService();
