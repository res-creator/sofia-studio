# Inserts breathing pauses between sentences (text unchanged), writes vo/narration_timed.wav + src/data/timeline.json
import json, subprocess
LEAD = 0.6; TAIL = 4.5
CUTS = [(29.197, 0.5), (50.678, 0.3), (52.697, 0.4)]  # v2: no inserted pauses (owner: lively pace, no dramatic pauses)
words = json.load(open('vo/words_fast.json'))
def nt(t): return t + LEAD + sum(e for c, e in CUTS if c <= t)
src = 'vo/narration_fast.wav'
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
