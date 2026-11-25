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
        elif op == 'replace' or (op == 'delete' and 0 < j1 < len(ww)):
            s0 = ww[j1]['s'] if j1 < len(ww) else ww[-1]['e']; e0 = ww[j2 - 1]['e'] if j2 > j1 else s0
            n = i2 - i1
            for k in range(n): res[i1 + k] = (s0 + (e0 - s0) * k / n, s0 + (e0 - s0) * (k + 1) / n)
    # trailing script words Whisper missed: spread them up to the end of the take
    k1 = len(res)
    while k1 > 0 and res[k1 - 1] is None: k1 -= 1
    if k1 < len(res):
        import soundfile as _sf
        dur = _sf.info(f'voice/{pid}.wav').duration - 0.25; a0 = (res[k1 - 1][1] if k1 else 0.0) + 0.2
        tot = sum(len(x) for x in sw[k1:]) or 1; tt = a0
        for k in range(k1, len(res)): dd = (dur - a0) * len(sw[k]) / tot; res[k] = (tt, tt + dd); tt += dd
    last = 0.0
    for k in range(len(res)):
        if res[k] is None: res[k] = (last, last)
        last = res[k][1]
    out[pid] = [dict(w=sw[k], s=round(res[k][0], 2), e=round(res[k][1], 2)) for k in range(len(sw))]
json.dump(out, open('words_script.json', 'w')); print('aligned', len(out))
