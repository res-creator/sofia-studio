"""python3 timeline.py <workdir> -> <workdir>/timeline.json"""
import json, os, sys
S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json"))); wd = sys.argv[1]
D = json.load(open(f"{wd}/durations.json")); ev = {"hook": [0.0, 4.2], "hookv": [0.4, 0.4 + D["i0_fast"]], "q": []}
t = 4.6
for i, it in enumerate(S["items"]):
    f1 = [t + 0.3, t + 0.3 + D[f"i{i}_fast"]]; guess = [f1[1], f1[1] + 2.0]
    sl = [guess[1], guess[1] + D[f"i{i}_slow"]]; f2 = [sl[1] + 0.5, sl[1] + 0.5 + D[f"i{i}_fast"]]; end = f2[1] + 0.9
    ev["q"].append(dict(i=i, start=t, f1=f1, guess=guess, slow=sl, f2=f2, end=end, **{k: it[k] for k in ("heard_ru", "heard_en", "written", "hl", "note")})); t = end
ev["outro"] = [t + 0.1, t + 0.1 + D["outro"]]; ev["ask"] = ev["outro"][1] + 0.4; ev["total"] = round(ev["ask"] + 3.2, 2)
json.dump(ev, open(f"{wd}/timeline.json", "w"), indent=1, ensure_ascii=False); print("total", ev["total"])
