# HW2 — Multiple Linear Regression（獨立個人作業）

本資料夾以 [1014_DIC](../1014_DIC/) 的互動網站為原型，新增符合 HW2 要求的 **Kaggle 資料分析 Notebook 與 CRISP-DM 報告草稿**。

## 作業依據

老師 HW2.pdf：Kaggle 公開資料集，約 10–20 個原始特徵（補充推薦 14–39 個），多元線性迴歸、Feature Selection、Model Evaluation、預測圖、CRISP-DM 六階段；需繳交 .ipynb 與 PDF 報告，附 GPT 對話 PDF 及 NotebookLM 至少 100 字摘要。**截止 2026-11-04**。

## 執行步驟

1. 從 Kaggle 下載 **Regression with a Flood Prediction Dataset**：https://www.kaggle.com/competitions/playground-series-s4e5/data （需依 Kaggle 平台條件登入及同意競賽規則）。
2. 解壓縮後把 **train.csv** 放在本資料夾 `data/train.csv`；不建議將完整大型競賽資料上傳 GitHub。
3. 安裝：`pip install -r requirements.txt`；開啟 `HW2_Multiple_Linear_Regression.ipynb`，由上而下執行。
4. Notebook 預設固定抽樣最多 20,000 筆以控制計算時間，報告需註明；需要全資料時設 `MAX_ROWS=None`（SFS 可能非常耗時）。
5. 核對所有輸出，填寫 `REPORT_TEMPLATE.md` 的數字、圖表及個人心得，匯出 PDF。
6. 將 GPT 對話紀錄另匯出 PDF，使用 NotebookLM 產生至少 100 字摘要並**自行確認內容**，合併進報告。
7. 將 .ipynb 與報告 PDF 放入依老師格式命名的 ZIP，提交 iLearning。

## 網頁原型

[HW2 互動版（GitHub Pages）](https://jjcybertools.github.io/nchu_AIoT_Homework/HW2/) — 可上傳 CSV 觀察特徵數 k、RMSE/R²、回歸方程式。**網站是輔助展示，無法取代正式 Notebook 與 PDF 報告。** Kaggle train.csv 很大，建議只上傳抽樣後 CSV；Notebook 才是主要分析。

## 目前狀態

- 已建立可執行的分析程式、網頁原型、報告模板與依賴清單。
- **尚未下載 Kaggle 原始資料、實際執行 Notebook 或產生有實證數值的正式 PDF。**
- GPT 對話紀錄、NotebookLM 摘要、個人資料及 iLearning 繳交需由使用者補齊。
