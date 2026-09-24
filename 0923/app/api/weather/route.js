import { NextResponse } from "next/server";
import { db, ensureSchema } from "@/lib/db";

export const dynamic = "force-dynamic";

const CWA_BASE = "https://opendata.cwa.gov.tw/api/v1/rest/datastore";

const CWA_API_KEY = process.env.CWA_API_KEY;

const PRIMARY = "O-A0003-001";
const FALLBACK = process.env.CWA_FALLBACK_DATASET || "O-A0001-001";
const INVALID = new Set([-99, -990, -991, -9991, -9997, -9998, -9999]);

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const v = value.trim();
    if (!v || v === "X" || v === "-") return null;
    if (v.toUpperCase() === "T") return 0;
  }
  const n = Number(value);
  return Number.isFinite(n) && !INVALID.has(n) ? n : null;
}

function coordinate(station) {
  const coordinates = station?.GeoInfo?.Coordinates || [];
  const wgs84 =
    coordinates.find((item) => item?.CoordinateName === "WGS84") ||
    coordinates[0];

  const lat = toNumber(wgs84?.StationLatitude);
  const lon = toNumber(wgs84?.StationLongitude);
  if (lat === null || lon === null) return null;
  if (lat < 20 || lat > 27 || lon < 118 || lon > 123.5) return null;
  return { lat, lon };
}

function normalizeStation(station) {
  const pos = coordinate(station);
  const temp = toNumber(station?.WeatherElement?.AirTemperature);
  const stationId = station?.StationId?.trim();

  if (!pos || temp === null || !stationId || temp < -20 || temp > 50) {
    return null;
  }

  const observedAt = station?.ObsTime?.DateTime || null;
  const weather = station?.WeatherElement?.Weather || null;

  return {
    stationId,
    stationName: station?.StationName || stationId,
    county: station?.GeoInfo?.CountyName || "未知縣市",
    town: station?.GeoInfo?.TownName || "",
    lat: pos.lat,
    lon: pos.lon,
    altitude: toNumber(station?.GeoInfo?.StationAltitude),
    observedAt,
    temperature: temp,
    humidity: toNumber(station?.WeatherElement?.RelativeHumidity),
    pressure: toNumber(station?.WeatherElement?.AirPressure),
    windSpeed: toNumber(station?.WeatherElement?.WindSpeed),
    windDirection: toNumber(station?.WeatherElement?.WindDirection),
    precipitation: toNumber(station?.WeatherElement?.Now?.Precipitation),
    weather,
  };
}

async function fetchDataset(dataset, apiKey) {
  const url = new URL(`${CWA_BASE}/${dataset}`);
  url.searchParams.set("Authorization", apiKey);
  url.searchParams.set("format", "JSON");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`CWA ${dataset} HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json?.success === "false" || json?.success === false) {
      throw new Error(`CWA ${dataset} success=false`);
    }

    const rawStations = json?.records?.Station || [];
    const stations = rawStations.map(normalizeStation).filter(Boolean);

    if (stations.length < 10) {
      throw new Error(`CWA ${dataset} valid station count too low`);
    }

    return { dataset, stations };
  } finally {
    clearTimeout(timeout);
  }
}

function summarize(stations) {
  const temps = stations.map((s) => s.temperature);
  const rain = stations.map((s) => s.precipitation).filter((v) => typeof v === "number");
  const wind = stations.map((s) => s.windSpeed).filter((v) => typeof v === "number");

  return {
    stationCount: stations.length,
    countyCount: new Set(stations.map((s) => s.county)).size,
    minTemperature: Math.min(...temps),
    maxTemperature: Math.max(...temps),
    maxPrecipitation: rain.length ? Math.max(...rain) : null,
    maxWindSpeed: wind.length ? Math.max(...wind) : null,
  };
}

export async function GET() {
  const apiKey = CWA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "CWA_API_KEY 尚未設定" },
      { status: 500 }
    );
  }

  let result;
  let primaryError = null;

  try {
    result = await fetchDataset(PRIMARY, apiKey);
  } catch (error) {
    primaryError = error instanceof Error ? error.message : String(error);
    try {
      result = await fetchDataset(FALLBACK, apiKey);
    } catch (fallbackError) {
      console.error("[weather]", { primaryError, fallbackError });
      return NextResponse.json(
        {
          success: false,
          error: "中央氣象署資料目前無法取得，請稍後再試。",
        },
        { status: 502 }
      );
    }
  }

  const latestObservedAt = result.stations
    .map((s) => s.observedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  const fetchedAt = new Date().toISOString();
  let database = { stored: false };

  try {
    await ensureSchema();
    const sql = db();

    const payload = {
      dataset: result.dataset,
      fetchedAt,
      latestObservedAt,
      stations: result.stations,
    };

    const inserted = await sql.query(
      `INSERT INTO snapshots
       (fetched_at, updated_at, source, station_count, payload)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (source, updated_at) DO NOTHING
       RETURNING id`,
      [
        fetchedAt,
        latestObservedAt || fetchedAt,
        `CWA ${result.dataset}`,
        result.stations.length,
        JSON.stringify(payload),
      ]
    );

    if (inserted.length) {
      const snapshotId = inserted[0].id;

      const observationRows = result.stations.map((station) => ({
        station_id: station.stationId,
        station_name: station.stationName,
        county: station.county,
        town: station.town,
        observed_at: station.observedAt,
        lng: station.lon,
        lat: station.lat,
        temperature: station.temperature,
        humidity: station.humidity,
        pressure: station.pressure,
        wind_speed: station.windSpeed,
        wind_direction: station.windDirection,
        precipitation: station.precipitation,
        weather: station.weather,
      }));

      await sql.query(
        `INSERT INTO observations (
          snapshot_id, station_id, station_name, county, town,
          observed_at, lng, lat, temperature, humidity, pressure,
          wind_speed, wind_direction, precipitation, weather
        )
        SELECT
          $1::bigint,
          x.station_id,
          x.station_name,
          x.county,
          x.town,
          x.observed_at::timestamptz,
          x.lng,
          x.lat,
          x.temperature,
          x.humidity,
          x.pressure,
          x.wind_speed,
          x.wind_direction,
          x.precipitation,
          x.weather
        FROM jsonb_to_recordset($2::jsonb) AS x(
          station_id text,
          station_name text,
          county text,
          town text,
          observed_at text,
          lng double precision,
          lat double precision,
          temperature double precision,
          humidity double precision,
          pressure double precision,
          wind_speed double precision,
          wind_direction double precision,
          precipitation double precision,
          weather text
        )`,
        [snapshotId, JSON.stringify(observationRows)]
      );

      database = {
        stored: true,
        snapshotId: Number(snapshotId),
        observationCount: result.stations.length,
      };
    } else {
      database = {
        stored: false,
        reason: "duplicate-observation-time",
      };
    }
  } catch (error) {
    console.error("[weather] Neon save failed:", error);
    database = {
      stored: false,
      error: error instanceof Error ? error.message : "database error",
    };
  }

  return NextResponse.json(
    {
      success: true,
      source: "中央氣象署 CWA OpenData",
      dataset: result.dataset,
      fallbackUsed: result.dataset !== PRIMARY,
      fetchedAt,
      latestObservedAt,
      summary: summarize(result.stations),
      stations: result.stations,
      database,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
