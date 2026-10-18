# Builds timeline.json: line start/end times, word timings, scene spans.
import json, subprocess, os
D = os.path.dirname(os.path.abspath(__file__))
lines = json.load(open(f'{D}/lines.json'))
GAP = {'l03': 0.9, 'l04': 0.6, 'l05': 0.8, 'l07': 0.7, 'l08': 0.6, 'l09': 0.5, 'l10': 1.6, 'l11': 0.7}
t = 0.6; out = []
for L in lines:
    t += GAP.get(L['id'], 0.45)
    f = f"{D}/vo/{L['id']}.mp3"
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    a = json.load(open(f[:-4] + '.align.json'))
    words, cur, ws = [], '', None
    for ch, s, e in zip(a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']):
        if ch.isspace():
            if cur: words.append({'w': cur, 't0': t + ws, 't1': t + pe}); cur = ''
            continue
        if not cur: ws = s
        cur += ch; pe = e
    if cur: words.append({'w': cur, 't0': t + ws, 't1': t + pe})
    out.append({'id': L['id'], 'scene': L['scene'], 't0': t, 't1': t + dur, 'words': words, 'text': L['text']})
    t += dur
T = t + 2.5
scenes = []
for L in out:
    if not scenes or scenes[-1]['id'] != L['scene']: scenes.append({'id': L['scene'], 't0': L['t0'] - (0.35 if scenes else L['t0'])})
for i, s in enumerate(scenes): s['t1'] = scenes[i + 1]['t0'] if i + 1 < len(scenes) else T
json.dump({'fps': 30, 'T': T, 'lines': out, 'scenes': scenes}, open(f'{D}/timeline.json', 'w'), indent=1)
print('T =', round(T, 2)); [print(s['id'], round(s['t0'], 2), round(s['t1'], 2)) for s in scenes]
