# Word timings for kinetic captions: faster-whisper (word_timestamps) on the trimmed, sped-up clips out/v_<id>.wav (made by prep.py).
# Writes voice/words.json {id: [[start, end, word], ...]} (seconds from the clip start). Run after prep.py, then run prep.py again.
import json, os, subprocess, numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json')))
m = WhisperModel('small', device='cpu', compute_type='int8'); out = {}
def aud(f): return np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
for k, who, text in S['lines']:
    f = os.path.join(D, '..', 'out', f'v_{k}.wav')
    segs, _ = m.transcribe(aud(f), language='en' if who == 'k' else 'ru', word_timestamps=True, initial_prompt=text)
    out[k] = [[round(w.start, 3), round(w.end, 3), w.word.strip()] for s in segs for w in s.words]
    print(k, ' '.join(w[2] for w in out[k]))
json.dump(out, open(os.path.join(D, 'words.json'), 'w'), ensure_ascii=False)
