# Монтажный лист: где в общем времени начинается каждый абзац озвучки и каждый кадр.
import json, os, sys
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from script import PARAS, GAP_AFTER
from media_list import INTRO, BEAT2, SHOTS
PRE = round(len(INTRO) * BEAT2 * 30) / 30   # вступление: нарезка в такт музыке, без голоса
TAIL = 5.0
FPS = 30

def build():
    paras, shots, t = [], [], PRE
    for name, _ in PARAS:
        j = json.load(open(f'{D}/vo/{name}.json'))
        trim = max(0.0, j['speech_start'] - 0.06)
        end = j['speech_end'] + 0.12 - trim
        paras.append(dict(name=name, start=t, file=f'{D}/vo/{name}.mp3', len=end, trim=trim))
        for k, c in j['cuts'].items(): shots.append([k, t + max(0.0, c - trim), name, c])
        t += end + GAP_AFTER[name]
    total = t + TAIL
    out = []
    for i, (k, sh) in enumerate(INTRO):
        out.append(dict(key=k, start=round(i * BEAT2 * FPS) / FPS, **sh))
    for i, (k, s, pname, c) in enumerate(shots):
        s = PRE if i == 0 else round((s - 2 / FPS) * FPS) / FPS
        out.append(dict(key=k, start=s, vo=(pname, c), **SHOTS[k]))
    for i, sh in enumerate(out):
        sh['dur'] = round(((out[i + 1]['start'] if i + 1 < len(out) else round(total * FPS) / FPS) - sh['start']) * FPS) / FPS
    # одна анимация (карта, график) на несколько планов подряд: каждый следующий план продолжает её с того же места
    i = 0
    while i < len(out):
        g = out[i].get('map')
        if g:
            j, acc = i, 0.0
            while j < len(out) and out[j].get('map') == g:
                out[j]['ss'] = round(acc, 3); acc += out[j]['dur']; j += 1
            for q in range(i, j): out[q]['gfx_total'] = acc
            i = j
        else: i += 1
    return paras, out, round(total * FPS) / FPS

if __name__ == '__main__':
    p, s, total = build()
    for x in s: print(f"{x['start']:7.2f} {x['dur']:5.2f}  {x['key']:4} " + ', '.join(f'{k}={v}' for k, v in x.items() if k not in ('key', 'start', 'dur')))
    d = [x['dur'] for x in s]
    print(f'total {total:.1f}s = {total/60:.1f} min, shots {len(s)}, avg {sum(d)/len(d):.2f}s, min {min(d):.2f}, max {max(d):.2f}')
