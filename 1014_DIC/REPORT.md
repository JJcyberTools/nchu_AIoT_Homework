# DIC2｜多元線性迴歸實作報告

**資料日期：2026/10/14｜方法：OLS + Forward SFS（前端實作）**

## 一、研究目的

觀察不同特徵數量對多元線性迴歸預測誤差 RMSE 與決定係數 R² 的影響，依課堂要求分析 50 Startups 與 Boston Housing 兩個 Problem。網頁另提供 CSV 檔案與網址匯入功能。

## 二、資料與方法

- 50 Startups：以 Profit 為目標；自變數為 R&D Spend、Administration、Marketing Spend 與州別虛擬變數。
- Boston Housing：以 medv 為目標；其餘欄位作為候選自變數。該資料集含具爭議的種族相關特徵 b，僅供教學使用。
- 每個資料集採固定亂數種子 20261014 做 80/20 資料分割。前向特徵選擇只使用訓練集，以訓練集 RMSE 決定下一個新增特徵；在測試集計算 RMSE 與 R²。
- 回歸係數以 OLS 計算，數值尺度會先標準化以改善計算穩定性。表內數字為相同前端演算法的實際計算結果，**不是老師示範 PDF 的數字，也不等同 Python analysis.py 的 random_state=42 結果**。

## 三、50 Startups

資料共 50 筆；訓練 40 筆，測試 10 筆。

| k | 選取特徵 | Test RMSE | Test R² |
|---:|---|---:|---:|
| 1 | R&D Spend | 9,308.169 | 0.8773 |
| 2 | R&D Spend、Administration | 11,411.160 | 0.8156 |
| 3 | R&D Spend、Administration、Marketing Spend | 10,745.921 | 0.8365 |
| 4 | R&D Spend、Administration、Marketing Spend、State = New York | 11,086.585 | 0.8259 |
| 5 | R&D Spend、Administration、Marketing Spend、State = New York、State = Florida | 11,098.430 | 0.8256 |

本次切分最低 RMSE 對應 k = **1**，RMSE = **9,308.169**，R² = **0.8773**。此為單次切分的描述結果，不代表已使用獨立資料選出最佳模型。

## 三、Boston Housing

資料共 506 筆；訓練 404 筆，測試 102 筆。

| k | 選取特徵 | Test RMSE | Test R² |
|---:|---|---:|---:|
| 1 | lstat | 5.692 | 0.5465 |
| 2 | lstat、rm | 4.566 | 0.7081 |
| 3 | lstat、rm、ptratio | 4.323 | 0.7384 |
| 4 | lstat、rm、ptratio、dis | 4.483 | 0.7186 |
| 5 | lstat、rm、ptratio、dis、nox | 4.215 | 0.7513 |
| 6 | lstat、rm、ptratio、dis、nox、zn | 4.354 | 0.7346 |
| 7 | lstat、rm、ptratio、dis、nox、zn、chas | 4.245 | 0.7478 |
| 8 | lstat、rm、ptratio、dis、nox、zn、chas、b | 4.141 | 0.7600 |

本次切分最低 RMSE 對應 k = **8**，RMSE = **4.141**，R² = **0.7600**。此為單次切分的描述結果，不代表已使用獨立資料選出最佳模型。

## 四、結論與反思

1. 特徵增加不保證測試 RMSE 下降；應兼顧簡約性、可解釋性與泛化表現。
2. RMSE 與資料目標單位相同，不能不考慮尺度就跨資料集直接比較。
3. 固定一次訓練／測試切分對結果仍有影響；正式模型選擇建議用訓練集交叉驗證，另保留全新測試集作一次評估。
4. Boston Housing 為具倫理爭議的歷史教材，不適合真實房價或個人決策。

## 五、重現方式

網站打開 `index.html`，選擇問題並按「開始分析」，即可依上述固定切分得到折線圖、比較表、方程式與預測介面。執行 `python analysis.py` 可生成另一套採 random_state=42、包含 Lasso／ElasticNet／Forward SFS／Exhaustive 的 Python 分析結果 `results.json`。兩者不應混稱為同一測試數字。

## 六、參考來源

- [老師 GitHub 示範](https://github.com/huanchen1107/AIoT-DIC2-MultipleLR/)
- [50 Startups CSV](https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv)
- [Boston Housing CSV](https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv)
