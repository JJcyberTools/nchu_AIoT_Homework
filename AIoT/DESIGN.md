# DESIGN.md — AIoT Context-Aware Dining & Parking Agent

> Proposal stage (2026-10-08). v0.2 is a demo; Neo4j, verified restaurant data and live parking are not implemented yet.

## Problem & requirements
Recommend restaurant + nearby parking lot pairs from natural-language Chinese dining queries. Strict budget, cuisine, opening time, maximum walk and travel limits are hard constraints; scenario and atmosphere are soft preferences. Never silently relax hard constraints. Unknown data cannot satisfy a required hard constraint.

## Architecture
① User Scenario → ② Streamlit Chat Input (future Next.js) → ③ Dify Chatflow LLM JSON parser → ④ Restaurant/Neo4j and Parking API Retrieval → ⑤ Python Analytics Engine ↔ ⑥ Domain Knowledge and Provenance → ⑦ Pair Decision/Top 3 → ⑧ Evidence-backed Output. Missing critical slots loop back to clarification.

## Components / implementation mapping
- app.py: Streamlit chat demo.
- parser.py: Dify chat-messages API or labeled local rule-based demo.
- recommender.py: demo hard constraints and ranking.
- data.py: fictional sample records only.
- DIFY_CHATFLOW.md: manual setup.

## Planned knowledge graph
Restaurant, ParkingLot, Cuisine, DiningScenario, AtmosphereTag, District, Source. Relations: HAS_CUISINE, SUITABLE_FOR, HAS_ATMOSPHERE, LOCATED_IN, NEAR_PARKING, SUPPORTED_BY. Each real-world fact needs source URL and verification time.

## Core algorithm (planned)
01: Parse query into structured slots and validate JSON.
02: Ask follow-up if critical details are missing.
03: Retrieve restaurant and parking records.
04: Attach provenance, freshness and unknown-state labels.
05: Build restaurant-parking pairs.
06: Exclude pairs violating verified hard constraints or lacking required evidence.
07: Score context, walking, driving, price and source quality.
08: Diversify by restaurant, select up to three, attach backup parking.
09: Return explanations, source links, timestamps, or no-result reason.

## Data
Official Taichung off-street parking dataset: https://data.gov.tw/dataset/83931 . AvailableCarRGB is a full-rate light signal, **not guaranteed exact free-space count**. TDX availability API is a candidate: https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/ParkingAvailability/City/Taichung?%24format=JSON ; authentication, fields and freshness require verification.

## Analytics & evaluation (not yet run)
Target: 20–30 verified restaurants, 10–20 parking lots, 50 annotated Chinese queries. Baselines: keyword filter; LLM intent without parking; full paired agent. Metrics: slot F1, hard-constraint violation rate, feasible pair rate, provenance completeness, response latency, user feedback. These are planned sample sizes, not achieved results.

## How to run
```bash
cd AIoT
pip install -r requirements.txt
streamlit run app.py
```
Configure DIFY_API_KEY securely. Without it, parser is local rule-based demonstration, not LLM.

## Limitations / deployment
Current restaurant, parking, fee, availability and ETA records are fictional. No live Neo4j, parking, route API, verified opening hours, or Next.js deployment. Future Vercel site should use a separate project to preserve previous weather homework.

## References
[1] Lin et al. (2025), https://doi.org/10.1145/3678004
[2] Said (2025), https://doi.org/10.3389/fdata.2024.1505284
[3] Cui et al. (2025), https://doi.org/10.1145/3726302.3729932
[4] Zhang et al. (2024), https://doi.org/10.1016/j.eswa.2024.123876
[5] Taichung City Government, https://data.gov.tw/dataset/83931
[6] Course iLearning Proposal requirements, https://lms2020.nchu.edu.tw/course/homework/74762
