import json
import streamlit as st
from parser import parse
from recommender import recommend

st.set_page_config(page_title="AIoT 美食 × 停車 Agent",page_icon="🍽️",layout="centered")
st.title("🍽️ AIoT｜美食 × 停車 Agent")
st.caption("v0.2 自然語言文字聊天｜情境理解 → 條件驗證 → 組合推薦")
st.warning("課程原型：所有餐廳、停車場、費率、車位與路線數字都是虛構示意，並非即時資訊。")
if "history" not in st.session_state: st.session_state.history=[]
with st.sidebar:
    st.subheader("測試範例")
    st.write("今晚跟女朋友約會，兩人，每人800元以內，希望安靜，停車後走路5分鐘內")
    st.write("四個朋友聚餐，每人500元左右，偏好火鍋，停車方便")
    if st.button("清除對話"):
        st.session_state.history=[]
        st.rerun()
    st.caption("目前每則輸入獨立解析，尚未支援跨訊息補全條件。")

for item in st.session_state.history:
    with st.chat_message("user"): st.write(item["query"])
    with st.chat_message("assistant"):
        st.markdown(item["answer"])
        with st.expander("查看情境 JSON"):
            st.json(item["criteria"])
query=st.chat_input("例如：今晚兩人約會，每人800元內，希望安靜又好停車")
if query:
    with st.chat_message("user"): st.write(query)
    with st.chat_message("assistant"):
        try:
            criteria, mode = parse(query)
            lines=[f"**解析模式：** {mode}"]
            if criteria.get("unresolved"):
                lines.append("**需要確認：** "+"；".join(map(str,criteria["unresolved"])))
            if not criteria.get("origin"):
                lines.append("**尚缺出發位置：** 無法驗證真實交通時間；下列車程僅為展示值。")
            if not criteria.get("dining_time"):
                lines.append("**尚缺用餐時間：** 無法驗證營業狀態。")
            results=recommend(criteria)
            if not results:
                lines.append("目前示範資料沒有符合已指定硬條件的組合；不會自動放寬條件。")
            else:
                lines.append("### 示範推薦 Top 3")
                for i,(score,r,reasons) in enumerate(results,1):
                    parking=r["parking_hour"]*2
                    lines.append(f"""**{i}. {r['name']}** — {r['cuisine']}
- 每人餐費示意：NT$ {r['price_low']}–{r['price_high']}
- 停車：{r['parking']}；示意車程 {r['drive']} 分、步行 {r['parking_walk']} 分
- 車位：{"未知" if r['spaces'] is None else "示意滿位" if r['spaces']==0 else "示意剩餘 "+str(r['spaces'])+" 格"}（非即時）
- 假設停 2 小時，示意停車費 NT$ {parking}（未驗證實際計費）
- 推薦依據：{"、".join(reasons) if reasons else "示範評分及交通便利度"}
- 來源：尚無真實可查證來源；營業、價格、路線均未確認。""")
            lines.append("\n*提醒：示範結果不代表已通過真實營業、路線或車位查核。*")
            answer="\n\n".join(lines)
            st.markdown(answer)
            with st.expander("查看情境 JSON"): st.json(criteria)
            st.session_state.history.append({"query":query,"answer":answer,"criteria":criteria})
        except Exception as exc:
            st.error("解析失敗；沒有偷偷改用其他模式。請檢查 Dify API 設定或輸出 JSON。")
            st.caption(f"錯誤類型：{type(exc).__name__}")
