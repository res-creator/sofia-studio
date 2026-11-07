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
              'Katla 1918.jpg': 'неизвестный фотограф (1918)', 'Neil Armstrong pose.jpg': 'NASA', 'Ingolf by Raadsig.jpg': 'Йохан Петер Раадсиг (1806–1882)'}

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
        else: continue
        print('fetch', k, 'OK' if ok else 'FAIL', flush=True)
