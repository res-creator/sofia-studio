"""python3 short/measure.py <file.wav|mp4> ...  -> integrated LUFS, LRA, true peak (ffmpeg ebur128)
python3 short/measure.py --groups <slug> [dir]  -> speech loudness per voice group (nar / tip / her / others) from the raw clips placed on the timeline"""
import subprocess, sys, re, json, collections
import numpy as np, soundfile as sf


def meas(p):
    o = subprocess.run(["ffmpeg", "-nostats", "-i", p, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = re.findall(r"I:\s+(-?[\d.]+) LUFS", o); LRA = re.findall(r"LRA:\s+(-?[\d.]+) LU", o); TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", o)
    return float(I[-1]), float(LRA[-1]), float(TP[-1])


def groups(slug, D=None):
    D = D or f"eps/{slug}"; TL = json.load(open(f"{D}/timeline.json")); SR = 48000; N = int(TL["dur"] * SR) + SR
    grp = collections.defaultdict(lambda: np.zeros(N, dtype=np.float32))
    for s in TL["speech"]:
        x, _ = sf.read(f"{D}/vo/{s['id']}.wav"); i = int(s["t"] * SR); g = "nar" if s["who"] == "nar" else "tip" if s["who"] == "tip" else "her" if s["who"] == "her" else "others"
        seg = x[: N - i].astype(np.float32); grp[g][i:i + len(seg)] += seg
    out = []
    for g, a in grp.items():
        sf.write("/tmp/_g.wav", a, SR); out.append(f"{g}=%.1f" % meas("/tmp/_g.wav")[0])
    return " ".join(out)


if __name__ == "__main__":
    if sys.argv[1] == "--groups": print(sys.argv[2], "speech LUFS by group:", groups(*sys.argv[2:]))
    else:
        for p in sys.argv[1:]: print(p.split("/")[-1], "I=%.1f LUFS  LRA=%.1f  TP=%.1f dBTP" % meas(p))
