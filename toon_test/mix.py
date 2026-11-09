import json, subprocess
TL = json.load(open('timeline.json')); I = {i['id']: i for i in TL['items']}
def at(id, frac=0.0): i = I[id]; return i['t0'] + frac * (i['t1'] - i['t0'])
inputs, filt = [], []
def add(path, t, vol=1.0, trim=None):
    k = len(inputs) // 2 + 1; inputs.extend(['-i', path])
    f = f'[{k}:a]'
    if trim: f += f'atrim={trim[0]:.3f}:{trim[0]+trim[1]:.3f},asetpts=PTS-STARTPTS,'
    f += f'volume={vol},adelay={int(t*1000)}|{int(t*1000)}[a{k}]'
    filt.append(f)
for it in TL['items']:
    if it['kind'] == 'line': add(f"vo/{it['id']}.mp3", it['t0'], 1.0, (it['clipIn'], it['clipDur']))
S = 'sfx/'
add(S+'jingle.mp3', 0, 0.6)
add(S+'sneak.mp3', at('e1'), 0.35)
add(S+'chime.mp3', at('wake', 0.3), 0.6)
add(S+'buzzer.mp3', at('f2'), 0.45)
add(S+'pop.mp3', at('disguise'), 0.7)
add(S+'laugh.mp3', at('f3', 1) - 0.1, 0.35)
add(S+'yank.mp3', at('unplug', 0.5), 0.7)
add(S+'boot.mp3', at('f4') - 0.1, 0.5)
add(S+'click.mp3', at('lights', 0.1), 0.7)
add(S+'door.mp3', at('icecream', 0.1), 0.6)
add(S+'laugh.mp3', at('p2', 1) - 0.1, 0.35)
add(S+'door.mp3', at('salad'), 0.6)
add(S+'trombone.mp3', at('e10', 1) - 0.2, 0.6)
add(S+'laugh.mp3', at('end') + 0.6, 0.45)
add(S+'jingle.mp3', at('end') + 1.2, 0.5)
n = len(inputs) // 2
fc = ';'.join(filt) + ';' + ''.join(f'[a{k}]' for k in range(1, n + 1)) + f'amix=inputs={n}:normalize=0,alimiter=limit=0.9,loudnorm=I=-14:TP=-1.5[out]'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video_noaudio.mp4', *inputs, '-filter_complex', fc, '-map', '0:v', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', 'the_pickens_smart_fridge.mp4'], check=True)
