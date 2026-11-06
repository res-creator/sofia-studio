# Renders the document pages used in the film and finds the exact phrases to highlight (pixel boxes, 200 dpi).
import subprocess, re, json, os, html
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..'); D = ROOT + '/assets/raw/docs'; OUT = os.environ['DOCS_OUT']; os.makedirs(OUT, exist_ok=True)
def words(pdf, page):
    x = subprocess.run(['pdftotext', '-f', str(page), '-l', str(page), '-bbox', pdf, '-'], capture_output=True, text=True).stdout
    return [(float(a), float(b), float(c), float(d_), html.unescape(w)) for a, b, c, d_, w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', x)]
def find(ws, phrase):
    toks = phrase.split(); n = len(toks)
    norm = lambda s: re.sub(r'[^\w]', '', s.lower())
    for i in range(len(ws) - n + 1):
        if all(norm(ws[i + k][4]) == norm(toks[k]) for k in range(n)): return ws[i:i + n]
    raise SystemExit(f'not found: {phrase}')
def boxes(seq, sc):  # one box per line
    lines = {}
    for a, b, c, d, w in seq: lines.setdefault(round(b), []).append((a, b, c, d))
    return [[min(v[0] for v in L) * sc - 6, min(v[1] for v in L) * sc - 4, max(v[2] for v in L) * sc + 6, max(v[3] for v in L) * sc + 4] for L in lines.values()]
meta = {}
for key, pdf, page, phrases in [
    ('sa_boat', 'NWS_Harvey_Service_Assessment_2018.pdf', 17, ['If you have a boat, we need your help.']),
    ('court', 'CFC_17-9002_Downstream_2026-04-22_via_ELR.pdf', 40, ['Defendant estimated that potential dam failure placed 600,000 lives at stake', 'Corps members exhibited a high degree of professionalism amid Harvey’s circumstances.']),
    ('ntsb', 'NTSB_HAR0701_Wilmer_bus_fire.pdf', 4, ['Twenty-three passengers were fatally injured'])]:
    pdfp = f'{D}/{pdf}'; png = f'{OUT}/{key}'
    subprocess.run(['pdftoppm', '-f', str(page), '-l', str(page), '-r', '200', '-png', '-singlefile', pdfp, png], check=True)
    ws = words(pdfp, page); sc = 200 / 72
    meta[key] = dict(png=png + '.png', boxes=[boxes(find(ws, p), sc) for p in phrases])
# NHC Advisory 22 (text bulletin, NOAA archive) typeset as a teletype page
txt = open(os.environ['ADV22']).read().splitlines()
i0 = next(i for i, l in enumerate(txt) if l.startswith('BULLETIN')); i1 = next(i for i, l in enumerate(txt) if l.startswith('RAINFALL')) + 7
lines = txt[i0:i0 + 9] + ['', '[...]', ''] + txt[i1 - 7:i1]
f = ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf', 34)
im = Image.new('RGB', (1700, 140 + 46 * len(lines)), (248, 247, 242)); d = ImageDraw.Draw(im); y = 70; hb = []
for l in lines:
    d.text((90, y), l, font=f, fill=(25, 25, 25))
    if any(k in l for k in ('15 to 30 inches', 'catastrophic and life-threatening')): hb.append([84, y - 6, 90 + d.textlength(l, font=f) + 6, y + 42])
    y += 46
im.save(f'{OUT}/adv22.png'); meta['adv22'] = dict(png=f'{OUT}/adv22.png', boxes=[hb])
json.dump(meta, open(f'{OUT}/docs.json', 'w'), indent=1); print(json.dumps({k: [len(b) for b in v['boxes']] for k, v in meta.items()}))
