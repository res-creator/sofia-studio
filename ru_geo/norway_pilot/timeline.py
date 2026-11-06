# Монтажный лист: где в общем времени начинается каждый абзац озвучки и каждый кадр.
import json, os, sys, subprocess
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
from script import PARAS, GAP_AFTER, SHOTS
PRE = 4.0    # вступление: 4 с только музыка и пролёт (у референса ~5 с)
TAIL = 3.5   # хвост после последнего слова
FPS = 30

def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)

def build():
    paras, shots, t = [], [], PRE
    for name, _ in PARAS:
        j = json.load(open(f'{D}/vo/{name}.json'))
        end = j['speech_end'] + 0.12
        paras.append(dict(name=name, start=t, file=f'{D}/vo/{name}.mp3', len=end))
        for k, c in j['cuts'].items(): shots.append([k, t + c])
        t += end + GAP_AFTER[name]
    total = t + TAIL
    shots[0][1] = 0.0
    # кадр меняется чуть раньше слова (на 2 кадра), как у монтажёра «под слово»
    out = []
    for i, (k, s) in enumerate(shots):
        s = 0.0 if i == 0 else round((s - 2 / FPS) * FPS) / FPS
        out.append(dict(key=k, start=s, **SHOTS[k]))
    for i, sh in enumerate(out):
        sh['dur'] = round(((out[i + 1]['start'] if i + 1 < len(out) else round(total * FPS) / FPS) - sh['start']) * FPS) / FPS
    return paras, out, round(total * FPS) / FPS

if __name__ == '__main__':
    p, s, total = build()
    for x in s: print(f"{x['start']:7.2f} {x['dur']:5.2f}  {x['key']:4} " + ', '.join(f'{k}={v}' for k, v in x.items() if k not in ('key', 'start', 'dur')))
    d = [x['dur'] for x in s]
    print(f'total {total:.1f}s, shots {len(s)}, avg {sum(d)/len(d):.2f}s, min {min(d):.2f}, max {max(d):.2f}')
