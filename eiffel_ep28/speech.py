# Real speech start/end of every voice line (silencedetect, not the alignment end, which includes trailing silence) -> vo/speech.json
import json, os, re, subprocess
D = os.path.dirname(os.path.abspath(__file__)); out = {}
for L in json.load(open(f'{D}/script.json')):
    f = f"{D}/vo/{L['id']}.mp3"
    e = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-42dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    dur = float(re.search(r'Duration: (\d+):(\d+):([\d.]+)', e).groups()[2])
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', e)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', e)]
    s0 = en[0] if st and st[0] < 0.05 and en else 0.0
    s1 = st[-1] if st and (len(en) < len(st) or en[-1] > dur - 0.06) else dur
    out[L['id']] = [round(max(0, s0 - 0.03), 3), round(min(dur, s1 + 0.06), 3)]
json.dump(out, open(f'{D}/vo/speech.json', 'w'), indent=0); print(out, 'total', round(sum(b - a for a, b in out.values()), 2))
