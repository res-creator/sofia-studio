# Обход категорий Wikimedia Commons (HTML-страницы) с паузами: собирает список видеофайлов по Норвегии.
import re, sys, time, html, urllib.request, urllib.parse, json
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
def fetch(title):
    url = 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(title)
    for k in range(6):
        time.sleep(12)
        try: return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=90).read().decode()
        except urllib.error.HTTPError as e:
            if e.code == 404: return ''
            print('  wait', e.code, flush=True); time.sleep(120 * (k + 1))
        except Exception as e: print('  err', e, flush=True); time.sleep(60)
    return ''
seen, queue, files = set(), [(c, 0) for c in sys.argv[2:]], {}
maxd = int(sys.argv[1])
while queue:
    c, d = queue.pop(0)
    if c in seen: continue
    seen.add(c); s = fetch(c)
    subs = sorted(set(html.unescape(x) for x in re.findall(r'href="/wiki/(Category:[^"#?]+)"', s)))
    fs = sorted(set(html.unescape(urllib.parse.unquote(x)) for x in re.findall(r'href="/wiki/(File:[^"#?]+\.(?:webm|ogv|mpg|mpeg|mp4))"', s, re.I)))
    print(f'## {c} files={len(fs)} subs={len(subs)}', flush=True)
    for f in fs: print('   ', f, flush=True); files.setdefault(f, c)
    if d < maxd:
        for sc in subs:
            if ('ideo' in sc or 'ime-lapse' in sc) and ('Norw' in sc or 'Svalbard' in sc): queue.append((sc, d + 1))
json.dump(files, open('/tmp/claude-0/-home-user-sofia-studio/f8714ad5-2476-58ea-9e75-a040a10f088a/scratchpad/norway_videos.json', 'w'), ensure_ascii=False, indent=0)
print('DONE', len(files), flush=True)
