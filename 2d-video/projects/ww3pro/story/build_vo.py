# Новая дорожка пилота: куски голоса рассказчика + реплики героев между ними.
# Пишет input/voiceover.wav, timeline/words.json (сдвинутые слова), story/shots.json (границы кадров + времена реплик).
import json, os, subprocess
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); R = os.path.abspath(os.path.join(P, '../../..'))
SRC = os.path.join(P, '../ww3/input/voiceover.mp3'); DLG = os.path.join(R, 'ru_geo/ww3/pro_vo')
WORDS = json.load(open(os.path.join(P, '../ww3/timeline/words.json')))['words']
T = os.path.join(P, 'build/vo'); os.makedirs(T, exist_ok=True)
SEQ = [('n', 0.0, 5.0), ('d', 'k1'), ('n', 5.7, 18.0), ('d', 'k2'), ('n', 18.5, 22.95), ('d', 'k3'), ('n', 23.55, 31.85), ('d', 'p1'), ('d', 'k4'), ('d', 'p2'), ('n', 34.45, 39.6)]
PRE, POST = 0.2, 0.3
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
parts, cur, segs, D, words = [], 0.0, [], {}, []
for i, s in enumerate(SEQ):
    f = f'{T}/{i:02d}.wav'
    if s[0] == 'n':
        _, a, b = s; subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(a), '-to', str(b), '-i', SRC, '-ar', '48000', '-ac', '1', f], check=True)
        segs.append((a, b, cur)); words += [{**w, 'start': w['start'] - a + cur, 'end': w['end'] - a + cur} for w in WORDS if a <= w['start'] < b - 0.05]
    else:
        k = s[1]; subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{DLG}/{k}.mp3', '-af', f'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,adelay={int(PRE*1000)},apad=pad_dur={POST}', '-ar', '48000', '-ac', '1', f], check=True)
        d = dur(f); D[k] = [round(cur + PRE, 3), round(cur + d - POST, 3)]
    parts.append(f); cur += dur(f)
open(f'{T}/list.txt', 'w').write(''.join(f"file '{p}'\n" for p in parts))
os.makedirs(os.path.join(P, 'input'), exist_ok=True); os.makedirs(os.path.join(P, 'timeline'), exist_ok=True)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', f'{T}/list.txt', '-ar', '48000', os.path.join(P, 'input/voiceover.wav')], check=True)
json.dump({'source': 'pilot', 'words': words}, open(os.path.join(P, 'timeline/words.json'), 'w'), ensure_ascii=False)
def M(t):  # старое время рассказчика → новое
    for a, b, c in segs:
        if a - 0.01 <= t <= b + 0.01: return round(t - a + c, 3)
    raise ValueError(t)
END = round(cur, 3)
b = [0, M(2.2), M(4.36), D['k1'][0] - 0.1, M(7.8), M(10.6), M(13.2), D['k2'][0] - 0.15, M(20.6), D['k3'][0] - 0.15, M(25.9), M(28.5), M(30.65), D['k4'][0] - 0.1, D['p2'][0] - 0.1, M(34.45) + 0.05, M(35.95), END]
tr = {2: {'type': 'dip', 'dur': 0.5}, 5: {'type': 'push', 'dur': 0.4}, 7: {'type': 'push', 'dur': 0.4}, 11: {'type': 'push', 'dur': 0.4}, 16: {'type': 'push', 'dur': 0.45}, 17: {'type': 'fade', 'dur': 0.6}}
shots = []
for i in range(len(b) - 1):
    s = {'id': f'p{i + 1:02d}', 'start': round(b[i], 3), 'end': round(b[i + 1], 3), 'params': {'D': D}}
    if i + 1 in tr: s['in'] = tr[i + 1]
    shots.append(s)
json.dump({'duration': END, 'shots': shots}, open(os.path.join(P, 'story/shots.json'), 'w'), indent=1)
c = json.load(open(os.path.join(P, 'config.json'))); c['duration'] = END; c['voiceover'] = 'input/voiceover.wav'; json.dump(c, open(os.path.join(P, 'config.json'), 'w'), ensure_ascii=False, indent=1)
json.dump([{'start': 0.0, 'end': END, 'file': 'hidden_agenda.mp3', 'gain': -2, 'fadeIn': 1.5, 'fadeOut': 1.5}], open(os.path.join(P, 'story/music.json'), 'w'))
print('END', END, D); print([(s['id'], s['start'], s['end']) for s in shots])
