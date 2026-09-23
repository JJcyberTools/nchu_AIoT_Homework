const CWA_KEY = "CWA-55FDA6D3-" + "A43C-4AE0-" + "BB30-E62D5F684FB2";
const DATASET = "O-A0003-001";
const API_URL = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/${DATASET}?Authorization=${CWA_KEY}&format=JSON`;

const map = L.map("map", {
  zoomControl: false,
  minZoom: 6,
  maxZoom: 14,
  maxBounds: [[21.5, 117.5], [27.0, 123.8]],
  maxBoundsViscosity: 0.7
}).setView([23.7, 121.0], 7);

L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri ｜ 氣象資料：交通部中央氣象署 CWA",
    maxNativeZoom: 16,
    maxZoom: 18
  }
).addTo(map);

L.control.zoom({ position: "bottomright" }).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
let stations = [];

const els = {
  refreshBtn: document.getElementById("refreshBtn"),
  retryBtn: document.getElementById("retryBtn"),
  countySelect: document.getElementById("countySelect"),
  searchInput: document.getElementById("searchInput"),
  stationCount: document.getElementById("stationCount"),
  minTemp: document.getElementById("minTemp"),
  maxTemp: document.getElementById("maxTemp"),
  countyCount: document.getElementById("countyCount"),
  updatedAt: document.getElementById("updatedAt"),
  fetchTime: document.getElementById("fetchTime"),
  summaryScope: document.getElementById("summaryScope"),
  loading: document.getElementById("loading"),
  errorToast: document.getElementById("errorToast"),
  errorText: document.getElementById("errorText")
};

const invalidValues = new Set([-99, -990, -991, -9991, -9997, -9998, -9999]);

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") {
    const v = value.trim();
    if (!v || v === "X" || v === "-") return null;
    if (v.toUpperCase() === "T") return 0;
  }
  const n = Number(value);
  if (!Number.isFinite(n) || invalidValues.has(n)) return null;
  return n;
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

function tempColor(temp) {
  if (temp < 10) return "#2563eb";
  if (temp < 15) return "#0ea5e9";
  if (temp < 20) return "#10b981";
  if (temp < 25) return "#84cc16";
  if (temp < 30) return "#f59e0b";
  if (temp < 35) return "#f97316";
  return "#ef4444";
}

function formatTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-TW", { hour12: false, timeZone: "Asia/Taipei" });
}

function formatNumber(value, suffix = "", digits = 1) {
  return typeof value === "number" ? `${value.toFixed(digits)}${suffix}` : "—";
}

function normalizeStation(station) {
  const coords = station?.GeoInfo?.Coordinates || [];
  const pos = coords.find(c => c?.CoordinateName === "WGS84") || coords[0];
  const lat = toNumber(pos?.StationLatitude);
  const lon = toNumber(pos?.StationLongitude);
  const temp = toNumber(station?.WeatherElement?.AirTemperature);
  const id = station?.StationId?.trim();

  if (!id || lat === null || lon === null || temp === null) return null;
  if (lat < 20 || lat > 27 || lon < 118 || lon > 123.5) return null;
  if (temp < -20 || temp > 50) return null;

  let humidity = toNumber(station?.WeatherElement?.RelativeHumidity);
  if (typeof humidity === "number" && humidity <= 1.2) humidity *= 100;

  return {
    stationId: id,
    stationName: station?.StationName || id,
    county: station?.GeoInfo?.CountyName || "未知縣市",
    town: station?.GeoInfo?.TownName || "",
    lat,
    lon,
    temperature: temp,
    humidity,
    pressure: toNumber(station?.WeatherElement?.AirPressure),
    windSpeed: toNumber(station?.WeatherElement?.WindSpeed),
    windDirection: toNumber(station?.WeatherElement?.WindDirection),
    precipitation: toNumber(station?.WeatherElement?.Now?.Precipitation),
    weather: station?.WeatherElement?.Weather || "",
    observedAt: station?.ObsTime?.DateTime || null
  };
}

function stationIcon(station) {
  return L.divIcon({
    className: "station-marker-wrap",
    html: `
      <div class="station-marker" style="--temp-color:${tempColor(station.temperature)}">
        <span class="station-weather">${weatherEmoji(station.weather)}</span>
        <span class="station-temp">${Math.round(station.temperature)}°</span>
      </div>
    `,
    iconSize: [58, 32],
    iconAnchor: [29, 16]
  });
}

function popupHtml(s) {
  return `
    <div class="station-popup">
      <div class="popup-title"><span>${weatherEmoji(s.weather)}</span><strong>${s.stationName}</strong></div>
      <div class="popup-place">${s.county} ${s.town}</div>
      <div class="popup-temp" style="color:${tempColor(s.temperature)}">${s.temperature.toFixed(1)}°C</div>
      <div class="popup-grid">
        <span>天氣</span><b>${s.weather || "—"}</b>
        <span>濕度</span><b>${formatNumber(s.humidity, "%", 0)}</b>
        <span>雨量</span><b>${formatNumber(s.precipitation, " mm")}</b>
        <span>風速</span><b>${formatNumber(s.windSpeed, " m/s")}</b>
        <span>氣壓</span><b>${formatNumber(s.pressure, " hPa")}</b>
        <span>觀測</span><b>${formatTime(s.observedAt)}</b>
      </div>
    </div>
  `;
}

function rebuildCountyOptions() {
  const current = els.countySelect.value;
  const counties = [...new Set(stations.map(s => s.county))].filter(Boolean).sort((a,b) => a.localeCompare(b, "zh-Hant"));
  els.countySelect.innerHTML = '<option value="">全部縣市</option>';
  counties.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    els.countySelect.appendChild(option);
  });
  if (counties.includes(current)) els.countySelect.value = current;
  els.countyCount.textContent = counties.length;
}

function getFilteredStations() {
  const county = els.countySelect.value;
  const q = els.searchInput.value.trim().toLowerCase();
  return stations.filter(s => {
    const countyOk = !county || s.county === county;
    const text = `${s.stationName} ${s.county} ${s.town}`.toLowerCase();
    return countyOk && (!q || text.includes(q));
  });
}

function renderStations() {
  const filtered = getFilteredStations();
  markerLayer.clearLayers();

  filtered.forEach(s => {
    L.marker([s.lat, s.lon], { icon: stationIcon(s), title: `${s.stationName} ${s.temperature}°C` })
      .bindPopup(popupHtml(s))
      .addTo(markerLayer);
  });

  els.stationCount.textContent = filtered.length;
  els.summaryScope.textContent = els.countySelect.value || "全台";

  const temps = filtered.map(s => s.temperature);
  els.minTemp.textContent = temps.length ? `${Math.min(...temps).toFixed(1)}°` : "—";
  els.maxTemp.textContent = temps.length ? `${Math.max(...temps).toFixed(1)}°` : "—";

  if (filtered.length && (els.countySelect.value || els.searchInput.value.trim())) {
    map.fitBounds(L.latLngBounds(filtered.map(s => [s.lat, s.lon])).pad(0.2), { maxZoom: 10 });
  } else {
    map.setView([23.7, 121.0], 7);
  }
}

async function loadWeather() {
  els.loading.hidden = false;
  els.errorToast.hidden = true;
  els.refreshBtn.disabled = true;
  els.refreshBtn.textContent = "更新中…";

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`CWA API HTTP ${response.status}`);

    const json = await response.json();
    if (json?.success === "false" || json?.success === false) {
      throw new Error("CWA API 回傳 success=false");
    }

    const raw = json?.records?.Station || [];
    stations = raw.map(normalizeStation).filter(Boolean);

    if (!stations.length) throw new Error("API 有回應，但沒有可用測站資料");

    rebuildCountyOptions();
    renderStations();

    const latest = stations.map(s => s.observedAt).filter(Boolean).sort().at(-1);
    els.updatedAt.textContent = formatTime(latest);
    els.fetchTime.textContent = `API 取得：${formatTime(new Date().toISOString())}`;
  } catch (error) {
    els.errorText.textContent = error instanceof Error ? error.message : "未知錯誤";
    els.errorToast.hidden = false;
  } finally {
    els.loading.hidden = true;
    els.refreshBtn.disabled = false;
    els.refreshBtn.textContent = "↻ 更新資料";
  }
}

els.refreshBtn.addEventListener("click", loadWeather);
els.retryBtn.addEventListener("click", loadWeather);
els.countySelect.addEventListener("change", renderStations);
els.searchInput.addEventListener("input", renderStations);

loadWeather();
