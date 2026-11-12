"""Script words with times: aligns SCRIPT_EN.csv tokens to Whisper words (words.json) -> words_script.json.
Tokens replaced by Whisper (numbers written as digits, names) get times spread over the matching Whisper span."""
import json, csv, re, difflib
W = json.load(open('words.json')); out = {}
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())
for r in csv.DictReader(open('SCRIPT_EN.csv', encoding='utf-8')):
    pid = r['id']; sw = r['english_narration'].split(); ww = W[pid]
    a = [norm(x) for x in sw]; b = [norm(x['w']) for x in ww]; res = [None] * len(sw)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == 'equal':
            for k in range(i2 - i1): res[i1 + k] = (ww[j1 + k]['s'], ww[j1 + k]['e'])
        elif op == 'replace' or (op == 'delete' and j1 > 0):
            s0 = ww[j1]['s'] if j1 < len(ww) else ww[-1]['e']; e0 = ww[j2 - 1]['e'] if j2 > j1 else s0
            n = i2 - i1
            for k in range(n): res[i1 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
    last = 0.0
    for k in range(len(res)):
        if res[k] is None: res[k] = (last, last)
        last = res[k][1]
    out[pid] = [dict(w=sw[k], s=round(res[k][0], 2), e=round(res[k][1], 2)) for k in range(len(sw))]
json.dump(out, open('words_script.json', 'w')); print('aligned', len(out))
