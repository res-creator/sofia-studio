# Same mix for both versions: voices + knock + chain + chair + music bed.
import subprocess, os, json
D = os.path.dirname(os.path.abspath(__file__))
import sys
V2 = len(sys.argv) > 1 and sys.argv[1] == 'v2'
VO = {'d2b': 2.5, 'd2c': 9.25, 'd2d': 11.3}; T = 17.0 if V2 else 16.2
ev = [(f'vo/{k}.mp3', v, 1.0) for k, v in VO.items()] + [
  ('sfx/knock.mp3', 0.05, 0.9), ('sfx/boom.mp3', 0.3, 0.35), ('sfx/whoosh.mp3', 2.2, 0.35), ('sfx/drone.mp3', 2.3, 0.35), ('sfx/whoosh.mp3', 8.9, 0.3),
  ('sfx/boom.mp3', 9.05, 0.45), ('sfx/whoosh.mp3', 11.0, 0.3), ('sfx/chain.mp3', 12.75, 0.9), ('sfx/cart.mp3', 13.75, 0.25), ('sfx/boom.mp3', 14.6, 0.35)] + ([('sfx/pop.mp3', 15.3, 0.7), ('sfx/whoosh.mp3', 15.05, 0.3), ('sfx/knock.mp3', 15.8, 1.0), ('sfx/boom.mp3', 15.9, 0.8), ('sfx/whoosh.mp3', 15.88, 0.5)] if V2 else [('sfx/pop.mp3', 15.2, 0.7)])
args = ['ffmpeg', '-y', '-v', 'error']
for f, _, _ in ev: args += ['-i', f'{D}/{f}']
args += ['-stream_loop', '-1', '-i', f'{D}/sfx/music2.mp3']
fl = [f'[{i}:a]aresample=44100,aformat=channel_layouts=stereo,volume={v},adelay={int(s*1000)}|{int(s*1000)}[a{i}]' for i, (f, s, v) in enumerate(ev)]
n = len(ev); fl.append(f'[{n}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:{T},afade=t=in:d=0.5,afade=t=out:st={T-0.8}:d=0.8,volume=0.22[m]')
fl.append(''.join(f'[a{i}]' for i in range(n)) + f'[m]amix=inputs={n+1}:normalize=0:duration=longest,atrim=0:{T},alimiter=limit=0.9[out]')
subprocess.run(args + ['-filter_complex', ';'.join(fl), '-map', '[out]', '-t', str(T), f'{D}/out/mix' + ('_v2' if V2 else '') + '.wav'], check=True); print('mix ok')
