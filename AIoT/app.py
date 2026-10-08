import streamlit as st
from data import RESTAURANTS

st.set_page_config(page_title="AIoT 美食 × 停車推薦", page_icon="🍽️", layout="wide")
st.title("🍽️ AIoT｜台中美食 × 停車推薦")
st.caption("情境感知餐廳與停車場配對｜課程專題 UI Prototype")
st.warning("展示模式：所有餐廳、車位、車程與費率皆為虛構示例；尚未串接即時 API、Neo4j 或 AI 模型。")
with st.sidebar:
    st.header("設定用餐需求")
    scenario = st.selectbox("用餐情境", ["不限","約會","朋友聚會","家庭聚餐","一般用餐"])
    atmosphere = st.selectbox("氛圍偏好", ["不限","安靜","熱鬧","適合聊天"])
    cuisine = st.selectbox("料理偏好（選填）", ["不限","義式","火鍋","日式"])
    required_cuisine = st.checkbox("料理必須符合（硬條件）")
    budget = st.number_input("每人餐費上限 NT$（0 表示不限）", min_value=0, value=800, step=50)
    people = st.number_input("用餐人數", min_value=1, max_value=20, value=2)
    hours = st.number_input("停車時長（小時，示意）", min_value=1, max_value=12, value=2)
    max_walk = st.slider("停車後最多步行（分鐘）", 1, 20, 5)
    max_drive = st.slider("最多車程（分鐘，示意）", 5, 60, 30)
    st.text_input("出發位置", "勤美附近", help="展示版不會實際計算路線")
    st.caption("營業時間、實際位置及交通路線尚未驗證，不會宣稱已符合。")

def evaluate(r):
    reasons = []
    if budget and r["price_high"] > budget:
        return None
    if r["parking_walk"] > max_walk or r["drive"] > max_drive:
        return None
    if required_cuisine and cuisine != "不限" and r["cuisine"] != cuisine:
        return None
    score = r["rating"] / 5 * 0.25
    score += max(0, 1-r["parking_walk"]/20) * 0.25
    score += max(0, 1-r["drive"]/60) * 0.15
    if scenario != "不限":
        score += (0.15 if scenario in r["tags"] else 0)
        if scenario in r["tags"]: reasons.append("符合用餐情境")
    if atmosphere != "不限":
        score += (0.10 if atmosphere in r["tags"] else 0)
        if atmosphere in r["tags"]: reasons.append("符合氛圍偏好")
    if cuisine != "不限":
        score += (0.10 if cuisine == r["cuisine"] else 0)
        if cuisine == r["cuisine"]: reasons.append("符合料理偏好")
    return score, reasons

results = []
for r in RESTAURANTS:
    evaluated = evaluate(r)
    if evaluated is not None:
        results.append((evaluated[0], r, evaluated[1]))
results.sort(key=lambda x:x[0], reverse=True)

a,b,c = st.columns(3)
a.metric("符合示範硬條件", len(results))
b.metric("推薦組合", min(3,len(results)))
c.metric("資料模式", "Demo")
st.subheader("推薦餐廳＋停車場 Top 3")
if not results:
    st.error("示範資料沒有符合硬條件的組合。可自行調整預算、車程或步行上限；系統不會自動放寬限制。")
for idx,(score,r,reasons) in enumerate(results[:3],1):
    with st.container(border=True):
        st.markdown(f"### {idx}. {r['name']}")
        st.write(f"📍 {r['area']}　｜　🍴 {r['cuisine']}　｜　⭐ 示意評分 {r['rating']}")
        st.write(f"**餐費：** 每人 NT$ {r['price_low']}–{r['price_high']}（示意）")
        st.write(f"**停車：** {r['parking']}　｜　示意車程 {r['drive']} 分鐘　｜　步行 {r['parking_walk']} 分鐘")
        status = "未知" if r["spaces"] is None else ("示意滿位" if r["spaces"] == 0 else f"示意剩餘 {r['spaces']} 格")
        st.write(f"**車位：** {status}（非即時）")
        parking_fee = r["parking_hour"] * hours
        st.write(f"**費用試算：** 停車約 NT$ {parking_fee}；{people} 人餐費＋停車約 NT$ {r['price_low']*people+parking_fee:,}–{r['price_high']*people+parking_fee:,}（假設按小時計費，不含未知服務費）")
        st.write("**排序原因：** " + ("、".join(reasons) if reasons else "依示範評分、步行與車程排序"))
        st.caption("⚠️ 營業狀態、來源、車位更新時間、路線及實際價格均未確認。")
        with st.expander("查看資料來源與限制"):
            st.write(r["source"])
            st.write("目前沒有可驗證的影片片段或文章連結，不能宣稱 YouTuber 曾推薦。")
st.divider()
st.subheader("下一階段系統流程")
st.code("需求解析 → 餐廳/標籤向量召回 → Neo4j 圖譜查詢 → 硬條件驗證 → 停車場/車位/路線 → 組合排序 → 來源解釋")
st.info("此樣板僅示範流程中的表單、簡化硬條件過濾及排序；完整圖譜 RAG、即時車位與導航尚待實作。")
