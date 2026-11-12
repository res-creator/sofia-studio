"""Copy downloaded Commons images into assets/ (max 2560 px, JPEG q86) and write CREDITS.md + assets/credits.json.
python3 prepare_assets.py COMMONS_DIR  (COMMONS_DIR has selected.json and img/<key>.jpg)"""
import json, os, sys, re
from PIL import Image
TR = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', ['a','b','v','g','d','e','yo','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','kh','ts','ch','sh','shch','','y','','e','yu','ya']))
def latin(s): return ''.join((TR.get(c.lower(), c).capitalize() if c.isupper() else TR.get(c, c)) for c in s)
D = sys.argv[1]; sel = json.load(open(os.path.join(D, 'selected.json'))); os.makedirs('assets', exist_ok=True); cred = {}
for k, x in sel.items():
    f = os.path.join(D, 'img', k + '.jpg')
    if not os.path.exists(f) or os.path.getsize(f) < 20000: continue
    im = Image.open(f).convert('RGB'); im.thumbnail((2560, 2560)); im.save(f'assets/{k}.jpg', quality=86)
    artist = latin(re.sub(r'\s+', ' ', x['artist']).strip()) or 'unknown'
    lic = x['lic'] if x['lic'] != 'Attribution' else 'Attribution (ESA/Copernicus)'
    cred[k] = dict(title=x['title'], page=x['page'], artist=artist, license=lic,
                   short=f"Photo: {artist[:40]} · {lic} · Wikimedia Commons" if not any(s in x['title'] + x['desc'] + x['artist'] for s in ('Copernicus', 'Sentinel')) else f"Contains modified Copernicus Sentinel data · {lic} · Wikimedia Commons")
json.dump(cred, open('assets/credits.json', 'w'), indent=1)
lines = ['# EP01 credits (all free licences). Paste the list into the YouTube description.', '']
for k, c in cred.items(): lines.append(f"- {c['title'][5:]} — {c['artist']} — {c['license']} — {c['page']}")
lines += ['', 'Maps: Natural Earth (public domain). Diagrams, charts and animation: How It\'s Run (own work).',
          'Narration: Kokoro TTS (Apache 2.0), voice am_puck. Music and sound design: own synthesis.']
open('CREDITS.md', 'w').write('\n'.join(lines) + '\n'); print(len(cred), 'assets')
