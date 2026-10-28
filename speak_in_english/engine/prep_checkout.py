"""python3 prep_checkout.py -> eps/checkout/vo/<id>.wav + <id>.words.json from the ElevenLabs takes in ../../checkout/vo/ (no new generation).
Same processing as eleven_tts.py (48 kHz mono, silence trimmed, peak 0.89); word timings come from the ElevenLabs character alignment."""
import json, os, re, subprocess, numpy as np, soundfile as sf
SR = 48000; SRC = '../../checkout/vo'; OD = 'eps/checkout/vo'; os.makedirs(OD, exist_ok=True)
MAP = dict(hook_her='s00', a1_x='m01', a1_her='s02', a1_x2='m02', a1_her2='s03', a2_her='s04', a2_x='m03', a2_x2='m04', a2_x3='m05', a2_her2='s05',
           b1_her='s06', b1_d='c01', b1_her2='s07', b1_d2='c02', b1_x='m06', b1_d3='c03', b2_x='m07', b2_her='s08', b2_d='c04', b2_her2='s09',
           c1_her='s10', c1_x='m08', c1_her2='s11', c1_x2='m09', c2_her='s12', c2_x='m10', c2_her2='s13', c2_x2='m11', c2_her3='s14', c2_x3='m12')
assert len(set(MAP.values())) == 30
for lid, src in MAP.items():
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', f'{SRC}/{src}.mp3', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32).copy(); thr = 0.01 * np.abs(x).max(); idx = np.where(np.abs(x) > thr)[0]
    a = max(0, idx[0] - 960); x = x[a: idx[-1] + 7200]; x = x / (np.abs(x).max() + 1e-9) * 0.89
    sf.write(f'{OD}/{lid}.wav', x.astype(np.float32), SR)
    al = json.load(open(f'{SRC}/{src}.align.json')); ch, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    words, cur, depth = [], None, 0; off = a / SR
    for c, s, e in zip(ch, st, en):
        if c == '[': depth += 1; continue
        if c == ']': depth -= 1; continue
        if depth: continue
        if c.isspace():
            if cur: words.append(cur); cur = None
            continue
        if cur is None: cur = [c, s, e]
        else: cur[0] += c; cur[2] = e
    if cur: words.append(cur)
    words = [[w, round(max(0, s - off), 3), round(max(0, e - off), 3)] for w, s, e in words if re.search(r"[A-Za-z]", w)]
    json.dump(words, open(f'{OD}/{lid}.words.json', 'w'))
    print(lid, src, round(len(x) / SR, 2), ' '.join(w[0] for w in words))
