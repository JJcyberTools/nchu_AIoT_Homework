# Dify Chatflow v0.2 設定指南

此版使用 **Dify Chat App / Chatflow 的 chat-messages API**，不是 Workflow 的 workflows/run API。

## 建立步驟
1. 在 Dify 建立 Chatflow 應用，選定可用的 LLM Provider。
2. Start → LLM → Answer。LLM 的 System prompt 貼上 parser.py 的 SYSTEM_INSTRUCTION。
3. LLM User prompt 使用 Dify 提供的使用者 query 變數；Answer 節點只輸出 LLM 的文字結果，**必須是單一 JSON object**。
4. 在 Dify 的 API Access 取得該 Chatflow App API Key，設為 DIFY_API_KEY；自架 Dify 可設 DIFY_BASE_URL。
5. 本版 Streamlit 每次發送完整的獨立輸入，未串接 Dify conversation_id；多輪條件記憶是後續功能。

## 測試句
- 今晚想跟女朋友約會，兩人，每人800元以內，希望安靜，停車後走路五分鐘內。
- 四個朋友吃飯，每人500左右，偏好火鍋，停車方便。
- 兩人吃飯加停車總共1200元內。（應標 unresolved，不可當作每人1200元）

## 邊界
- Dify 解析出的預算、車程等值仍由 Python 檢查。
- Dify 無金鑰時使用本地簡易規則展示，不能稱為 LLM。
- 尚未接 Neo4j、真實來源、即時車位與路線服務。
- JSON schema 是此專案約定，不是 Dify 內建欄位；請以 Dify Test Run 實測格式。
