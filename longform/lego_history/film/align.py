# Word timings for the Fish Audio voice: faster-whisper word timestamps -> mapped onto the SCRIPT text (difflib) ->
# chapters/<ch>/vo/<id>.align.json in the format figmakit/lib/scene.js S.words() reads (characters + character_start_times_seconds).
# Then lays out each chapter: cues.json (line start times, T), vo.wav (44.1 kHz mono) and seg.srt.
# Re-run after replacing any voice file: python3 film/align.py   (this is the only step needed to swap the voice; then re-render)
import json, os, glob, re, subprocess, difflib, wave, numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SR = 44100
CARD = 3.4                                                     # chapter title card before the first line (not in the cold open)
EXTRA = {'h1': 0.4, 'h2': 0.9, 'h3': 0.6, 'h4': 0.9, 'c1': 0.3, 'c2': 0.6, 'c3': 0.5, 'c4': 0.9, 'c5': 0.8, 'c6': 1.4, 'g1': 0.4, 'g2': 0.5, 'g3': 0.6, 'g4': 1.4,
         'b1': 0.3, 'b2': 0.5, 'b3': 0.7, 'b4': 0.6, 'b5': 0.4, 'b6': 0.8, 'b7': 1.4, 'b8': 0.8, 'b9': 1.5, 'y1': 1.4, 'y2': 0.6, 'y3': 0.8, 'y4': 0.8, 'y5': 0.9,
         'y6': 2.2, 'o1': 1.0, 'o2': 0.5, 'o3': 0.9, 'o4': 0.6, 'o5': 0.4, 'o6': 0.4, 'o7': 0.7, 'o8': 1.8, 'm1': 0.4, 'm2': 0.7, 'm3': 1.6,
         'a1': 0.4, 'a2': 1.0, 'a3': 1.0, 'a4': 1.2, 'a5': 2.2, 'a6': 3.6}   # visual "breaths" on story turns (music/sfx carry them)
GAP = 0.5
model = WhisperModel('small.en', device='cpu', compute_type='int8')
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
def pcm(f, sr): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
NUM = {'2004': 'two thousand four', '1932': 'nineteen thirty two', '1947': 'nineteen forty seven', '1949': 'nineteen forty nine', '1954': 'nineteen fifty four', '1958': 'nineteen fifty eight',
       '1978': 'nineteen seventy eight', '1993': 'nineteen ninety three', '1998': 'nineteen ninety eight', '1999': 'nineteen ninety nine', '2001': 'two thousand one', '2002': 'two thousand two',
       '2003': 'two thousand three', '2005': 'two thousand five', '2006': 'two thousand six', '2008': 'two thousand eight', '2014': 'twenty fourteen', '1968': 'nineteen sixty eight'}
def srt_t(t): ms = int(round(t * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
for ch in sorted(glob.glob(f'{D}/chapters/*/')):
    lines = json.load(open(f'{ch}script.json')); first = os.path.basename(ch.rstrip('/')) == 'c0_hook'
    t = 0.4 if first else CARD; cues = []; vo = []; srt = []
    for L in lines:
        mp3 = f"{ch}vo/{L['id']}.mp3"; a = pcm(mp3, 16000); dur = len(a) / 16000
        segs, _ = model.transcribe(a, language='en', word_timestamps=True)
        ww = [w for s in segs for w in s.words]
        # whisper tokens (numbers spelled out) vs script tokens
        wt = []
        for w in ww:
            for p in (NUM.get(norm(w.word), norm(w.word))).split(): wt.append((p, w.start, w.end))
        words = L['text'].split(); st = []
        for w in words:
            n = norm(w); st.append(NUM.get(n, n).split()[0] if n else '')
        sm = difflib.SequenceMatcher(None, st, [x[0] for x in wt], autojunk=False); tm = [None] * len(words)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size): tm[blk.a + k] = wt[blk.b + k][1]
        known = [i for i, v in enumerate(tm) if v is not None]
        for i in range(len(words)):
            if tm[i] is None:
                lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
                if lo is None and hi is None: tm[i] = dur * i / len(words)
                elif lo is None: tm[i] = max(0, tm[hi] - 0.3 * (hi - i))
                elif hi is None: tm[i] = min(dur, tm[lo] + 0.3 * (i - lo))
                else: tm[i] = tm[lo] + (tm[hi] - tm[lo]) * (i - lo) / (hi - lo)
        chars, cst = [], []
        for i, w in enumerate(words):
            if i: chars.append(' '); cst.append(tm[i])
            for c in w: chars.append(c); cst.append(tm[i])
        json.dump({'characters': chars, 'character_start_times_seconds': [round(x, 3) for x in cst], 'duration': round(dur, 3), 'matched': len(known), 'words': len(words)},
                  open(f"{ch}vo/{L['id']}.align.json", 'w'))
        end = ww[-1].end if ww else dur
        cues.append([L['id'], round(t, 3)])
        # subtitles: split into sentences, each timed from its first word to the next sentence start (<= 2 lines of 42)
        sents, cur = [], []
        for i, w in enumerate(words):
            cur.append(i)
            if re.search(r'[.!?]["\']?$', w) or (len(' '.join(words[j] for j in cur)) > 70 and re.search(r'[,:;]$', w)): sents.append(cur); cur = []
        if cur: sents.append(cur)
        for k, s in enumerate(sents):
            t0 = t + tm[s[0]]; t1 = t + (tm[sents[k + 1][0]] - 0.05 if k + 1 < len(sents) else end + 0.25)
            srt.append((t0, t1, ' '.join(words[j] for j in s)))
        vo.append((t, mp3)); t += end + GAP + EXTRA.get(L['id'], 0.0)
        print(L['id'], f'{dur:.1f}s', f"matched {len(known)}/{len(words)}", flush=True)
    T = round(t + 0.4, 2)
    # vo.wav
    N = int(T * SR); buf = np.zeros(N, np.float32)
    for t0, f in vo: x = pcm(f, SR); i = int(t0 * SR); buf[i:i + len(x)] += x[:N - i]
    w = wave.open(f'{ch}vo.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(buf, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    old = json.load(open(f'{ch}cues.json')) if os.path.exists(f'{ch}cues.json') else {}
    new = {'T': T, 'vo': cues, 'card': not first}
    for k in ('tail', 'sfx', 'music'):
        if k in old: new[k] = old[k]
    json.dump(new, open(f'{ch}cues.json', 'w'), indent=1)
    open(f'{ch}seg.srt', 'w').write('\n'.join(f'{i + 1}\n{srt_t(a)} --> {srt_t(b)}\n{tx}\n' for i, (a, b, tx) in enumerate(srt)))
    print('==', os.path.basename(ch.rstrip('/')), 'T', T)
