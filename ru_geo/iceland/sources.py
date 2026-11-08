# Реестр исходников выпуска «Исландия»: Pixabay (видео/фото), Wikimedia Commons (через статьи Википедии).
# pv/pp/wk возвращают запись MEDIA: файл, что/где снято, автор, лицензия, ссылка. fetch() скачивает всё нужное.
import html, json, os, re, subprocess, sys, time, urllib.parse
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import pixabay, commons_find as cf
DATA = os.path.join(D, '..', 'data')
_PV = json.load(open(f'{D}/pool.json')); _PP = json.load(open(f'{D}/photopool.json'))
_WK = [n for _, n in json.load(open(f'{D}/wiki_rows.json'))]
META_F = f'{D}/wiki_meta.json'
_META = json.load(open(META_F)) if os.path.exists(META_F) else {}
PXL = 'Pixabay Content License'; PXL_URL = 'https://pixabay.com/service/license-summary/'

def pv(i, what, place, **kw):
    r = _PV[str(i)]
    return dict(file=f'pixabay/v/{i}.mp4', url=r['url'], what=what, place=place, author=f"{r['user']} (Pixabay)", license=PXL,
                license_url=PXL_URL, page=r['page'], source='Pixabay', **kw)

def pp(i, what, place, **kw):
    r = _PP[str(i)]
    return dict(file=f'pixabay/p/{i}.jpg', url=r['url'], what=what, place=place, author=f"{r['user']} (Pixabay)", license=PXL,
                license_url=PXL_URL, page=r['page'], source='Pixabay', **kw)

def _safe(n): return re.sub(r'[^\w.-]', '_', n)[:120]

FIX_AUTHOR = {'Vestmannaeyjar Vulkanasche 1.jpg': 'Christian Bickel (fingalo)', 'Olaus Magnus - On Strange Properties of Some Mountains.jpg': 'Олаус Магнус (1555)',
              'Benjamin Franklin by Joseph Duplessis 1778.jpg': 'Жозеф Дюплесси (1778)', 'Anonymous - Prise de la Bastille.jpg': 'неизвестный художник (XVIII век)',
              'Katla 1918.jpg': 'неизвестный фотограф (1918)', 'Neil Armstrong pose.jpg': 'NASA', 'Ingolf by Raadsig.jpg': 'Йохан Петер Раадсиг (1806–1882)',
              'CoventryAlbertWestfj.jpg': 'неизвестный фотограф (1958)', 'Reykjavík harbour in 1910, offloading of fish from the rowboat.jpg': 'неизвестный фотограф (1910)',
              'Katrín Jakobsdóttir (cropped).jpg': 'Kim Wendt / NordForsk', 'Astronaut Monument Unveiling.jpg': 'David Philips / The Exploration Museum'}

def clean_author(n, a):
    if n in FIX_AUTHOR: return FIX_AUTHOR[n]
    if a.startswith('.mw-parser') or ' DD ' in n: return 'Diego Delso (delso.photo)' if ' DD ' in n else a
    a = re.split(r' (?:InfoField|Title|Categories|Keywords|This image|Place of creation|Upload:)', a)[0]
    return a.replace('Aerial_view_of_the_Westmen_Isles,_2009-02-01.jpg : ', '').replace('Photograph: ', '').replace(' Unknown author', '').strip(' –-')

def wk(ref, what, place, **kw):
    """ref — номер строки в wiki_rows.json или имя файла Commons."""
    n = _WK[ref] if isinstance(ref, int) else ref
    m = _META.get(n, {})
    return dict(file=f'commons_img/{_safe(n)}.jpg', commons=n, what=what, place=place, author=clean_author(n, m.get('author', '?')), license=m.get('license', '?'),
                page='https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(n.replace(' ', '_')), source='Wikimedia Commons', **kw)

# Доработка «люди и жизнь страны» (ноябрь 2026): сведения о файлах Commons, найденных через MediaSearch (rework/research.py),
# и фото с Flickr (только CC BY / CC BY-SA / CC0 / Public Domain Mark; rework/flickr.py).
_RW = json.load(open(f'{D}/rework/commons_db.json')) if os.path.exists(f'{D}/rework/commons_db.json') else {}
for _n, _r in _RW.items():
    if (_n not in _META or _META[_n].get('license') in ('?', '')) and not _r.get('missing'): _META[_n] = dict(author=_r.get('author', ''), license=_r.get('license', ''), fair=False)
_FL = json.load(open(f'{D}/rework/flickr_db.json'))['p'] if os.path.exists(f'{D}/rework/flickr_db.json') else {}
FL_LIC = {'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/', 'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
          'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/', 'Public Domain Mark 1.0': 'https://creativecommons.org/publicdomain/mark/1.0/'}

def fl(pid, what, place, **kw):
    r = _FL[str(pid)]
    return dict(file=f'flickr/{pid}.jpg', flickr=str(pid), what=what, place=place, author=f"{r['author']} (Flickr)", license=r['license'],
                license_url=FL_LIC.get(r['license'], ''), page=r['page'], source='Flickr', **kw)

def cv(name, local, what, place, **kw):
    """видео с Commons: скачивается отдельно (rework/dl_slow.py — upload.wikimedia.org отвечает 429 на частые запросы)"""
    m = _META.get(name, {})
    return dict(file=f'commons_vid/{local}', commons=name, what=what, place=place, author=clean_author(name, m.get('author', '?')), license=m.get('license', '?'),
                page='https://commons.wikimedia.org/wiki/File:' + urllib.parse.quote(name.replace(' ', '_')), source='Wikimedia Commons', **kw)

def _flickr_big(page):
    s = subprocess.run(['curl', '-sS', '-L', '-A', pixabay.UA, '--max-time', '90', page], capture_output=True, text=True).stdout
    for k in ('k', 'h', 'b', 'c'):
        m = re.search(r'"' + k + r'":\{"data":\{"displayUrl":"([^"]+)","width":(\d+)', s)
        if m: return 'https:' + m.group(1).replace('\\/', '/')
    return None

def wiki_meta(names):
    """Автор и лицензия со страницы en.wikipedia.org/wiki/File:… (там показано описание с Commons)."""
    for n in names:
        if n in _META: continue
        url = 'https://en.wikipedia.org/wiki/File:' + urllib.parse.quote(n.replace(' ', '_'))
        s = subprocess.run(['curl', '-sS', '-A', cf.UA, '--max-time', '60', url], capture_output=True, text=True).stdout
        lic = sorted(set(html.unescape(re.sub(r'<[^>]+>', '', x)).strip() for x in re.findall(r'licensetpl_short[^>]*>(.*?)</', s, re.S)))
        t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s)))
        au = re.search(r' Author (.*?) (?:Permission|Licensing|Camera location|Other versions|Source)', t)
        fair = 'non-free' in s.lower() or 'fair use' in s.lower()
        _META[n] = dict(author=(au.group(1).strip()[:160] if au else ''), license=', '.join(lic) or ('NON-FREE' if fair else '?'), fair=fair)
        print(n[:60], '|', _META[n]['license'], '|', _META[n]['author'][:60], flush=True)
        json.dump(_META, open(META_F, 'w'), ensure_ascii=False, indent=0); time.sleep(1.0)

def fetch(media):
    for k, m in media.items():
        if m['file'].startswith('commons_vid/'): continue
        p = os.path.join(DATA, m['file'])
        if os.path.exists(p) and os.path.getsize(p) > 20000: continue
        os.makedirs(os.path.dirname(p), exist_ok=True)
        if m['source'] == 'Pixabay': ok = pixabay.download(m['url'], p)
        elif m['source'] == 'Wikimedia Commons':
            ok = False
            n = m['commons'].replace(' ', '_'); h = __import__('hashlib').md5(n.encode()).hexdigest()
            orig = f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(n)}'   # если файл меньше 1920 px, превью нет — берём оригинал
            for url in [cf.thumb_url(m['commons'], w) for w in (1920, 1280)] + [orig]:
                r = subprocess.run(['curl', '-sS', '-A', cf.UA, '--max-time', '300', '-o', p, '-w', '%{http_code}', url], capture_output=True, text=True)
                if r.stdout.strip() == '200' and os.path.getsize(p) > 5000: ok = True; break
        elif m['source'] == 'Flickr':
            u = _flickr_big(m['page']); ok = bool(u) and pixabay.download(u, p); time.sleep(1.5)
        else: continue
        print('fetch', k, 'OK' if ok else 'FAIL', flush=True)
