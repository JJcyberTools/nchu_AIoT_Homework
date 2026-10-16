# HW2 — Multiple Linear Regression（獨立個人作業）

本資料夾以 [1014_DIC](../1014_DIC/) 的互動網站為原型，新增符合 HW2 要求的 **Kaggle 資料分析 Notebook 與 CRISP-DM 報告草稿**。

## 作業依據

老師 HW2.pdf：Kaggle 公開資料集，約 10–20 個原始特徵（補充推薦 14–39 個），多元線性迴歸、Feature Selection、Model Evaluation、預測圖、CRISP-DM 六階段；需繳交 .ipynb 與 PDF 報告，附 GPT 對話 PDF 及 NotebookLM 至少 100 字摘要。**截止 2026-11-04**。

## 執行步驟

1. 從 Kaggle 下載 **Regression with a Flood Prediction Dataset**：https://www.kaggle.com/competitions/playground-series-s4e5/data （需依 Kaggle 平台條件登入及同意競賽規則）。
2. 解壓縮後把 **train.csv** 放在本資料夾 `data/train.csv`；不建議將完整大型競賽資料上傳 GitHub。
3. 安裝：`pip install -r requirements.txt`；開啟 `HW2_Multiple_Linear_Regression.ipynb`，由上而下執行。
4. Notebook 預設固定抽樣最多 3,000 筆以控制計算時間，報告需註明；需要全資料時設 `MAX_ROWS=None`（SFS 可能非常耗時）。
5. 核對所有輸出，填寫 `REPORT_TEMPLATE.md` 的數字、圖表及個人心得，匯出 PDF。
6. 將 GPT 對話紀錄另匯出 PDF，使用 NotebookLM 產生至少 100 字摘要並**自行確認內容**，合併進報告。
7. 將 .ipynb 與報告 PDF 放入依老師格式命名的 ZIP，提交 iLearning。

## HW2 洪水預測成果網站

[HW2 互動版（GitHub Pages）](https://jjcybertools.github.io/nchu_AIoT_Homework/HW2/) — 直接展示 Kaggle 洪水資料、12 組模型比較、RMSE/R²、CRISP-DM 與 20 特徵 Ridge 即時預測，無需上傳 CSV。**網站是輔助展示，不能取代正式 Notebook 與 PDF 報告。**

## 已完成的實際分析（2026-10-17）

- 使用者提供真實 Kaggle train.csv，共 1,117,957 筆、20 個原始特徵。
- random_state=42 抽樣 3,000 筆；訓練 2,400 筆、測試 600 筆。
- 12 組模型比較：全部特徵 / SelectKBest / RFE / SFS × OLS / Ridge / Lasso。最佳 Ridge(20特徵) RMSE=0.019644、R²=0.860401。
- 已新增 **OLS 95% 預測區間**程式（本次測試集實測涵蓋率 95.0%，平均區間寬 0.07859），以及殘差圖、常態 Q-Q、Breusch–Pagan、Jarque–Bera、Durbin–Watson、VIF 診斷。
- 診斷結果：BP p=1.36e-19、JB p=1.54e-73、DW=2.064、max VIF=1.018。BP/JB 顯示簡單常態同方差假設並不完全符合，故 95% 區間須視為教學用近似值。
- **仍需學生自行處理**：ChatGPT 全部對話匯出 PDF、NotebookLM 研究與至少 100 字摘要、姓名學號、依指定格式命名與 iLearning 上傳。

## 注意事項

- Notebook 需要原始 `data/train.csv` 才能重新執行；大型原始 CSV 不放 GitHub。
- Notebook 需要 `scipy` 和 `statsmodels`（已列入 requirements.txt）。
- 正式 PDF 報告需包含 **預測圖及其 95% 預測區間**、方法比較、AI 使用揭露與 NotebookLM 摘要。
