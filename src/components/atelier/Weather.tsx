"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  parseWeather,
  WEATHER_REFRESH_MS,
  WEATHER_URL,
  weatherCondition,
  type CurrentWeather,
  type WeatherSymbol,
} from "@/lib/weather";
const WeatherContext = createContext<{
  weather: CurrentWeather | null;
  loading: boolean;
}>({ weather: null, loading: true });
export function WeatherProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<{
    weather: CurrentWeather | null;
    loading: boolean;
  }>({ weather: null, loading: true });
  useEffect(() => {
    let disposed = false,
      inFlight = false,
      lastAttempt = 0;
    let controller: AbortController | undefined;
    async function refresh() {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      lastAttempt = Date.now();
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 8000);
      try {
        const response = await fetch(WEATHER_URL, {
          signal: controller.signal,
          credentials: "omit",
        });
        if (!response.ok) throw new Error("Weather unavailable");
        const weather = parseWeather(await response.json());
        if (!disposed) setValue({ weather, loading: false });
      } catch {
        if (!disposed) setValue({ weather: null, loading: false });
      } finally {
        clearTimeout(timeout);
        inFlight = false;
      }
    }
    const visible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastAttempt >= WEATHER_REFRESH_MS
      )
        void refresh();
    };
    void refresh();
    const interval = setInterval(() => void refresh(), WEATHER_REFRESH_MS);
    document.addEventListener("visibilitychange", visible);
    return () => {
      disposed = true;
      controller?.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}
function WeatherIcon({
  symbol,
  isDay = true,
}: {
  symbol: WeatherSymbol;
  isDay?: boolean;
}) {
  const cloud = (
    <path d="M7 18a4 4 0 1 1 .5-8 5 5 0 0 1 9.7 1.4A3.5 3.5 0 1 1 18 18Z" />
  );
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-weather-icon={symbol}
    >
      {symbol === "sun" ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
        </>
      ) : symbol === "moon" ? (
        <path d="M20 14A8.5 8.5 0 0 1 10 4a8.5 8.5 0 1 0 10 10Z" />
      ) : symbol === "fog" ? (
        <>
          <path d="M3 9h18M5 13h14M3 17h18" />
        </>
      ) : (
        <>
          {symbol === "partly-cloudy" ? (
            isDay ? (
              <>
                <path d="M4 3v2M1 8h2M8 3 7 5" />
                <circle cx="6" cy="8" r="3.5" />
              </>
            ) : (
              <path d="M8 3a4 4 0 0 0 0 8 4 4 0 0 1-2-7" />
            )
          ) : null}
          {cloud}
          {symbol === "rain" ? (
            <path d="m8 21-1 2m6-2-1 2m6-2-1 2" />
          ) : symbol === "snow" ? (
            <path d="M8 22h.1M13 21h.1M18 22h.1" />
          ) : symbol === "storm" ? (
            <path d="m13 15-3 5h4l-2 4" />
          ) : null}
        </>
      )}
    </svg>
  );
}
export function MarseilleWeather() {
  const { weather, loading } = useContext(WeatherContext);
  const condition = weather
    ? weatherCondition(weather.code, weather.isDay)
    : null;
  const time = weather
    ? new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Paris",
      }).format(weather.time)
    : null;
  const label = weather
    ? `Marseille : ${Math.round(weather.temperature)} °C, ${condition?.label}. Données de ${time}, Open-Meteo.`
    : loading
      ? "Marseille : chargement de la météo, Open-Meteo."
      : "Marseille : météo indisponible. Open-Meteo.";
  return (
    <a
      className="marseille-weather"
      href="https://open-meteo.com/"
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
    >
      <WeatherIcon
        symbol={condition?.symbol ?? "cloud"}
        isDay={weather?.isDay}
      />
      <span>Marseille</span>
      {weather ? (
        <strong>
          {Math.round(weather.temperature)}°<span className="sr-only">C</span>
        </strong>
      ) : (
        <span className="weather-unavailable">
          {loading ? "…" : "indisponible"}
        </span>
      )}
    </a>
  );
}
