# Word timings for the kinetic captions: faster-whisper on the trimmed clips out/v_<id>.wav (run prep.py first). Writes voice/words.json {id: [[start, end, word], ...]}
import json, os, subprocess, numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); S = json.load(open(os.path.join(D, 'script.json'))); m = WhisperModel('small', device='cpu', compute_type='int8'); out = {}
for k, v, text in S['lines']:
    f = os.path.join(D, '..', 'out', f'v_{k}.wav')
    if not os.path.exists(f): continue
    a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.int16).astype(np.float32) / 32768
    lang = 'ru' if v == 'z' or 'Угу' in text else 'en'
    segs, _ = m.transcribe(a, language=lang, beam_size=5, word_timestamps=True, initial_prompt=text)
    out[k] = [[round(w.start, 2), round(w.end, 2), w.word.strip()] for s in segs for w in s.words]
    print(k, len(text.split()), len(out[k]), ' '.join(w[2] for w in out[k]), flush=True)
json.dump(out, open(os.path.join(D, 'words.json'), 'w'), ensure_ascii=False)
