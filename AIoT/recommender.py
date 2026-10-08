"""Demo recommendation. Never treat demo parking/ETA as real-time facts."""
from data import RESTAURANTS

def recommend(criteria):
    matches=[]
    for r in RESTAURANTS:
        budget=criteria.get("budget_per_person")
        if criteria.get("budget_is_hard") and budget is not None and r["price_high"]>budget:
            continue
        if criteria.get("cuisine_required") and criteria.get("cuisine") and r["cuisine"]!=criteria["cuisine"]:
            continue
        if criteria.get("max_walk_minutes") is not None and r["parking_walk"]>criteria["max_walk_minutes"]:
            continue
        if criteria.get("max_drive_minutes") is not None and r["drive"]>criteria["max_drive_minutes"]:
            continue
        score=0.30*r["rating"]/5 + 0.25*max(0,1-r["parking_walk"]/20) + 0.15*max(0,1-r["drive"]/60)
        reasons=[]
        if criteria.get("scenario") in r["tags"]:
            score+=0.15; reasons.append("符合用餐情境標籤")
        if criteria.get("atmosphere") in r["tags"]:
            score+=0.10; reasons.append("符合氛圍偏好標籤")
        if criteria.get("cuisine") == r["cuisine"]:
            score+=0.05; reasons.append("符合料理偏好")
        if budget and not criteria.get("budget_is_hard") and r["price_high"]<=budget:
            score+=0.05; reasons.append("符合預算偏好")
        matches.append((score,r,reasons))
    return sorted(matches,key=lambda item:item[0],reverse=True)[:3]
