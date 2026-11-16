# Звук: голос + музыка по смыслу (Kevin MacLeod, CC BY 4.0) с кроссфейдами и приглушением под голос → build/mix.wav
#   python3 tools/mix.py [END_SECONDS]
import json, os, subprocess, sys
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); ROOT = os.path.abspath(os.path.join(P, '../../..'))
M = os.path.join(ROOT, 'ru_geo/data/music/kml'); B = os.path.join(P, 'build'); os.makedirs(B, exist_ok=True)
CUES = json.load(open(os.path.join(P, 'story/music.json')))   # [{start, end, file, offset, gain}]
END = float(sys.argv[1]) if len(sys.argv) > 1 else json.load(open(os.path.join(P, 'config.json')))['duration']
vo = os.path.join(P, 'input/voiceover.mp3')
args = ['ffmpeg', '-y', '-v', 'error', '-t', f'{END:.3f}', '-i', vo]; fc = []; labs = []
for i, c in enumerate([c for c in CUES if c['start'] < END]):
    st, en = c['start'], min(c['end'], END); d = en - st; fi, fo = c.get('fadeIn', 1.0), c.get('fadeOut', 1.2)
    args += ['-ss', str(c.get('offset', 0)), '-t', f'{d + fo:.3f}', '-i', os.path.join(M, c['file'])]
    fc.append(f"[{i+1}:a]aresample=48000,aformat=channel_layouts=stereo,volume={c.get('gain', 0)}dB,afade=t=in:d={fi},afade=t=out:st={d - 0.01:.3f}:d={fo},adelay={int(st*1000)}|{int(st*1000)}[m{i}]"); labs.append(f'[m{i}]')
fc.append(f"{''.join(labs)}amix=inputs={len(labs)}:normalize=0[mus]")
fc.append("[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[v1][v2]")
fc.append("[mus][v2]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500:makeup=1[duck]")
fc.append(f"[v1][duck]amix=inputs=2:normalize=0:weights=1 0.55,atrim=0:{END:.3f},loudnorm=I=-14:TP=-1.5:LRA=11[out]")
args += ['-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '48000', os.path.join(B, 'mix.wav')]
subprocess.run(args, check=True); print('mix ok', END)
