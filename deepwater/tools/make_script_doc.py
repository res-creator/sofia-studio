# Full narration + testimony text with timecodes -> final/dwh_narration_script.md
import json, math
st_o = json.load(open('research/stt_check_opening.json')) if False else {}
STT = {'w': 'research/jit_0723_part1_stt.json', 'x': 'research/jit_0723_91191_stt.json', 'y': 'research/jit_0723_91195_stt.json'}
SW = {k: [w for w in json.load(open(p))['words'] if w['type'] == 'word'] for k, p in STT.items()}
PART = {'w': 'DVIDS 91190, part 1', 'x': 'DVIDS 91191, part 2', 'y': 'DVIDS 91195, part 3'}
CH = {'ch1': '1 · The rig and the well', 'ch2': '2 · Three barriers', 'ch3': '3 · The test', 'ch4': '4 · The signs', 'ch5': '5 · The blowout', 'ch6': '6 · Abandon ship', 'ch7': '7 · The last line of defense', 'ch8': '8 · After', 'ch9': '9 · The answer', 'names': 'Names of the eleven men (on screen, no narration)'}
def tc(x): return f'{int(x // 60)}:{int(x % 60):02d}'
out = ['# Deepwater Horizon — narration and testimony text (as recorded)', '', 'Narrator: AI voice (ElevenLabs, "Todd"). Testimony: Mike Williams, chief electronics technician, at the USCG/BOEMRE Joint Investigation hearing, July 23, 2010 (public domain, DVIDS). Testimony text = speech-to-text of the original audio (scribe_v1), checked by ear only at the cut points. Timecodes are positions in `final/dwh_full_film.mp4`.', '']
def run(script, data, off, title):
    T = json.load(open(data)); seq = json.load(open(script))['seq']; out.append(f'## {title}'); out.append('')
    for it in seq:
        if it[0] == 'vo': out.append(f'**{tc(off + T["lines"][it[1]]["s"])}** · NARRATOR: {it[2]}'); out.append('')
        elif it[0] == 'bite':
            src = it[4] if len(it) > 4 else 'w'; segs = T['bites'][it[1]]
            txt = ' … '.join(' '.join(w['text'] for w in SW[src] if a - 0.05 <= w['start'] and w['end'] <= b + 0.05) for a, b in it[2])
            span = ', '.join(f'{tc(a)}–{tc(b)}' for a, b in it[2])
            out.append(f'**{tc(off + segs[0]["at"])}** · MIKE WILLIAMS (testimony, {PART[src]}, source {span}): “{txt}”'); out.append('')
        elif it[1] in CH: out.append(f'### {CH[it[1]]} ({tc(off + T["events"][it[1]]["at"])})'); out.append('')
od = json.load(open('src/data/open.json'))['duration']
run('script/opening.json', 'src/data/open.json', 0, 'Opening (0:00)')
run('script/film.json', 'src/data/film.json', math.ceil(od * 30) / 30, 'Main film')
open('final/dwh_narration_script.md', 'w').write('\n'.join(out).replace('Lyman', 'Wyman')); print('ok')
