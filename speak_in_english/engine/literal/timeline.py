"""python3 timeline.py <workdir> -> <workdir>/timeline.json"""
import json, os, sys
S = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "script.json"))); wd = sys.argv[1]
D = json.load(open(f"{wd}/durations.json")); ev = {"intro": [0.15, 0.15 + D["intro"]], "q": []}
t = ev["intro"][1] + 0.35
for i, it in enumerate(S["items"]):
    lit = [t + 1.8, t + 1.8 + D[f"i{i}_lit"]]; what = [lit[1] + 0.5, lit[1] + 0.5 + D[f"i{i}_what"]]
    real = [what[1] + 0.3, what[1] + 0.3 + D[f"i{i}_real"]]; end = real[1] + 1.8
    ev["q"].append(dict(i=i, ru=it["ru"], lit=it["lit"], real=it["real"], start=t, litv=lit, whatv=what, realv=real, end=end)); t = end
ev["outro"] = [t + 0.2, t + 0.2 + D["outro"]]; ev["total"] = round(ev["outro"][1] + 1.3, 2)
json.dump(ev, open(f"{wd}/timeline.json", "w"), indent=1, ensure_ascii=False); print("total", ev["total"])
