#!/usr/bin/env python3
"""python3 compose_auto.py <slug> [t0 t1] : SCRIPT.md (новый формат: >> {"b":[англ. запросы стока],"big":{"n","l"}}, главы с >> {"icon"}) + film.json
-> подбор клипов Coverr, карточки, timeline, видео ru_geo/<slug>/video/<slug>.mp4 (или excerpt если заданы t0 t1)."""
import json, os, re, subprocess, sys, urllib.parse
R = '/home/user/sofia-studio/ru_geo'; slug = sys.argv[1]; J = f'{R}/{slug}'; C = f'{R}/flat2d/compose'; ST = f'{R}/stock'; os.makedirs(ST, exist_ok=True)
film = json.load(open(f'{J}/film.json', encoding='utf8')); segs = film['segs']
DBF = f'{R}/stock/coverr_db.json'; DB = json.load(open(DBF)) if os.path.exists(DBF) else {'q': {}, 'v': {}}
old = f'{R}/iceland/rework/coverr_db.json'
if not DB['v'] and os.path.exists(old): DB = json.load(open(old))
def curl(url): return subprocess.run(['curl', '-sS', '-L', '--max-time', '60', url], capture_output=True, text=True).stdout
import time
def search(q):
    if q in DB['q'] and DB['q'][q]: return DB['q'][q]
    for attempt in range(60):
        raw = curl('https://api.coverr.co/videos?' + urllib.parse.urlencode(dict(query=q, page_size=20, urls='true')))
        if 'Exceeded query limit' in raw or not raw.strip(): print('лимит Coverr, жду 5 минут', flush=True); time.sleep(300); continue
        try: d = json.loads(raw)
        except Exception: time.sleep(30); continue
        ids = []
        for h in d.get('hits', []):
            if h.get('is_vertical') or h.get('is_ai_generated'): continue
            u = h.get('urls') or {}; mp4 = u.get('mp4') or u.get('mp4_download')
            if not mp4: continue
            DB['v'][h['id']] = dict(id=h['id'], title=h['title'], dur=h.get('duration'), mp4=mp4, tags=h.get('tags', [])[:10]); ids.append(h['id'])
        DB['q'][q] = ids; json.dump(DB, open(DBF, 'w'), ensure_ascii=False); time.sleep(1.5); return ids
    return []
# --- разбор сценария
L = open(f'{J}/SCRIPT.md', encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines()
paras, icons = [], {}; last = None; cur_ch = None
for l in L:
    t = l.strip()
    if t.startswith('## '): cur_ch = t[3:].strip(); last = ('ch', cur_ch); continue
    if t.startswith('>>'):
        d = json.loads(t[2:].strip())
        if last and last[0] == 'ch': icons[last[1]] = d.get('icon', '')
        elif last and last[0] == 'p': paras[-1]['cue'] = d
        continue
    if not t or t.startswith(('---', '#', '|')): continue
    txt = re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()
    if txt: paras.append(dict(text=txt, cue={})); last = ('p', txt)
voice = [s for s in segs if s['kind'] == 'voice']
if len(paras) != len(voice): sys.exit(f'абзацев {len(paras)} != озвученных {len(voice)}')
# --- подбор клипов
used = set(); cards = []; tl = []; CRED = {}
sys.path.insert(0, f'{R}/lib')
import pixabay
def pick(q):
    """Pixabay: горизонтальное видео, >=4.5 с, не повторяем клипы."""
    try: hits = pixabay.search(q, True, 50)
    except Exception as e: print('pixabay err', q, e); return None, None
    for h in hits:
        k = 'pb_' + str(h['id'])
        if k in used or float(h.get('duration') or 0) < 4.5: continue
        v = pixabay.best_video(h, 1920)
        if v['width'] < v['height'] or v['width'] < 1280: continue
        p = f'{ST}/{k}.mp4'
        if pixabay.download(v['url'], p) and os.path.getsize(p) > 100000:
            used.add(k); CRED[k] = dict(user=h.get('user'), page=h.get('pageURL'), q=q); return k, h
    return None, None
def add(t, d, **k): tl.append(dict(t=round(t, 3), d=round(d, 3), **k))
chaps = [(s['t'], s['title']) for s in segs if s['kind'] == 'chapter']; ci = 0
bounds = []  # окна абзацев
vi = 0
for i, s in enumerate(segs):
    if s['kind'] != 'voice': continue
    a = 0.0 if vi == 0 else s['t']; b = film['total']
    for j in range(i + 1, len(segs)): b = segs[j]['t'] - 1.6 if segs[j]['kind'] == 'chapter' else segs[j]['t']; break
    bounds.append((a, b)); vi += 1
cardjobs = []
for idx, ((a, b), p) in enumerate(zip(bounds, paras)):
    cue = p['cue']; qs = (cue.get('b', []) or ['city street'])[:2]; big = cue.get('big'); t = a; dur_total = b - a
    if big and dur_total > 6:
        png = f'{J}/card_big_{idx}.png'; cardjobs.append(dict(type='bignum', big=big['n'], label=big.get('l', ''), bg='black', out=png)); add(t, 3.6, type='card', src=png); t += 3.6
    n = max(1, round((b - t) / 4.6)); shot = (b - t) / n
    for j in range(n):
        k, v = pick(qs[j % len(qs)])
        if not k:
            for q in qs:
                k, v = pick(q)
                if k: break
        if k: add(t + j * shot, shot, type='clip', src=f'stock/{k}.mp4', ss=0.3)
        else: add(t + j * shot, shot, type='card', src=f'{C}/black.png')
# заставки глав
for ct, title in chaps:
    if ct < 0.01: continue
    png = f'{J}/card_ch_{int(ct)}.png'; num = [x for x in chaps if x[0] > 0.01].index((ct, title)) + 1
    cardjobs.append(dict(type='chapter', num=f'{num:02d}', title=title, icon=icons.get(title, ''), out=png)); add(ct - 1.6, 2.6, type='card', src=png)
# окна абзацев не должны пересекаться с заставками: заставка занимает [ct-1.6, ct+1.0]; абзацы уже заканчиваются на ct-1.6 и начинаются на ct+1.0 (по layout)
tl.sort(key=lambda x: x['t'])
if not os.path.exists(f'{C}/black.png'): cardjobs.append(dict(type='bignum', big='', label='', bg='black', out=f'{C}/black.png'))
json.dump(cardjobs, open('/tmp/cj.json', 'w'), ensure_ascii=False); subprocess.run(['node', f'{C}/cards.mjs', '/tmp/cj.json'], check=True)
json.dump(dict(segs=tl), open(f'{J}/timeline.json', 'w'), ensure_ascii=False, indent=0)
# проверка непрерывности
prev = 0.0
for s in tl:
    if abs(s['t'] - prev) > 0.15: print('ДЫРА/нахлёст', round(prev, 2), '->', round(s['t'], 2))
    prev = s['t'] + s['d']
print('segments', len(tl), 'clips used', len(used)); json.dump(CRED, open(f'{J}/credits_pixabay.json', 'w'), ensure_ascii=False, indent=1)
# музыка
M = f'{R}/paperson/music'; mus = f'{J}/music.wav'
if not os.path.exists(mus):
    T = film['total']; ids = ['41', '76', '22', '18']; args = []; filt = ''; prevl = '[0]'
    for m in ids: args += ['-i', f'{M}/mixkit_{m}.mp3']
    for i in range(1, len(ids)): filt += f'{prevl}[{i}]acrossfade=d=4[c{i}];'; prevl = f'[c{i}]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', f'{filt}{prevl}atrim=0:{T},asetpts=N/SR/TB,volume=0.13,afade=t=in:d=3,afade=t=out:st={T - 5}:d=5[o]', '-map', '[o]', '-ar', '48000', '-ac', '2', mus], check=True)
t0, t1 = (sys.argv[2], sys.argv[3]) if len(sys.argv) > 3 else ('0', str(film['total']))
os.makedirs(f'{J}/video', exist_ok=True); out = f'{J}/video/{slug}.mp4' if len(sys.argv) <= 3 else f'/tmp/claude-0/-home-user-sofia-studio/0950eaf2-4d18-5708-ba0e-bdb1f07766d9/scratchpad/{slug}_excerpt.mp4'
subprocess.run(['python3', f'{C}/compose.py', slug, f'{J}/timeline.json', out, t0, t1], check=True)
