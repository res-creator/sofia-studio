# Франсе v3 («illustrated lyrics»): word timings for song 56.0–78.0 s (video t=0 = song 56.0 s), refined on the vocal band,
# + Zhanna's light lip-sync envelope. The song is read from the scratchpad only to measure; nothing of it is stored but numbers.
import json, numpy as np, soundfile as sf, os
from scipy.signal import butter, sosfiltfilt
SCR = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/franse'
a, sr = sf.read(SCR + '/clip15.wav'); mid = a.mean(1); side = (a[:, 0] - a[:, 1]) / 2   # the 14.94 s «saya kim» fragment, t=0 = its start
voc = sosfiltfilt(butter(4, [250, 4000], 'band', fs=sr, output='sos'), mid - .6 * side)
FPS = 30; LEN = 14.94; n = int(LEN * FPS) + 1; w = int(.04 * sr)
def rms(i): c = int((i + .5) * sr / FPS); s = voc[max(0, c - w // 2): c + w // 2]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-7) if len(s) else -140
db = np.array([rms(i) for i in range(n)]); dbs = np.convolve(db, np.ones(3) / 3, 'same')
# lines: [start, end, [[word, t0, t1, key]]] — whisper (prompted pass for 1-4 & 8, unprompted pass +0.2 s for 5-7); «?» = unclear word
LINES = [   # whisper (prompted, vocal band) + energy onsets; the choir intro (0–3 s) and the beat drop at 4.0 s carry no lyrics
 [['На', 4.10, 4.55], ['мне', 4.62, 4.86], ['французский', 4.88, 5.66], ['ле', 5.70, 5.84], ['ПАРФЮМ', 5.86, 7.2, 1]],
 [['конкретно', 7.68, 8.3], ['Жан-Поль', 8.32, 8.64], ['ГОТЬЕ', 8.66, 9.8, 1]],
 [['На', 10.1, 10.5], ['ней', 10.52, 10.66], ['французское', 10.68, 11.38], ['Д**ЬМО', 11.4, 12.0, 1]],
 [['конкретно', 13.1, 13.92], ['Коко', 13.94, 14.14], ['ШАНЕЛЬ', 14.16, 14.75, 1]]]
# refine: snap each word start to the strongest vocal onset (rise in dB) within ±0.12 s
rise = np.r_[0, np.diff(dbs)]
for L in LINES:
    prevStart = -1
    for wd in L:
        i0 = int(wd[1] * FPS); lo, hi = max(1, i0 - 4, int((prevStart + .1) * FPS) + 1), min(n - 1, i0 + 4)
        if hi >= lo:
            j = lo + int(np.argmax(rise[lo:hi + 1]))
            if rise[j] > 2.0: wd[1] = round(j / FPS, 3)
        wd[1] = max(wd[1], round(prevStart + .1, 3)); prevStart = wd[1]
    for k in range(len(L) - 1): L[k][2] = max(L[k][2], L[k + 1][1]) if L[k][2] < L[k + 1][1] - .25 else L[k + 1][1]
# light lip-sync: one opening per vowel, distributed on vocal peaks inside each word
VOW = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ'; sing = np.zeros(n); syl = []
for L in LINES:
    for wd in L:
        word, s0, e0 = wd[0], wd[1], wd[2]; vs = [c for c in word.lower() if c in VOW.lower()] or ['а']
        if word == '(?)': vs = ['а', 'о']
        i0, i1 = int(s0 * FPS), max(int(s0 * FPS) + 1, int(e0 * FPS)); seg = dbs[i0:i1 + 1]; k = len(vs); pk = []
        for j in list(np.argsort(-seg)):
            if all(abs(j - q) >= 3 for q in pk): pk.append(j)
            if len(pk) == k: break
        pk = sorted(pk) if len(pk) == k else [int(round((m + .5) * len(seg) / k)) for m in range(k)]
        syl += [[(i0 + j) / FPS, v] for v, j in zip(vs, pk)]
lo, hi = np.percentile(db, 20), np.percentile(db, 98)
for idx, (tp, v) in enumerate(syl):
    prev = syl[idx - 1][0] if idx else tp - .4; nxt = syl[idx + 1][0] if idx + 1 < len(syl) else tp + .4
    dl, dr = min(.16, (tp - prev) * .5), min(.2, (nxt - tp) * .5); amp = ((.55 if v in 'аоэу' else .4) + .3 * np.clip((dbs[int(tp * FPS)] - lo) / (hi - lo), 0, 1)) * .85   # «light» lip-sync
    for i in range(max(0, int((tp - dl) * FPS)), min(n, int((tp + dr) * FPS) + 1)):
        u = i / FPS - tp; d = dl if u < 0 else dr; x = .5 + .5 * np.cos(np.pi * min(1, abs(u) / max(d, 1e-3))); sing[i] = max(sing[i], amp * x)
SCENES = [[0, 0], [4.0, 1], [7.45, 2], [10.0, 3], [13.7, 4]]   # 0 hook (choir intro), 1 ПАРФЮМ from the beat drop, 2 ГОТЬЕ, 3 hallway Д**ЬМО, 4 bag close-up on «Коко Шанель»
json.dump({'LEN': LEN, 'LINES': LINES, 'SCENES': SCENES, 'env': [round(float(v), 3) for v in sing]}, open('timeline_15.json', 'w'), ensure_ascii=False)
with open('LYRICS_15S.md', 'w') as f:
    f.write('# Франсе 15 с (версия saya kim) — строчки и тайминги\n\nВремя в секундах от начала звука (= начала видео). Хор 0–3 с, тишина, бит падает на 4,0 с.\n\n')
    for i, L in enumerate(LINES):
        t0, t1 = L[0][1], L[-1][2]; f.write(f"{i + 1}. **{t0:.2f}–{t1:.2f}** — «{' '.join(w[0] for w in L)}»\n")
        f.write('   - слова: ' + ', '.join(f"{w[0]} {w[1]:.2f}" for w in L) + '\n')
    f.write('\nВсе четыре строчки разобраны уверенно: whisper с подсказкой дал ровно эти слова, без подсказки — те же слова с искажениями («лепарфлон», «кокошаный»). Мат на экране закрыт звёздочками: «Д**ЬМО».\n')
for i, L in enumerate(LINES): print(i + 1, L[0][1], L[-1][2], ' '.join(w[0] for w in L))
