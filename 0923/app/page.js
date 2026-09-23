"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TAIWAN_CENTER = [23.7, 121.0];
const TAIWAN_BOUNDS = [
  [21.7, 118.0],
  [26.6, 123.1],
];

function weatherEmoji(text = "") {
  if (/雷/.test(text)) return "⛈️";
  if (/雨/.test(text)) return "🌧️";
  if (/雪/.test(text)) return "🌨️";
  if (/霧|靄/.test(text)) return "🌫️";
  if (/晴/.test(text)) return "☀️";
  if (/多雲/.test(text)) return "⛅";
  if (/陰/.test(text)) return "☁️";
  return "🌡️";
}

function colorByTemperature(temp) {
  if (temp < 10) return "#2563eb";
  if (temp < 15) return "#0ea5e9";
  if (temp < 20) return "#10b981";
  if (temp < 25) return "#84cc16";
  if (temp < 30) return "#f59e0b";
  if (temp < 35) return "#f97316";
  return "#ef4444";
}

function formatValue(value, suffix = "", digits = 1) {
  return typeof value === "number" ? `${value.toFixed(digits)}${suffix}` : "—";
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("zh-TW", {
    hour12: false,
    timeZone: "Asia/Taipei",
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function stationIcon(L, station) {
  const color = colorByTemperature(station.temperature);
  const emoji = weatherEmoji(station.weather);
  return L.divIcon({
    className: "station-marker-wrap",
    html: `
      <div class="station-marker" style="--temp-color:${color}">
        <span class="station-weather">${emoji}</span>
        <span class="station-temp">${Math.round(station.temperature)}°</span>
      </div>
    `,
    iconSize: [58, 32],
    iconAnchor: [29, 16],
  });
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }
    const existing = document.querySelector('script[data-leaflet="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.crossOrigin = "";
    script.dataset.leaflet = "true";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Home() {
  const mapNodeRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(null);
  const leafletRef = useRef(null);

  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("全部縣市");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState("");

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/weather", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "氣象資料載入失敗");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "氣象資料載入失敗");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || mapRef.current || !mapNodeRef.current) return;

        leafletRef.current = L;
        const map = L.map(mapNodeRef.current, {
          zoomControl: false,
          minZoom: 6,
          maxZoom: 14,
          maxBounds: TAIWAN_BOUNDS,
          maxBoundsViscosity: 0.7,
        }).setView(TAIWAN_CENTER, 7);

        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles © Esri ｜ 氣象資料：交通部中央氣象署 CWA",
            maxNativeZoom: 16,
            maxZoom: 18,
          }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);
        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        setMapReady(true);
      })
      .catch(() => {
        setError("地圖元件載入失敗，請檢查網路連線。");
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const counties = useMemo(() => {
    if (!data?.stations) return [];
    return [...new Set(data.stations.map((s) => s.county))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "zh-Hant"));
  }, [data]);

  const filteredStations = useMemo(() => {
    if (!data?.stations) return [];
    const keyword = query.trim().toLowerCase();
    return data.stations.filter((station) => {
      const countyMatched =
        county === "全部縣市" || station.county === county;
      const keywordMatched =
        !keyword ||
        `${station.stationName} ${station.county} ${station.town}`
          .toLowerCase()
          .includes(keyword);
      return countyMatched && keywordMatched;
    });
  }, [data, query, county]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !markersRef.current) return;

    const L = leafletRef.current;
    const group = markersRef.current;
    group.clearLayers();

    filteredStations.forEach((station) => {
      const marker = L.marker([station.lat, station.lon], {
        icon: stationIcon(L, station),
        keyboard: true,
        title: `${station.stationName} ${station.temperature}°C`,
      });

      marker.bindPopup(`
        <div class="station-popup">
          <div class="popup-title">
            <span>${weatherEmoji(station.weather)}</span>
            <strong>${escapeHtml(station.stationName)}</strong>
          </div>
          <div class="popup-place">${escapeHtml(station.county)} ${escapeHtml(
        station.town
      )}</div>
          <div class="popup-temp" style="color:${colorByTemperature(
            station.temperature
          )}">
            ${station.temperature.toFixed(1)}°C
          </div>
          <div class="popup-grid">
            <span>天氣</span><b>${escapeHtml(station.weather || "—")}</b>
            <span>濕度</span><b>${formatValue(
              station.humidity == null ? null : station.humidity * 100,
              "%",
              0
            )}</b>
            <span>雨量</span><b>${formatValue(
              station.precipitation,
              " mm"
            )}</b>
            <span>風速</span><b>${formatValue(station.windSpeed, " m/s")}</b>
            <span>氣壓</span><b>${formatValue(
              station.pressure,
              " hPa"
            )}</b>
            <span>觀測</span><b>${formatTime(station.observedAt)}</b>
          </div>
        </div>
      `);
      marker.addTo(group);
    });

    if (filteredStations.length > 0 && (county !== "全部縣市" || query.trim())) {
      const bounds = L.latLngBounds(
        filteredStations.map((s) => [s.lat, s.lon])
      );
      mapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 10 });
    } else {
      mapRef.current.fitBounds(TAIWAN_BOUNDS);
    }
  }, [filteredStations, mapReady, county, query]);

  const visibleTemps = filteredStations.map((s) => s.temperature);
  const minTemp = visibleTemps.length ? Math.min(...visibleTemps) : null;
  const maxTemp = visibleTemps.length ? Math.max(...visibleTemps) : null;

  return (
    <main className="app-shell">
      <div id="map" ref={mapNodeRef} className="map" />

      <header className="topbar glass">
        <div>
          <p className="eyebrow">NCHU · AIoT-DA HW1 · CWA OpenData</p>
          <h1>台灣即時氣象視覺化地圖</h1>
        </div>
        <button className="refresh-btn" onClick={loadWeather} disabled={loading}>
          {loading ? "更新中…" : "↻ 更新資料"}
        </button>
      </header>

      <section className="search-panel glass">
        <label>
          <span>縣市篩選</span>
          <select value={county} onChange={(e) => setCounty(e.target.value)}>
            <option>全部縣市</option>
            {counties.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label>
          <span>搜尋測站 / 行政區</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：臺中、梧棲、臺北"
          />
        </label>

        <div className="filter-status">
          顯示 <strong>{filteredStations.length}</strong> 個測站
        </div>
      </section>

      <aside className="summary-panel glass">
        <div className="summary-title">
          <span>🌤️</span>
          <div>
            <b>即時概況</b>
            <small>{county === "全部縣市" ? "全台" : county}</small>
          </div>
        </div>

        <div className="summary-grid">
          <article>
            <small>最低溫</small>
            <strong>{minTemp == null ? "—" : `${minTemp.toFixed(1)}°`}</strong>
          </article>
          <article>
            <small>最高溫</small>
            <strong>{maxTemp == null ? "—" : `${maxTemp.toFixed(1)}°`}</strong>
          </article>
          <article>
            <small>資料集</small>
            <strong className="small-value">{data?.dataset || "—"}</strong>
          </article>
          <article>
            <small>縣市數</small>
            <strong>{data?.summary?.countyCount ?? "—"}</strong>
          </article>
        </div>

        <div className="updated-card">
          <span className="live-dot" />
          <div>
            <small>最新 CWA 觀測時間</small>
            <b>{formatTime(data?.latestObservedAt)}</b>
          </div>
        </div>

        {data?.fallbackUsed && (
          <p className="notice">主要資料源暫時不可用，目前使用備援資料集。</p>
        )}
      </aside>

      <aside className="legend glass">
        <b>氣溫圖例</b>
        <div><i style={{ background: "#2563eb" }} /> &lt; 10°C</div>
        <div><i style={{ background: "#0ea5e9" }} /> 10–15°C</div>
        <div><i style={{ background: "#10b981" }} /> 15–20°C</div>
        <div><i style={{ background: "#84cc16" }} /> 20–25°C</div>
        <div><i style={{ background: "#f59e0b" }} /> 25–30°C</div>
        <div><i style={{ background: "#f97316" }} /> 30–35°C</div>
        <div><i style={{ background: "#ef4444" }} /> ≥ 35°C</div>
      </aside>

      <footer className="footer-status glass">
        <span>資料來源：交通部中央氣象署</span>
        <span>API 取得：{formatTime(data?.fetchedAt)}</span>
      </footer>

      {loading && !data && (
        <div className="overlay-message">
          <div className="message-card glass">正在取得中央氣象署即時資料…</div>
        </div>
      )}

      {error && (
        <div className="error-toast">
          <strong>⚠️ 無法取得資料</strong>
          <span>{error}</span>
          <button onClick={loadWeather}>重試</button>
        </div>
      )}
    </main>
  );
}
