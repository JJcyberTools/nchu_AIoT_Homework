"""Natural-language constraint parsing. Dify is optional; local parser is explicitly a demo."""
import json, os, re
import requests

SYSTEM_INSTRUCTION = """你是台中美食與停車推薦系統的「需求解析器」，只輸出 JSON，不要 Markdown。
Schema: {"scenario":null|"約會"|"朋友聚會"|"家庭聚餐"|"一般用餐",
"atmosphere":null|"安靜"|"熱鬧"|"適合聊天",
"cuisine":null|"義式"|"火鍋"|"日式",
"cuisine_required":false,"budget_per_person":null|integer,
"budget_is_hard":false,"people":null|integer,
"origin":null|string,"dining_time":null|string,
"max_walk_minutes":null|integer,"max_drive_minutes":null|integer,
"parking_preferred":false,"unresolved":[]}
不要把「左右」「大概」視為硬預算；「以內」「不得超過」才是硬上限。
不要推定兩人必定約會、朋友必定熱鬧。未知用 null，不編造。
輸出只包含上述欄位。"""

def demo_parse(text):
    """Small rule-based demo, not an LLM and not comprehensive Chinese NLP."""
    out = dict(scenario=None, atmosphere=None, cuisine=None, cuisine_required=False,
               budget_per_person=None, budget_is_hard=False, people=None, origin=None,
               dining_time=None, max_walk_minutes=None, max_drive_minutes=None,
               parking_preferred=bool(re.search("停車|開車|車位", text)), unresolved=[])
    for keyword, value in [("約會","約會"),("女朋友","約會"),("男朋友","約會"),
                           ("朋友","朋友聚會"),("家庭","家庭聚餐"),("家人","家庭聚餐")]:
        if keyword in text:
            out["scenario"] = value
            break
    for word in ["安靜","熱鬧","適合聊天"]:
        if word in text: out["atmosphere"] = word
    if "聊天" in text: out["atmosphere"] = "適合聊天"
    for word in ["火鍋","義式","日式"]:
        if word in text: out["cuisine"] = word
    out["cuisine_required"] = bool(out["cuisine"] and re.search("一定要|只吃|必須", text))
    m = re.search(r"(?:每人|一個人|每個人)[^\d]{0,8}(\d{2,5})\s*元?", text)
    if m:
        out["budget_per_person"] = int(m.group(1))
        out["budget_is_hard"] = bool(re.search("以內|以下|不能超過|不得超過|上限", text))
    elif re.search(r"\d{2,5}\s*元", text):
        out["unresolved"].append("預算是每人還是總額？")
    for number,unit in [("兩",2),("二",2),("三",3),("四",4),("五",5),("六",6)]:
        if number+"人" in text: out["people"]=unit
    m = re.search(r"(\d+)\s*人", text)
    if m: out["people"]=int(m.group(1))
    m = re.search(r"(?:走路|步行)[^\d]{0,6}(\d+)\s*分鐘", text)
    if m: out["max_walk_minutes"]=int(m.group(1))
    m = re.search(r"(?:車程|開車)[^\d]{0,6}(\d+)\s*分鐘", text)
    if m: out["max_drive_minutes"]=int(m.group(1))
    if "勤美" in text: out["origin"]="勤美附近"
    if "台中車站" in text or "臺中車站" in text: out["origin"]="台中車站"
    if "今晚" in text: out["dining_time"]="今晚（時間未確認）"
    return out

def parse(text, user_id="aiot-demo"):
    api_key = os.getenv("DIFY_API_KEY","")
    if not api_key:
        return demo_parse(text), "本地規則展示（未連接 LLM）"
    endpoint = os.getenv("DIFY_BASE_URL","https://api.dify.ai/v1").rstrip("/")
    payload = {"inputs":{},"query":SYSTEM_INSTRUCTION+"\n使用者輸入："+text,
               "response_mode":"blocking","user":user_id}
    response = requests.post(endpoint+"/chat-messages",json=payload,
        headers={"Authorization":"Bearer "+api_key,"Content-Type":"application/json"},timeout=45)
    response.raise_for_status()
    answer = response.json().get("answer","")
    answer = re.sub(r"^\s*```(?:json)?|\s*```\s*$","",answer.strip(),flags=re.I)
    obj = json.loads(answer)
    if not isinstance(obj,dict): raise ValueError("Dify must return a JSON object")
    allowed = {"scenario","atmosphere","cuisine","cuisine_required","budget_per_person",
               "budget_is_hard","people","origin","dining_time","max_walk_minutes",
               "max_drive_minutes","parking_preferred","unresolved"}
    if not allowed.issubset(obj): raise ValueError("Dify response is missing fields")
    for key in ("budget_per_person","people","max_walk_minutes","max_drive_minutes"):
        if obj[key] is not None and (type(obj[key]) is not int or obj[key] < 0):
            raise ValueError("Invalid numeric field: "+key)
    for key in ("cuisine_required","budget_is_hard","parking_preferred"):
        if type(obj[key]) is not bool: raise ValueError("Invalid boolean field: "+key)
    for key, options in {"scenario":("約會","朋友聚會","家庭聚餐","一般用餐"),
                         "atmosphere":("安靜","熱鬧","適合聊天"),
                         "cuisine":("義式","火鍋","日式")}.items():
        if obj[key] is not None and obj[key] not in options: raise ValueError("Invalid label: "+key)
    if not isinstance(obj["unresolved"],list): raise ValueError("Invalid unresolved")
    return {k:obj[k] for k in allowed}, "Dify LLM"
