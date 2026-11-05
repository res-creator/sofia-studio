# Rough cut 3 on a TEMPORARY voice (local Piper TTS, not the narrator; no ElevenLabs credits).
# Reads script/film_v3.json (make_script_v3.py). Maps rendered by maps_v3.py at the exact length they cover.
# Output: harvey/rough/harvey_rough_v3_tempvoice.mp4 + harvey/rough/timeline_v3.json. The v2 rough cut is left as it is.
import json, os, re, subprocess, wave, textwrap, importlib.util
import numpy as np

ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
RAW = ROOT + '/assets/raw'
TMP = os.environ.get('ROUGH_TMP', '/tmp/harvey_rough3')
PIPER = os.environ.get('PIPER_DIR', TMP + '/piper') + '/en_US-ryan-medium.onnx'
OUT = ROOT + '/rough'
W, H, FPS, SR = 1280, 720, 25, 48000
LEN_SCALE = 1.4
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'; FONTB = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
BG = '0x101214'
for d in ('vo', 'seg', 'maps'): os.makedirs(f'{TMP}/{d}', exist_ok=True)
os.makedirs(OUT, exist_ok=True)

def dv(i): return f'{RAW}/dvids/dvids_{i}.mp4'
GOES = f'{RAW}/other/noaa_star_goes16_harvey_geocolor.mp4'
FREEZE = {'K1': ('620835', 119.2, 0, 1920), 'G1': ('620838', 115.0, 240, 1400)}
def run(cmd): subprocess.run(cmd, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def esc(t): return t.replace('\\', '\\\\').replace(':', '\\:').replace("'", '’').replace('%', '\\%').replace(',', '\\,')

seq = json.load(open(ROOT + '/script/film_v3.json'))['seq']
src_mtime = os.path.getmtime(ROOT + '/script/film_v3.json')
# 1) temp narration
for it in seq:
    if it['k'] != 'vo': continue
    p = f"{TMP}/vo/{it['id']}.wav"
    if not os.path.exists(p) or open(p + '.txt').read() != it['text'] if os.path.exists(p + '.txt') else True:
        subprocess.run(['python3', '-m', 'piper', '-m', PIPER, '--length-scale', str(LEN_SCALE), '-f', p], input=it['text'], text=True, check=True, capture_output=True)
        open(p + '.txt', 'w').write(it['text'])
# 2) timeline
t = 0.0; TL = []
for it in seq:
    g = it.get('gap', 0) or 0
    d = dur(f"{TMP}/vo/{it['id']}.wav") if it['k'] == 'vo' else (sum(b - a for a, b in it['segs']) + 0.35 * (len(it['segs']) - 1)) if it['k'] == 'bite' else it['secs']
    TL.append(dict(it, vs=round(t, 3), s=round(t + g, 3), e=round(t + g + d, 3))); t += g + d
TOTAL = t + 0.5
json.dump({'total': round(TOTAL, 2), 'items': [{k: v for k, v in x.items() if k != 'shots'} | {'shots': x['shots']} for x in TL]}, open(OUT + '/timeline_v3.json', 'w'), indent=1)

# 3) picture
def label_vf(lbl):
    if not lbl or lbl.startswith('—'): return ''
    fs = 20 if len(lbl) < 95 else 15
    return (f",drawbox=x=0:y=ih-64:w=iw:h=64:color=black@0.45:t=fill,"
            f"drawtext=fontfile={FONT}:text='{esc(lbl)}':fontsize={fs}:fontcolor=white@0.92:x=36:y=h-42")
FIT = f'scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color={BG},setsar=1'
ENC = ['-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p']
def card(text, d, out, big=False):
    lines = [w for para in text.split('\n') for w in (textwrap.wrap(para, 52) or [''])]; fs = 54 if big else 30
    dt = ','.join(f"drawtext=fontfile={FONTB if big else FONT}:text='{esc(l)}':fontsize={fs}:fontcolor=white:x=(w-text_w)/2:y=(h/2)-{(len(lines)-1)*fs*0.8}+{i*fs*1.6}" for i, l in enumerate(lines))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c={BG}:s={W}x{H}:r={FPS}:d={d}', '-vf', dt] + ENC + [out])
def still(img, d, out, lbl, push=0.06):
    n = max(2, int(d * FPS))
    vf = (f'scale=2560:1440:force_original_aspect_ratio=decrease,pad=2560:1440:(ow-iw)/2:(oh-ih)/2:color={BG},'
          f"zoompan=z='1+{push}*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}" + label_vf(lbl))
    run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', img, '-vf', vf, '-t', f'{d:.3f}'] + ENC + [out])
def shot(sh, d, lbl, out, item):
    k = sh[0]
    if k == 'clip':
        src, a, b = sh[1], sh[2], sh[3]; L = b - a
        vf = FIT + (f',setpts=PTS*{d / L:.4f}' if d > L * 1.3 else '') + f',tpad=stop_mode=clone:stop_duration={d:.2f}' + label_vf(lbl)
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-i', dv(src), '-vf', vf, '-t', f'{d:.3f}'] + ENC + [out])
    elif k == 'goes':
        a, b = sh[1], sh[2]; L = b - a
        vf = f'crop=1200:675:0:262,scale={W}:{H}' + (f',setpts=PTS*{d / L:.4f}' if d > L else '') + f',tpad=stop_mode=clone:stop_duration={d:.2f}' + label_vf(lbl)
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a), '-i', GOES, '-vf', vf, '-t', f'{d:.3f}'] + ENC + [out])
    elif k == 'freeze':
        src, tt, cx, cw = FREEZE[sh[1]]; img = f'{TMP}/fr_{sh[1]}.png'
        if not os.path.exists(img): run(['ffmpeg', '-v', 'error', '-y', '-ss', str(tt), '-i', dv(src), '-frames:v', '1', '-vf', f'crop={cw}:{int(cw*9/16)}:{cx}:0,scale=1920:1080', img])
        still(img, d, out, lbl)
    elif k == 'photo': still(ROOT + '/' + sh[1], d, out, lbl)
    elif k == 'card': card(sh[1], d, out, big=(item == 'o3'))
    elif k == 'black': run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}:d={d}'] + ENC + [out])
    elif k == 'map':
        m = f"{TMP}/maps/{sh[1]}_{d:.2f}.mp4"
        if not os.path.exists(m): run(['python3', ROOT + '/tools/maps_v3.py', sh[1], f'{d:.3f}', m, str(W), str(H)])
        vf = 'null' + label_vf(lbl) if lbl and not lbl.startswith('—') and sh[1] in () else 'null'
        run(['ffmpeg', '-v', 'error', '-y', '-i', m, '-vf', vf, '-t', f'{d:.3f}'] + ENC + [out])
    elif k == 'sync':
        # speaker in sync for the first sh[3] s of the bite's sound, then the next shot of the item takes over
        pass

segs = []; i = 0
while i < len(TL):
    it = TL[i]; shots = it['shots']
    # merge consecutive items that share one map
    if len(shots) == 1 and shots[0][0] == 'map':
        j = i
        while j + 1 < len(TL) and TL[j + 1]['shots'] == shots: j += 1
        d = TL[j]['e'] - it['vs']; p = f"{TMP}/seg/{it['id']}_map.mp4"; shot(shots[0], d, it['label'], p, it['id']); segs.append(p); i = j + 1; continue
    d_all = it['e'] - it['vs']
    if shots[0][0] == 'sync':
        src = shots[0][1]; on = min(shots[0][3], d_all); a0 = it['segs'][0][0]
        lead = it['s'] - it['vs']; lbl = it['label'].split(' → ')[0] if not it['label'].startswith('—') else '—'
        if src == '551726' and it['id'] in ('f2', 'f4'): lbl = '—'
        p = f"{TMP}/seg/{it['id']}_sync.mp4"; take = min(on, sum(b - a for a, b in it['segs'])) + lead
        run(['ffmpeg', '-v', 'error', '-y', '-ss', str(max(0, a0 - lead)), '-i', dv(src), '-vf', FIT + label_vf(lbl), '-t', f'{take:.3f}'] + ENC + [p]); segs.append(p)
        rest = d_all - take
        if rest > 0.05:
            if len(shots) > 1:
                p2 = f"{TMP}/seg/{it['id']}_rest.mp4"; lbl2 = it['label'].split(' → ')[-1]; shot(shots[1], rest, lbl2, p2, it['id']); segs.append(p2)
            else:
                p2 = f"{TMP}/seg/{it['id']}_rest.mp4"
                run(['ffmpeg', '-v', 'error', '-y', '-ss', str(a0 + on), '-i', dv(src), '-vf', FIT + label_vf(lbl) + f',tpad=stop_mode=clone:stop_duration={rest:.2f}', '-t', f'{rest:.3f}'] + ENC + [p2]); segs.append(p2)
        i += 1; continue
    w = [(s[3] - s[2]) if s[0] in ('clip', 'goes') and len(s) > 3 else (s[2] - s[1]) if s[0] == 'goes' else 6.0 for s in shots]
    ds = [d_all * x / sum(w) for x in w]
    labels = it['label'].split(' → ') if ' → ' in it['label'] else [it['label']] * len(shots)
    for j, (sh, d) in enumerate(zip(shots, ds)):
        p = f"{TMP}/seg/{it['id']}_{j}.mp4"; shot(sh, d, labels[min(j, len(labels) - 1)], p, it['id']); segs.append(p)
    i += 1
open(f'{TMP}/all.txt', 'w').write(''.join(f"file '{p}'\n" for p in segs))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{TMP}/all.txt', '-c', 'copy', f'{TMP}/video.mp4'])

# 4) sound
N = int((TOTAL + 1) * SR)
def readwav(src, ss=None, t=None):
    run(['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', src, '-ac', '1', '-ar', str(SR), f'{TMP}/x.wav'])
    with wave.open(f'{TMP}/x.wav') as f: return np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.zeros(N, np.float32); nat = np.zeros(N, np.float32)
def put(buf, at, a, g=1.0):
    i0 = int(at * SR); a = a[:max(0, N - i0)].copy(); f = min(len(a) // 2, int(0.04 * SR))
    if f: a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    buf[i0:i0 + len(a)] += a * g
def norm(a, lvl): a = a - a.mean(); return a / (np.sqrt((a ** 2).mean()) + 1e-9) * lvl
for it in TL:
    if it['k'] == 'vo': put(voice, it['s'], norm(readwav(f"{TMP}/vo/{it['id']}.wav"), 0.08))
    elif it['k'] == 'bite':
        at = it['s']
        for sa, sb in it['segs']: put(voice, at, norm(readwav(dv(it['src']), sa, sb - sa), 0.075)); at += sb - sa + 0.35
# natural sound from every clip shot, at its position (551726 b-roll carries a reporter's voice: muted)
pos = 0.0; i = 0
for it in TL:
    shots = it['shots']; d_all = it['e'] - it['vs']; pos = it['vs']
    if shots[0][0] in ('map', 'sync') or it['k'] == 'bite': continue
    w = [(s[3] - s[2]) if s[0] in ('clip', 'goes') and len(s) > 3 else 6.0 for s in shots]
    for sh, d in zip(shots, [d_all * x / sum(w) for x in w]):
        if sh[0] == 'clip' and sh[1] not in ('551726', '548574'):
            try:
                a = readwav(dv(sh[1]), sh[2], min(d, sh[3] - sh[2]))
                lvl = 0.07 if it['k'] == 'nat' else 0.035
                if sh[1] == '546948' and it['k'] == 'nat': lvl = 0.09
                put(nat, pos, norm(a, lvl))
            except Exception: pass
        pos += d
def sm(x, w):
    n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
duck = 1 - 0.7 * np.clip(sm(voice, 0.4) / 0.02, 0, 1)
mix = voice + nat * duck; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open(f'{TMP}/mix.wav', 'w') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
run(['ffmpeg', '-v', 'error', '-y', '-i', f'{TMP}/video.mp4', '-i', f'{TMP}/mix.wav', '-filter_complex',
     f"[0:v]drawtext=fontfile={FONT}:text='ROUGH CUT 3 · TEMPORARY VOICE (not the narrator) · no music yet':fontsize=15:fontcolor=white@0.5:x=w-text_w-24:y=18[v];[1:a]loudnorm=I=-16:TP=-1.5[a]",
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-c:a', 'aac', '-b:a', '160k', '-shortest', OUT + '/harvey_rough_v3_tempvoice.mp4'])
print('total', round(TOTAL, 1))
