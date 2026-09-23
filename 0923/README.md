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
