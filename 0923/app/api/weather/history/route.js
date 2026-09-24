import { NextResponse } from "next/server";
import { db, ensureSchema } from "../../../../lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get("stationId");
  const county = searchParams.get("county");
  const limitRaw = Number(searchParams.get("limit") || 96);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 96, 1), 500);

  try {
    await ensureSchema();
    const sql = db();

    if (stationId) {
      const rows = await sql.query(
        `SELECT
           o.station_id AS "stationId",
           o.station_name AS "stationName",
           o.county,
           o.town,
           o.observed_at AS "observedAt",
           s.fetched_at AS "fetchedAt",
           o.temperature,
           o.humidity,
           o.pressure,
           o.wind_speed AS "windSpeed",
           o.wind_direction AS "windDirection",
           o.precipitation
         FROM observations o
         JOIN snapshots s ON s.id = o.snapshot_id
         WHERE o.station_id = $1
         ORDER BY s.fetched_at DESC
         LIMIT $2`,
        [stationId, limit]
      );

      return NextResponse.json({
        success: true,
        mode: "station",
        stationId,
        count: rows.length,
        rows: rows.reverse(),
      });
    }

    if (county) {
      const rows = await sql.query(
        `SELECT
           s.fetched_at AS "fetchedAt",
           MAX(o.observed_at) AS "observedAt",
           AVG(o.temperature)::double precision AS "temperature",
           COUNT(*)::integer AS "stationCount"
         FROM observations o
         JOIN snapshots s ON s.id = o.snapshot_id
         WHERE o.county = $1
         GROUP BY s.id, s.fetched_at
         ORDER BY s.fetched_at DESC
         LIMIT $2`,
        [county, limit]
      );

      return NextResponse.json({
        success: true,
        mode: "county",
        county,
        count: rows.length,
        rows: rows.reverse(),
      });
    }

    return NextResponse.json(
      { success: false, error: "請提供 county 或 stationId 參數" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[weather-history]", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "歷史資料查詢失敗",
      },
      { status: 500 }
    );
  }
}
