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

## 專案目前架構

```text
GitHub
  │
  ├── Next.js / React Source Code
  └── GitHub Actions
          │
          │ 每 30 分鐘
          ▼
       Vercel
          │
          ├── /api/weather
          │       │
          │       ▼
          │   CWA Open Data API
          │       │
          │       ▼
          │   Neon PostgreSQL
          │       ├── snapshots
          │       └── observations
          │
          └── /api/weather/history
                  │
                  ▼
             歷史氣象資料
                  │
                  ▼
          React / Leaflet / Chart UI
```

目前 GitHub 是原始碼來源，Vercel 會偵測 `main` branch 的新 commit 並自動重新部署。

---

## 主要功能

- CWA `O-A0003-001` 自動氣象站即時觀測資料
- Next.js API Route 代理 CWA API
- CWA API Key 儲存在 Vercel Environment Variables
- Neon PostgreSQL 永久儲存歷史資料
- GitHub Actions 每 30 分鐘自動觸發資料擷取
- Leaflet 台灣 GIS 地圖
- 台灣縣市行政邊界
- 鄉鎮市區行政邊界
- 縣市名稱與平均氣溫
- 縣市 Polygon Hover 高亮
- 點擊縣市直接切換並放大
- 縣市下拉選單
- 測站 / 行政區文字搜尋
- 即時測站氣溫 Marker
- 天氣圖示
- 測站 Popup 詳細資料
- 縣市歷史平均氣溫折線圖
- 歷史資料表格
- RWD 桌面 / 行動版介面

---

## GIS 顯示邏輯

為避免全台同時顯示大量測站造成畫面過度擁擠，目前依 Leaflet Zoom Level 控制資訊密度。

### Zoom 7–9

主要顯示：

- 縣市邊界
- 縣市名稱
- 縣市平均氣溫
- 縣市 Hover
- 縣市 Click

此階段不顯示大量測站與鄉鎮細節。

### 點擊縣市

點擊地圖上的縣市 Polygon 或縣市名稱後：

```text
選擇縣市
   ↓
自動切換下拉選單
   ↓
地圖直接放大到 Zoom 10
   ↓
顯示該縣市詳細資訊
```

### Zoom 10 以上

顯示詳細層級：

- 該縣市氣象站 Marker
- 鄉鎮市區行政邊界
- 鄉鎮市區名稱
- 測站即時氣溫
- 測站詳細 Popup

這樣可以讓全台視角保持乾淨，同時在需要時查看細部資料。

---

## CWA Open Data

主要使用資料集：

```text
O-A0003-001
```

若主要資料源失敗，也保留備援資料集邏輯：

```text
O-A0001-001
```

主要使用欄位：

| 欄位 | 用途 |
| --- | --- |
| StationId | 測站 ID |
| StationName | 測站名稱 |
| GeoInfo.CountyName | 縣市 |
| GeoInfo.TownName | 鄉鎮市區 |
| Coordinates | 經緯度 |
| AirTemperature | 氣溫 |
| RelativeHumidity | 相對濕度 |
| AirPressure | 氣壓 |
| WindSpeed | 風速 |
| WindDirection | 風向 |
| Precipitation | 雨量 |
| Weather | 天氣現象 |
| ObsTime | 觀測時間 |

---

## API Key 管理

CWA API Key 不再直接寫在前端 JavaScript。

目前改為放在 Vercel Environment Variables：

```text
CWA_API_KEY
```

Next.js Server API 使用：

```js
process.env.CWA_API_KEY
```

因此瀏覽器不需要直接取得 CWA API Key。

---

## Neon PostgreSQL

目前資料庫使用 **Neon Serverless PostgreSQL**，並透過：

```text
DATABASE_URL
```

由 Vercel Server Function 連線。

使用套件：

```text
@neondatabase/serverless
```

### snapshots

每一次成功取得新的 CWA 觀測資料時，建立一筆 Snapshot。

主要欄位：

```text
id
fetched_at
updated_at
source
station_count
payload
```

並使用：

```text
UNIQUE (source, updated_at)
```

避免同一個 CWA 觀測時間重複寫入。

### observations

每一個 Snapshot 會包含該次所有有效測站資料。

主要欄位：

```text
snapshot_id
station_id
station_name
county
town
observed_at
lng
lat
temperature
humidity
pressure
wind_speed
wind_direction
precipitation
weather
```

因此資料會隨時間累積，形成真正的氣象時序資料。

---

## 即時氣象 API

API Route：

```text
GET /api/weather
```

流程：

```text
Browser / GitHub Actions
        ↓
GET /api/weather
        ↓
Vercel Server Function
        ↓
CWA O-A0003-001
        ↓
JSON Parsing / Data Cleaning
        ↓
Neon PostgreSQL
        ↓
Response to Frontend
```

如果 CWA 回傳的是已經儲存過的觀測時間，資料庫不會再次建立重複 Snapshot。

---

## 歷史氣象 API

### 查詢縣市歷史平均氣溫

例如：

```text
GET /api/weather/history?county=臺中市&limit=96
```

回傳每個 Snapshot 中該縣市所有測站的平均氣溫。

### 查詢單一測站歷史資料

例如：

```text
GET /api/weather/history?stationId=467490&limit=144
```

可取得單一測站的：

- 氣溫
- 濕度
- 氣壓
- 風速
- 風向
- 雨量
- 觀測時間

這部分可繼續延伸成單站歷史圖表。

---

## 歷史資料折線圖

選擇縣市後，前端會呼叫：

```text
/api/weather/history?county=...
```

折線圖目前代表：

```text
時間
 ↓
該縣市所有測站平均氣溫
```

例如：

```text
20:00 → 26.8°C
20:30 → 26.4°C
21:00 → 26.1°C
21:30 → 25.8°C
```

這與舊版「同一時間比較不同測站」不同，目前已經是真正由 PostgreSQL 歷史資料產生的時間序列。

---

## 每 30 分鐘自動收集資料

由於 Vercel Hobby Plan 不適合使用高頻率 Vercel Cron，目前改用 **GitHub Actions** 定時呼叫 Vercel API。

Workflow：

```text
.github/workflows/weather-cron.yml
```

排程：

```yaml
schedule:
  - cron: "*/30 * * * *"
```

流程：

```text
GitHub Actions
每 30 分鐘
     ↓
Vercel /api/weather
     ↓
CWA
     ↓
Neon PostgreSQL
```

因此即使沒有使用者開啟網站，歷史氣象資料仍會持續累積。

---

## 資料清洗

CWA API 回傳資料後，Server 端會進行基本清洗，包括：

- 過濾無 Station ID 的資料
- 過濾無經緯度資料
- 過濾無有效氣溫資料
- Taiwan 經緯度範圍檢查
- 不合理氣溫範圍過濾
- CWA 常見缺值過濾

常見無效值：

```text
-99
-990
-991
-9991
-9997
-9998
-9999
```

濕度若為 0–1 比例格式，也會轉換成百分比格式。

---

## 縣市名稱正規化

CWA 與 GIS 行政區資料可能來自不同版本，因此會將名稱正規化：

```text
台 → 臺
桃園縣 → 桃園市
臺北縣 → 新北市
臺中縣 → 臺中市
臺南縣 → 臺南市
高雄縣 → 高雄市
```

避免 API、GeoJSON、TopoJSON 之間因行政區名稱不同造成無法對應。

---

## Leaflet GIS

Leaflet 負責：

- Map Zoom / Pan
- Marker
- Popup
- Tooltip
- GeoJSON Polygon
- Hover Highlight
- Click Event
- Fit Bounds
- GIS Layer Control

底圖使用：

```text
Esri World Dark Gray Base Map
```

---

## 台灣 GIS 資料

### 縣市邊界

專案內：

```text
taiwan-counties.geojson
```

用於：

- 台灣縣市 Polygon
- Hover
- Click
- 縣市名稱
- 平均氣溫
- 自動 Fit Bounds

### 鄉鎮市區

使用 Taiwan Atlas：

```text
towns-10t.json
```

並透過：

```text
topojson-client
```

將 TopoJSON 轉換成 GeoJSON 後交由 Leaflet 顯示。

---

## 測站 Popup

Zoom 10 以上顯示氣象站 Marker。

點擊 Marker 可查看：

- 測站名稱
- 縣市
- 鄉鎮市區
- 天氣現象
- 氣溫
- 相對濕度
- 雨量
- 風速
- 氣壓
- 觀測時間

---

## 縣市選單順序

目前依照：

```text
北部
↓
中部
↓
南部
↓
東部
↓
外島
```

排列。

包含：

```text
基隆市
臺北市
新北市
桃園市
新竹市
新竹縣
苗栗縣
臺中市
彰化縣
南投縣
雲林縣
嘉義市
嘉義縣
臺南市
高雄市
屏東縣
宜蘭縣
花蓮縣
臺東縣
澎湖縣
金門縣
連江縣
```

---

## 使用技術

| 技術 | 用途 |
| --- | --- |
| Next.js | Web App / API Route |
| React | 前端互動 UI |
| JavaScript | 資料處理與互動邏輯 |
| Leaflet | GIS 地圖 |
| GeoJSON | 縣市行政邊界 |
| TopoJSON | 鄉鎮市區資料 |
| topojson-client | TopoJSON 轉 GeoJSON |
| SVG | 歷史資料折線圖 |
| CWA Open Data | 即時氣象資料來源 |
| Neon PostgreSQL | 歷史氣象資料庫 |
| @neondatabase/serverless | Neon Serverless DB Driver |
| Vercel | Next.js 部署 / Server Function |
| GitHub | Source Code / Version Control |
| GitHub Actions | 每 30 分鐘資料擷取 |
| Esri Map Tiles | 深色 GIS 底圖 |

---

## 專案結構

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
    ├── README.md
    │
    ├── index.html
    ├── style.css
    └── script.js
```

其中 `index.html / style.css / script.js` 為早期 GitHub Pages 靜態版本；目前 Vercel 部署主要使用 `app/` 下的 Next.js 版本。

---

## Environment Variables

Vercel Project 需要：

```text
CWA_API_KEY
DATABASE_URL
```

用途：

| Variable | 用途 |
| --- | --- |
| CWA_API_KEY | 呼叫中央氣象署 API |
| DATABASE_URL | 連線 Neon PostgreSQL |

實際金鑰與 Database Connection String 不應 commit 到 GitHub。

---

## 舊版與目前版本差異

### 第一版

```text
Browser
  ↓
CWA API
  ↓
JavaScript Memory
  ↓
Leaflet / Chart.js / Table
  ↓
GitHub Pages
```

特性：

- 沒有後端
- 沒有 SQL
- 沒有永久儲存
- 沒有真正歷史資料

### 目前版本

```text
GitHub Actions / Browser
          ↓
        Vercel
          ↓
      Next.js API
       ↓       ↓
     CWA      Neon
               ↓
          PostgreSQL
               ↓
        Historical API
               ↓
         GIS / History
```

現在已經具備：

- Server API
- PostgreSQL
- SQL Query
- 歷史資料
- 定時擷取
- 歷史折線圖
- Vercel 自動部署

---

## 後續可延伸

- 單一測站歷史折線圖
- 歷史濕度 / 雨量 / 風速圖
- 24 小時 / 7 天時間篩選
- Min / Max Temperature
- CWA Forecast API
- 一週天氣預報
- 日期選擇器
- SQL Aggregate Query
- Dashboard 統計卡片
- 異常氣象偵測
- AI 天氣摘要
- Telegram / LINE / Email 通知
- 空氣品質 / AirBox 資料整合
- Streamlit 分析 Dashboard

---

## 參考

- AIoT-DA L3 AI Vibe Coding 天氣預報 HW1
- Central Weather Administration OpenData
- Leaflet
- Taiwan Atlas / Taiwan GIS
- Neon PostgreSQL
- Vercel
- GitHub Actions
- AirBox
- `huanchen1107/taiwan-weather-map`

---

**NCHU AIoT · CWA Open Data · Taiwan Weather GIS · Vercel · Neon PostgreSQL**
