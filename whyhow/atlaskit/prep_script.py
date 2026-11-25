"""script.md -> SCRIPT_EN.csv (+ chapters.json: first paragraph of each '## CH' section, and the last cold-open paragraph).
usage (in the episode dir): python3 ../atlaskit/prep_script.py"""
import re, csv, json
t = open('script.md', encoding='utf-8').read(); rows = []; chapters = []; cold_end = None; sec = ''; first = False
for line in t.splitlines():
    if line.startswith('## '):
        sec = line; first = line.startswith('## CH'); continue
    m = re.match(r'\*\*(A\d+[A-C]?)\*\* (.*)', line)
    if not m: continue
    pid, txt = m.groups(); txt = re.sub(r'\s*\[[^\]]*\]', '', txt).strip()
    if first: chapters.append(pid); first = False
    if 'COLD OPEN' in sec: cold_end = pid
    rows.append((pid, txt))
with open('SCRIPT_EN.csv', 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, quoting=csv.QUOTE_MINIMAL); w.writerow(['id', 'start_s', 'max_duration_s', 'english_narration'])
    for pid, txt in rows: w.writerow([pid, 0, 60, txt])
json.dump(dict(chapters=chapters, title_after=cold_end), open('chapters.json', 'w'))
print(len(rows), 'paras; chapters', chapters, 'title after', cold_end, '; words', sum(len(x.split()) for _, x in rows))
