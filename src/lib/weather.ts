export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=43.2965&longitude=5.3698&current=temperature_2m,weather_code,is_day&timezone=Europe%2FParis&timeformat=unixtime";
export const WEATHER_REFRESH_MS = 15 * 60 * 1000;
export const WEATHER_MAX_AGE_MS = 45 * 60 * 1000;
export type WeatherSymbol =
  | "sun"
  | "moon"
  | "partly-cloudy"
  | "cloud"
  | "fog"
  | "rain"
  | "snow"
  | "storm";
export interface CurrentWeather {
  temperature: number;
  code: number;
  isDay: boolean;
  time: number;
}
export function weatherCondition(
  code: number,
  isDay = true,
): { symbol: WeatherSymbol; label: string } {
  if (code === 0)
    return { symbol: isDay ? "sun" : "moon", label: "Ciel dégagé" };
  if (code === 1 || code === 2)
    return { symbol: "partly-cloudy", label: "Quelques nuages" };
  if (code === 3) return { symbol: "cloud", label: "Couvert" };
  if (code === 45 || code === 48) return { symbol: "fog", label: "Brouillard" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { symbol: "rain", label: "Pluie" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { symbol: "snow", label: "Neige" };
  if ([95, 96, 99].includes(code)) return { symbol: "storm", label: "Orage" };
  return { symbol: "cloud", label: "Conditions inconnues" };
}
/** Reject malformed or stale responses instead of inventing live weather. */
export function parseWeather(
  payload: unknown,
  now = Date.now(),
): CurrentWeather | null {
  if (!payload || typeof payload !== "object" || !("current" in payload))
    return null;
  const current = payload.current;
  if (!current || typeof current !== "object") return null;
  const data = current as Record<string, unknown>;
  if (
    typeof data.temperature_2m !== "number" ||
    !Number.isFinite(data.temperature_2m) ||
    typeof data.weather_code !== "number" ||
    !Number.isInteger(data.weather_code) ||
    (data.is_day !== 0 && data.is_day !== 1) ||
    typeof data.time !== "number" ||
    !Number.isFinite(data.time)
  )
    return null;
  if (Math.abs(now - data.time * 1000) > WEATHER_MAX_AGE_MS) return null;
  return {
    temperature: data.temperature_2m,
    code: data.weather_code,
    isDay: data.is_day === 1,
    time: data.time * 1000,
  };
}
