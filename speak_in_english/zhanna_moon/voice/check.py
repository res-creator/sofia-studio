# faster-whisper check of every take: python3 voice/check.py [ids]
import json, sys, subprocess, numpy as np
from faster_whisper import WhisperModel
S = json.load(open('voice/script.json')); m = WhisperModel('small', device='cpu', compute_type='int8')
for k, v, text in S['lines']:
    if sys.argv[1:] and k not in sys.argv[1:]: continue
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'voice/{k}.mp3', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    seg, _ = m.transcribe(a, language='ru', beam_size=5); print(k, f'{len(a)/16000:.2f}s', '|', ' '.join(s.text.strip() for s in seg), '|| want:', text)
