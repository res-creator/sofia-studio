"""timeline.json from voice/*.wav: paragraph starts with gaps (0.5 s; +3.2 s before chapter cards; +4.2 s title card after P003)."""
import json, soundfile as sf, glob, os
chapters = {'P004', 'P009', 'P014', 'P017', 'P024', 'P031', 'P036', 'P042'}
t = 1.6; tl = []
for f in sorted(glob.glob('voice/*.wav')):
    pid = os.path.basename(f)[:-4]; info = sf.info(f); d = info.frames / info.samplerate
    if pid in chapters: t += 3.2
    tl.append(dict(id=pid, start=round(t, 3), dur=round(d, 3))); t += d + 0.5
    if pid == 'P003': t += 4.2
json.dump(dict(paras=tl, voiceEnd=round(t + 0.6, 2), qcard=3.5, endscreen=20), open('timeline.json', 'w'), indent=0)
