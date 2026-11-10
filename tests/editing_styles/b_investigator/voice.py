# Free local voice (Kokoro, no ElevenLabs) → vo.wav (24 kHz) + lines.json (line start/end) + words.json (faster-whisper word timings).
import json, numpy as np, soundfile as sf, sys
from kokoro_onnx import Kokoro
K = '/tmp/claude-0/-home-user-sofia-studio/176d0eba-3377-5cf0-9724-ed52b2b7b1d7/scratchpad/kokoro/'
k = Kokoro(K + 'kokoro-v1.0.onnx', K + 'voices-v1.0.bin'); voice = sys.argv[1] if len(sys.argv) > 1 else 'am_onyx'
lines = [l.strip() for l in open('script.txt') if l.strip()]
START, GAPS = 0.35, [0.45, 0.35, 0.4, 0.4, 0.45, 0.35, 0.6, 0.35, 0.45]
out, t, info = [], START, []
out.append(np.zeros(int(START * 24000), np.float32))
for i, l in enumerate(lines):
    s, sr = k.create(l, voice=voice, speed=1.07, lang='en-us'); s = np.asarray(s, np.float32)
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 200): nz[-1] + 1200]
    info.append({'i': i, 'text': l, 'a': t, 'b': t + len(s) / sr}); out.append(s); t += len(s) / sr
    g = GAPS[i] if i < len(GAPS) else 0; out.append(np.zeros(int(g * sr), np.float32)); t += g
a = np.concatenate(out); sf.write('vo.wav', a, 24000); json.dump(info, open('lines.json', 'w'), indent=1)
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8'); from scipy.signal import resample_poly
x16 = resample_poly(a, 2, 3).astype(np.float32)
segs, _ = m.transcribe(x16, word_timestamps=True)
words = [{'w': w.word.strip(), 'a': w.start, 'b': w.end} for s in segs for w in s.words]
json.dump(words, open('words.json', 'w'), indent=0); print('voice', voice, 'len', round(t, 2)); print(' '.join(w['w'] for w in words))
