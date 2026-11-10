# Free local TTS (Kokoro, am_michael) for editing-style test A; then word timings with faster-whisper. Usage: python3 voice.py
import soundfile as sf, numpy as np, json, os
from kokoro_onnx import Kokoro
KD = '/tmp/claude-0/-home-user-sofia-studio/176d0eba-3377-5cf0-9724-ed52b2b7b1d7/scratchpad/kokoro'
D = os.path.dirname(os.path.abspath(__file__))
k = Kokoro(f'{KD}/kokoro-v1.0.onnx', f'{KD}/voices-v1.0.bin')
lines = [l.strip() for l in open(f'{D}/script.txt') if l.strip()]
out, starts, sr = [], [], 24000
t = 0.25; out.append(np.zeros(int(0.25 * sr), np.float32))
for l in lines:
    s, sr = k.create(l, voice='am_michael', speed=1.08, lang='en-us')
    # trim edge silence
    nz = np.where(np.abs(s) > 0.01)[0]; s = s[max(0, nz[0] - 600): nz[-1] + 1200]
    starts.append([t, t + len(s) / sr, l]); out.append(s.astype(np.float32)); t += len(s) / sr
    gap = 0.26; out.append(np.zeros(int(gap * sr), np.float32)); t += gap
v = np.concatenate(out); sf.write(f'{D}/vo.wav', v, sr)
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8')
from scipy.signal import resample_poly
segs, _ = m.transcribe(resample_poly(v, 2, 3).astype(np.float32), word_timestamps=True)
words = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]
json.dump({'lines': starts, 'words': words, 'T': t}, open(f'{D}/timing.json', 'w'), indent=0)
print('total', round(t, 2)); print(' '.join(w[0] for w in words))
