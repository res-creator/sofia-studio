# Coverr (бесплатная лицензия Coverr: можно коммерчески, подпись не обязательна). Ключ подставляет прокси окружения — в коде его нет.
#   python3 rework/coverr.py search <tag> "запрос" ...   -> rework/coverr_db.json + лист rework/sheets/cv_<tag>.jpg
import json, os, subprocess, sys, urllib.parse
D = os.path.dirname(os.path.abspath(__file__))
F = f'{D}/coverr_db.json'; DB = json.load(open(F)) if os.path.exists(F) else {'q': {}, 'v': {}}
def get(url): return subprocess.run(['curl', '-sS', '-L', '--max-time', '60', url], capture_output=True, text=True).stdout
def search(q, n=20):
    if q in DB['q']: return DB['q'][q]
    d = json.loads(get('https://api.coverr.co/videos?' + urllib.parse.urlencode(dict(query=q, page_size=n, urls='true'))))
    ids = []
    for h in d.get('hits', []):
        if h.get('is_vertical') or h.get('is_ai_generated'): continue
        u = h.get('urls') or {}
        DB['v'][h['id']] = dict(id=h['id'], title=h['title'], desc=(h.get('description') or '')[:200], tags=h.get('tags', [])[:12], dur=h.get('duration'),
                                w=h.get('max_width'), thumb=h.get('thumbnail'), mp4=u.get('mp4') or u.get('mp4_download'), slug=h.get('slug'),
                                page=f"https://coverr.co/videos/{h.get('slug')}")
        ids.append(h['id'])
    DB['q'][q] = ids; json.dump(DB, open(F, 'w'), ensure_ascii=False, indent=0); return ids
def sheet(tag, ids, cols=5):
    from PIL import Image, ImageDraw, ImageFont
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13); td = f'{D}/thumbs'; os.makedirs(td, exist_ok=True)
    rows = (len(ids) + cols - 1) // cols; img = Image.new('RGB', (cols * 384, rows * 240), (18, 18, 22)); dr = ImageDraw.Draw(img)
    for i, k in enumerate(ids):
        r = DB['v'][k]; tp = f'{td}/cv_{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-L', '-o', tp, r['thumb']])
        try: im = Image.open(tp).convert('RGB'); im.thumbnail((380, 214))
        except Exception: im = Image.new('RGB', (380, 214), (90, 0, 0))
        x, y = (i % cols) * 384, (i // cols) * 240; img.paste(im, (x + 2, y + 2))
        dr.text((x + 3, y + 220), f"{i}:{k[:8]} {r['dur']}s {r['w']} {r['title'][:28]}", fill=(255, 255, 0), font=f)
    p = f'{D}/sheets/cv_{tag}.jpg'; img.save(p, quality=80); print(p)
if __name__ == '__main__':
    tag, qs = sys.argv[2], sys.argv[3:]; ids = []
    for q in qs:
        for k in search(q)[:10]:
            if k not in ids: ids.append(k)
    sheet(tag, ids[:40])
