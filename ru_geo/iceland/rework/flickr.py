# Flickr: поиск только по свободным лицензиям (4 = CC BY 2.0, 5 = CC BY-SA 2.0, 9 = CC0, 10 = Public Domain Mark) — HTML-страница поиска,
# данные из встроенного JSON. Для выбранных фото дату съёмки и место проверяем по странице фото (page()).
import html, json, os, re, subprocess, sys, time, urllib.parse
D = os.path.dirname(os.path.abspath(__file__))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
F = f'{D}/flickr_db.json'; DB = json.load(open(F)) if os.path.exists(F) else {'q': {}, 'p': {}}
LIC = {4: 'CC BY 2.0', 5: 'CC BY-SA 2.0', 9: 'CC0 1.0', 10: 'Public Domain Mark 1.0'}
def get(url): return subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '90', url], capture_output=True, text=True).stdout
def search(q, n=30):
    if q in DB['q']: return DB['q'][q]
    s = get('https://www.flickr.com/search/?' + urllib.parse.urlencode(dict(text=q, license='4,5,9,10')))
    i = s.find('modelExport:'); j = s.find('\n', i)
    try: d = json.loads(s[i + 12:j].strip().rstrip(','))
    except Exception: print('fail', q); return []
    ids = []
    try: items = d['main']['search-photos-lite-models'][0]['data']['photos']['data']['_data'][:n]
    except Exception: items = []
    for x in items:
        if not x or 'data' not in x: continue
        x = x['data']; sz = x['sizes']['data']
        if 'n' not in sz: continue
        big = next((sz[k]['data'] for k in ('k', 'h', 'l', 'c', 'z', 'n') if k in sz), None)
        pid = re.search(r'/(\d+)_', sz['n']['data']['url']).group(1)
        DB['p'].setdefault(pid, dict(id=pid, title=html.unescape(x.get('title', '')), desc=html.unescape(x.get('description', ''))[:400],
             author=x.get('realname') or x.get('username'), owner=x['ownerNsid'], alias=x.get('pathAlias') or x['ownerNsid'],
             license=LIC.get(x['license'], str(x['license'])), thumb='https:' + sz['n']['data']['url'].replace('_n.', '_z.') if 'z' in sz else 'https:' + sz['n']['data']['url'],
             url='https:' + big['url'], w=big['width'], h=big['height']))
        DB['p'][pid]['page'] = f"https://www.flickr.com/photos/{DB['p'][pid]['alias']}/{pid}/"
        ids.append(pid)
    DB['q'][q] = ids; json.dump(DB, open(F, 'w'), ensure_ascii=False, indent=0); time.sleep(2)
    return ids
def page(pid):
    """дата съёмки, место и теги со страницы фото"""
    r = DB['p'][pid]
    if 'taken' in r: return r
    s = get(r['page'])
    m = re.search(r'"dateTaken":"?(\d+)', s) or re.search(r'Taken on ([A-Za-z]+ \d+, \d{4})', s)
    r['taken'] = m.group(1) if m else ''
    if r['taken'].isdigit() and len(r['taken']) >= 9: r['taken'] = time.strftime('%Y-%m-%d', time.gmtime(int(r['taken'][:10])))
    loc = re.search(r'"locationName":"([^"]+)"', s) or re.search(r'"locality":\{"_content":"([^"]+)"', s)
    r['loc'] = html.unescape(loc.group(1)) if loc else ''
    r['tags'] = sorted(set(re.findall(r'"raw":"([^"]{2,40})"', s)))[:30]
    json.dump(DB, open(F, 'w'), ensure_ascii=False, indent=0); time.sleep(1.5)
    return r
def sheet(tag, ids, cols=5):
    from PIL import Image, ImageDraw, ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13); td = f'{D}/thumbs'; os.makedirs(td, exist_ok=True); os.makedirs(f'{D}/sheets', exist_ok=True)
    rows = (len(ids) + cols - 1) // cols; img = Image.new('RGB', (cols * 384, rows * 262), (18, 18, 22)); d = ImageDraw.Draw(img)
    for i, k in enumerate(ids):
        r = DB['p'][k]; tp = f'{td}/fl{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-A', UA, '-o', tp, r['thumb']])
        try: im = Image.open(tp).convert('RGB'); im.thumbnail((380, 214))
        except Exception: im = Image.new('RGB', (380, 214), (90, 0, 0))
        x, y = (i % cols) * 384, (i // cols) * 262; img.paste(im, (x + 2, y + 2))
        d.text((x + 3, y + 218), f"{k} {r['w']}px {r['license']}", fill=(255, 255, 0), font=f); d.text((x + 3, y + 236), r['title'][:50], fill=(255, 255, 255), font=f)
    p = f'{D}/sheets/{tag}.jpg'; img.save(p, quality=80); print(p)
if __name__ == '__main__':
    tag, n, qs = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
    ids = []
    for q in qs:
        for k in search(q)[:n]:
            if k not in ids: ids.append(k)
    sheet(tag, ids)
