"""python3 qa_report.py <qa_dir> [<qa_dir_after>] > report.md
Summarises qa_frames.js results for all episodes (and compares two runs if a second directory is given)."""
import json, sys, glob, os
from collections import Counter, defaultdict

NAMES = {
    'face_covered_by_card': 'лицо закрыто карточкой урока', 'face_covered_by_bubble': 'лицо закрыто облачком',
    'face_covered_by_captions': 'лицо закрыто субтитрами', 'face_covered_by_insert': 'лицо закрыто вставкой (телефон)',
    'face_covered_by_window': 'лицо закрыто окном звонка', 'face_covered_by_overlay': 'лицо закрыто вставкой серии',
    'crop_feet_ankles': 'обрез по ступням/щиколоткам', 'crop_knees': 'обрез по коленям', 'head_cut': 'обрезан лоб/голова',
    'speaker_offscreen': 'говорящий за кадром', 'bubble_offscreen': 'облачко выходит за экран', 'bubble_covered': 'облачко перекрыто',
    'bubble_overlap': 'облачка накладываются', 'bubble_too_long': 'облачко слишком длинное', 'text_under_platform_ui': 'текст под интерфейсом TikTok/Shorts',
    'face_under_platform_ui': 'лицо говорящего под интерфейсом', 'prop_out_of_frame': 'важный предмет вне кадра', 'prop_covered': 'важный предмет закрыт',
}
SEV = {'critical': 'критическая', 'major': 'заметная', 'minor': 'незначительная'}

def load(d):
    out = {}
    for f in sorted(glob.glob(os.path.join(d, '*', 'qa.json'))):
        j = json.load(open(f)); out[j['summary']['ep']] = j
    return out

def table(runs):
    tot = Counter(); typ = Counter(); typsev = defaultdict(Counter); secs = Counter()
    for ep, j in runs.items():
        for i in j['issues']:
            tot[i['sev']] += 1; typ[i['type']] += 1; typsev[i['type']][i['sev']] += 1; secs[i['sev']] += i['dur']
    return tot, typ, typsev, secs

A = load(sys.argv[1]); B = load(sys.argv[2]) if len(sys.argv) > 2 else None
tot, typ, typsev, secs = table(A)
print(f"# Аудит композиции: {len(A)} серий\n")
print(f"Всего проблем: **{sum(tot.values())}** — критических {tot['critical']}, заметных {tot['major']}, незначительных {tot['minor']}.")
print(f"Суммарная длительность: критических {secs['critical']:.0f} с, заметных {secs['major']:.0f} с.\n")
print("## Типы проблем\n\n| Проблема | всего | крит. | замет. | незнач. |\n|---|---|---|---|---|")
for t, n in typ.most_common():
    s = typsev[t]; print(f"| {NAMES.get(t, t)} | {n} | {s['critical']} | {s['major']} | {s['minor']} |")
print("\n## Серии (по числу критических, затем заметных)\n\n| Серия | крит. | замет. | незнач. | главная проблема |\n|---|---|---|---|---|")
for ep, j in sorted(A.items(), key=lambda kv: (-kv[1]['summary']['critical'], -kv[1]['summary']['major'])):
    s = j['summary']; top = Counter(i['type'] for i in j['issues'] if i['sev'] != 'minor').most_common(1)
    print(f"| {ep} | {s['critical']} | {s['major']} | {s['minor']} | {NAMES.get(top[0][0], top[0][0]) if top else '—'} |")
if B:
    t2, typ2, ts2, secs2 = table(B)
    print(f"\n# Сравнение: старая система → новая ({len(B)} серий)\n")
    print(f"| | старая | новая |\n|---|---|---|")
    for k in ['critical', 'major', 'minor']: print(f"| {SEV[k]} | {tot[k]} | {t2[k]} |")
    print(f"| секунд критических | {secs['critical']:.0f} | {secs2['critical']:.0f} |\n| секунд заметных | {secs['major']:.0f} | {secs2['major']:.0f} |")
    print("\n| Проблема | старая | новая |\n|---|---|---|")
    for t in sorted(set(typ) | set(typ2), key=lambda t: -typ[t]): print(f"| {NAMES.get(t, t)} | {typ[t]} | {typ2[t]} |")
