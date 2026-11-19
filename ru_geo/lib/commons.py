# Поиск и скачивание видео с Wikimedia Commons через REST API (action-API на этом IP часто ограничен).
# Сохраняет автора, лицензию и ссылку каждого файла: credits нужны для CC BY / CC BY-SA.
import json, re, sys, time, urllib.parse, urllib.request
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
BASE = 'https://commons.wikimedia.org/w/rest.php/v1'
def get(url, raw=False):
    for k in range(5):
        time.sleep(8)                        # вежливый темп: Commons часто отвечает 429
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=90).read()
            return r if raw else json.loads(r)
        except Exception as e:
            time.sleep(60 * (k + 1)); err = e
    raise err
def search(q, n=25, video=True):
    qq = q + (' filetype:video' if video else '')
    j = get(f"{BASE}/search/page?q={urllib.parse.quote(qq)}&limit={n}")
    return [p['key'] for p in j['pages']]
def info(key):
    t = urllib.parse.quote(key)
    f = get(f"{BASE}/file/{t}")
    src = get(f"{BASE}/page/{t}")['source']
    lic = re.findall(r'\{\{\s*(?:self\|)?([^{}|]*(?:cc-[^{}|]*|PD[^{}|]*|cc0|CC0)[^{}|]*)', src, re.I)
    lic = sorted(set(l.strip() for l in lic))
    au = re.search(r'\|\s*[Aa]uthor\s*=\s*(.+)', src)
    o = f['original']
    return dict(key=key, url=o['url'], w=o.get('width'), h=o.get('height'), dur=o.get('duration'), size=o.get('size'),
                license=lic, author=(au.group(1).strip()[:150] if au else ''), page='https://commons.wikimedia.org/wiki/' + t)
if __name__ == '__main__':
    for q in sys.argv[1:]:
        print('##', q, flush=True)
        try:
            for k in search(q): print('  ', k, flush=True)
        except Exception as e: print('  ERR', e, flush=True)
