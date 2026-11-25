#!/usr/bin/env python3
"""python3 tools/auto_paper.py <slug>: SCRIPT.md (с разметкой '>> {json}') + <slug>/film.json -> flat2d/sb_<slug>.js, scenes_<slug>.js.
Нужны: ru_geo/<slug>/film.json (tools/build_film.py), ru_geo/<slug>/archive/credits.json (archive/pick.py)."""
import json, os, re, sys
R_ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); slug = sys.argv[1]; J = f'{R_}/{slug}'; F = f'{R_}/flat2d'
film = json.load(open(f'{J}/film.json', encoding='utf8')); cr = json.load(open(f'{J}/archive/credits.json', encoding='utf8')) if os.path.exists(f'{J}/archive/credits.json') else {}
voice = [s for s in film['segs'] if s['kind'] == 'voice']
L = open(f'{J}/SCRIPT.md', encoding='utf8').read().split('## ТАБЛИЦА ФАКТОВ')[0].splitlines()
paras, chapters = [], {}; cur_ch = None; last = None
for l in L:
    t = l.strip()
    if t.startswith('## '): cur_ch = t[3:].strip(); last = ('chapter', cur_ch); continue
    if t.startswith('>>'):
        try: d = json.loads(t[2:].strip())
        except Exception as e: sys.exit(f'bad json: {t[:80]} {e}')
        if last and last[0] == 'chapter': chapters[last[1]] = d.get('card', {}).get('photo')
        elif last and last[0] == 'para': paras[-1]['cue'] = d
        continue
    if not t or t.startswith(('---', '#', '|')): continue
    txt = re.sub(r'\s+', ' ', re.sub(r'\[[a-z ]+\]', '', t)).strip()
    if txt: paras.append(dict(text=txt, cue={})); last = ('para', txt)
if len(paras) != len(voice): sys.exit(f'абзацев в сценарии {len(paras)} != озвученных {len(voice)}')
js = lambda x: json.dumps(x, ensure_ascii=False)
def photo_ok(k): return k in cr
out = ["import { CARD_BG } from './engine.js';", "import { hero, tags } from './paper_common.js';", "const ph = (src, o = {}) => ({ scene: 'photo', sp: { src, tone: 'sepia', dim: 0.16 }, sticker: true, cams: [[960, 540, 1.0, 1.1]], actors: o.actors || [], hud: o.hud, to: o.to });", 'export const SB = [']
miss = set()
for i, (p, seg) in enumerate(zip(paras, voice)):
    cue = p['cue'] or {}; dur = seg['dur']; ent = []
    if cue.get('card'):
        items = cue['card'].get('items', [])[:3]; its = [dict(big=a, label=b, at=round(0.3 + k * min(2.0, dur / (len(items) + 1)), 2)) for k, (a, b) in enumerate(items)]
        sp = dict(bg='#ffd98a', items=its)
        if cue['card'].get('bg') and photo_ok(cue['card']['bg']): sp = dict(bgPhoto=cue['card']['bg'], tone='sepia', items=its)
        ent.append(f"{{ scene: 'info', sp: {js(sp)}, cams: ['w'], actors: [], to: 99 }}")
    else:
        shots = [k for k in cue.get('shots', []) if k]; ok = [k for k in shots if photo_ok(k)]; miss |= set(shots) - set(ok)
        if not ok: ok = [next(iter(cr))] if cr else ['']
        n = len(ok); hero_c = cue.get('hero'); tg = cue.get('tags', [])[:3]
        for j, k in enumerate(ok):
            to = 99 if j == n - 1 else round(dur * (j + 1) / n, 2); a0 = dur * j / n; a1 = dur * (j + 1) / n if j < n - 1 else dur + 2
            acts = f"[hero({{ emo: {js(hero_c.get('emo', 'flat'))}, x: {1480 if hero_c.get('side', 'R') == 'R' else 440}{', item: ' + js(hero_c['item']) if hero_c.get('item') not in (None, 'none') else ''} }})]" if hero_c and j == min(1, n - 1) else '[]'
            tl = [t for t in tg if a0 - 0.05 <= t[1] * dur < a1]
            right = bool(hero_c) and hero_c.get('side', 'R') == 'L'; x = 1360 if right else 560
            tcalls = ', '.join(f"[{js(t[0])}, {x}, {250 + m * 130}, {round(max(0.1, t[1] * dur - a0), 2)}, {62 if len(t[0]) < 18 else 50}, {(-0.03, 0.02, -0.02)[m % 3]}]" for m, t in enumerate(tl))
            ent.append(f"ph({js(k)}, {{ actors: {acts}, hud: {('tags(' + tcalls + ')') if tcalls else 'undefined'}, to: {to} }})")
    out.append(f"  {{ m: {js(p['text'])}, seq: [{', '.join(ent)}] }},")
out.append('];')
out.append('export const CARDS = ' + js({k: v for k, v in chapters.items() if v and photo_ok(v)}) + ';')
out.append('Object.assign(CARD_BG, CARDS);')
open(f'{F}/sb_{slug}.js', 'w', encoding='utf8').write('\n'.join(out) + '\n')
open(f'{F}/scenes_{slug}.js', 'w', encoding='utf8').write("import './scenes_chernobyl.js';\n")
print('sb written:', len(paras), 'paras;', 'нет фото для ключей:', sorted(miss))
