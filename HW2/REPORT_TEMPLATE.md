# HW2 — Multiple Linear Regression 報告（執行後完成並匯出 PDF）

> **注意：本文件是待填寫的報告草稿，不是已完成的實驗結果。請勿直接以未驗證數據提交。**

## 基本資訊

- 課程：智慧物聯網
- 作業：HW2 — Multiple Linear Regression
- 姓名／學號：＿＿＿＿
- Kaggle 資料來源：https://www.kaggle.com/competitions/playground-series-s4e5/data
- 分析日期：＿＿＿＿

## 一、Business Understanding

本研究使用公開 Kaggle 洪水預測資料集，以 FloodProbability 為連續預測目標，探討多項環境與基礎設施特徵是否有助於建立可解釋的線性基準模型。成果僅供課堂學習，不應作為真實防災決策。

## 二、Data Understanding

資料來源：Kaggle Playground Series S4E5。資料筆數：＿＿；原始特徵數：＿＿；遺漏值情況：＿＿；目標變數分布：＿＿；相關性最高特徵：＿＿。

## 三、Data Preparation

移除識別欄位 id，選取數值特徵，以固定亂數種子 42 將資料切分為訓練 80%、測試 20%。只用訓練資料擬合中位數補值器、標準化與特徵選擇器，避免資料洩漏。是否抽樣、抽樣筆數：＿＿。

## 四、Modeling

比較 OLS、Ridge、Lasso，搭配全部特徵、SelectKBest、RFE、SFS 等策略，使用訓練集選取特徵。特徵數 k：＿＿。最佳模型：＿＿；選出特徵：＿＿。

## 五、Evaluation

| 模型 / 特徵選擇 | MAE | MSE | RMSE | R² | Adjusted R² |
|---|---:|---:|---:|---:|---:|
| 請貼入 Notebook 實際結果 | — | — | — | — | — |

請插入 Notebook 產生的 Actual vs Predicted、Residual plot、Residual distribution 圖片，說明線性關係、殘差型態、同方差、常態性、獨立性與共線性的限制。不要將觀察當成已通過正式統計檢定。

## 六、Deployment

用測試集單筆資料模擬新樣本推論，預測值：＿＿，真實值：＿＿。由於普通線性迴歸不保證預測在 [0,1]，部署時須加上輸出限制與風險提醒；此處不進行真實防災應用。

## 七、結果與反思

研究結論（執行後填寫）：＿＿。

限制：競賽資料的泛化能力未知；單次隨機切分與抽樣可能改變結果；相關不代表因果。

## 八、AI 輔助紀錄

ChatGPT 使用說明：用於規劃 Notebook、資料處理、模型比較、程式除錯及報告結構。**請附真實 GPT 對話匯出 PDF**。

NotebookLM 摘要（至少 100 字）：**待使用者實際操作 NotebookLM 後填寫**。

## 九、參考資料

- Kaggle: Regression with a Flood Prediction Dataset, Playground Series S4E5, https://www.kaggle.com/competitions/playground-series-s4e5/data
- Scikit-learn 官方文件：https://scikit-learn.org/stable/
