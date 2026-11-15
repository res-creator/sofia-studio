"""Word timings + STT check per take: python3 stt_words.py -> words.json, stt_report.txt"""
import json, glob, os, re, difflib, csv
from faster_whisper import WhisperModel
import soundfile as sf, numpy as np
from scipy.signal import resample_poly
m = WhisperModel('small.en', device='cpu', compute_type='int8')
txt = {r['id']: r['english_narration'] for r in csv.DictReader(open('SCRIPT_EN.csv', encoding='utf-8'))}
out = {}; rep = []
norm = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower()).split()
for f in sorted(glob.glob('voice/*.wav')):
    pid = os.path.basename(f)[:-4]
    x, sr = sf.read(f, dtype='float32'); x = x if x.ndim == 1 else x.mean(1); x = resample_poly(x, 16000, sr).astype(np.float32)
    segs, _ = m.transcribe(x, word_timestamps=True, language='en', beam_size=5)
    ws = [dict(w=w.word.strip(), s=round(w.start, 2), e=round(w.end, 2)) for s in segs for w in s.words]
    out[pid] = ws
    a, b = norm(txt[pid]), norm(' '.join(w['w'] for w in ws))
    r = difflib.SequenceMatcher(None, a, b).ratio()
    diff = [f'{op}: {" ".join(a[i1:i2])} -> {" ".join(b[j1:j2])}' for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes() if op != 'equal']
    rep.append(f'{pid} {r:.3f} ' + ' | '.join(diff)); print(rep[-1], flush=True)
json.dump(out, open('words.json', 'w'))
open('stt_report.txt', 'w').write('\n'.join(rep))
