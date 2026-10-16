# HW2 — Multiple Linear Regression 報告（真實資料分析結果）

> 本報告使用使用者提供的真實 Kaggle train.csv（1,117,957 筆），以 random_state=42 抽樣 3,000 筆，固定 80/20 切分。以下指標已由 Python/scikit-learn 實際計算；AI 對話與 NotebookLM 摘要仍需另附。

## 基本資訊

- 課程：智慧物聯網
- 作業：HW2 — Multiple Linear Regression
- 姓名／學號：＿＿＿＿
- Kaggle 資料來源：https://www.kaggle.com/competitions/playground-series-s4e5/data
- 分析日期：＿＿＿＿

## 一、Business Understanding

本研究使用公開 Kaggle 洪水預測資料集，以 FloodProbability 為連續預測目標，探討多項環境與基礎設施特徵是否有助於建立可解釋的線性基準模型。成果僅供課堂學習，不應作為真實防災決策。

## 二、Data Understanding

資料來源：Kaggle Playground Series S4E5。原始資料 1,117,957 筆，22 欄（id、20 個原始預測特徵、FloodProbability）。為控制特徵選擇的運算時間，隨機抽樣 3,000 筆進行分析；本次抽樣資料無缺失值。目標 FloodProbability 為連續數值。

## 三、Data Preparation

移除識別欄位 id，選取數值特徵，以固定亂數種子 42 將資料切分為訓練 80%、測試 20%。只用訓練資料擬合中位數補值器、標準化與特徵選擇器，避免資料洩漏。本次使用 random_state=42 抽樣 3,000 筆，訓練 2,400 筆、測試 600 筆。

## 四、Modeling

比較 OLS、Ridge、Lasso，搭配全部特徵、SelectKBest、RFE、SFS 等策略，使用訓練集選取特徵。比較 20 個完整特徵與 SelectKBest、RFE、SFS 各選取 14 個特徵；總計 4 種特徵配置 × 3 種迴歸模型 = 12 組。最低測試 RMSE 為完整 20 特徵搭配 Ridge(alpha=1.0)，代表此資料的 14 特徵版本在這次切分下並未改善測試誤差。

## 五、Evaluation

| 模型 / 特徵選擇 | MAE | MSE | RMSE | R² | Adjusted R² |
|---|---:|---:|---:|---:|---:|
| 全部 20 特徵 / Ridge | 0.015378 | 0.000385897 | **0.019644** | **0.860401** | 0.855579 |
| 全部 20 特徵 / OLS | 約 0.0154 | 約 0.000386 | 0.019645 | 0.860391 | 約 0.8556 |
| SelectKBest 14 特徵 / OLS | 待檢視比較表 | 約 0.001120 | 0.033470 | 0.594750 | 待檢視比較表 |
| SFS 14 特徵 / OLS | 待檢視比較表 | 約 0.001134 | 0.033681 | 0.589622 | 待檢視比較表 |
| RFE 14 特徵 / OLS | 待檢視比較表 | 約 0.001173 | 0.034243 | 0.575820 | 待檢視比較表 |

實際繪製了 Actual vs Predicted、Residual plot、Residual distribution 三張診斷圖，以及 OLS **95% 預測區間圖** `HW2_prediction_interval_95.png` 和殘差/Q–Q 診斷圖 `HW2_regression_diagnostics.png`，請將圖片插入 PDF。測試集的 95% 預測區間實際涵蓋率為 **95.0%**，平均區間寬 **0.07859**。區間是基於 OLS、t 分布與同方差常態誤差假設的教學近似；不是 Ridge 的精確區間。測試 R² 約 0.8604，表示在本次切分下模型能解釋約 86.0% 的測試目標變異；實際診斷結果：Breusch–Pagan p = 1.36×10⁻¹⁹（同方差假設遭拒絕）、Jarque–Bera p = 1.54×10⁻⁷³（殘差常態假設遭拒絕）、Durbin–Watson = 2.064（未見明顯一階相關，但抽樣順序無自然時間意義）、最大 VIF = 1.018（未見嚴重共線性）。因此應明確揭露：傳統 OLS 預測區間假設未完全滿足。

## 六、Deployment

用測試集單筆資料模擬新樣本推論，預測值：0.525323，真實值：0.525。由於普通線性迴歸不保證預測在 [0,1]，部署時須加上輸出限制與風險提醒；此處不進行真實防災應用。

## 七、結果與反思

本次資料中，全部 20 個特徵的 Ridge 模型測試 RMSE 最低（0.019644），但與 OLS（0.019645）極為接近；限制到 14 特徵時誤差上升，顯示特徵數減少不一定提升預測能力。這個結果只對本次抽樣與固定切分成立，不能推廣為其他樣本上的必然表現。

限制：競賽資料的泛化能力未知；單次隨機切分與抽樣可能改變結果；相關不代表因果。

## 八、方法比較與主流解法討論

本研究以普通最小平方法（OLS）作為基準，並比較 Ridge（L2 正則化）與 Lasso（L1 正則化）。Ridge 透過係數懲罰降低模型對資料的敏感度；Lasso 可將部分係數壓至零，兼具特徵篩選效果。這些是 scikit-learn 文件中常見的線性迴歸方法。本次資料的 Ridge 與 OLS 結果非常接近，Lasso 在指定 alpha=0.001 時略差；未經調參與交叉驗證，不能宣稱 Ridge 對所有資料最優。另可考慮 RandomForestRegressor、HistGradientBoostingRegressor 等非線性方法，但本作業未執行這些模型，故不提供虛構分數。請學生在 NotebookLM 實際研究網路上同主題解法後補充有來源的比較。

## 九、AI 輔助紀錄

ChatGPT 使用說明：用於規劃 Notebook、資料處理、模型比較、程式除錯及報告結構。**請附真實 GPT 對話匯出 PDF**。

NotebookLM 摘要（至少 100 字）：**待使用者實際操作 NotebookLM 後填寫**。

## 十、參考資料

- Kaggle: Regression with a Flood Prediction Dataset, Playground Series S4E5, https://www.kaggle.com/competitions/playground-series-s4e5/data
- Scikit-learn 官方文件：https://scikit-learn.org/stable/
