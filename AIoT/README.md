# AIoT v0.2｜情境感知台中美食＋停車推薦

依據 HackMD 2026-10-08 新版「美食＋停車位提案」。**本版本為可執行聊天介面原型**，使用虛構餐廳與停車場資料。

## 啟動
```bash
cd AIoT
pip install -r requirements.txt
streamlit run app.py
```

不設定 API Key 時為「本地規則展示模式」，並非真正 LLM。
如需 LLM：建立 Dify Chatflow，設定環境變數 DIFY_API_KEY（不要提交密鑰），參考 [DIFY_CHATFLOW.md](DIFY_CHATFLOW.md)。

## v0.2
- Streamlit 自然語言聊天
- Dify LLM JSON 需求解析（有金鑰時），無金鑰本地規則展示
- 顯示解析結果及待確認欄位
- Python 硬條件過濾＋軟偏好排序，回傳 Top 3
- 費用試算、資料來源與未確認事項明示

## 尚未完成
Neo4j 圖譜、向量索引、真實餐廳來源、停車場 API、真實 ETA、營業時間核驗、影片時間戳記、真正的多輪條件記憶。**所有餐廳、車位、費率與車程皆為虛構資料**，不可用於真實導航或用餐決策。

參考：https://hackmd.io/@OkUqJVjTT4ug3cXLK9M9dQ/Sk6n7qiczx
