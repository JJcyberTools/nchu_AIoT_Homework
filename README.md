# AIoT 與數據分析 — 個人入口網站與動態時鐘儀表板

> **課堂實作作業 DIC-1 (Do in Class 1) — Personal Portal & Live Timekeeper**

---

## 📚 課程資訊 (Course Information)

| 項目 | 內容說明 |
| :--- | :--- |
| **課程名稱** | AIoT 與數據分析（AIoT & Data Analytics, AIoT-DA） |
| **課堂實作** | DIC-1 (Do in Class 1) — 個人入口網站與動態時鐘儀表板（Personal Portal & Live Timekeeper） |
| **授課單元** | Lecture 2 — 瀏覽器、現代 Web 核心與非同步資料流（L2Web） |
| **示範教師** | Huan Chen |
| **學生作業儲存庫** | [https://github.com/JJcyberTools/nchu_AIoT_Homework](https://github.com/JJcyberTools/nchu_AIoT_Homework) |
| **學生作業 Demo** | [https://jjcybertools.github.io/nchu_AIoT_Homework/](https://jjcybertools.github.io/nchu_AIoT_Homework/) |

---

<img width="1310" height="949" alt="image" src="https://github.com/user-attachments/assets/4ad3e48b-e5db-4fd4-97f2-89fd1cf4eaca" />


---

## 🌟 作品功能特色

1. **個人專屬姓名展示與自訂 (Personal Identity Hub)**：
   - 頂部醒目展示姓名與當前時段動態問候（清晨、早安、午安、午後、晚安、深夜）。
   - 支援線上自訂姓名與暱稱，點擊即時修改。
   - 姓名自動儲存於瀏覽器 `localStorage`，重新整理頁面依然保留。

2. **高精度動態即時時鐘（雙模式切換）**：
   - **數位模式 (Digital Clock)**：清晰顯示時、分、秒，帶動態呼吸冒號。
   - **指針模式 (Analog Clock)**：極簡指針機械鐘面，時、分、秒針即時平滑旋轉。
   - **12H / 24H 制自由切換**：可一鍵切換 24 小時制或帶有 AM/PM 標籤之 12 小時制。

3. **完整日期與本地時區**：
   - 顯示西元年、月、日與繁體中文星期。
   - 自動偵測並顯示本地時區資訊（例如 GMT+8 台北時間）。

4. **時間數據概況小工具**：
   - **今日進度條**：動態計算今日已度過的百分比與剩餘小時數。
   - **當年度週次與倒數**：顯示當年度週次以及距離新年的倒數天數。
   - **世界時區一覽**：即時換算東京、倫敦、紐約、舊金山國際時間。

5. **4 款現代毛玻璃主題切換**：
   - 極光魅影 (Aurora - 預設)
   - 電馭霓虹 (Cyberpunk)
   - 暮霞煦陽 (Sunset)
   - 曜石深邃 (Midnight)

---

## 📁 檔案結構 (File Structure)

```text
├── index.html        # 網頁主要語意化結構與佈局
├── style.css         # 現代毛玻璃設計系統與 4 款主題樣式
├── app.js            # 即時時鐘計算、姓名自訂與狀態管理邏輯
└── README.md         # 課程與專案說明文件
```

---

## 🚀 本地執行方式

1. **直接開啟**：在檔案總管中雙擊 `index.html` 即可在瀏覽器開啟。
2. **透過 HTTP 伺服器預覽**：
   ```bash
   # 使用 Python 啟動伺服器
   python -m http.server 8080
   
   # 或使用 Node.js
   npx http-server -p 8080
   ```
   啟動後於瀏覽器造訪 `http://localhost:8080` 即可預覽。
