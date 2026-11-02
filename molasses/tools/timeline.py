# Inserts breathing pauses between sentences (text unchanged), writes vo/narration_timed.wav + src/data/timeline.json
import json, subprocess
LEAD = 1.0; TAIL = 5.0
CUTS = [(4.5, .5), (11.5, .7), (14.55, .2), (21.7, .5), (28.85, .7), (32.36, 1.3), (40.1, .2), (49.1, .8), (53.62, .6), (55.3, .3), (57.55, 1.0)]
words = json.load(open('vo/words.json'))
def nt(t): return t + LEAD + sum(e for c, e in CUTS if c <= t)
src = 'vo/narration.mp3'
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))
edges = [0] + [c for c, _ in CUTS] + [dur]
fc = []; parts = []
fc.append(f'anullsrc=r=44100:cl=mono,atrim=0:{LEAD}[s0]'); parts.append('[s0]')
for i in range(len(edges) - 1):
    fc.append(f'[0:a]atrim={edges[i]}:{edges[i+1]},asetpts=PTS-STARTPTS[a{i}]'); parts.append(f'[a{i}]')
    ext = CUTS[i][1] if i < len(CUTS) else TAIL
    fc.append(f'anullsrc=r=44100:cl=mono,atrim=0:{ext}[g{i}]'); parts.append(f'[g{i}]')
fc.append(''.join(parts) + f'concat=n={len(parts)}:v=0:a=1[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '44100', '-ac', '1', 'vo/narration_timed.wav'], check=True)
total = LEAD + dur + sum(e for _, e in CUTS) + TAIL
tl = {'fps': 30, 'duration': round(total, 3), 'words': [{'w': w['w'], 's': round(nt(w['s']), 3), 'e': round(nt(w['e']), 3)} for w in words]}
json.dump(tl, open('src/data/timeline.json', 'w'), indent=0)
print('total', total)
