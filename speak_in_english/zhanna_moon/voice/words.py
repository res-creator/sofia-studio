# word timings of the trimmed, sped-up takes (out/v_*.wav), to align the card flips
import sys, numpy as np, soundfile as sf, json
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8'); R = {}
for k in sys.argv[1:]:
    a, sr = sf.read(f'out/v_{k}.wav'); a = a.astype(np.float32); idx = np.arange(0, len(a), sr / 16000).astype(int); a = a[idx]
    seg, _ = m.transcribe(a, language='ru', word_timestamps=True); W = [(round(w.start, 2), w.word.strip()) for s in seg for w in s.words]; R[k] = W; print(k, W)
json.dump(R, open('out/words.json', 'w'), ensure_ascii=False)
