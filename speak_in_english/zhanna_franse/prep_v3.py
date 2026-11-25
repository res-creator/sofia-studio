# Франсе v3 («illustrated lyrics»): word timings for song 56.0–78.0 s (video t=0 = song 56.0 s), refined on the vocal band,
# + Zhanna's light lip-sync envelope. The song is read from the scratchpad only to measure; nothing of it is stored but numbers.
import json, numpy as np, soundfile as sf, os
from scipy.signal import butter, sosfiltfilt
SCR = '/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad/franse'
a, sr = sf.read(SCR + '/frag3.wav'); mid = a.mean(1); side = (a[:, 0] - a[:, 1]) / 2
voc = sosfiltfilt(butter(4, [250, 4000], 'band', fs=sr, output='sos'), mid - .6 * side)
FPS = 30; LEN = 22.5; n = int(LEN * FPS) + 1; w = int(.04 * sr)
def rms(i): c = int((i + .5) * sr / FPS); s = voc[max(0, c - w // 2): c + w // 2]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-7) if len(s) else -140
db = np.array([rms(i) for i in range(n)]); dbs = np.convolve(db, np.ones(3) / 3, 'same')
# lines: [start, end, [[word, t0, t1, key]]] — whisper (prompted pass for 1-4 & 8, unprompted pass +0.2 s for 5-7); «?» = unclear word
LINES = [
 [['На', .68, .74], ['мне', .74, .88], ['французский', .88, 1.54], ['ле', 1.54, 1.66], ['ПАРФЮМ', 1.66, 3.2, 1]],
 [['конкретно', 3.28, 4.1], ['Жан-Поль', 4.1, 4.46], ['ГОТЬЕ', 4.46, 5.7, 1]],
 [['На', 5.88, 6.34], ['ней', 6.34, 6.48], ['французское', 6.48, 7.22], ['Д**ЬМО', 7.22, 8.38, 1]],
 [['конкретно', 9.16, 9.74], ['Коко', 9.74, 9.94], ['ШАНЕЛЬ', 9.94, 10.6, 1]],
 [['Моя', 11.58, 11.74], ['(?)', 11.74, 12.16], ['походка', 12.16, 12.72], ['оставляет', 12.72, 13.3], ['СЛЕД', 13.3, 13.52, 1]],
 [['Они', 14.3, 14.52], ['хотят', 14.52, 14.94], ['КАК', 14.94, 15.12, 1], ['Я,', 15.12, 15.34, 1], ['они', 15.48, 15.6], ['хотят', 15.6, 16.0], ['(?)', 16.0, 16.46]],
 [['Меня', 17.04, 17.3], ['пугают', 17.3, 17.88], ['мысли', 17.88, 18.24], ['о', 18.24, 18.4], ['ТЮРЬМЕ', 18.4, 18.92, 1]],
 [['А', 20.3, 20.54], ['я', 20.54, 20.68], ['на', 20.68, 20.82], ['своей', 20.82, 21.1], ['ВОЛНЕ', 21.1, 21.64, 1]]]
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
SCENES = [[L[0][1] - (.68 if i == 0 else 0), i + 1] for i, L in enumerate(LINES)]   # each scene starts on its line; scene 1 at t=0
json.dump({'LEN': LEN, 'LINES': LINES, 'SCENES': SCENES, 'env': [round(float(v), 3) for v in sing]}, open('timeline_v3.json', 'w'), ensure_ascii=False)
with open('LYRICS_V3.md', 'w') as f:
    f.write('# Франсе v3 — строчки и тайминги (видео t=0 = 0:56.0 трека)\n\nВремя в секундах от начала видео. В скобках — время в треке. «(?)» — слово, которое не удалось разобрать уверенно: проверь, пожалуйста.\n\n')
    for i, L in enumerate(LINES):
        t0, t1 = L[0][1], L[-1][2]; f.write(f"{i + 1}. **{t0:.2f}–{t1:.2f}** ({56 + t0:.1f}–{56 + t1:.1f}) — «{' '.join(w[0] for w in L)}»\n")
        f.write('   - слова: ' + ', '.join(f"{w[0]} {w[1]:.2f}" for w in L) + '\n')
    f.write('\nНеуверенные места:\n- строка 5: между «Моя» и «походка» есть ещё слово, whisper слышит «У АСО» / не слышит вовсе;\n- строка 6: конец «они хотят …» — whisper слышит «навек» / «на вязь»;\n- строка 3: в песне мат, на экране он закрыт звёздочками: «Д**ЬМО».\n')
for i, L in enumerate(LINES): print(i + 1, L[0][1], L[-1][2], ' '.join(w[0] for w in L))
