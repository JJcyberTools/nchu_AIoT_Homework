# Taiwan Weather GIS Dashboard
## AIoT L3 - CWA HW1

> **CWA Open Data → Taiwan GIS → GitHub Pages**  
> 💡 從氣象資料到互動式台灣地圖，使用真實中央氣象署資料完成 AIoT 天氣視覺化作業。

**Live demo website:**  
https://jjcybertools.github.io/nchu_AIoT_Homework/0923/

**GitHub source:**  
https://github.com/JJcyberTools/nchu_AIoT_Homework/tree/main/0923

<img width="1903" height="966" alt="image" src="https://github.com/user-attachments/assets/4d26b5a1-5042-43d5-8472-aa3d6b650ae0" />

<img width="1901" height="975" alt="image" src="https://github.com/user-attachments/assets/8b702092-34b5-49a7-bd25-be8231afd177" />


本作業以中央氣象署（CWA）真實 Open Data 為資料來源，從 API 資料取得開始，將即時觀測資料整理後，結合 Leaflet、Taiwan GIS 行政區邊界與互動式圖表，在 GitHub Pages 建立可直接操作的 Taiwan Weather GIS Web。

目前 HW1 以 **CWA API + JSON + JavaScript + GIS + GitHub Pages** 為主；SQLite、資料庫 ETL、預報歷史資料等內容將配合後續課程再延伸。

## 五大 Gate - 進度追蹤

- [x] **Gate 1：CWA API 資料取得**
  - 使用中央氣象署 Open Data API
  - 使用資料集 `O-A0003-001`
  - 網站開啟時讀取一次即時觀測資料

- [x] **Gate 2：JSON 資料整理**
  - 解析測站名稱、行政區、氣溫、濕度、雨量、風速、氣壓
  - 過濾缺值與異常資料
  - 整理縣市 / 鄉鎮市區資訊

- [x] **Gate 3：Taiwan GIS 地圖視覺化**
  - Leaflet 台灣互動式地圖
  - 縣市邊界與鄉鎮市區邊界
  - 縣市名稱與行政區名稱
  - 測站氣溫 Marker
  - 氣溫色階圖例
  - Hover 高亮與點擊縣市切換

- [x] **Gate 4：互動式資料展示**
  - 縣市下拉選單
  - 測站 / 行政區搜尋
  - 選取縣市後只顯示該縣市測站
  - 顯示該縣市測站氣溫折線圖
  - 顯示該縣市即時資料表格
  - 點擊測站查看詳細天氣資訊

- [x] **Gate 5：GitHub Pages 部署**
  - GitHub Repository 版本管理
  - GitHub Pages 線上展示
  - 可透過公開網址直接開啟並取得 CWA 即時資料

## 目前網站功能

- 台灣即時氣象 GIS 地圖
- CWA `O-A0003-001` 自動氣象站即時觀測資料
- 各縣市行政邊界
- 鄉鎮市區行政邊界與名稱
- 縣市平均溫度與顏色標示
- 放大後顯示各測站氣溫 Marker
- 天氣圖示（晴、多雲、陰、雨、雷、霧等）
- 點擊測站顯示：
  - 測站名稱
  - 縣市 / 行政區
  - 氣溫
  - 天氣現象
  - 相對濕度
  - 降雨量
  - 風速
  - 氣壓
  - 最新觀測時間
- 縣市下拉篩選
- 測站 / 行政區文字搜尋
- 點擊地圖縣市直接切換縣市
- 縣市測站氣溫折線圖
- 縣市即時氣象資料表
- 最新 CWA 觀測時間
- API 取得時間
- RWD 桌面 / 行動版介面

## 系統流程

```text
GitHub Pages
    │
    ▼
index.html / style.css / script.js
    │
    ├── CWA Open Data API
    │      └── O-A0003-001
    │
    ├── Leaflet Map
    │      ├── Taiwan County Boundaries
    │      ├── Township / District Boundaries
    │      └── Weather Station Markers
    │
    └── Chart.js
           ├── County Temperature Line Chart
           └── County Weather Data Table
```

## 使用技術

- HTML5
- CSS3
- Vanilla JavaScript
- Leaflet 1.9
- Chart.js
- TopoJSON
- Taiwan GIS GeoJSON / TopoJSON
- Central Weather Administration OpenData API
- Esri World Dark Gray Base Map
- GitHub Pages

## CWA API

本作業主要使用：

```text
O-A0003-001
```

資料來源：

**交通部中央氣象署 OpenData**

網站載入時由瀏覽器直接呼叫 CWA API，取得即時自動氣象站觀測資料。

## 氣溫色階

| 氣溫 | 地圖顏色 |
| --- | --- |
| < 10°C | 深藍 |
| 10–15°C | 藍 |
| 15–20°C | 綠 |
| 20–25°C | 黃綠 |
| 25–30°C | 黃橘 |
| 30–35°C | 橘 |
| ≥ 35°C | 紅 |

## 專案結構

```text
0923/
├── index.html
├── style.css
├── script.js
├── taiwan-counties.geojson
├── README.md
└── docs/
    └── demo.png        # 待加入網站截圖
```

## Live Demo

直接開啟：

https://jjcybertools.github.io/nchu_AIoT_Homework/0923/

## Repository

https://github.com/JJcyberTools/nchu_AIoT_Homework/tree/main/0923

## 後續延伸

依照後續課程內容，可再加入：

- CWA 天氣預報資料
- 日期選擇
- 一週最高 / 最低溫時間序列
- SQLite 氣象資料庫
- 歷史資料查詢
- Streamlit Dashboard
- ETL 資料處理流程
- 更多 AIoT / AI 分析功能

## 參考

- AIoT-DA L3 AI Vibe Coding 天氣預報 HW1
- Central Weather Administration OpenData
- Leaflet
- Chart.js
- Taiwan Atlas / Taiwan GIS
- AirBox
- `huanchen1107/taiwan-weather-map`

---

**AIoT L3 · CWA Open Data · Taiwan Weather GIS Dashboard**

---

# 技術實作補充：這個網站實際用了什麼？

這一版 HW1 目前的核心方式是：**CWA API 取得即時資料 → JavaScript 解析 JSON → Leaflet / Chart.js / HTML Table 顯示**。

目前尚未使用 SQLite、SQL Query 或後端資料庫。網站載入時會向中央氣象署取得一次最新觀測資料，整理完成後存放在瀏覽器記憶體中，再由同一批資料提供地圖、圖表、表格與統計資訊使用。

## 完整資料流程

~~~text
使用者開啟 GitHub Pages
        ↓
script.js 執行
        ↓
JavaScript fetch()
        ↓
CWA Open Data API
        ↓
O-A0003-001 JSON
        ↓
normalizeStation() 資料清洗
        ↓
stations[] 儲存在 Browser Memory
        ↓
├── Leaflet 地圖 Marker
├── 縣市 / 行政區 GIS
├── 氣溫色階
├── 縣市平均溫度
├── 北 / 中 / 南 / 東平均溫度
├── Chart.js 折線圖
└── HTML 即時資料表格
~~~

換句話說，目前是 **API 抓一次資料後，由瀏覽器端 JavaScript 整理，再將同一份資料分配給不同 UI 元件顯示**。

## 1. CWA Open Data API

本作業主要使用中央氣象署自動氣象站即時觀測資料：

~~~text
O-A0003-001
~~~

透過 JavaScript Fetch API 直接取得 JSON。主要會使用到的欄位包括：

- StationId：測站 ID
- StationName：測站名稱
- GeoInfo.CountyName：縣市
- GeoInfo.TownName：鄉鎮市區
- Coordinates：測站經緯度
- AirTemperature：氣溫
- RelativeHumidity：相對濕度
- Precipitation：降雨量
- WindSpeed：風速
- WindDirection：風向
- AirPressure：氣壓
- Weather：天氣現象
- ObsTime：觀測時間

目前設定為 **網站每次開啟時讀取一次即時資料**，不進行固定時間輪詢。

## 2. JSON 解析與資料清洗

CWA API 回傳原始 JSON 後，程式會使用 normalizeStation() 將每一個測站轉換成網站較容易使用的格式。

~~~text
{
  stationName: 臺中,
  county: 臺中市,
  town: 北區,
  lat: 24.14,
  lon: 120.68,
  temperature: 27.3,
  humidity: 71,
  precipitation: 0,
  windSpeed: 1.5
}
~~~

同時會處理：

- 缺少經緯度的測站
- 缺少氣溫的測站
- 不合理的氣溫值
- CWA 常見缺值，例如 -99、-9997、-9998、-9999
- 濕度數值格式
- 縣市與行政區名稱

## 3. 縣市名稱正規化

由於氣象資料與 GIS 行政區資料可能來自不同版本，因此加入名稱正規化，例如：

~~~text
台中市 → 臺中市
桃園縣 → 桃園市
台北縣 → 新北市
台中縣 → 臺中市
台南縣 → 臺南市
高雄縣 → 高雄市
~~~

這可以降低 CWA API、GeoJSON 與 TopoJSON 之間名稱不一致造成的點選或篩選問題。

## 4. Leaflet GIS 地圖

地圖使用 **Leaflet 1.9**，主要負責：

- 地圖縮放與拖曳
- Marker
- Popup
- Tooltip
- GeoJSON Polygon
- Hover 高亮
- Click Event
- Fit Bounds

底圖使用 **Esri World Dark Gray Base Map**，因此整體呈現深色 GIS Dashboard 風格。

## 5. Taiwan GIS 縣市邊界

專案內的 taiwan-counties.geojson 用來繪製台灣縣市行政邊界。

縣市 Polygon 可以：

- Hover 時高亮
- 顯示縣市名稱
- 顯示縣市平均氣溫
- 點擊後切換目前縣市
- 自動縮放至縣市範圍
- 觸發該縣市測站、折線圖與表格更新

## 6. 鄉鎮市區 GIS

鄉鎮市區資料使用 Taiwan Atlas TopoJSON，並透過 **topojson-client** 轉換為 GeoJSON 後交給 Leaflet 顯示。

選擇某個縣市後，可以看到該縣市內的行政區，例如臺中市的西屯區、北屯區、南屯區、豐原區、太平區、和平區等。

## 7. 氣象站 Marker

每個 CWA 測站都有 Latitude / Longitude，因此可直接使用經緯度將 Marker 放到正確位置。

Marker 顯示：

- 天氣圖示
- 即時氣溫
- 依氣溫變化的色階

為避免全台數百個測站同時顯示造成畫面混亂，程式會依地圖 Zoom Level 決定是否顯示測站 Marker。

## 8. Marker Popup

點擊測站後會顯示：

- 測站名稱
- 縣市 / 行政區
- 天氣現象
- 氣溫
- 相對濕度
- 雨量
- 風速
- 氣壓
- 最新觀測時間

## 9. 縣市互動

目前提供兩種方式切換縣市：

1. 左側下拉選單
2. 直接點擊地圖上的縣市 Polygon

切換後會同步：

- 更新下拉選單
- 自動縮放至縣市
- 顯示該縣市測站
- 顯示鄉鎮市區
- 更新即時概況
- 更新 Chart.js 折線圖
- 更新即時資料表格

左側縣市選單目前依 **北 → 中 → 南 → 東 → 外島** 排列。

## 10. 北 / 中 / 南 / 東區域顯示

未選取任何縣市時，地圖會額外顯示北部、中部、南部、東部區域標籤與區域平均氣溫。

平均溫度由該區域內所有可用氣象站即時氣溫計算。

## 11. Chart.js 折線圖

選擇縣市後使用 **Chart.js** 繪製該縣市測站氣溫折線圖。

目前：

- X 軸：行政區・測站名稱
- Y 軸：即時氣溫 °C

因此這張圖目前代表的是 **同一觀測時間下，各測站之間的氣溫差異**，並不是歷史時間序列。

等後續課程加入 SQLite 或其他資料庫後，就能儲存不同時間的觀測值，再改成真正的：

~~~text
18:00 → 19:00 → 20:00 → 21:00
~~~

時間序列氣溫折線圖。

## 12. 即時資料表格

選擇縣市後，表格會列出該縣市所有可用測站：

| 欄位 | 說明 |
| --- | --- |
| 行政區 | 測站所在鄉鎮市區 |
| 測站 | 氣象站名稱 |
| 天氣 | 即時天氣現象 |
| 氣溫 | 即時氣溫 |
| 濕度 | 相對濕度 |
| 雨量 | 即時降雨量 |
| 風速 | 即時風速 |

表格與地圖 Marker、折線圖使用的是 **同一批 CWA API 即時資料**。

## 13. 目前資料儲存方式

目前沒有資料庫，資料只存在 JavaScript 的瀏覽器記憶體中：

~~~text
let stations = []
~~~

因此目前特性為：

- 沒有永久儲存
- 沒有歷史資料
- 沒有 SQLite
- 沒有 SQL Query
- 沒有後端 Server
- 重新整理後會重新向 CWA API 抓最新資料

## 14. GitHub Pages

本專案採用 GitHub Pages 靜態部署，因此實際部署的核心是：

~~~text
index.html
style.css
script.js
GeoJSON
~~~

不需要 Node.js Server、Python Server 或資料庫 Server。

使用者開啟 GitHub Pages 後，由瀏覽器自行執行 JavaScript 並向 CWA API 取得即時資料。

## 技術總表

| 技術 | 用途 |
| --- | --- |
| HTML5 | Dashboard 網頁結構 |
| CSS3 | UI、深色介面、RWD |
| Vanilla JavaScript | API、資料整理與互動邏輯 |
| Fetch API | 呼叫 CWA Open Data |
| JSON | CWA API 資料格式 |
| Leaflet | GIS 地圖與互動 |
| GeoJSON | 台灣縣市邊界 |
| TopoJSON | 鄉鎮市區 GIS 資料 |
| topojson-client | TopoJSON 轉 GeoJSON |
| Chart.js | 縣市測站氣溫折線圖 |
| Esri Map Tiles | 深色地圖底圖 |
| CWA Open Data | 即時氣象資料來源 |
| GitHub | 程式版本管理 |
| GitHub Pages | 靜態網站部署 |

## 主要檔案負責內容

~~~text
0923/
├── index.html
│   ├── Dashboard HTML
│   ├── Leaflet
│   ├── TopoJSON Client
│   └── Chart.js
│
├── style.css
│   ├── Dashboard UI
│   ├── Marker Style
│   ├── County / District Label
│   ├── Chart / Table Panel
│   └── Responsive Design
│
├── script.js
│   ├── CWA API fetch
│   ├── JSON parsing
│   ├── Data cleaning
│   ├── County normalization
│   ├── Leaflet map
│   ├── County / District GIS
│   ├── Temperature color scale
│   ├── Chart.js
│   └── Weather table
│
└── taiwan-counties.geojson
    └── 台灣縣市 GIS 邊界
~~~

## HW1 與後續課程的差異

目前 HW1：

~~~text
CWA API
   ↓
JSON
   ↓
JavaScript
   ↓
GIS / Chart / Table
   ↓
GitHub Pages
~~~

後續課程可再擴充為：

~~~text
CWA API
   ↓
ETL
   ↓
SQLite / Database
   ↓
SQL Query
   ↓
歷史資料 / 預報資料
   ↓
Chart / GIS / Streamlit
~~~

可延伸項目包括 SQLite、SQL Query、歷史氣象資料、定時資料擷取、一週預報、MinT / MaxT、日期選擇、時間序列折線圖、Streamlit Dashboard、ETL Pipeline、AI 分析與通知服務。
