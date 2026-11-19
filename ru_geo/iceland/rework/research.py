# Доработка видеоряда (люди и жизнь страны): поиск кандидатов на Wikimedia Commons (MediaSearch HTML) и Pixabay,
# сведения о файлах (автор, лицензия, дата, описание) через en.wikipedia API, контактные листы для отбора.
#   python3 rework/research.py commons "запрос" ...   |  python3 rework/research.py pixabay "запрос" ...  |  ... sheet <tag> <имена>
import html, json, os, re, subprocess, sys, time, urllib.parse
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..', 'lib'))
import pixabay
UA = 'SofiaStudioResearch/1.0 (https://github.com/res-creator/sofia-studio)'
DB_F = f'{D}/commons_db.json'; DB = json.load(open(DB_F)) if os.path.exists(DB_F) else {}
Q_F = f'{D}/queries.json'; QS = json.load(open(Q_F)) if os.path.exists(Q_F) else {}

def curl(url, out=None):
    a = ['curl', '-sS', '-L', '-A', UA, '--max-time', '120'] + (['-o', out, '-w', '%{http_code}'] if out else []) + [url]
    return subprocess.run(a, capture_output=True, text=True).stdout

def msearch(q, typ='image', n=40):
    key = f'{typ}:{q}'
    if key in QS: return QS[key]
    url = 'https://commons.wikimedia.org/w/index.php?' + urllib.parse.urlencode(dict(search=q, title='Special:MediaSearch', type=typ))
    for k in range(4):
        s = curl(url)
        if 'sdms-search-results' in s: break
        time.sleep(20 * (k + 1))
    names = []
    for m in re.findall(r'File:([^"&<\\]{3,220}\.(?:jpe?g|png|tiff?|webm|ogv|mp4|mpg|mpeg))', s, re.I):
        nm = html.unescape(urllib.parse.unquote(m)).replace('_', ' ')
        if nm not in names: names.append(nm)
    QS[key] = names[:n]; json.dump(QS, open(Q_F, 'w'), ensure_ascii=False, indent=0); time.sleep(4)
    return QS[key]

def strip(x): return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', x or ''))).strip()

def meta(names):
    need = [n for n in names if n not in DB]
    for i in range(0, len(need), 40):
        chunk = need[i:i + 40]
        url = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode(dict(action='query', format='json', prop='imageinfo',
              titles='|'.join('File:' + n for n in chunk), iiprop='url|size|mime|extmetadata', iiurlwidth=640,
              iiextmetadatafilter='LicenseShortName|LicenseUrl|Artist|Credit|DateTimeOriginal|ImageDescription|Categories|AttributionRequired|UsageTerms|GPSLatitude|GPSLongitude'))
        d = None
        for k in range(6):
            try: d = json.loads(curl(url)); break
            except Exception: time.sleep(30 * (k + 1))
        if d is None: print('meta: skip chunk (429)', flush=True); continue
        norm = {x['to']: x['from'] for x in d['query'].get('normalized', [])}
        for p in d['query']['pages'].values():
            t = p['title'][5:]; t = norm.get(p['title'], p['title'])[5:] if p['title'] in norm else t
            if 'imageinfo' not in p: DB[t] = dict(missing=True); continue
            ii = p['imageinfo'][0]; m = {k: strip(v.get('value')) for k, v in ii.get('extmetadata', {}).items()}
            DB[t] = dict(url=ii['url'], thumb=ii.get('thumburl'), w=ii.get('width'), h=ii.get('height'), mime=ii.get('mime'), dur=ii.get('duration'),
                         license=m.get('LicenseShortName', ''), license_url=m.get('LicenseUrl', ''), author=m.get('Artist', '')[:200],
                         credit=m.get('Credit', '')[:200], date=m.get('DateTimeOriginal', '')[:60], desc=m.get('ImageDescription', '')[:500],
                         cats=m.get('Categories', '')[:400], attr=m.get('AttributionRequired', ''), gps=[m.get('GPSLatitude'), m.get('GPSLongitude')])
        json.dump(DB, open(DB_F, 'w'), ensure_ascii=False, indent=0); time.sleep(1)

FREE = re.compile(r'^(CC0|CC BY(-SA)? [\d.]+( [a-z]+)?|CC BY(-SA)?|Public domain|PD.*|Attribution|No restrictions|FAL|GFDL.*)$', re.I)
def ok_license(l): return bool(l) and ('NC' not in l and 'ND' not in l) and bool(FREE.match(l.strip()) or l.lower().startswith(('cc by', 'cc0', 'public domain')))

def sheet(tag, names, cols=5):
    from PIL import Image, ImageDraw, ImageFont
    os.makedirs(f'{D}/sheets', exist_ok=True); tdir = f'{D}/thumbs'; os.makedirs(tdir, exist_ok=True)
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    rows = (len(names) + cols - 1) // cols; img = Image.new('RGB', (cols * 384, rows * 260), (18, 18, 22)); d = ImageDraw.Draw(img)
    for i, n in enumerate(names):
        r = DB.get(n, {}); tp = f'{tdir}/{abs(hash(n)) % 10**12}.jpg'
        if not os.path.exists(tp) and r.get('thumb'): curl(r['thumb'], tp)
        try: im = Image.open(tp).convert('RGB'); im.thumbnail((380, 214)); 
        except Exception: im = Image.new('RGB', (380, 214), (90, 0, 0))
        x, y = (i % cols) * 384, (i // cols) * 260; img.paste(im, (x + 2, y + 2))
        d.text((x + 3, y + 218), f"{i}: {n[:52]}", fill=(255, 255, 255), font=f)
        d.text((x + 3, y + 236), f"{r.get('license','?')[:16]} | {r.get('date','')[:18]} | {r.get('w')}", fill=(120, 230, 120) if ok_license(r.get('license')) else (255, 120, 120), font=f)
    p = f'{D}/sheets/{tag}.jpg'; img.save(p, quality=82); return p

if __name__ == '__main__':
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == 'commons':
        typ = 'image'
        if args and args[0] == '--video': typ = 'video'; args = args[1:]
        allnames = []
        for q in args:
            ns = msearch(q, typ); print(f'{q!r}: {len(ns)}', flush=True); allnames += [n for n in ns if n not in allnames]
        meta(allnames)
        print(json.dumps(allnames, ensure_ascii=False))
