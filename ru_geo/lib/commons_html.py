# Сведения о файле Commons из HTML-страницы (REST/API часто отвечают 429): ссылка на оригинал и 720p/1080p, лицензия, автор.
import re, sys, json, time, html, urllib.parse, urllib.request
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
def page(key):
    url = 'https://commons.wikimedia.org/wiki/' + urllib.parse.quote(key.replace(' ', '_'))
    for k in range(6):
        time.sleep(6)
        try: return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=90).read().decode()
        except Exception as e: print('  wait', e, flush=True); time.sleep(60 * (k + 1))
    return ''
def strip(s): return html.unescape(re.sub(r'<[^>]+>', ' ', s)).strip()
def info(key):
    s = page(key)
    orig = re.search(r'href="(https://upload\.wikimedia\.org/wikipedia/commons/[0-9a-f]/[0-9a-f]{2}/[^"]+)"', s)
    trans = sorted(set(re.findall(r'(https://upload\.wikimedia\.org/wikipedia/commons/transcoded/[^"\s]+?\.(?:1080p|720p|480p)\.(?:vp9\.webm|webm|av1\.webm|mp4))', s)))
    txt = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))
    lic = sorted(set(strip(x) for x in re.findall(r'licensetpl&#95;short"[^>]*>(.*?)<', s, re.S)))
    lurl = sorted(set(strip(x) for x in re.findall(r'licensetpl&#95;link"[^>]*>(.*?)<', s, re.S)))
    au = re.search(r' Author (.*?) (?:Licensing|Permission|Camera location|Other versions)', txt)
    desc = re.search(r' Description (.*?) Date ', txt)
    dims = re.findall(r'([\d,]+) × ([\d,]+) pixels', txt)
    dur = None
    return dict(key=key, page='https://commons.wikimedia.org/wiki/' + urllib.parse.quote(key.replace(' ', '_')),
                orig=html.unescape(orig.group(1)) if orig else None, trans=[html.unescape(t) for t in trans],
                license=lic, license_url=[strip(x) for x in lurl], author=au.group(1)[:200] if au else '',
                desc=desc.group(1)[:300] if desc else '', dims=max(((int(a.replace(',', '')), int(b.replace(',', ''))) for a, b in dims), default=None))
if __name__ == '__main__':
    out = {}
    for k in [l.strip() for l in open(sys.argv[1]) if l.strip()]:
        try: out[k] = info(k); i = out[k]; print(f"{i['dims']} {i['license']} | {i['author'][:60]} | {k[5:80]} | {len(i['trans'])} trans | {i['desc'][:120]}", flush=True)
        except Exception as e: print('ERR', k, e, flush=True)
        json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
