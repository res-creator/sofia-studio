"""v2 timeline: 0.35 s between paragraphs, +1.8 s before chapter openings (short chapter card with sound), +1.6 s title after P003."""
import json, soundfile as sf, glob, os
chapters = {'P004', 'P009', 'P014', 'P017', 'P024', 'P031', 'P036', 'P042'}
order = [l.split(',')[0] for l in open('SCRIPT_EN.csv', encoding='utf-8').read().splitlines()[1:] if l[:1] == 'P']
t = 0.9; tl = []
for pid in order:
    info = sf.info(f'voice/{pid}.wav'); d = info.frames / info.samplerate
    if pid in chapters: t += 1.8
    tl.append(dict(id=pid, start=round(t, 3), dur=round(d, 3))); t += d + 0.35
    if pid == 'P003': t += 1.6
json.dump(dict(paras=tl, voiceEnd=round(t + 0.4, 2), qcard=2.5, endscreen=15), open('timeline.json', 'w'), indent=0)
print('voice end %.1f min' % (t / 60))
