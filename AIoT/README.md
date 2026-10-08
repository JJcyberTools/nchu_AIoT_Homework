# AIoT｜台中情境美食＋停車推薦 Demo

依據 2026-10-08 HackMD 新版提案製作的 **Streamlit 可互動樣板**。目前使用虛構餐廳與停車場，**沒有**串接即時車位、Neo4j、LLM 或路線 API。所有數字僅供介面及排序邏輯驗證。

## 啟動
```bash
pip install -r requirements.txt
streamlit run app.py
```

## 已完成
- 情境、預算、料理、停車步行上限與車程條件輸入
- 硬條件過濾與軟偏好加權排序
- 每家餐廳配主要停車場，顯示前三家、估計費用與說明
- 明確標示虛構資料及未串接的即時資訊

## 後續
1. 以真實餐廳與官方停車場資料替換 `data.py`
2. 串接 Neo4j 知識圖譜、固定標籤與節點向量索引
3. 串接官方車位快照、更新時間及路線 API
4. 加入可追溯 YouTube / 文章來源與 LLM 意圖解析

資料來源構想：https://hackmd.io/@OkUqJVjTT4ug3cXLK9M9dQ/Sk6n7qiczx
