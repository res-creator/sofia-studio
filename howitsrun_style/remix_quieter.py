# Owner's note (Nov 2026): "background music much quieter in all videos".
# For each episode: set the music level in mix.py to mus * 0.1 with stronger ducking (was mus * 0.3, ducking 0.55),
# rebuild cues + mix.wav, and re-mux the existing video stream with the -14 LUFS master. The picture is not re-rendered.
# Usage: python3 howitsrun_style/remix_quieter.py ep1 ep2 ...
import os, re, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = 'out = (vo * 1.0 + fx * (1 - 0.6 * dk) + mus * 0.3 * (1 - 0.55 * dk)) * fade'
NEW = 'out = (vo * 1.0 + fx * (1 - 0.6 * dk) + mus * 0.1 * (1 - 0.7 * dk)) * fade   # owner: background music much quieter (was mus * 0.3, ducking 0.55)'
TMP = tempfile.mkdtemp(prefix='remix_')
for ep in sys.argv[1:]:
    d = os.path.join(ROOT, ep)
    mix = open(f'{d}/mix.py').read()
    if OLD in mix: open(f'{d}/mix.py', 'w').write(mix.replace(OLD, NEW))
    elif 'mus * 0.1 * (1 - 0.7 * dk)' not in mix: print(ep, 'mix line not found'); continue
    out = re.search(r'master\.sh mix\.wav _video\.mp4 (\S+\.mp4)', open(f'{d}/build.sh').read()).group(1)
    run = lambda *a: subprocess.run(a, cwd=d, check=True, capture_output=True, text=True).stdout
    if os.path.exists(f'{d}/trim.py'): run('python3', 'trim.py')
    run('node', 'episode.js', 'cues'); run('python3', 'mix.py')
    T = run('node', '-e', "console.log(require('./episode.js').T)", 'none').strip()
    vid = f'{TMP}/{ep}_video.mp4'
    run('ffmpeg', '-v', 'error', '-y', '-i', out, '-map', '0:v', '-c', 'copy', vid)
    run('sh', '../howitsrun_style/master.sh', 'mix.wav', vid, out, T)
    i = subprocess.run(['ffmpeg', '-i', out, '-af', 'ebur128', '-f', 'null', '-'], cwd=d, capture_output=True, text=True).stderr
    lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', i)[-1]
    print(ep, out, lufs, 'LUFS', T, 's', flush=True)
print('temp dir (safe to delete):', TMP)
