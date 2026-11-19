import json, os, sys, subprocess
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..', 'lib')); import pixabay
POOL = json.load(open(f'{D}/pix_pool.json'))
def sheet(tag, ids, cols=6):
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12); td = f'{D}/thumbs'; os.makedirs(td, exist_ok=True); os.makedirs(f'{D}/sheets', exist_ok=True)
    rows = (len(ids) + cols - 1) // cols; img = Image.new('RGB', (cols * 320, rows * 214), (18, 18, 22)); d = ImageDraw.Draw(img)
    for i, k in enumerate(ids):
        r = POOL[str(k)]; tp = f'{td}/px{k}.jpg'
        if not os.path.exists(tp): subprocess.run(['curl', '-sS', '-A', pixabay.UA, '-o', tp, r['thumb']])
        try: im = Image.open(tp).convert('RGB').resize((316, 178))
        except Exception: im = Image.new('RGB', (316, 178), (90, 0, 0))
        x, y = (i % cols) * 320, (i // cols) * 214; img.paste(im, (x + 2, y + 2))
        d.text((x + 3, y + 182), f"{k} {r['dur']}s {r['w']}", fill=(255, 255, 0), font=f); d.text((x + 3, y + 197), r['tags'][:44], fill=(255, 255, 255), font=f)
    p = f'{D}/sheets/{tag}.jpg'; img.save(p, quality=80); print(p)
if __name__ == '__main__':
    tag, qs = sys.argv[1], sys.argv[2:]; lim = 36
    ids = [k for k, r in POOL.items() if any(q in r['q'] for q in qs)]
    ids.sort(key=lambda k: -sum(q in POOL[k]['q'] for q in qs)); sheet(tag, ids[:lim])
