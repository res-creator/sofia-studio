# full timeline: hook (with its silence gap) -> per part: title card + VO -> end card. Inserts archival FEMA speech in p9.
# -> src/data/full.json (absolute word times) + vo/full_narration.wav (exact sample placement)
import json, subprocess, wave, numpy as np
SR = 44100; TITLE, TAIL, END = 2.4, 0.5, 15.0
hook = json.load(open('vo/hook_timed.words.json')); hmeta = json.load(open('vo/hook_timed.meta.json'))
body = json.load(open('script/body.json'))
words = [dict(x) for x in hook]
t = hmeta['duration'] - 1.6  # hook ends with its title shot; parts start after it
parts, inserts, place = [], [], [('hook', 0.0)]
INS = {'p9_05': ('ZyUfv8U0JV4', 49.0, 51.0, 'It was nothing, nothing, nothing left.'),
       'p9_06': ('ZyUfv8U0JV4', 82.3, 88.7, "I'm 82, and it's... why, why rebuild? It probably will take at least two years.")}
for n, c in enumerate(body):
    W = json.load(open(f"vo/{c['ch']}.words.json"))
    title_at = t; vo = t + (TITLE if c['title'] else 0.6)
    shift = 0.0; out = []
    for i, x in enumerate(W):
        out.append(dict(x, s=round(vo + x['s'] + shift, 3), e=round(vo + x['e'] + shift, 3)))
        last_of_line = i + 1 == len(W) or W[i + 1]['line'] != x['line']
        if last_of_line and x['line'] in INS:
            src, a, b, txt = INS[x['line']]; at = vo + x['e'] + shift + 0.5
            inserts.append({'at': round(at, 3), 'dur': round(b - a, 3), 'src': src, 'from': a, 'text': txt, 'after': x['line']})
            shift += (b - a) + 1.0
    words += out
    dur = W[-1]['e'] + shift
    parts.append({'id': c['ch'], 'n': n + 1, 'title': c['title'], 'title_at': round(title_at, 3), 'vo': round(vo, 3), 'end': round(vo + dur + TAIL, 3), 'shift_lines': [k for k in INS if k.startswith(c['ch'] + '_')]})
    place.append((c['ch'], vo))
    t = vo + dur + TAIL
DUR = round(t + END, 3)
lines = {}
for x in words:
    L = lines.setdefault(x['line'], {'s': x['s'], 'e': x['e']}); L['e'] = x['e']
json.dump({'duration': DUR, 'hook_end': hmeta['duration'] - 1.6, 'parts': parts, 'inserts': inserts, 'words': words, 'lines': lines, 'end_at': round(t, 3)}, open('src/data/full.json', 'w'))
# audio
N = int(DUR * SR); buf = np.zeros(N, np.float32)
def load(p, a=None, b=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(a), '-t', str(b - a)] if a is not None else []) + ['-i', p, '-ac', '1', '-ar', str(SR), '/tmp/claude-0/seg.wav']
    subprocess.run(cmd, check=True)
    with wave.open('/tmp/claude-0/seg.wav') as f: return np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
def put(a, at):
    i = int(round(at * SR)); n = min(len(a), N - i); buf[i:i + n] += a[:n]
# hook audio with its gap (rebuild the same way as mix_demo)
hv = load('vo/hook.mp3'); ci = int(hmeta['gap_at'] * SR); hv = np.concatenate([hv[:ci], np.zeros(int(hmeta['gap'] * SR), np.float32), hv[ci:]]); put(hv, 0)
for c in body:
    W = json.load(open(f"vo/{c['ch']}.words.json")); v = load(f"vo/{c['ch']}.mp3")
    P = next(p for p in parts if p['id'] == c['ch'])
    ins = [x for x in inserts if x['after'].startswith(c['ch'] + '_')]
    if not ins: put(v, P['vo']); continue
    # split the chapter audio at each insert point
    cur = 0.0; shift = 0.0
    for x in ins:
        cut = max(w['e'] for w in W if w['line'] == x['after']) + 0.25
        put(v[int(cur * SR):int(cut * SR)], P['vo'] + cur + shift)
        shift += x['dur'] + 1.0; cur = cut
    put(v[int(cur * SR):], P['vo'] + cur + shift)
fema = {}
for x in inserts:
    a = load(f"/tmp/claude-0/lah/fema/{x['src']}.mp4", x['from'], x['from'] + x['dur']); put(a * 1.0, x['at'])
with wave.open('vo/full_narration.wav', 'w') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes())
print('duration', DUR, 'parts', [(p['id'], p['title_at']) for p in parts], 'inserts', [(x['at'], x['dur']) for x in inserts])
