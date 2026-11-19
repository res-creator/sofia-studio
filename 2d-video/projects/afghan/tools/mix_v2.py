# Звук v2: голос + музыка (как mix.py: кроссфейды, приглушение под голос) + SFX из story/shots.json ("sfx": [{t, name, gain, dur}])
# процедурные звуки из 2d-video/audio/sfx.py (генерируются, без скачивания), громкость −14 LUFS.
#   python3 tools/mix_v2.py OUT.wav [FROM TO]     (FROM/TO — вырезать отрезок фильма, громкость считается по нему)
import json, os, subprocess, sys
import numpy as np
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ROOT = os.path.abspath(os.path.join(P, '../../..'))
sys.path.insert(0, os.path.join(ROOT, '2d-video/audio'))
import sfx as SFX
from dsp import SR, write_wav
M = os.path.join(ROOT, 'ru_geo/data/music/kml'); B = os.path.join(P, 'build'); os.makedirs(B, exist_ok=True)
OUT = sys.argv[1]; A = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
story = json.load(open(os.path.join(P, 'story/shots.json'))); END = float(sys.argv[3]) if len(sys.argv) > 3 else story['duration']
CUES = json.load(open(os.path.join(P, 'story/music.json'))); vo = os.path.join(P, 'input/voiceover.mp3')
T0 = max(0.0, A - 2.0)   # музыка/голос с запасом до начала отрезка
args = ['ffmpeg', '-y', '-v', 'error', '-ss', f'{T0:.3f}', '-t', f'{END - T0:.3f}', '-i', vo]; fc = []; labs = []
for i, c in enumerate([c for c in CUES if c['start'] < END and c['end'] > T0]):
    st, en = c['start'], min(c['end'], END); fi, fo = c.get('fadeIn', 1.0), c.get('fadeOut', 1.2)
    off = c.get('offset', 0) + max(0.0, T0 - st); st2 = max(st, T0); d = en - st2
    args += ['-ss', f'{off:.3f}', '-t', f'{d + fo:.3f}', '-i', os.path.join(M, c['file'])]
    fin = f'afade=t=in:d={fi},' if st >= T0 else ''
    dl = int((st2 - T0) * 1000)
    fc.append(f"[{len(labs)+1}:a]aresample=48000,aformat=channel_layouts=stereo,volume={c.get('gain', 0)}dB,{fin}afade=t=out:st={d - 0.01:.3f}:d={fo},adelay={dl}|{dl}[m{len(labs)}]"); labs.append(f'[m{len(labs)}]')
fc.append(f"{''.join(labs)}amix=inputs={len(labs)}:normalize=0[mus]")
fc.append("[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v1][v2]")
fc.append("[mus][v2]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500:makeup=1[duck]")
fc.append(f"[v1][duck]amix=inputs=2:normalize=0:weights=1 0.55,atrim=0:{END - T0:.3f}[out]")
raw = os.path.join(B, 'vm_raw.wav'); subprocess.run(args + ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', str(SR), '-c:a', 'pcm_f32le', raw], check=True)
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', raw, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
v = x[np.abs(x).mean(1) > 10 ** (-40 / 20)]; vr = 20 * np.log10(np.sqrt((v ** 2).mean()) + 1e-9) if len(v) else -20
hits = np.zeros_like(x); cache = {}; n = 0
for c in story.get('sfx', []):
    if not (T0 <= c['t'] < END): continue
    key = (c['name'], c.get('dur')); snd = cache.get(key)
    if snd is None: snd = cache[key] = SFX.make(c['name'], dur=c.get('dur'))
    i0 = int((c['t'] - T0) * SR); m = min(len(snd), len(hits) - i0)
    if m > 0: hits[i0:i0 + m] += snd[:m] * 10 ** ((c.get('gain', -10) + vr + 12) / 20); n += 1
x += hits; pk = np.abs(x).max()
if pk > 0.98: x = np.tanh(x / pk * 1.1) / np.tanh(1.1) * 0.97
write_wav(os.path.join(B, 'vms_raw.wav'), x)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{A - T0:.3f}', '-i', os.path.join(B, 'vms_raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), OUT], check=True)
for f in ('vm_raw.wav', 'vms_raw.wav'): os.remove(os.path.join(B, f))
print('mix ok', OUT, 'sfx', n, 'voice rms', round(vr, 1))
