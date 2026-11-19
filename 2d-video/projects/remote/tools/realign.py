# Точные тайминги слов: Whisper по каждому абзацу отдельно (границы абзацев известны из segments_el.json),
# слова сценария сопоставляются с распознанными (difflib), несопоставленные — интерполяция внутри абзаца.
# Пишет timeline/words.json в формате transcribe.py.
import difflib, json, os, re, subprocess
import numpy as np
from faster_whisper import WhisperModel
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEG = json.load(open(os.path.join(P, '../../../ru_geo/remote/vo/segments_el.json')))
VO = os.path.join(P, 'input/voiceover.mp3')
norm = lambda s: re.sub(r'[^0-9a-zа-я]', '', s.lower().replace('ё', 'е'))
m = WhisperModel('small', compute_type='int8')
audio = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'quiet', '-i', VO, '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout, np.float32)
out = []
for sg in SEG:
    if sg['kind'] != 'voice': continue
    t0, t1 = sg['t'] - 0.2, sg['t'] + sg['dur'] + 0.2
    chunk = audio[int(max(0, t0) * 16000): int(t1 * 16000)]
    segs, _ = m.transcribe(chunk, language='ru', word_timestamps=True)
    rec = [(w.word.strip(), max(0, t0) + w.start, max(0, t0) + w.end) for s in segs for w in s.words]
    sw = sg['text'].split(); a = [norm(x) for x in sw]; b = [norm(x[0]) for x in rec]
    tim = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size): tim[blk.a + k] = (rec[blk.b + k][1], rec[blk.b + k][2])
    # только монотонные совпадения внутри окна
    last = -1
    for k in range(len(tim)):
        if tim[k] is None: continue
        if tim[k][0] < last or not (t0 - 0.1 <= tim[k][0] <= t1): tim[k] = None
        else: last = tim[k][0]
    cov = sum(x is not None for x in tim) / len(tim)
    if cov < 0.85: print(f"\n[low cov {cov:.2f}] {sg['text'][:60]} || REC: {' '.join(x[0] for x in rec)[:200]}")
    if cov < 0.5:   # распознавание не сошлось — по длине слов внутри абзаца
        L = [len(x) + 1 for x in sw]; tot = sum(L); acc = 0; tim = []
        for l in L: tim.append((sg['t'] + sg['dur'] * acc / tot, sg['t'] + sg['dur'] * (acc + l) / tot)); acc += l
        print(f"[fallback {sg['text'][:20]} cov={cov:.2f}]", end=' ')
    # якоря по краям абзаца
    if tim[0] is None: tim[0] = (sg['t'], sg['t'] + 0.3)
    if tim[-1] is None: tim[-1] = (sg['t'] + sg['dur'] - 0.4, sg['t'] + sg['dur'])
    i = 0
    while i < len(tim):
        if tim[i] is None:
            j = i
            while tim[j] is None: j += 1
            a0, a1 = tim[i - 1][1], tim[j][0]; n = j - i
            for k in range(n): tim[i + k] = (a0 + (a1 - a0) * k / n, a0 + (a1 - a0) * (k + 1) / n)
            i = j
        i += 1
    for w, (s, e) in zip(sw, tim): out.append(dict(word=w, start=round(s, 2), end=round(e, 2)))
    print(len(out), end=' ', flush=True)
json.dump(dict(source='realign per paragraph', words=out), open(os.path.join(P, 'timeline/words.json'), 'w'), ensure_ascii=False)
print('\nwords', len(out))
