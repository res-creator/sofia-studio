# Episode 14 (copied from subscription_ep13). Speech-to-text check of the final video with local Whisper (faster-whisper small.en): the transcript must match script.json
# (punctuation-insensitive). Usage: python3 -I stt_check.py video.mp4
import json, os, re, subprocess, sys, difflib, wave
import numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); V = sys.argv[1]; tmp = f'{D}/_stt.wav'
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', V, '-vn', '-ac', '1', '-ar', '16000', tmp], check=True)
w = wave.open(tmp); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768; w.close(); os.remove(tmp)
got = ' '.join(s.text for s in WhisperModel('small.en', device='cpu', compute_type='int8').transcribe(a, beam_size=5)[0])
NUM = [('$1,400', 'fourteen hundred dollars'), ('1,400', 'fourteen hundred'), ('8-day', 'eight-day'), ('8 day', 'eight day')]
def norm(s):
    s = s.lower().replace('’', "'")
    for x, y in NUM: s = s.replace(x, y)
    return re.sub(r'[^a-z0-9 ]', '', s.replace('-', ' ').replace('—', ' ')).split()
want = norm(' '.join(l['text'] for l in json.load(open(f'{D}/script.json')))); have = norm(got)
sm = difflib.SequenceMatcher(None, want, have, autojunk=False); print('match ratio', round(sm.ratio(), 3))
for op, a0, a1, b0, b1 in sm.get_opcodes():
    if op != 'equal': print(op, ' '.join(want[a0:a1]), '->', ' '.join(have[b0:b1]))
print('TRANSCRIPT:', got)
