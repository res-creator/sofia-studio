# English SRT for the full film: narration words (vo/*.words.json) + archival interview words (USGS film STT, scribe_v1).
import json
T = json.load(open('src/data/film.json'))
CC = [w for w in json.load(open('research/corecast_stt.json'))['words'] if w['type'] == 'word']
SEQ = json.load(open('script/film.json'))['seq']
words = []  # (text, start, end, speaker)
for it in SEQ:
    if it[0] == 'vo':
        for w in T['lines'][it[1]]['words']: words.append((w['w'], w['s'], w['e'], 'N'))
    elif it[0] == 'bite':
        b = T['bites'][it[1]]; a0 = it[2]
        for w in CC:
            if it[2] <= w['start'] < it[3]:
                words.append((w['text'], b['at'] + w['start'] - a0, b['at'] + w['end'] - a0, it[1]))
# merge spoken numbers/dates into digits so they never split across cues
PH = [('nineteen eighty-two', '1982'), ('nineteen ninety-one', '1991'), ('nineteen eighty', '1980'), ('eighteen fifty-seven', '1857'),
      ('May seventeenth', 'May 17'), ('May eighteenth', 'May 18'), ('March twentieth', 'March 20'), ('March twenty-seventh', 'March 27'), ('April thirtieth', 'April 30'),
      ('eight thirty-two and eleven seconds', '8:32:11'), ('eight thirty-two', '8:32'), ('six fifty-three', '6:53'), ('five point seven', '5.7'), ('five-point-one', '5.1'),
      ('four hundred and fifty', '450'), ('two hundred and fifty', '250'), ('a hundred and thirty', '130'), ('two hundred', '200'), ('thirteen hundred', '1,300'),
      ('twenty thousand', '20,000'), ('five thousand', '5,000'), ('sixty-one', '61'), ('Fifty-seven', '57'), ('eighty-three-year-old', '83-year-old'), ('magnitude-four', 'magnitude-4'),
      ('Coldwater Two', 'Coldwater II'), ('Coldwater One', 'Coldwater I'), ('lower forty-eight', 'lower 48'), ('thirty-year-old', '30-year-old')]
def norm(x): return x.lower().strip('.,')
merged = []; i = 0
while i < len(words):
    hit = None
    for ph, rep in PH:
        n = ph.split(); seg = words[i:i + len(n)]
        if len(seg) == len(n) and all(norm(a[0]) == norm(b) for a, b in zip(seg, n)) and len({x[3] for x in seg}) == 1:
            tail = seg[-1][0][len(seg[-1][0].rstrip('.,?!')):]; hit = (rep + tail, seg[0][1], seg[-1][2], seg[0][3]); i += len(n); break
    if hit: merged.append(hit)
    else: merged.append(words[i]); i += 1
words = merged
ABBR = ('St.', 'U.S.', 'a.m.', 'p.m.', 'Mt.')
cues = []; cur = []
for w in words:
    if cur and (w[3] != cur[-1][3] or w[1] - cur[-1][2] > 0.8 or len(' '.join(x[0] for x in cur + [w])) > 84 or w[1] - cur[0][1] > 6 or (cur[-1][0][-1] in '.?!' and cur[-1][0] not in ABBR)):
        cues.append(cur); cur = []
    cur.append(w)
if cur: cues.append(cur)
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}'
def wrap(t):
    if len(t) <= 42: return t
    i = t.rfind(' ', 0, len(t) // 2 + 8); return t[:i] + '\n' + t[i + 1:]
out = []
for k, c in enumerate(cues):
    txt = ' '.join(x[0] for x in c).replace(' ,', ',')
    end = max(c[-1][2] + 0.25, c[0][1] + 1.0)
    if k + 1 < len(cues): end = min(end, cues[k + 1][0][1] - 0.05)
    out.append(f'{k + 1}\n{ts(c[0][1])} --> {ts(end)}\n{wrap(txt)}\n')
open('final/msh_full_film.srt', 'w').write('\n'.join(out)); print(len(out), 'cues')
