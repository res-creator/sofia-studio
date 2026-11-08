# Vertical Shorts / TikToks (1080x1920) cut from "The Match King": each clip = a few whole voice lines taken from the YouTube master,
# laid out as: blurred, zoomed copy of the frame as background · the full 16:9 picture in the middle · a hook title on top ·
# big word-group captions (ASS) under the picture · an end tag "Full story on YouTube". No new credits used.
# Usage: python3 shorts.py   → shorts/short_<n>.mp4 + shorts/captions.txt
import json, os, subprocess, re
D = os.path.dirname(os.path.abspath(__file__)); OUT = f'{D}/shorts'; os.makedirs(OUT, exist_ok=True)
SRC = f'{D}/the_match_king_youtube_master.mp4'
TL = json.loads(subprocess.run(['node', '-e', "const t=require('./timeline.js');console.log(JSON.stringify({L:t.L,E:t.E,W:t.W}))"], cwd=D, capture_output=True, text=True).stdout)
L, E, Wd = TL['L'], TL['E'], TL['W']
CLIPS = [
  ('He sold the world’s matches.\nNone of the money was real.', ['h1', 'h2', 'h3', 'h4']),
  ('He lent money to whole countries.\nHere’s how.', ['m1', 'm2', 'm2b', 'm5']),
  ('The trick behind the\nbiggest fraud of the 1920s', ['r1', 'r2', 'r3', 'r4', 'r5']),
  ('Reported: $300 million profit.\nReal: $40 million.', ['a1', 'a2', 'a3', 'e2']),
]
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f'{h}:{m:02d}:{s:05.2f}'
ASS_HEAD = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter Display,84,&H00FFFFFF,&H0000C8F2,&H00101010,&H80000000,-1,0,0,0,100,100,0,0,1,7,3,8,60,60,1300,1
Style: Hook,Inter Display,70,&H00D8ECF6,&H00FFFFFF,&H00101010,&H00000000,-1,0,0,0,100,100,0,0,1,6,0,8,60,60,190,1
Style: Tag,Inter Display,52,&H0030C2F2,&H00FFFFFF,&H00101010,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,2,60,60,150,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
notes = []
for n, (hook, ids) in enumerate(CLIPS, 1):
    segs, t, ev = [], 0.0, []
    for i in ids:
        a, b = L[i] - 0.25, E[i] + 0.35; segs.append((a, b))
        ws = Wd[i]; grp = []
        for k, (w, ws0, we) in enumerate(ws):   # 2–3 word groups; current word highlighted yellow
            grp.append((w, ws0, we))
            if len(grp) == 3 or re.search(r'[.,?!:…]$', w) or k == len(ws) - 1:
                g0 = t + (L[i] + grp[0][1] - a); g1 = t + (L[i] + grp[-1][2] - a) + 0.08
                for j, (gw, w0, w1) in enumerate(grp):
                    s0 = t + (L[i] + w0 - a); s1 = t + (L[i] + (grp[j + 1][1] if j + 1 < len(grp) else grp[-1][2]) - a) + (0.08 if j == len(grp) - 1 else 0)
                    txt = ' '.join(('{\\c&H0030C8F2&}' + x[0].upper() + '{\\c&H00FFFFFF&}') if jj == j else x[0].upper() for jj, x in enumerate(grp))
                    ev.append(f'Dialogue: 1,{ts(s0)},{ts(s1)},Cap,,0,0,0,,{txt}')
                grp = []
        t += b - a
    dur = t + 2.2
    ev.append(f'Dialogue: 2,{ts(0)},{ts(dur)},Hook,,0,0,0,,{hook.upper().replace(chr(10), "\\N")}')
    ev.append(f'Dialogue: 2,{ts(t - 0.3)},{ts(dur)},Tag,,0,0,0,,FULL STORY ON YOUTUBE · HOW IT’S RUN')
    ass = f'{OUT}/cap_{n}.ass'; open(ass, 'w').write(ASS_HEAD + '\n'.join(ev) + '\n')
    # cut the segments (frame-accurate re-encode), join, add a 2.2 s hold on the last frame
    parts = []
    for k, (a, b) in enumerate(segs):
        p = f'{OUT}/_p{n}_{k}.mp4'; subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-i', SRC, '-t', f'{b - a:.3f}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-c:a', 'aac', '-b:a', '256k', '-af', 'afade=t=in:d=0.08,afade=t=out:st=%.3f:d=0.12' % (b - a - 0.12), p], check=True); parts.append(p)
    lst = f'{OUT}/_l{n}.txt'; open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts)); joined = f'{OUT}/_j{n}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy', joined], check=True)
    vf = ("[0:v]tpad=stop_mode=clone:stop_duration=2.2,split[a][b];"
          "[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.18[bg];"
          "[b]scale=1180:-2,crop=1080:664[fg];"
          "[bg][fg]overlay=0:(H-h)/2-40,ass=" + ass + "[v]")
    out = f'{OUT}/short_{n}.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', joined, '-filter_complex', vf, '-map', '[v]', '-map', '0:a', '-af', 'apad=pad_dur=2.2,loudnorm=I=-14:TP=-1.5', '-t', f'{dur:.3f}',
                    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-movflags', '+faststart', out], check=True)
    for p in parts + [lst, joined]: os.remove(p)
    notes.append((n, hook.replace('\n', ' '), round(dur, 1))); print('short', n, round(dur, 1), 's', flush=True)
CAP = {1: 'In 1932 the world’s richest man in matches was found dead in Paris. Then accountants opened his books. \U0001F4B8 What would YOU have done?',
       2: 'He lent $125 million to Germany — in exchange for every match sold there. The Match King’s strangest deal.',
       3: 'New investors paid the old ones. Sound familiar? This was 1920s Sweden.',
       4: 'Price Waterhouse called his books “so childish” anyone could see the fraud. Nobody looked.'}
with open(f'{OUT}/captions.txt', 'w') as f:
    for n, hook, dur in notes:
        f.write(f'SHORT {n} ({dur} s) — short_{n}.mp4\nTitle: {hook}\nCaption: {CAP[n]}\n#history #finance #fraud #matchking #howitsrun\nFull film: link to the YouTube video in the comment / bio\n\n')
print('done')
