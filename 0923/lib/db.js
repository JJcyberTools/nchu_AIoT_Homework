import { neon } from "@neondatabase/serverless";

let schemaPromise;

function getSql() {
  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }

  return neon(connectionString);
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql();

      await sql`
        CREATE TABLE IF NOT EXISTS snapshots (
          id BIGSERIAL PRIMARY KEY,
          fetched_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          source TEXT NOT NULL,
          station_count INTEGER NOT NULL,
          payload JSONB NOT NULL,
          UNIQUE (source, updated_at)
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS observations (
          snapshot_id BIGINT NOT NULL
            REFERENCES snapshots(id) ON DELETE CASCADE,
          station_id TEXT NOT NULL,
          station_name TEXT,
          county TEXT,
          town TEXT,
          observed_at TIMESTAMPTZ,
          lng DOUBLE PRECISION,
          lat DOUBLE PRECISION,
          temperature DOUBLE PRECISION,
          humidity DOUBLE PRECISION,
          pressure DOUBLE PRECISION,
          wind_speed DOUBLE PRECISION,
          wind_direction DOUBLE PRECISION,
          precipitation DOUBLE PRECISION,
          weather TEXT
        )
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_obs_station_time
        ON observations (station_id, observed_at DESC)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_obs_county_snapshot
        ON observations (county, snapshot_id)
      `;
    })();
  }

  return schemaPromise;
}

export function db() {
  return getSql();
}
