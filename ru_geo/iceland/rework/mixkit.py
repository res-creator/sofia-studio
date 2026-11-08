# Mixkit (Mixkit Stock Video Free License: можно коммерчески, подпись не обязательна). Поиск по обычным страницам сайта,
# скачивание того же файла, что даёт кнопка Download (assets.mixkit.co/videos/<id>/<id>-1080.mp4).
#   python3 rework/mixkit.py <tag> "запрос" ...  -> rework/mixkit_db.json + лист rework/sheets/mk_<tag>.jpg
import html, json, os, re, subprocess, sys, urllib.parse
D = os.path.dirname(os.path.abspath(__file__))
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
F = f'{D}/mixkit_db.json'; DB = json.load(open(F)) if os.path.exists(F) else {'q': {}, 'v': {}}
def get(u): return subprocess.run(['curl', '-sS', '-L', '-A', UA, '--max-time', '60', u], capture_output=True, text=True).stdout
def search(q):
    if q in DB['q']: return DB['q'][q]
    slug = re.sub(r'[^a-z0-9]+', '-', q.lower()).strip('-')
    s = get(f'https://mixkit.co/free-stock-video/{slug}/')
    ids = []
    for m in re.finditer(r'href="/free-stock-video/([a-z0-9-]+)-(\d+)/"', s):
        name, vid = m.group(1), m.group(2)
        if vid in ids: continue
        DB['v'].setdefault(vid, dict(id=vid, title=name.replace('-', ' '), page=f'https://mixkit.co/free-stock-video/{name}-{vid}/',
                                     mp4=f'https://assets.mixkit.co/videos/{vid}/{vid}-1080.mp4',
                                     thumb=f'https://assets.mixkit.co/videos/{vid}/{vid}-thumb-360-0.jpg', license='Mixkit Stock Video Free License',
                                     license_url='https://mixkit.co/license/#videoFree'))
        ids.append(vid)
    DB['q'][q] = ids; json.dump(DB, open(F, 'w'), ensure_ascii=False, indent=0); return ids
def sheet(tag, ids, cols=5):
    from PIL import Image, ImageDraw, ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13); td = f'{D}/thumbs'; os.makedirs(td, exist_ok=True)
    rows = (len(ids) + cols - 1) // cols; img = Image.new('RGB', (cols * 384, rows * 240), (18, 18, 22)); dr = ImageDraw.Draw(img)
    for i, k in enumerate(ids):
        r = DB['v'][k]; tp = f'{td}/mk_{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-L', '-A', UA, '-o', tp, r['thumb']])
        try: im = Image.open(tp).convert('RGB'); im.thumbnail((380, 214))
        except Exception: im = Image.new('RGB', (380, 214), (90, 0, 0))
        x, y = (i % cols) * 384, (i // cols) * 240; img.paste(im, (x + 2, y + 2))
        dr.text((x + 3, y + 220), f"{k} {r['title'][:44]}", fill=(255, 255, 0), font=f)
    p = f'{D}/sheets/mk_{tag}.jpg'; img.save(p, quality=80); print(p)
if __name__ == '__main__':
    tag, qs = sys.argv[1], sys.argv[2:]; ids = []
    for q in qs:
        for k in search(q)[:10]:
            if k not in ids: ids.append(k)
    sheet(tag, ids[:40])
