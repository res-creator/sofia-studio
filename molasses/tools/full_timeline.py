# Builds full/timeline_full.json + full/vo/full_narration.wav
# cold open (vo/todd, unchanged) -> for each chapter: card (silence) + lead + chapter voice + tail
import json, subprocess
CARD, LEAD, TAIL = 2.6, 0.3, 0.9
chs = json.load(open('full/chapters.json'))
cold = json.load(open('vo/todd/timeline.json'))
dur = lambda p: float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
t = cold['duration']; out = {'cold': {'start': 0, 'dur': cold['duration']}, 'chapters': [], 'lines': {}, 'words': []}
parts = [('vo/todd/narration_timed.wav', None)]
for k, c in enumerate(chs):
    w = json.load(open(f"full/vo/{c['id']}.words.json"))
    d = dur(f"full/vo/{c['id']}.mp3")
    card = t; vo = t + CARD + LEAD; end = vo + d + TAIL
    out['chapters'].append({'id': c['id'], 'num': k + 1, 'label': c['label'], 'title': c['title'], 'card': round(card, 3), 'vo': round(vo, 3), 'end': round(end, 3)})
    for x in w:
        s, e = round(vo + x['s'], 3), round(vo + x['e'], 3)
        out['words'].append({'w': x['w'], 's': s, 'e': e, 'line': x['line']})
        L = out['lines'].setdefault(x['line'], {'s': s, 'e': e, 'ch': c['id'], 'words': []})
        L['e'] = e; L['words'].append(s)
    parts.append((f"full/vo/{c['id']}.mp3", (CARD + LEAD, d, TAIL)))
    t = end
out['duration'] = round(t + 6.0, 3)  # 6 s end card
json.dump(out, open('full/timeline_full.json', 'w'))
# audio
fc = []; ins = []; labels = []
for i, (p, pad) in enumerate(parts):
    ins += ['-i', p]
    if pad is None: fc.append(f'[{i}:a]aresample=44100,aformat=channel_layouts=mono[p{i}]')
    else: fc.append(f'[{i}:a]aresample=44100,aformat=channel_layouts=mono,adelay={int(pad[0]*1000)},apad=pad_dur={pad[2]}[p{i}]')
    labels.append(f'[p{i}]')
fc.append(''.join(labels) + f'concat=n={len(parts)}:v=0:a=1,apad=pad_dur=6.0[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '44100', '-ac', '1', 'full/vo/full_narration.wav'], check=True)
print('total', out['duration'], 'audio', dur('full/vo/full_narration.wav'))
