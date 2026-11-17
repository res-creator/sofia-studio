# fixshot.py — отрендерить несколько шотов проекта-источника на новом (локальном) таймлайне для vedit.py.
# usage: python3 fixshot.py spec.json   spec: {src, name, dur, words: [[w, t0, t1]...], shots: [{id, start, end, tpl, params, in?}], out, workers}
import json, os, subprocess, sys
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = json.load(open(sys.argv[1])); src = os.path.join(R, 'projects', s['src']); P = os.path.join(R, 'projects', '_fix_' + s['name'])
os.makedirs(os.path.join(P, 'story'), exist_ok=True); os.makedirs(os.path.join(P, 'timeline'), exist_ok=True)
for k in ('scenes', 'assets', 'input'):
    d = os.path.join(P, k)
    if not os.path.lexists(d): os.symlink(os.path.realpath(os.path.join(src, k)), d)
cfg = json.load(open(os.path.join(src, 'config.json'))); cfg['duration'] = s['dur']; cfg['fadeIn'] = 0; cfg['fadeOut'] = 0; json.dump(cfg, open(os.path.join(P, 'config.json'), 'w'), ensure_ascii=False)
json.dump({'duration': s['dur'], 'shots': s['shots']}, open(os.path.join(P, 'story/shots.json'), 'w'), ensure_ascii=False)
json.dump({'words': [{'word': w, 'start': a, 'end': b} for w, a, b in s.get('words', [])]}, open(os.path.join(P, 'timeline/words.json'), 'w'), ensure_ascii=False)
env = {**os.environ, 'PW_CHROMIUM': '/opt/pw-browsers/chromium'}
if '--stills' in sys.argv:
    subprocess.run(['node', 'render.mjs', '--project', P, '--stills', sys.argv[sys.argv.index('--stills') + 1], '--scale', '0.5'], cwd=R, env=env, check=True); sys.exit()
subprocess.run(['node', 'render.mjs', '--project', P, '--from', '0', '--to', str(s['dur']), '--workers', str(s.get('workers', 2)), '--format', 'jpeg', '--crf', '16', '--preset', 'veryfast', '--out', s['out']], cwd=R, env=env, check=True, stdout=subprocess.DEVNULL)
print('rendered', s['out'])
