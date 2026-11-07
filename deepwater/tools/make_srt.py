# English SRT for the full film (opening + main film): narration words (vo/*.words.json) + testimony words (scribe_v1 STT of the hearing video).
import json, math
STT = {'w': 'research/jit_0723_part1_stt.json', 'x': 'research/jit_0723_91191_stt.json', 'y': 'research/jit_0723_91195_stt.json'}
SPK = {'w': {'speaker_1': 'Williams'}, 'x': {'speaker_0': 'Williams'}, 'y': {'speaker_0': 'Williams'}}
SW = {k: [w for w in json.load(open(p))['words'] if w['type'] == 'word'] for k, p in STT.items()}
FIX = {'Lyman': 'Wyman'}
words = []  # (text, start, end, group)
def add(script, data, off):
    T = json.load(open(data)); seq = json.load(open(script))['seq']
    for it in seq:
        if it[0] == 'vo':
            for w in T['lines'][it[1]]['words']: words.append((w['w'], off + w['s'], off + w['e'], 'N'))
        elif it[0] == 'bite':
            src = it[4] if len(it) > 4 else 'w'
            for seg, (a, b) in zip(T['bites'][it[1]], it[2]):
                for w in SW[src]:
                    if a - 0.05 <= w['start'] and w['end'] <= b + 0.05:
                        who = SPK[src].get(w.get('speaker_id'), 'Investigator')
                        words.append((FIX.get(w['text'], w['text']), off + seg['at'] + w['start'] - a, off + seg['at'] + w['end'] - a, who))
od = json.load(open('src/data/open.json'))['duration']
add('script/opening.json', 'src/data/open.json', 0.0)
add('script/film.json', 'src/data/film.json', math.ceil(od * 30) / 30)
PH = [('fourteen hundred', '1,400'), ('twenty ten', '2010'), ('twenty sixteen', '2016'), ('April twentieth,', 'April 20,'), ('April twenty-second,', 'April 22,'),
      ('eight-oh-two,', '8:02,'), ('nine-oh-one,', '9:01,'), ('nine-twenty,', '9:20,'), ('nine-thirty,', '9:30,'), ('nine-ten,', '9:10,'), ('eight-fifty,', '8:50,'),
      ('nine forty-nine.', '9:49.'), ('nine thirty.', '9:30.'), ('nine forty,', '9:40,'), ('July fifteenth.', 'July 15.'), ('September nineteenth,', 'September 19,'),
      ('three-hundred-sixty-ton', '360-ton'), ('a hundred and twenty-six', '126'), ('A hundred and twenty-six', '126'), ('a hundred and fifteen', '115'),
      ('thirty-eight', '38'), ('fifty-eight million', '58 million'), ('five thousand', '5,000'), ('four point nine', '4.9'), ('three point one nine', '3.19'),
      ('eighty-seven', '87'), ('thirty-six', '36'), ('fifty to seventy', '50 to 70'), ('thirty minutes.', '30 minutes.'), ('thirty minutes,', '30 minutes,'), ('four billion', '$4 billion'), ('dollars', '')]
norm = lambda x: x.lower()
merged = []; i = 0
while i < len(words):
    hit = None
    for ph, rep in PH:
        n = ph.split(); seg = words[i:i + len(n)]
        if len(seg) == len(n) and all(norm(a[0]) == norm(b) for a, b in zip(seg, n)) and len({x[3] for x in seg}) == 1:
            hit = (rep, seg[0][1], seg[-1][2], seg[0][3]); i += len(n); break
    if hit:
        if hit[0]: merged.append(hit)
    else: merged.append(words[i]); i += 1
words = merged
ABBR = ('p.m.', 'a.m.', 'U.S.', 'Mr.', 'B.', 'Jr.')
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
out = []; prev = None
for k, c in enumerate(cues):
    txt = ' '.join(x[0] for x in c).replace(' ,', ',').replace('$4 billion billion', '$4 billion')
    if c[0][3] != 'N' and c[0][3] != prev: txt = f'[{c[0][3]}] ' + txt
    prev = c[0][3]
    end = max(c[-1][2] + 0.25, c[0][1] + 1.0)
    if k + 1 < len(cues): end = min(end, cues[k + 1][0][1] - 0.05)
    out.append(f'{k + 1}\n{ts(c[0][1])} --> {ts(end)}\n{wrap(txt)}\n')
open('final/dwh_full_film.srt', 'w').write('\n'.join(out)); print(len(out), 'cues')
