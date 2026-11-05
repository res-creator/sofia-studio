# Rough cut on a TEMPORARY voice, for checking pace only (not the film's narrator, no ElevenLabs credits used).
# Reads script/film_v2.json (from make_script_v2.py). Narration: local Piper TTS (en_US-ryan-medium), one file per line.
# Timeline uses the real length of each temp line plus the scripted pause before it; interview bites use their real in/out.
# Maps are placeholders (dark cards describing the map) until M1–M6 are built.
# Output: harvey/rough/harvey_rough_tempvoice.mp4 (1280x720) + harvey/rough/timeline.json
# Run from repo root: python3 harvey/tools/build_rough.py   (needs: pip install piper-tts; voice files in $PIPER_DIR)
import json, os, subprocess, wave, re, numpy as np

ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
RAW = ROOT + '/assets/raw'
TMP = os.environ.get('ROUGH_TMP', '/tmp/harvey_rough')
PIPER = os.environ.get('PIPER_DIR', TMP + '/piper') + '/en_US-ryan-medium.onnx'
OUT = ROOT + '/rough'
W, H, FPS, SR = 1280, 720, 25, 48000
LEN_SCALE = 1.35          # slows the temp voice to an unhurried documentary pace (~150-160 wpm)
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
FONTB = '/usr/share/fonts/opentype/inter/Inter-SemiBold.otf'
os.makedirs(TMP + '/vo', exist_ok=True); os.makedirs(TMP + '/seg', exist_ok=True); os.makedirs(OUT, exist_ok=True)

def dv(i): return f'{RAW}/dvids/dvids_{i}.mp4'
def ph(i): return f'{RAW}/photos/dvids_img_{i}.jpg'
GOES = f'{RAW}/other/noaa_star_goes16_harvey_geocolor.mp4'
USGS_HWM = f'{RAW}/other/usgs_high_water_marks.jpg'
# freeze frames: (src, t, crop x, crop w) — crop is 16:9 from the top, which removes the burned-in subtitles
K1, K2, K3 = ('620835', 119.2, 0, 1920), ('620835', 42.1, 40, 1400), ('620835', 34.6, 120, 1400)
G1 = ('620838', 115.0, 240, 1400)
MAPS = {
 'M1': 'MAP M1 — Day-3 High Risk outlook over greater Houston (Aug. 25); zoom stops at blurred streets',
 'M2': 'MAP M2 — coastal counties under evacuation orders; Harris County outlined, no general order',
 'M3': 'MAP M3 — track to Rockport, then the four-day stall',
 'M4': 'MAP M4 — rain over Harris County hour by hour, Sat evening → Sun morning; 9:27 p.m. flash flood emergency',
 'M4b': 'MAP M4b — north Houston, near Hardy Toll Road and Beltway 8',
 'M5a': 'MAP M5a — 154,170 flooded houses across Harris County; move west to two basins',
 'M5b': 'MAP M5b — Addicks and Barker; gates closed Aug. 25',
 'M5c': 'MAP M5c — pools spread into neighbourhoods inside the basins',
 'M5d': 'MAP M5d — Buffalo Bayou already high; releases from ≈ midnight Aug. 28',
 'M5e': 'MAP M5e — homes along the bayou; record pools Aug. 30',
 'M5': 'MAP M5 — final state',
 'M6': 'MAP M6 — the storm moves east; 60.58 in at Nederland',
}
# shots per item: ('clip', src, in, out) | ('freeze', spec) | ('photo', path) | ('map', key) | ('card', text) | ('box', src) synced bite
# | ('sync', src) synced bite full frame | ('black',)
S = {
 'o0': [('clip', '546526', 0, 3)], 'o1': [('freeze', K1)], 'o2': [('freeze', K2)], 'o3': [('freeze', K3)], 'o4': [('freeze', K3)],
 'o4b': [('photo', ph('3709576'))], 'o5': [('clip', '546164', 27, 36)], 'o6': [('clip', '546389', 42, 51)],
 'o7': [('card', 'HARVEY · HOUSTON, 2017')],
 'a1': [('goes', 0, 10)], 'a2': [('card', '"catastrophic and life-threatening flooding"\n"15 to 30 inches … isolated maximum amounts of 40 inches"')],
 'a3': [('map', 'M1')], 'a4': [('freeze', G1)], 'a5': [('map', 'M2')], 'a6': [('map', 'M2')],
 'a7': [('card', 'Hurricane Rita, Sept. 2005\nNTSB: 23 evacuees died in a bus fire on I-45, Sept. 23 — the day before landfall')],
 'a8': [('goes', 10, 16), ('map', 'M3')],
 'b1': [('map', 'M4')], 'b2': [('map', 'M4')], 'b3': [('clip', '551726', 3, 12)], 'b4': [('sync', '551726')],
 'b5': [('clip', '551726', 30, 36)], 'b6': [('clip', '546166', 0, 30)],
 'b7': [('card', '"If you have a boat, we need your help."\n— Harris County Judge Ed Emmett, Aug. 27, 2017')], 'b8': [('map', 'M4b')],
 'c1': [('photo', ph('3710048')), ('photo', ph('3709578'))], 'c2': [('clip', '546164', 27, 36), ('clip', '546836', 0, 20)],
 'c3': [('clip', '546164', 45, 53), ('clip', '546164', 78, 86)], 'c4': [('clip', '546164', 108, 114)],
 'c5': [('freeze', K1)], 'c6': [('freeze', K2)], 'c9': [('freeze', K2)], 'c10': [('freeze', K1)],
 'c11': [('photo', ph('3709578'))], 'c11b': [('photo', ph('3709578'))],
 'c12': [('clip', '546526', 0, 12), ('clip', '546526', 33, 45)], 'c13': [('clip', '546389', 0, 39)], 'c14': [('clip', '546389', 108, 125)],
 'c15': [('box', '549208')], 'c16': [('clip', '546389', 60, 75)], 'c17': [('box', '549218')],
 'd1': [('map', 'M5a')], 'd2': [('map', 'M5b')], 'd3': [('map', 'M5c'), ('clip', '547036', 125, 145)],
 'd4': [('map', 'M5d'), ('clip', '547036', 85, 100)], 'd5': [('map', 'M5e'), ('clip', '547036', 50, 65), ('clip', '547036', 141, 150)],
 'd6': [('map', 'M5')],
 'e1': [('map', 'M6')], 'e2': [('clip', '590199', 27, 39)], 'e3': [('clip', '547337', 20, 50), ('clip', '547337', 66, 90)],
 'e4': [('clip', '547337', 93, 99)], 'e5': [('clip', '547430', 0, 12)], 'e6': [('sync', '547400')],
 'f1': [('clip', '551726', 100, 107)], 'f2': [('sync', '551726')], 'f3': [('photo', USGS_HWM)],
 'g1': [('clip', '546389', 189, 210), ('clip', '546164', 27, 36)], 'g2': [('freeze', K1)], 'g6': [('freeze', K1), ('black',)],
}

def run(cmd): subprocess.run(cmd, check=True)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def esc(t): return t.replace('\\', '\\\\').replace(':', '\\:').replace("'", '’').replace('%', '\\%')

seq = json.load(open(ROOT + '/script/film_v2.json'))['seq']
# 1) temp narration
for it in seq:
    if it['k'] != 'vo': continue
    p = f"{TMP}/vo/{it['id']}.wav"
    if not os.path.exists(p) or os.path.getmtime(p) < os.path.getmtime(ROOT + '/script/film_v2.json'):
        txt = re.sub(r"\s+", ' ', it['text'])
        subprocess.run(['python3', '-m', 'piper', '-m', PIPER, '--length-scale', str(LEN_SCALE), '-f', p], input=txt, text=True, check=True, capture_output=True)
# 2) timeline from real lengths
t = 0.0; TL = []
for it in seq:
    g = it.get('gap', 0) or 0
    if it['k'] == 'vo': d = dur(f"{TMP}/vo/{it['id']}.wav")
    elif it['k'] == 'bite': d = sum(b - a for a, b in it['segs']) + 0.35 * (len(it['segs']) - 1)
    else: d = it['secs']
    TL.append(dict(id=it['id'], k=it['k'], vs=round(t, 3), s=round(t + g, 3), e=round(t + g + d, 3), label=it.get('label', '—'), segs=it.get('segs'), src=it.get('src')))
    t += g + d
TOTAL = t + 0.5
json.dump({'total': round(TOTAL, 2), 'items': TL}, open(OUT + '/timeline.json', 'w'), indent=1)

# 3) picture segments: each item covers [vs, e] (its pause + its sound)
def label_filter(lbl):
    if not lbl or lbl in ('—', '-') or lbl.startswith('**'): return ''
    lbl = lbl.replace('**', '')
    open(f'{TMP}/lbl.txt', 'w').write(lbl)
    return (f",drawbox=x=0:y=ih-64:w=iw:h=64:color=black@0.45:t=fill,"
            f"drawtext=fontfile={FONT}:text='{esc(lbl)}':fontsize={20 if len(lbl) < 95 else 15}:fontcolor=white@0.92:x=36:y=h-42")
def card(text, d, out, big=False):
    import textwrap
    lines = [w for para in text.split('\n') for w in (textwrap.wrap(para, 52) or [''])]; fs = 54 if big else 30
    dt = ','.join(f"drawtext=fontfile={FONTB if big else FONT}:text='{esc(l)}':fontsize={fs}:fontcolor=white:x=(w-text_w)/2:y=(h/2)-{(len(lines)-1)*fs*0.8}+{i*fs*1.6}"
                  for i, l in enumerate(lines))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=0x0b0d10:s={W}x{H}:r={FPS}:d={d}', '-vf', dt, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', out])
def shot(sh, d, lbl, out, item):
    k = sh[0]; lf = label_filter(lbl)
    base = ['ffmpeg', '-v', 'error', '-y']; enc = ['-t', f'{d:.3f}', '-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', out]
    fit = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}'
    if k == 'clip':
        src, a, b = sh[1], sh[2], sh[3]; L = b - a
        vf = fit + (f',setpts=PTS*{max(1.0, d / L):.4f}' if d > L * 1.25 else '') + f',tpad=stop_mode=clone:stop_duration={d:.2f}' + lf
        run(base + ['-ss', str(a), '-i', dv(src), '-vf', vf] + enc)
    elif k == 'goes':
        a, b = sh[1], sh[2]; L = b - a
        vf = f'crop=1200:675:0:262,scale={W}:{H}' + (f',setpts=PTS*{d / L:.4f}' if d > L else '') + f',tpad=stop_mode=clone:stop_duration={d:.2f}' + lf
        run(base + ['-ss', str(a), '-i', GOES, '-vf', vf] + enc)
    elif k in ('freeze', 'photo'):
        if k == 'freeze':
            src, tt, cx, cw = sh[1]; img = f'{TMP}/fr_{src}_{tt}.png'
            if not os.path.exists(img):
                run(['ffmpeg', '-v', 'error', '-y', '-ss', str(tt), '-i', dv(src), '-frames:v', '1', '-vf', f'crop={cw}:{int(cw*9/16)}:{cx}:0,scale=1920:1080', img])
        else: img = sh[1]
        n = max(2, int(d * FPS))
        vf = (f'scale=2560:1440:force_original_aspect_ratio=increase,crop=2560:1440,'
              f"zoompan=z='1+0.06*on/{n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}" + lf)
        run(base + ['-loop', '1', '-i', img, '-vf', vf] + enc)
    elif k == 'map':
        card(MAPS[sh[1]] + '\n(placeholder — map to be built from the cited data)', d, out)
    elif k == 'card':
        card(sh[1], d, out, big=(item == 'o7'))
    elif k == 'black':
        run(base + ['-f', 'lavfi', '-i', f'color=c=black:s={W}x{H}:r={FPS}:d={d}'] + enc)
    elif k in ('sync', 'box'):
        segs = [s for s in TL if s['id'] == item][0]['segs']; a = segs[0][0]
        parts = []
        for j, (sa, sb) in enumerate(segs):
            pth = f'{TMP}/seg/{item}_p{j}.mp4'
            if k == 'box':
                vf = (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=20,eq=brightness=-0.25[bg];"
                      f"[b]scale=960:540[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2-20" + lf)
            else: vf = fit + lf
            extra = 0.35 if j < len(segs) - 1 else 0
            run(base + ['-ss', str(sa), '-i', dv(sh[1]), '-filter_complex', vf, '-t', f'{sb - sa + extra:.3f}', '-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', pth])
            parts.append(pth)
        # pause before the bite: first frame held
        lead = d - sum(dur(p) for p in parts)
        if lead > 0.04:
            pre = f'{TMP}/seg/{item}_lead.mp4'
            run(base + ['-ss', str(a), '-i', dv(sh[1]), '-vf', (fit if k == 'sync' else f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=20,eq=brightness=-0.25') + f',tpad=stop_mode=clone:stop_duration={lead:.2f}', '-t', f'{lead:.3f}', '-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', pre])
            parts = [pre] + parts
        lst = f'{TMP}/seg/{item}.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
        run(base + ['-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', out])

segs = []
for it in TL:
    shots = S[it['id']]; d_all = it['e'] - it['vs']
    if shots[0][0] in ('sync', 'box'):
        p = f"{TMP}/seg/{it['id']}.mp4"; shot(shots[0], d_all, it['label'], p, it['id']); segs.append(p); continue
    # split duration: clips get their natural length share, others equal share
    w = [(s[3] - s[2]) if s[0] == 'clip' else (s[2] - s[1]) if s[0] == 'goes' else 6.0 for s in shots]
    ds = [d_all * x / sum(w) for x in w]
    for j, (sh, d) in enumerate(zip(shots, ds)):
        p = f"{TMP}/seg/{it['id']}_{j}.mp4"; shot(sh, d, it['label'], p, it['id']); segs.append(p)
open(f'{TMP}/all.txt', 'w').write(''.join(f"file '{p}'\n" for p in segs))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{TMP}/all.txt', '-c', 'copy', f'{TMP}/video.mp4'])

# 4) sound: temp narration + original interview sound + natural sound of clips (low under words, full in holds)
N = int((TOTAL + 1) * SR)
def readwav(src, ss=None, t=None):
    cmd = ['ffmpeg', '-v', 'error', '-y'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', src, '-ac', '1', '-ar', str(SR), f'{TMP}/x.wav']
    run(cmd)
    with wave.open(f'{TMP}/x.wav') as f: return np.frombuffer(f.readframes(f.getnframes()), np.int16).astype(np.float32) / 32768
voice = np.zeros(N, np.float32); nat = np.zeros(N, np.float32); natg = np.zeros(N, np.float32)
def put(buf, at, a, g=1.0):
    i = int(at * SR); a = a[:max(0, N - i)]; f = min(len(a) // 2, int(0.03 * SR))
    if f: a = a.copy(); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    buf[i:i + len(a)] += a * g
for it in TL:
    if it['k'] == 'vo':
        a = readwav(f"{TMP}/vo/{it['id']}.wav"); put(voice, it['s'], a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.08)
    elif it['k'] == 'bite':
        at = it['s']
        for j, (sa, sb) in enumerate(it['segs']):
            a = readwav(dv(it['src']), sa, sb - sa); a = a - a.mean(); put(voice, at, a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.075); at += sb - sa + 0.35
# natural sound: under every clip shot, from its own source
pos = 0.0
for it in TL:
    shots = S[it['id']]; d_all = it['e'] - it['vs']
    if shots[0][0] in ('sync', 'box'): pos += d_all; continue
    w = [(s[3] - s[2]) if s[0] == 'clip' else (s[2] - s[1]) if s[0] == 'goes' else 6.0 for s in shots]
    for sh, d in zip(shots, [d_all * x / sum(w) for x in w]):
        if sh[0] == 'clip' and sh[1] not in ('551726',):   # 551726 b-roll carries the reporter's voice: muted
            try:
                a = readwav(dv(sh[1]), sh[2], min(d, sh[3] - sh[2] + 3))
                put(nat, pos, a / (np.sqrt((a ** 2).mean()) + 1e-9) * 0.05)
            except Exception: pass
        pos += d
tt = np.arange(N) / SR
def sm(x, w):
    n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
    return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
duck = 1 - 0.75 * np.clip(sm(voice, 0.4) / 0.02, 0, 1)
mix = voice + nat * duck
mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
with wave.open(f'{TMP}/mix.wav', 'w') as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
run(['ffmpeg', '-v', 'error', '-y', '-i', f'{TMP}/video.mp4', '-i', f'{TMP}/mix.wav', '-filter_complex',
     f"[0:v]drawtext=fontfile={FONT}:text='ROUGH CUT · TEMPORARY VOICE (not the narrator) · MAPS ARE PLACEHOLDERS':fontsize=16:fontcolor=white@0.55:x=w-text_w-24:y=20[v];[1:a]loudnorm=I=-16:TP=-1.5[a]",
     '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-shortest', OUT + '/harvey_rough_tempvoice.mp4'])
print('total', round(TOTAL, 1), 's')
