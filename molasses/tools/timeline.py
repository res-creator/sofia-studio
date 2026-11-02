# usage: python3 tools/timeline.py VARIANT_DIR
# Reads VARIANT_DIR/config.json {"audio": "...", "words": "...", "lead": s, "tail": s, "cuts": [[t, extra_s], ...]}
# Writes VARIANT_DIR/narration_timed.wav + VARIANT_DIR/timeline.json. Text is never changed; "cuts" only add silence.
import json, subprocess, sys
D = sys.argv[1]
cfg = json.load(open(f'{D}/config.json'))
LEAD, TAIL, CUTS = cfg['lead'], cfg['tail'], [tuple(c) for c in cfg.get('cuts', [])]
words = json.load(open(f"{D}/{cfg['words']}"))
src = f"{D}/{cfg['audio']}"
def nt(t): return t + LEAD + sum(e for c, e in CUTS if c <= t)
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))
edges = [0] + [c for c, _ in CUTS] + [dur]
fc = [f'anullsrc=r=44100:cl=mono,atrim=0:{LEAD}[s0]']; parts = ['[s0]']
for i in range(len(edges) - 1):
    fc.append(f'[0:a]atrim={edges[i]}:{edges[i+1]},asetpts=PTS-STARTPTS[a{i}]'); parts.append(f'[a{i}]')
    ext = CUTS[i][1] if i < len(CUTS) else TAIL
    fc.append(f'anullsrc=r=44100:cl=mono,atrim=0:{ext}[g{i}]'); parts.append(f'[g{i}]')
fc.append(''.join(parts) + f'concat=n={len(parts)}:v=0:a=1[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', ';'.join(fc), '-map', '[out]', '-ar', '44100', '-ac', '1', f'{D}/narration_timed.wav'], check=True)
total = LEAD + dur + sum(e for _, e in CUTS) + TAIL
tl = {'fps': 30, 'duration': round(total, 3), 'words': [{'w': w['w'], 's': round(nt(w['s']), 3), 'e': round(nt(w['e']), 3)} for w in words]}
json.dump(tl, open(f'{D}/timeline.json', 'w'), indent=0)
print('total', round(total, 3))
