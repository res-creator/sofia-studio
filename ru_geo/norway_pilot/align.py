# Тайминги склеек: распознаём озвучку (faster-whisper, слова с таймкодами) и сопоставляем со сценарием.
# Кадр [[ключ]] начинается в момент первого слова после метки. Пишет vo/<абзац>.json и печатает расхождения текста.
import json, re, os, sys, subprocess, difflib
import numpy as np
from faster_whisper import WhisperModel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import PARAS
D = os.path.dirname(os.path.abspath(__file__))
norm = lambda w: re.sub(r'[^а-яa-z0-9]', '', w.lower().replace('ё', 'е'))
def load(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
m = WhisperModel(os.environ.get('WHISPER', 'small'), device='cpu', compute_type='int8')
for name, raw in PARAS:
    words, marks = [], {}
    for part in re.split(r'(\[\[\w+\]\])', raw):
        k = re.fullmatch(r'\[\[(\w+)\]\]', part)
        if k: marks[k.group(1)] = len(words)
        else: words += [w for w in part.split() if norm(w)]
    a = load(f'{D}/vo/{name}.mp3')
    segs, _ = m.transcribe(a, language='ru', word_timestamps=True, condition_on_previous_text=False)
    hw = [w for s in segs for w in s.words]
    sm = difflib.SequenceMatcher(None, [norm(w) for w in words], [norm(w.word) for w in hw], autojunk=False)
    idx = {}
    for i, j, n in sm.get_matching_blocks():
        for t in range(n): idx[i + t] = j + t
    def t_of(wi):
        for k in range(wi, len(words)):          # ближайшее распознанное слово справа
            if k in idx: return hw[idx[k]].start - (0.0 if k == wi else 0.25)
        return hw[-1].end
    cuts = {k: round(max(0.0, t_of(wi) - 0.08), 3) for k, wi in marks.items()}
    cuts[list(marks)[0]] = 0.0
    diffs = [(op, ' '.join(words[i1:i2]), ''.join(w.word for w in hw[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
    json.dump({"cuts": cuts, "speech_start": hw[0].start, "speech_end": hw[-1].end, "dur": len(a) / 16000,
               "words": [[w.word, w.start, w.end] for w in hw]}, open(f'{D}/vo/{name}.json', 'w'), ensure_ascii=False)
    print(f'{name}: {len(a)/16000:.1f}s speech {hw[0].start:.2f}-{hw[-1].end:.2f}', cuts)
    for d in diffs: print('   DIFF', d)
