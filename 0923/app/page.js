"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TAIWAN_CENTER = [23.7, 121.0];
const TAIWAN_BOUNDS = [
  [21.7, 118.0],
  [26.6, 123.1],
];

function canonicalCountyName(name = "") {
  const value = String(name).trim().replace(/台/g, "臺");
  const aliases = {
    "桃園縣": "桃園市",
    "臺北縣": "新北市",
    "臺中縣": "臺中市",
    "臺南縣": "臺南市",
    "高雄縣": "高雄市",
  };
  return aliases[value] || value;
}

function countyNamesEqual(a, b) {
  return canonicalCountyName(a) === canonicalCountyName(b);
}

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

function HistoryChart({ rows }) {
  if (!rows.length) {
    return <div className="history-empty">歷史資料正在累積中，之後重新載入就會逐步出現時間序列。</div>;
  }

  const values = rows
    .map((row) => Number(row.temperature))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return <div className="history-empty">目前沒有可用的歷史氣溫資料。</div>;
  }

  const width = 520;
  const height = 180;
  const padX = 34;
  const padY = 18;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);

  const points = rows.map((row, index) => {
    const value = Number(row.temperature);
    const x =
      rows.length === 1
        ? width / 2
        : padX + (index / (rows.length - 1)) * (width - padX * 2);
    const y =
      height - padY - ((value - min) / range) * (height - padY * 2);
    return { x, y, value, row };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="history-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="縣市歷史平均氣溫折線圖">
        <line x1={padX} x2={width - padX} y1={height - padY} y2={height - padY} />
        <line x1={padX} x2={padX} y1={padY} y2={height - padY} />
        <path d={path} className="history-line" />
        {points.map((point, index) => (
          <g key={`${point.row.fetchedAt}-${index}`}>
            <circle cx={point.x} cy={point.y} r="3.5" />
            <title>
              {`${formatTime(point.row.observedAt || point.row.fetchedAt)} · ${point.value.toFixed(1)}°C`}
            </title>
          </g>
        ))}
        <text x="4" y={padY + 3}>{max.toFixed(1)}°</text>
        <text x="4" y={height - padY}>{min.toFixed(1)}°</text>
      </svg>
    </div>
  );
}

function loadTopoJson() {
  return new Promise((resolve, reject) => {
    if (window.topojson) {
      resolve(window.topojson);
      return;
    }
    const existing = document.querySelector('script[data-topojson="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.topojson));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js";
    script.dataset.topojson = "true";
    script.onload = () => resolve(window.topojson);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function countyNameIcon(L, name, temp) {
  const color = temp == null ? "#cbd5e1" : colorByTemperature(temp);
  const tempText = temp == null ? "" : `${temp.toFixed(1)}°`;
  return L.divIcon({
    className: "county-map-name-wrap",
    html: `<div class="county-map-name" style="--county-color:${color}">
      <span>${name}</span><small>${tempText}</small>
    </div>`,
    iconSize: [96, 34],
    iconAnchor: [48, 17],
  });
}

function districtNameIcon(L, county, town) {
  return L.divIcon({
    className: "district-map-name-wrap",
    html: `<div class="district-map-name"><span>${town}</span><small>${county}</small></div>`,
    iconSize: [86, 36],
    iconAnchor: [43, 18],
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
  const countyBoundaryRef = useRef(null);
  const countyNameRef = useRef(null);
  const districtBoundaryRef = useRef(null);
  const districtNameRef = useRef(null);
  const countyGeoRef = useRef(null);
  const townGeoRef = useRef(null);
  const leafletRef = useRef(null);

  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("全部縣市");
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(7);
  const [boundaryVersion, setBoundaryVersion] = useState(0);
  const [error, setError] = useState("");
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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
    if (county === "全部縣市") {
      setHistoryRows([]);
      setHistoryError("");
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError("");

    fetch(`/api/weather/history?county=${encodeURIComponent(county)}&limit=96`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok || !json.success) {
          throw new Error(json.error || "歷史資料載入失敗");
        }
        if (!cancelled) setHistoryRows(json.rows || []);
      })
      .catch((err) => {
        if (!cancelled) {
          setHistoryRows([]);
          setHistoryError(err instanceof Error ? err.message : "歷史資料載入失敗");
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [county, data?.fetchedAt]);

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
        countyBoundaryRef.current = L.layerGroup().addTo(map);
        countyNameRef.current = L.layerGroup().addTo(map);
        districtBoundaryRef.current = L.layerGroup().addTo(map);
        districtNameRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;

        const syncZoom = () => setZoomLevel(map.getZoom());
        map.on("zoomend", syncZoom);
        syncZoom();
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

  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;

    Promise.all([
      fetch("https://raw.githubusercontent.com/JJcyberTools/nchu_AIoT_Homework/main/0923/taiwan-counties.geojson", {
        cache: "force-cache",
      }).then((response) => {
        if (!response.ok) throw new Error("縣市邊界載入失敗");
        return response.json();
      }),
      Promise.all([
        fetch("https://cdn.jsdelivr.net/npm/taiwan-atlas/towns-10t.json", {
          cache: "force-cache",
        }).then((response) => {
          if (!response.ok) throw new Error("鄉鎮邊界載入失敗");
          return response.json();
        }),
        loadTopoJson(),
      ]).then(([topology, topojson]) => {
        if (!topology?.objects?.towns) return null;
        return topojson.feature(topology, topology.objects.towns);
      }),
    ])
      .then(([countyGeo, townGeo]) => {
        if (cancelled) return;
        countyGeoRef.current = countyGeo;
        townGeoRef.current = townGeo;
        setBoundaryVersion((value) => value + 1);
      })
      .catch((err) => {
        console.warn(err);
      });

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  const counties = useMemo(() => {
    if (!data?.stations) return [];

    const order = [
      "基隆市", "臺北市", "新北市", "桃園市", "新竹市", "新竹縣",
      "苗栗縣", "臺中市", "彰化縣", "南投縣", "雲林縣",
      "嘉義市", "嘉義縣", "臺南市", "高雄市", "屏東縣",
      "宜蘭縣", "花蓮縣", "臺東縣", "澎湖縣", "金門縣", "連江縣"
    ];
    const orderIndex = new Map(order.map((name, index) => [name, index]));

    return [...new Set(data.stations.map((s) => s.county))]
      .filter(Boolean)
      .sort((a, b) => {
        const ai = orderIndex.has(a) ? orderIndex.get(a) : 999;
        const bi = orderIndex.has(b) ? orderIndex.get(b) : 999;
        return ai === bi ? a.localeCompare(b, "zh-Hant") : ai - bi;
      });
  }, [data]);

  const filteredStations = useMemo(() => {
    if (!data?.stations) return [];
    const keyword = query.trim().toLowerCase();
    return data.stations.filter((station) => {
      const countyMatched =
        county === "全部縣市" || countyNamesEqual(station.county, county);
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

    if (zoomLevel < 10) return;

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
          <div class="popup-place">${escapeHtml(station.county)} ${escapeHtml(station.town)}</div>
          <div class="popup-temp" style="color:${colorByTemperature(station.temperature)}">
            ${station.temperature.toFixed(1)}°C
          </div>
          <div class="popup-grid">
            <span>天氣</span><b>${escapeHtml(station.weather || "—")}</b>
            <span>濕度</span><b>${formatValue(station.humidity, "%", 0)}</b>
            <span>雨量</span><b>${formatValue(station.precipitation, " mm")}</b>
            <span>風速</span><b>${formatValue(station.windSpeed, " m/s")}</b>
            <span>氣壓</span><b>${formatValue(station.pressure, " hPa")}</b>
            <span>觀測</span><b>${formatTime(station.observedAt)}</b>
          </div>
        </div>
      `);
      marker.addTo(group);
    });
  }, [filteredStations, mapReady, zoomLevel]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !countyBoundaryRef.current) return;
    const L = leafletRef.current;
    const countyGeo = countyGeoRef.current;
    if (!countyGeo) return;

    const boundaryGroup = countyBoundaryRef.current;
    const nameGroup = countyNameRef.current;
    const districtGroup = districtBoundaryRef.current;
    const districtNameGroup = districtNameRef.current;

    boundaryGroup.clearLayers();
    nameGroup.clearLayers();
    districtGroup.clearLayers();
    districtNameGroup.clearLayers();

    const stationTemps = new Map();
    (data?.stations || []).forEach((station) => {
      const key = canonicalCountyName(station.county);
      const values = stationTemps.get(key) || [];
      if (typeof station.temperature === "number") values.push(station.temperature);
      stationTemps.set(key, values);
    });

    const avgTemp = (name) => {
      const values = stationTemps.get(canonicalCountyName(name)) || [];
      return values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : null;
    };

    let geoLayer;
    const chooseCounty = (name, bounds) => {
      const normalized = canonicalCountyName(name);
      setCounty(normalized);
      setQuery("");
      if (bounds && mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: [26, 26], maxZoom: 10 });
        if (mapRef.current.getZoom() < 10) mapRef.current.setZoom(10);
      }
    };

    geoLayer = L.geoJSON(countyGeo, {
      style: (feature) => {
        const name = canonicalCountyName(feature?.properties?.COUNTYNAME || feature?.properties?.name || "");
        const temp = avgTemp(name);
        const color = temp == null ? "#94a3b8" : colorByTemperature(temp);
        const active = county !== "全部縣市" && countyNamesEqual(name, county);
        return {
          color: active ? color : "#64748b",
          weight: active ? 3.2 : 1.25,
          opacity: active ? 1 : 0.72,
          fillColor: color,
          fillOpacity: active ? 0.10 : 0.018,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = canonicalCountyName(feature?.properties?.COUNTYNAME || feature?.properties?.name || "");
        const temp = avgTemp(name);
        const color = temp == null ? "#94a3b8" : colorByTemperature(temp);
        const active = county !== "全部縣市" && countyNamesEqual(name, county);

        layer.bindTooltip(
          temp == null
            ? `${name} · 點擊切換`
            : `${name} · 平均 ${temp.toFixed(1)}°C · 點擊切換`,
          { sticky: true }
        );

        layer.on({
          mouseover: (event) => {
            event.target.setStyle({
              weight: 3.6,
              opacity: 1,
              fillOpacity: active ? 0.15 : 0.10,
              color,
            });
          },
          mouseout: (event) => geoLayer.resetStyle(event.target),
          click: (event) => {
            L.DomEvent.stopPropagation(event);
            chooseCounty(name, event.target.getBounds());
          },
        });

        if (zoomLevel <= 9 && name) {
          const center = layer.getBounds().getCenter();
          L.marker(center, {
            icon: countyNameIcon(L, name, temp),
            interactive: true,
            keyboard: true,
            title: name,
          })
            .on("click", (event) => {
              L.DomEvent.stopPropagation(event);
              chooseCounty(name, layer.getBounds());
            })
            .addTo(nameGroup);
        }
      },
    });

    geoLayer.addTo(boundaryGroup);

    if (county !== "全部縣市" && townGeoRef.current && zoomLevel >= 10) {
      const features = townGeoRef.current.features.filter((feature) =>
        countyNamesEqual(feature?.properties?.COUNTYNAME || "", county)
      );

      let townLayer;
      townLayer = L.geoJSON(
        { type: "FeatureCollection", features },
        {
          style: {
            color: "#cbd5e1",
            weight: 1.15,
            opacity: 0.78,
            fillColor: "#94a3b8",
            fillOpacity: 0.025,
          },
          onEachFeature: (feature, layer) => {
            const countyName = canonicalCountyName(feature?.properties?.COUNTYNAME || county);
            const town = feature?.properties?.TOWNNAME || "";
            layer.bindTooltip(`${countyName} ${town}`, { sticky: true });
            layer.on({
              mouseover: (event) =>
                event.target.setStyle({
                  weight: 2.2,
                  color: "#f8fafc",
                  fillOpacity: 0.12,
                }),
              mouseout: (event) => townLayer.resetStyle(event.target),
            });

            if (town) {
              L.marker(layer.getBounds().getCenter(), {
                icon: districtNameIcon(L, countyName, town),
                interactive: false,
                keyboard: false,
              }).addTo(districtNameGroup);
            }
          },
        }
      );
      townLayer.addTo(districtGroup);
    }
  }, [mapReady, data, county, zoomLevel, boundaryVersion]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;

    if (county !== "全部縣市") {
      const feature = countyGeoRef.current?.features?.find((item) =>
        countyNamesEqual(
          item?.properties?.COUNTYNAME || item?.properties?.name || "",
          county
        )
      );

      if (feature) {
        const layer = L.geoJSON(feature);
        mapRef.current.fitBounds(layer.getBounds(), { padding: [26, 26], maxZoom: 10 });
        if (mapRef.current.getZoom() < 10) mapRef.current.setZoom(10);
        return;
      }
    }

    if (query.trim() && filteredStations.length) {
      const bounds = L.latLngBounds(filteredStations.map((station) => [station.lat, station.lon]));
      mapRef.current.fitBounds(bounds.pad(0.2), { maxZoom: 10 });
      if (mapRef.current.getZoom() < 9) mapRef.current.setZoom(9);
      return;
    }

    if (county === "全部縣市" && !query.trim()) {
      mapRef.current.setView(TAIWAN_CENTER, 7);
    }
  }, [county, query, mapReady, boundaryVersion]);

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

      {county !== "全部縣市" && (
        <aside className="history-panel glass">
          <div className="history-head">
            <div>
              <b>{county} 歷史平均氣溫</b>
              <small>
                Neon PostgreSQL · {historyRows.length} 筆快照
              </small>
            </div>
            {historyLoading && <span>查詢中…</span>}
          </div>

          {historyError ? (
            <div className="history-empty">{historyError}</div>
          ) : (
            <HistoryChart rows={historyRows} />
          )}

          <div className="history-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>時間</th>
                  <th>平均氣溫</th>
                  <th>測站數</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.slice().reverse().slice(0, 8).map((row) => (
                  <tr key={row.fetchedAt}>
                    <td>{formatTime(row.observedAt || row.fetchedAt)}</td>
                    <td>{Number(row.temperature).toFixed(1)}°C</td>
                    <td>{row.stationCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      )}

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
