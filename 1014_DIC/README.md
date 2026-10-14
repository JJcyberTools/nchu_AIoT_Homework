# DIC2｜多元線性迴歸（50 Startups & Boston Housing）

中興大學智慧物聯網 2026/10/14 課堂練習。依據課程 PDF 的「兩題都做，擇一上傳」要求，完成兩個問題分析與一個可互動的 GitHub Pages 網站。參考[老師示範專案](https://github.com/huanchen1107/AIoT-DIC2-MultipleLR/)，但本作業使用獨立程式與自己的實際計算成果。

## 開啟互動網站


**Live Demo : https://jjcybertools.github.io/nchu_AIoT_Homework/1014_DIC/**

<img width="1490" height="966" alt="image" src="https://github.com/user-attachments/assets/f7f5b6da-54c5-440f-8dc6-a8d516ff142c" />
<img width="1456" height="979" alt="image" src="https://github.com/user-attachments/assets/60d79465-beb4-42a6-9360-76684cb6eb26" />
<img width="1544" height="973" alt="image" src="https://github.com/user-attachments/assets/0f55a90c-b21f-4399-b936-1ced7de2edcc" />


## PDF 作業要求對照

| 項目 | 對應 |
| --- | --- |
| Problem 1：50 Startups 多元線性迴歸 | 首頁 Problem 下拉選單；Python analysis.py |
| Problem 2：Boston Housing 多元線性迴歸 | 首頁 Problem 下拉選單；Python analysis.py |
| 加分：下拉視窗兩個 Problem | 已完成 |
| 加分：自行輸入 Dataset | 本機 CSV 與 CSV 網址（需 CORS）、可切換目標變數 |
| RMSE 與 R-squared 特徵數圖表 | 兩個折線圖 |
| 特徵選擇比較 | 前端 Forward SFS；Python Lasso、ElasticNet、Forward SFS、Exhaustive |
| 預測 | 網頁輸入特徵值，立即預測 |
| 可公開分享 | 純靜態網站，無需 Flask 或伺服器 |

## 檔案結構

- index.html：繁體中文互動式分析網站（瀏覽器執行 OLS）
- analysis.py：scikit-learn 迴歸、特徵選擇、指標輸出
- data/startup.csv：50 Startups 原始資料
- data/boston.csv：Boston Housing 原始資料
- tests/test_analysis.py：模型計算基本測試
- requirements.txt：Python 相依套件
- results.json：執行 analysis.py 後會產生，不預先填寫假資料

## 使用 Python 執行完整分析

在專案根目錄下：

    cd 1014_DIC
    python -m pip install -r requirements.txt
    python analysis.py
    python -m pytest -q

完成後會產生 results.json，包含兩個問題各種特徵數的 RMSE、R²、模型係數與所選欄位。可選擇自己準備的原始 CSV：

    python analysis.py --startup-csv data/startup.csv --boston-csv data/boston.csv

## 如何使用網頁

1. 選擇 Problem 1、Problem 2 或自訂資料集。
2. 直接按「開始分析」，或先指定本機 CSV 檔／HTTPS CSV 網址。
3. CSV 讀入後，選擇數值型目標欄位。用 k 滑桿切換 1–8 個變數（不超過可用欄數）。
4. 查看 RMSE / R² 圖表、特徵比較、回歸方程式與結果摘要。
5. 輸入新資料後按「套用輸入值並預測」。

CSV 的第一列必須是表頭；目標值必須能轉成數值；至少需要 15 筆有效樣本。類別欄位會以 one-hot 編碼；類別太多的欄位會跳過。

## 方法與結果限制

- 兩個問題皆採 80% 訓練、20% 測試。
- Python 固定 random_state=42。模型特徵選擇僅使用訓練集；測試集不參與特徵選擇。
- 前端採 JavaScript OLS + Forward SFS + 固定亂數切分（種子 20261014）；Python 採 scikit-learn、不同種子與更多特徵選擇方法。**兩者切分程序不同，RMSE 與 R² 不一定一致。**
- Python 的 Exhaustive 以「訓練集調整後 R²」選子集；Lasso 與 ElasticNet 使用訓練集標準化後係數作排序，輸出的回歸估計則用 OLS。
- RMSE 越低通常越好，R² 越高通常越好；測試集 R² 可能為負值。不同特徵數未必呈單調變化。
- 表格中按最低測試 RMSE 排列的「最佳」只供這次切分的描述；用同一測試集做模型選擇仍可能有選模偏差，正式研究應另做交叉驗證及獨立測試。

## 資料來源與倫理說明

- [50 Startups dataset](https://raw.githubusercontent.com/Avik-Jain/100-Days-Of-ML-Code/master/datasets/50_Startups.csv) — 目標欄位 Profit。
- [Boston Housing dataset](https://raw.githubusercontent.com/selva86/datasets/master/BostonHousing.csv) — 目標欄位 medv。

Boston Housing 包含歷史上具爭議的種族相關欄位 b，僅因課堂題目指定而分析，不應用於真實房屋估價或決策。此作業不以老師範例畫面的數字假冒本專案的測試成果。靜態網頁需要 JavaScript 且在 GitHub Pages 部署後可讀取同目錄的 data/*.csv。

## GitHub Pages

若你的主儲存庫已啟用 main 分支根目錄為 GitHub Pages 來源，上傳後此資料夾可以直接由 /1014_DIC/ 路徑瀏覽。若尚未啟用，請於 Settings → Pages → Build and deployment 選擇 Deploy from a branch、main、/(root) 並儲存。本專案不需改動主目錄既有 index.html。
