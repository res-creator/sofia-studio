"""v2 timeline: 0.35 s between paragraphs, +1.8 s before chapter openings (short chapter card with sound), +1.6 s title after P003."""
import json, soundfile as sf, glob, os
chapters = {'N005', 'N012B', 'N020', 'N025', 'N032', 'N038'}
order = [l.split(',')[0] for l in open('SCRIPT_EN.csv', encoding='utf-8').read().splitlines()[1:] if l[:1] == 'N']
t = 0.9; tl = []
for pid in order:
    info = sf.info(f'voice/{pid}.wav'); d = info.frames / info.samplerate
    if pid in chapters: t += 1.5
    tl.append(dict(id=pid, start=round(t, 3), dur=round(d, 3))); t += d + 0.25
    if pid == 'N004': t += 1.6
json.dump(dict(paras=tl, voiceEnd=round(t + 0.4, 2), qcard=2.5, endscreen=15), open('timeline.json', 'w'), indent=0)
print('voice end %.1f min' % (t / 60))
