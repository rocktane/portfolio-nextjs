import { describe, expect, test } from "bun:test";
import {
  parseWeather,
  WEATHER_MAX_AGE_MS,
  weatherCondition,
} from "../../src/lib/weather";
const now = Date.UTC(2026, 10, 13, 14, 0);
const payload = {
  current: {
    temperature_2m: 17.6,
    weather_code: 61,
    is_day: 1,
    time: now / 1000,
  },
};
describe("current Marseille weather", () => {
  test("accepts a fresh complete response without changing temperature or code", () => {
    expect(parseWeather(payload, now)).toEqual({
      temperature: 17.6,
      code: 61,
      isDay: true,
      time: now,
    });
  });
  test("rejects stale data and malformed values instead of pretending it is live", () => {
    expect(parseWeather(payload, now + WEATHER_MAX_AGE_MS + 1)).toBeNull();
    for (const current of [
      null,
      {},
      { ...payload.current, temperature_2m: "17" },
      { ...payload.current, temperature_2m: NaN },
      { ...payload.current, is_day: 2 },
      { ...payload.current, time: "now" },
    ])
      expect(parseWeather({ current }, now)).toBeNull();
  });
  test("uses actual WMO conditions, and a moon for clear nights", () => {
    expect(weatherCondition(0, true).symbol).toBe("sun");
    expect(weatherCondition(0, false).symbol).toBe("moon");
    for (const [code, symbol] of [
      [2, "partly-cloudy"],
      [3, "cloud"],
      [48, "fog"],
      [65, "rain"],
      [86, "snow"],
      [95, "storm"],
    ] as const)
      expect(weatherCondition(code).symbol).toBe(symbol);
    expect(weatherCondition(999).label).toBe("Conditions inconnues");
  });
});
