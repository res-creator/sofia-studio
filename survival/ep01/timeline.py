# timeline.json: line times, word times (v3 [tags] dropped), scene spans, mouth envelopes (30 fps) for talking lines.
import json, subprocess, os, re, array
D = os.path.dirname(os.path.abspath(__file__))
lines = json.load(open(f'{D}/lines.json'))
GAP = {'d1a': 1.0, 'd2a': 1.0, 'd3a': 1.0, 'd4a': 1.0, 'd5a': 1.0, 'c02': 0.25, 'd1c': 0.6, 'd1d': 0.3, 'd2b': 0.6, 'd2c': 0.8, 'd2d': 0.45,
       'd3b': 0.7, 'd3c': 0.45, 'd5b': 0.5, 'd5c': 0.7, 'd5d': 0.35}
FPS = 30
def env(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
    a = array.array('h', raw); n = 8000 // FPS; out = []
    for i in range(0, len(a), n):
        seg = a[i:i + n]; out.append((sum(x * x for x in seg) / max(1, len(seg))) ** 0.5)
    m = max(out) or 1; return [round(min(1, v / m * 1.6), 2) for v in out]
t = 0.4; out = []
for L in lines:
    t += GAP.get(L['id'], 0.4)
    f = f"{D}/vo/{L['id']}.mp3"
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    a = json.load(open(f[:-4] + '.align.json'))
    words, cur, ws, depth = [], '', None, 0
    for ch, s, e in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch == '[': depth += 1; continue
        if ch == ']': depth -= 1; continue
        if depth: continue
        if ch.isspace():
            if cur: words.append({'w': cur, 't0': t + ws, 't1': t + pe}); cur = ''
            continue
        if not cur: ws = s
        cur += ch; pe = e
    if cur: words.append({'w': cur, 't0': t + ws, 't1': t + pe})
    o = {'id': L['id'], 'who': L['who'], 'scene': L['scene'], 't0': t, 't1': t + dur, 'words': words}
    if L['who'] != 'N': o['env'] = env(f)
    out.append(o); t += dur
T = t + 2.6
scenes = []
for L in out:
    if not scenes or scenes[-1]['id'] != L['scene']: scenes.append({'id': L['scene'], 't0': L['t0'] - (GAP.get(L['id'], 0.4) if scenes else L['t0'])})
for i, s in enumerate(scenes): s['t1'] = scenes[i + 1]['t0'] if i + 1 < len(scenes) else T
json.dump({'fps': FPS, 'T': T, 'lines': out, 'scenes': scenes}, open(f'{D}/timeline.json', 'w'))
print('T =', round(T, 2)); [print(s['id'], round(s['t0'], 2), round(s['t1'], 2)) for s in scenes]
