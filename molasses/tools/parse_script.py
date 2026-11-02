# full/script_draft.md (approved) -> full/chapters.json : chapters 1..9 (cold open is reused from vo/todd)
import json, re
src = open('full/script_draft.md').read().split('## Fact table')[0]
chs = []; cur = None; para = 0
for raw in src.splitlines():
    l = raw.strip()
    m = re.match(r'## (CHAPTER [0-9A-Z]+) — (.+?) \(', l)
    if m:
        cur = {'id': 'c' + m.group(1).split()[1].lower(), 'label': m.group(1), 'title': m.group(2).strip('"“” '), 'lines': []}; chs.append(cur); para = 0; continue
    if l.startswith('## '): cur = None; continue
    if cur is None: continue
    if not l or l == '---': para += 1; continue
    t = re.sub(r'\s*\*\*\[CHECK[^\]]*\]\*\*', '', l).strip()
    if t: cur['lines'].append({'id': f"{cur['id']}_{len(cur['lines']) + 1:02d}", 'text': t, 'para': para})
json.dump(chs, open('full/chapters.json', 'w'), indent=1)
n = sum(len(' '.join(x['text'] for x in c['lines'])) for c in chs)
for c in chs: print(c['id'], c['title'], len(c['lines']))
print('chars', n)
