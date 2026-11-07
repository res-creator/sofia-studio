# Builds full/timeline_full.json + full/vo/full_narration.wav
# cold open (vo/todd, unchanged) -> for each chapter: card (silence) + lead + chapter voice + tail
import json, subprocess
CARD, LEAD, TAIL, END = 2.6, 0.3, 0.9, 18.0
chs = json.load(open('full/chapters.json'))
cold = json.load(open('vo/todd/timeline.json'))
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
t = cold['duration']; out = {'cold': {'start': 0, 'dur': cold['duration']}, 'chapters': [], 'lines': {}, 'words': []}
parts = [('vo/todd/narration_timed.wav', None)]
for k, c in enumerate(chs):
    w = json.load(open(f"full/vo/{c['id']}.words.json"))
    d = dur(f"full/vo/{c['id']}.mp3")
    card = t; vo = t + CARD + LEAD; end = vo + d + TAIL
    out['chapters'].append({'id': c['id'], 'num': k + 1, 'label': c['label'], 'title': c['title'], 'card': round(card, 3), 'vo': round(vo, 3), 'end': round(end, 3)})
    for x in w:
        s, e = round(vo + x['s'], 3), round(vo + x['e'], 3)
        out['words'].append({'w': x['w'], 's': s, 'e': e, 'line': x['line']})
        L = out['lines'].setdefault(x['line'], {'s': s, 'e': e, 'ch': c['id'], 'words': []})
        L['e'] = e; L['words'].append(s)
    parts.append((f"full/vo/{c['id']}.mp3", (CARD + LEAD, d, TAIL)))
    t = end
out['duration'] = round(t + END, 3)  # end card (room for YouTube end screens)
json.dump(out, open('full/timeline_full.json', 'w'))
# audio: every part is placed at its exact sample offset (no concat drift from mp3 padding)
import numpy as np, wave, tempfile, os
SR = 44100; N = int(round(out['duration'] * SR)); buf = np.zeros(N, np.float32)
def load(p):
    tmp = tempfile.mktemp(suffix='.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-ac', '1', '-ar', str(SR), tmp], check=True)
    with wave.open(tmp) as f: a = np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
    os.remove(tmp); return a
starts = [0.0] + [c['vo'] for c in out['chapters']]
for (p, _), st in zip(parts, starts):
    a = load(p); i0 = int(round(st * SR)); n = min(len(a), N - i0); buf[i0:i0 + n] += a[:n]
with wave.open('full/vo/full_narration.wav', 'w') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
print('total', out['duration'], 'audio', dur('full/vo/full_narration.wav'))
