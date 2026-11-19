# Проверка озвучки: длительность, длинные паузы, расшифровка faster_whisper medium и сравнение с текстом (доля совпавших слов).
import json, os, re, subprocess, sys, difflib
import numpy as np
from faster_whisper import WhisperModel
D = os.path.dirname(os.path.abspath(__file__)); L = json.load(open(f'{D}/lines.json'))
m = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=4)
norm = lambda s: re.sub(r'[^а-яёa-z0-9 ]', ' ', re.sub(r'\[[a-z ]+\]', '', s.lower()).replace('ё', 'е')).split()
rep = []
for it in L:
    p = f'{D}/{it["id"]}.mp3'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ar', '16000', '-ac', '1', '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32); dur = len(a) / 16000
    segs, _ = m.transcribe(a, language='ru'); hyp = ' '.join(s.text for s in segs)
    r = difflib.SequenceMatcher(None, norm(it['text']), norm(hyp)).ratio()
    it['dur'] = round(dur, 2); it['asr'] = hyp.strip(); it['match'] = round(r, 3)
    flag = '!!' if r < 0.80 else ''
    print(it['id'], round(dur, 1), round(r, 2), flag, flush=True)
json.dump(L, open(f'{D}/lines.json', 'w'), ensure_ascii=False, indent=1)
