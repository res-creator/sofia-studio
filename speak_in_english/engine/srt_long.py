"""python3 srt_long.py <ep> <out.srt> -> subtitles from the timeline: English lines with the Russian translation underneath,
narrator in Russian, long lines split into their meaning chunks (cfg.chunks)."""
import json, sys
T = json.load(open(f"eps/{sys.argv[1]}/timeline.json")); CH = T["cfg"].get("chunks", {})
def ts(x): h, r = divmod(x, 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"
cues = []
for sp in T["speech"]:
    if sp["id"] in CH:
        ch, W8 = CH[sp["id"]], sp["words"]; cnt = [len(e.split()) for e, _ in ch]; wi = 0
        for i, (en, ru) in enumerate(ch):
            a = W8[wi][1] if wi < len(W8) else 0; wi += cnt[i]; b = W8[wi][1] if i < len(ch) - 1 and wi < len(W8) else sp["d"]
            cues.append((sp["t"] + a, sp["t"] + b, f"{en}\n{ru}"))
        continue
    text = sp["text"] if sp["who"] == "nar" else (f"{sp['text']}\n{sp['ru']}" if sp.get("ru") else sp["text"])
    if sp["who"] == "rec": text = "[запись 03:14] " + text
    cues.append((sp["t"], sp["t"] + sp["d"] + 0.3, text))
cues.sort(); out = []
for i, (a, b, x) in enumerate(cues):
    if i + 1 < len(cues): b = min(b, cues[i + 1][0] - 0.02)
    out.append(f"{i + 1}\n{ts(a)} --> {ts(max(b, a + 0.5))}\n{x}\n")
open(sys.argv[2], "w").write("\n".join(out)); print(len(out), "cues ->", sys.argv[2])
