# Taiwan Weather GIS Dashboard
## AIoT L3 - CWA Weather GIS + Vercel + Neon PostgreSQL

> **CWA Open Data → Vercel API → Neon PostgreSQL → Taiwan GIS Dashboard**

本專案以交通部中央氣象署（CWA）Open Data 為資料來源，將即時氣象觀測資料結合 Leaflet GIS、台灣縣市 / 鄉鎮市區行政邊界與歷史資料查詢，建立可互動的台灣氣象 Dashboard。

目前版本已由原本的 GitHub Pages 純前端架構，升級為 **Vercel + Next.js API + Neon PostgreSQL**。除了即時氣象地圖之外，也會持續累積歷史觀測資料，供後續折線圖與 SQL 查詢使用。

## Live Demo

**Vercel：**  
https://nchu-a-io-t-homework.vercel.app/

**GitHub Repository：**  
https://github.com/JJcyberTools/nchu_AIoT_Homework/tree/main/0923


<img width="2553" height="1335" alt="image" src="https://github.com/user-attachments/assets/87a62d7f-1c42-4e1e-9483-e15b256dd71d" />

<img width="2536" height="1353" alt="image" src="https://github.com/user-attachments/assets/9625aad6-6fa7-4cd8-9eb1-b2e22821e049" />


---

# 技術實作重點

本專案目前的重點不是單純做出氣象介面，而是把課堂中會使用到的 **API、JSON、GIS、SQL、資料庫、雲端部署與自動化資料蒐集** 串成一個完整流程。

## 技術總覽

| 類別 | 使用技術 / 工具 | 本專案用途 | 狀態 |
| --- | --- | --- | --- |
| 氣象資料 | CWA Open Data API | 取得中央氣象署自動氣象站觀測資料 | ✅ |
| API 資料格式 | JSON | 解析 CWA 回傳資料 | ✅ |
| Web Framework | Next.js 14 | 前端頁面與 Server API Route | ✅ |
| Frontend | React | Dashboard UI 與互動狀態 | ✅ |
| Server API | Next.js Route Handler | 由 Vercel Server 端呼叫 CWA / DB | ✅ |
| GIS | Leaflet | 台灣互動式地圖 | ✅ |
| GIS Data | GeoJSON | 台灣縣市行政邊界 | ✅ |
| GIS Data | TopoJSON | 鄉鎮市區行政邊界 | ✅ |
| GIS Conversion | topojson-client | TopoJSON 轉 GeoJSON | ✅ |
| Map Tiles | Esri World Dark Gray | GIS 底圖 | ✅ |
| Database | Neon PostgreSQL | 永久保存歷史氣象資料 | ✅ |
| SQL | PostgreSQL SQL Query | 建表、INSERT、JOIN、AVG、歷史查詢 | ✅ |
| DB Driver | @neondatabase/serverless | Next.js / Vercel 連線 Neon | ✅ |
| Cloud Deployment | Vercel | Next.js 部署與 Server Function | ✅ |
| Secret Management | Vercel Environment Variables | 保存 CWA_API_KEY、DATABASE_URL | ✅ |
| Version Control | Git / GitHub | 原始碼與 Commit 管理 | ✅ |
| Automation | GitHub Actions | 每 30 分鐘自動取得氣象資料 | ✅ |
| Historical Data | PostgreSQL Time Series | 累積不同時間的測站觀測 | ✅ |

---

## 課堂技術對照

以下整理本專案和課堂練習技術的對應，方便快速確認實作範圍。

| 課堂主題 | 本專案實作方式 | 對應檔案 |
| --- | --- | --- |
| CWA Open Data | 使用 `O-A0003-001` | `app/api/weather/route.js` |
| HTTP Request | Server 端使用 `fetch()` 呼叫 CWA | `app/api/weather/route.js` |
| JSON Parsing | 解析 Station / WeatherElement / GeoInfo | `app/api/weather/route.js` |
| 資料清洗 | 過濾無效值、座標、氣溫與缺值 | `app/api/weather/route.js` |
| SQL Database | Neon PostgreSQL | `lib/db.js` |
| 建立 Schema | `CREATE TABLE IF NOT EXISTS` | `lib/db.js` |
| SQL INSERT | 儲存 snapshots / observations | `app/api/weather/route.js` |
| SQL Query | 歷史資料查詢、JOIN、AVG | `app/api/weather/history/route.js` |
| Historical Data | 每次新的觀測時間存入 PostgreSQL | Neon DB |
| GIS Map | Leaflet | `app/page.js` |
| County Boundary | GeoJSON | `taiwan-counties.geojson` |
| Town Boundary | Taiwan Atlas TopoJSON | `app/page.js` |
| Dashboard | React + Next.js | `app/page.js` |
| Cloud Deployment | Vercel | Vercel Project |
| Scheduled Collection | GitHub Actions Cron | `.github/workflows/weather-cron.yml` |

---

## 系統架構

```text
                    GitHub
                      │
          Source Code│
                      ▼
                   Vercel
                      │
            Next.js Server API
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
       CWA Open Data      Neon PostgreSQL
       O-A0003-001        snapshots
             │            observations
             │                 │
             └────────┬────────┘
                      ▼
               Historical API
                      │
                      ▼
          React + Leaflet Dashboard
```

另一條背景資料蒐集流程：

```text
GitHub Actions
每 30 分鐘
      │
      ▼
Vercel /api/weather
      │
      ▼
CWA Open Data
      │
      ▼
Neon PostgreSQL
```

---

## Vercel

Vercel 在本專案負責：

- 部署 Next.js
- 執行 Server API Route
- 從 GitHub `main` branch 自動部署
- 提供 Environment Variables
- 讓前端不需要直接保存資料庫連線資訊

目前 Server 端使用的環境變數：

```text
CWA_API_KEY
DATABASE_URL
```

API Key 與資料庫 Connection String 都不直接寫入前端程式。

---

## Neon PostgreSQL

資料庫採用 **Neon Serverless PostgreSQL**。

連線套件：

```text
@neondatabase/serverless
```

主要使用兩張資料表。

### snapshots

代表每一次成功取得的新氣象快照。

```sql
snapshots
- id
- fetched_at
- updated_at
- source
- station_count
- payload
```

### observations

保存該次快照中的每一個測站資料。

```sql
observations
- snapshot_id
- station_id
- station_name
- county
- town
- observed_at
- lng
- lat
- temperature
- humidity
- pressure
- wind_speed
- wind_direction
- precipitation
- weather
```

使用到的 SQL 概念包括：

```text
CREATE TABLE
CREATE INDEX
INSERT
ON CONFLICT
SELECT
JOIN
WHERE
GROUP BY
ORDER BY
AVG
MAX
COUNT
LIMIT
```

因此目前已經不是只把資料暫存在 Browser Memory，而是有真正的 **SQL Database + Historical Data**。

---

## API

### Current Weather API

```text
GET /api/weather
```

負責：

```text
CWA API
   ↓
JSON
   ↓
資料清洗
   ↓
Neon PostgreSQL INSERT
   ↓
Frontend
```

### Historical Weather API

```text
GET /api/weather/history
```

縣市歷史資料：

```text
/api/weather/history?county=臺中市&limit=96
```

單一測站歷史資料：

```text
/api/weather/history?stationId=467490&limit=144
```

歷史查詢由 PostgreSQL 執行，而不是在前端用假資料產生。

---

## GIS 技術

GIS 使用：

```text
Leaflet
GeoJSON
TopoJSON
topojson-client
Esri Map Tiles
```

資料來源：

| GIS 資料 | 使用方式 |
| --- | --- |
| `taiwan-counties.geojson` | 縣市邊界 |
| Taiwan Atlas `towns-10t.json` | 鄉鎮市區邊界 |
| CWA Station Coordinates | 測站經緯度 |

因此地圖是由真實座標與行政區 GIS Data 疊加產生。

---

## 自動資料蒐集

使用 GitHub Actions：

```text
.github/workflows/weather-cron.yml
```

排程：

```yaml
cron: "*/30 * * * *"
```

也就是每 30 分鐘自動呼叫一次 Vercel Weather API。

目的不是單純刷新網頁，而是讓 PostgreSQL 持續累積不同時間的觀測資料。

---

## 專案主要檔案

```text
nchu_AIoT_Homework/
│
├── .github/
│   └── workflows/
│       └── weather-cron.yml
│
└── 0923/
    ├── app/
    │   ├── api/
    │   │   └── weather/
    │   │       ├── route.js
    │   │       └── history/
    │   │           └── route.js
    │   ├── globals.css
    │   ├── layout.js
    │   └── page.js
    │
    ├── lib/
    │   └── db.js
    │
    ├── taiwan-counties.geojson
    ├── package.json
    └── README.md
```

---

## 課程原始工具與目前實作差異

課堂流程中有示範 **SQLite / Pandas / Streamlit**。

本專案目前沒有使用這三項，而是將相同概念改成雲端 Web 架構：

| 課堂示範 | 本專案 |
| --- | --- |
| SQLite `data.db` | Neon PostgreSQL |
| Python SQLite Query | Next.js + PostgreSQL SQL Query |
| Streamlit | Next.js + React |
| Local App | Vercel Cloud Deployment |
| 手動執行資料取得 | GitHub Actions 每 30 分鐘自動執行 |

因此資料庫、SQL Query、歷史資料與 Dashboard 的核心概念都有實作，但採用的是 **Vercel + Neon PostgreSQL + Next.js** 技術組合。

---

## 技術關鍵字

```text
CWA Open Data
REST API
JSON
Fetch API
Next.js
React
Server API Route
Leaflet
GIS
GeoJSON
TopoJSON
PostgreSQL
SQL
Neon
Serverless Database
Vercel
Environment Variables
Git
GitHub
GitHub Actions
Cron
Historical Time Series Data
```

---

**NCHU AIoT · CWA Open Data · GIS · SQL · PostgreSQL · Vercel · Neon**
