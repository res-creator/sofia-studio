# Shortens over-long pauses INSIDE the voice lines (never the words, never the speed): any pause > 0.72 s is cut to 0.6 s
# (the "one thousand. ... Max." beat in s04 keeps 0.75 s). Writes vo_cut/<id>.wav + shifted <id>.align.json + vo_cut/speech.json
# (real speech start/end, same rule as speech.py). The voice text and the takes are unchanged (vo/ is read-only input).
import json, os, re, subprocess, wave, numpy as np
D = os.path.dirname(os.path.abspath(__file__)); SR = 44100; O = f'{D}/vo_cut'; os.makedirs(O, exist_ok=True)
LIMIT, KEEP, KEEP_ID = 0.72, 0.6, {'s04': 0.75}
def silences(f):
    e = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-42dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', e)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', e)]
    return st, en
speech = {}; saved = {}
for L in json.load(open(f'{D}/script.json')):
    i = L['id']; f = f'{D}/vo/{i}.mp3'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768; dur = len(a) / SR
    st, en = silences(f); al = json.load(open(f'{D}/vo/{i}.align.json'))
    cuts = []   # (time in original, seconds removed)
    for s0, s1 in zip(st, en):
        if s0 < 0.05 or s1 > dur - 0.06: continue          # leading / trailing silence: not a pause
        keep = KEEP_ID.get(i, KEEP)
        if s1 - s0 > LIMIT: cuts.append((s0 + keep / 2, (s1 - s0) - keep))
    out = a.copy(); fade = int(0.01 * SR)
    for c0, d in sorted(cuts, reverse=True):
        p0, p1 = int(c0 * SR), int((c0 + d) * SR); seg = out[p1:p1 + fade] * np.linspace(0, 1, fade) + out[p0:p0 + fade] * np.linspace(1, 0, fade)
        out = np.concatenate([out[:p0], seg, out[p1 + fade:]])
    def shift(t): return round(t - sum(min(d, max(0, t - c0)) for c0, d in cuts), 4)
    al = {**al, 'character_start_times_seconds': [shift(t) for t in al['character_start_times_seconds']], 'character_end_times_seconds': [shift(t) for t in al['character_end_times_seconds']]}
    json.dump(al, open(f'{O}/{i}.align.json', 'w'))
    w = wave.open(f'{O}/{i}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    st, en = silences(f'{O}/{i}.wav'); nd = len(out) / SR
    s0 = en[0] if st and st[0] < 0.05 and en else 0.0
    s1 = st[-1] if st and (len(en) < len(st) or en[-1] > nd - 0.06) else nd
    speech[i] = [round(max(0, s0 - 0.03), 3), round(min(nd, s1 + 0.06), 3)]; saved[i] = round(sum(d for _, d in cuts), 2)
json.dump(speech, open(f'{O}/speech.json', 'w'), indent=0)
print('trimmed', saved, 'speech total', round(sum(b - a for a, b in speech.values()), 2))
