import { WeatherData } from "../types";

export async function getWeather(
  lat: number,
  lng: number
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;

  const temperature = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const precipitation = current.precipitation;
  const windSpeed = current.wind_speed_10m;
  const weatherCode = current.weather_code;

  const description = weatherCodeToDescription(weatherCode);
  const skateScore = calculateSkateScore(temperature, precipitation, windSpeed, humidity);

  return {
    temperature: Math.round(temperature),
    precipitation,
    windSpeed: Math.round(windSpeed),
    humidity: Math.round(humidity),
    description,
    skateScore,
  };
}

export function calculateSkateScore(
  temp: number,
  precip: number,
  wind: number,
  humidity: number
): number {
  let score = 100;

  // Temperature: ideal 50-85°F
  if (temp < 50) score -= Math.min(40, (50 - temp) * 2);
  else if (temp > 85) score -= Math.min(40, (temp - 85) * 3);

  // Precipitation: any rain is bad
  if (precip > 0) score -= Math.min(50, precip * 25);

  // Wind: under 15mph is fine
  if (wind > 15) score -= Math.min(30, (wind - 15) * 3);

  // Humidity: over 80% sucks
  if (humidity > 80) score -= Math.min(15, (humidity - 80) * 1);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function weatherCodeToDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] ?? "Unknown";
}

export function getSkateScoreLabel(score: number): string {
  if (score >= 80) return "Send it";
  if (score >= 60) return "Decent day";
  if (score >= 40) return "Iffy";
  if (score >= 20) return "Not great";
  return "Stay inside";
}

export function getSkateScoreColor(score: number): string {
  if (score >= 80) return "text-skate-lime";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-skate-orange";
  return "text-skate-red";
}
