# 台灣即時氣象視覺化地圖｜AIoT-DA HW1

國立中興大學 AIoT-DA 課程 HW1。依課堂 Notion「AI Vibe coding 天氣預測 Forecast with CWA API」需求製作，參考 `huanchen1107/taiwan-weather-map` 的架構與互動方向，完成一個類 AirBox / 類 Windy 的台灣即時氣象地圖。

> 本專案不直接嵌入 Windy。地圖使用 Leaflet + Esri 深色底圖，氣象觀測資料來自中央氣象署（CWA）OpenData API。

## 功能

- 台灣互動式地圖
- CWA `O-A0003-001` 自動氣象站資料
- `O-A0001-001` 備援資料集
- 氣溫分級彩色測站 marker
- 天氣圖示（晴、多雲、陰、雨、雷、霧等）
- 點擊測站顯示：
  - 測站名稱
  - 縣市 / 鄉鎮
  - 氣溫
  - 天氣現象
  - 相對濕度
  - 降雨量
  - 風速
  - 氣壓
  - 最新觀測時間
- 縣市篩選
- 測站 / 行政區文字搜尋
- API 最新觀測時間與本次抓取時間
- 手動更新按鈕
- Loading / API 錯誤提示
- 手機 / 桌面 RWD
- CWA API Key 僅存放在後端環境變數，不會暴露在瀏覽器或 GitHub

## 技術架構

```text
Browser
  │
  ├─ Next.js UI
  │   └─ Leaflet map + station markers
  │
  └─ GET /api/weather
       │
       ├─ CWA O-A0003-001
       └─ fallback: O-A0001-001
```

### 技術

- Next.js 14
- React 18
- Leaflet 1.9（CDN）
- Central Weather Administration OpenData API
- Esri World Dark Gray Base map

## 安裝

```bash
npm install
```

複製環境變數：

```bash
cp .env.local.example .env.local
```

Windows PowerShell：

```powershell
Copy-Item .env.local.example .env.local
```

接著編輯 `.env.local`：

```env
CWA_API_KEY=你的中央氣象署_API_KEY
```

> 請勿把 `.env.local` commit 到 GitHub。專案已在 `.gitignore` 排除。

## 執行

```bash
npm run dev
```

瀏覽：

```text
http://localhost:3000
```

## Production build

```bash
npm run build
npm run start
```

## CWA API

主要使用：

```text
O-A0003-001
```

備援：

```text
O-A0001-001
```

API route：

```text
GET /api/weather
```

前端不會直接向 CWA 帶授權碼請求，而是透過 Next.js 後端 API route 呼叫，因此 `CWA_API_KEY` 不會出現在 browser source code。

## 資料清洗

後端會忽略：

- 缺少經緯度的測站
- 缺少氣溫的測站
- 無法轉換成數值的資料
- 常見 CWA 缺值，例如 `-99`、`-999`
- 明顯不合理的氣溫（低於 -20°C 或高於 50°C）
- 台灣合理範圍以外的座標

## 氣溫色階

| 氣溫 | 顏色概念 |
| --- | --- |
| < 10°C | 深藍 |
| 10–15°C | 藍 |
| 15–20°C | 綠 |
| 20–25°C | 黃綠 |
| 25–30°C | 黃橘 |
| 30–35°C | 橘 |
| ≥ 35°C | 紅 |

## 部署

可部署到 Vercel。部署後在 Project Settings → Environment Variables 設定：

```text
CWA_API_KEY
```

不要把真實 API Key 寫進任何 GitHub 檔案。

## 作業需求對照

- [x] 台灣互動式氣象地圖
- [x] CWA OpenData
- [x] `O-A0003-001`
- [x] 測站氣溫 marker
- [x] 氣溫分級顏色
- [x] marker popup 詳細資訊
- [x] 最新 CWA 觀測時間
- [x] 手動更新
- [x] CWA API Key 僅後端使用
- [x] API / map 錯誤處理
- [x] README 設定說明
- [x] 縣市搜尋 / 篩選
- [x] 天氣圖示
- [x] RWD

## 參考

- 課程：AIoT-DA L3 AI vibe coding 天氣預報 (2026.9.23) HW1
- Central Weather Administration OpenData Platform
- Leaflet
- AirBox
- `huanchen1107/taiwan-weather-map`

## 注意

本專案的 UI 與程式為重新製作，參考滿分範本的需求與架構方向，但沒有直接複製其完整程式碼。
