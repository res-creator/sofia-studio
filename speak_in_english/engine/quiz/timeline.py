"""python3 timeline.py <workdir> -> <workdir>/timeline.json (all times in seconds)"""
import json, os, sys
S = json.load(open(os.path.join(os.path.dirname(__file__), "script.json"))); wd = sys.argv[1]
D = json.load(open(f"{wd}/durations.json"))
GAP, COUNT, HOLD = 0.25, 4.0, 1.1
t = 0.0; ev = {"intro": [0.15, 0.15 + D["intro"]], "q": []}
t = ev["intro"][1] + 0.3
for i, q in enumerate(S["questions"]):
    ru = [t, t + D[f"q{i}_ru"]]; c0 = ru[1] + GAP; c1 = c0 + COUNT
    uk = [c1 + GAP, c1 + GAP + D[f"q{i}_uk"]]; us = [uk[1] + 0.45, uk[1] + 0.45 + D[f"q{i}_us"]]
    end = us[1] + HOLD
    ev["q"].append(dict(i=i, level=q["level"], ru=q["ru"], uk=q["uk"], us=q["us"], start=t, ruv=ru, count=[c0, c1], ukv=uk, usv=us, end=end))
    t = end
ev["outro"] = [t + 0.2, t + 0.2 + D["outro"]]; ev["total"] = round(ev["outro"][1] + 1.2, 2)
json.dump(ev, open(f"{wd}/timeline.json", "w"), indent=1, ensure_ascii=False); print("total", ev["total"])
