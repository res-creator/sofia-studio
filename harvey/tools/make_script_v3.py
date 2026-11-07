# Harvey v3 — script + edit plan in one source. Writes harvey/script/script_v3.md and harvey/script/film_v3.json.
# Shots per item: ('clip', dvids_id, in, out) | ('photo', path) | ('freeze', spec_key) | ('map', name) | ('card', text)
# Consecutive items with the same ('map', name) form one continuous map shot.
# Timings in the .md are estimates (2.5 words/s + pauses); build_rough_v3.py uses the real length of each temp line.
import json, os, re
RATE = 2.5
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
def V(i, t, shots, l='—', gap=0.8): return dict(k='vo', id=i, text=t, shots=shots, label=l, gap=gap)
def B(i, who, src, segs, words, shots, l, gap=0.9, nolabel_after=None): return dict(k='bite', id=i, who=who, src=src, segs=segs, text=words, shots=shots, label=l, gap=gap)
def N(i, secs, shots, snd, l='—', gap=0.0): return dict(k='nat', id=i, secs=secs, shots=shots, sound=snd, label=l, gap=gap)
P = lambda n: f'assets/raw/photos/dvids_img_{n}.jpg'

SCENES = [
 dict(n='0', title='Opening — a rescue in the street', when='Houston, Aug 29, 2017 → context', items=[
  N('o0', 27.0, [('clip', '546948', 0.0, 7.0), ('clip', '546948', 22.0, 28.0), ('clip', '546948', 43.0, 51.0), ('clip', '546948', 79.0, 85.0)],
    'Original sound of the clip: the rescuers and the woman ("I\'m sorry." — "No, no, don\'t be sorry… we\'re gonna put the life vest on you… I\'ll push you up… one, two")',
    'Border Patrol BORSTAR swift-water rescue, Houston, Aug. 29, 2017'),
  V('o1', 'Houston, August 2017. A hurricane had come ashore in Texas and then stalled. For days, its rain kept falling on the fourth-largest city in America.',
    [('map', 'where')], 'Track: NOAA/NHC best track'),
  V('o2', 'Catastrophic flooding was forecast days in advance. Why did so many people still end up trapped?',
    [('clip', '546389', 42.0, 51.0)], 'Texas National Guard, Houston, Aug. 27, 2017'),
  N('o3', 3.0, [('card', 'HARVEY · HOUSTON, 2017')], 'Rotor tail of the previous clip fades'),
 ]),
 dict(n='1', title='Three days of warning', when='Wed Aug 23 – Fri Aug 25', items=[
  V('a1', 'Five days earlier, Harvey had fallen apart over the Caribbean. On Wednesday, August twenty-third, it came back to life over the Gulf of Mexico, and grew fast.',
    [('goes', 0, 10)], 'Satellite, Aug. 25, 2017 · NOAA/NESDIS/STAR, RAMMB/CIRA'),
  V('a2', 'On Friday, the National Hurricane Center warned of catastrophic, life-threatening flooding: fifteen to thirty inches of rain, in places forty.', [('map', 'forecast')]),
  V('a3', 'Forecasters put greater Houston under their highest flood risk, three days ahead. What no forecast could show was which streets would flood.', [('map', 'forecast')]),
  V('a4', 'At Coast Guard Air Station Cape Cod, in Massachusetts, the pilot Simon Greene later recalled that on Friday afternoon their normal flights were cancelled, and they waited for the word to send a crew south.',
    [('freeze', 'G1'), ('photo', P('3710048'))], 'Lt. Cmdr. Simon Greene · Coast Guard pilot (interview still) → Cape Cod aircraft en route, Aug. 27, 2017'),
  V('a5', 'In Houston, officials had a different decision to make. Several coastal counties ordered people out. For Houston and Harris County, there was no general evacuation order.', [('map', 'evac')]),
  V('a6', 'County Judge Ed Emmett explained why. When a storm surge comes in from the sea, you know who lives in its path. With rain, he said, you don\'t know which neighbourhoods are going to be affected.', [('map', 'evac')]),
  V('a7', 'And they remembered Hurricane Rita in 2005. As millions tried to leave the Houston area, dozens of people died during the evacuation, twenty-three of them in a single bus fire on the highway, before Rita came ashore.',
    [('card', 'Hurricane Rita, Sept. 2005\nNTSB: 23 evacuees died in a bus fire on I-45, Sept. 23 — the day before landfall')], 'NTSB HAR-07/01'),
  V('a8', 'At about ten on Friday night, Harvey came ashore near Rockport as a Category 4 hurricane. Then it stopped moving.', [('map', 'stall')]),
 ]),
 dict(n='2', title='The night', when='Sat Aug 26 – Sun morning Aug 27', items=[
  V('b1', 'On Saturday night, the rain bands settled over Houston. One gauge recorded more than three inches in thirty minutes. At 9:27, the weather service issued its first flash flood emergency.', [('map', 'night')]),
  V('b2', 'By Sunday morning, two-day totals in the Houston area were approaching twenty-five inches. Most of that rain had fallen in nine to twelve hours, late on Saturday night and early on Sunday. And the storm was not over.', [('map', 'night')]),
  V('b3', 'South-east of the city, the water rose in Dickinson. Matthew Dusek, a Coast Guard chief, lived there.', [('map', 'dickinson')]),
  B('b4', 'Dusek', '551726', [(12.18, 30.80)], 'We had sewage come up through our showers and our bathtubs. So pretty much the night that it was happening it was up to our box springs, and we were pretty much walking around in sewage water and whatever else.',
    [('clip', '551726', 12.0, 31.0)], 'Dusek\'s street in Dickinson, filmed Sept. 4, 2017 · voice: CPO Matthew Dusek, U.S. Coast Guard'),
  V('b5', 'According to an Air National Guard report, when the water started filling his house, he took his boat and spent the day pulling his neighbours out.', [('clip', '551726', 31.0, 36.0)], 'Dickinson, Sept. 4, 2017'),
  V('b6', 'By Sunday morning, Harris County\'s 911 system had taken fifty-six thousand calls in fifteen hours. The county judge asked for help.',
    [('clip', '546166', 0.0, 30.0)], 'Coast Guard flood team, Houston, Sunday, Aug. 27, 2017'),
  N('b7', 3.5, [('card', '"If you have a boat, we need your help."\n— Harris County Judge Ed Emmett, Aug. 27, 2017')], 'Room tone', 'Quoted in NWS Service Assessment, p. 8'),
  V('b8', 'Early on Sunday, a Houston police sergeant, Steve Perez, left home for work in heavy rain. According to Police Chief Art Acevedo, Perez\'s wife had asked him not to go, and he answered that there was work to do. He drowned in his patrol car on a flooded road in north Houston.', [('map', 'perez')]),
 ]),
 dict(n='3', title='Rescue', when='Sun Aug 27 – Tue Aug 29', items=[
  V('c1', 'That Sunday, Coast Guard aircraft from Cape Cod arrived over Houston.', [('photo', P('3709578'))], 'Coast Guard helicopter over Houston, Aug. 27, 2017'),
  V('c2', 'Most calls were just addresses from 911. Greene said they were told to follow the roads. Whichever pilot was not flying typed each address into Google Maps on a phone and called out the turns, like a driver.',
    [('clip', '546164', 27.0, 36.0), ('clip', '546574', 0.0, 16.0)], 'Coast Guard, Houston, Aug. 27–28, 2017'),
  N('c3', 22.0, [('clip', '546574', 44.0, 56.0), ('clip', '546574', 62.0, 80.0)], 'Natural sound of the hoist camera', 'Coast Guard hoist camera, Houston, Aug. 27–28, 2017 (DVIDS)'),
  V('c5', 'One of the rescue swimmers flying those calls was Brendan Kiley.', [('freeze', 'K1')], 'Brendan Kiley · Coast Guard rescue swimmer (interview still, 2018)'),
  V('c5b', 'On his second day in Houston, he was lowered to a one-story house. Five people were waiting on the roof. The water was almost up to the top of a car beside it.', [('map', 'kiley')], gap=0.5),
  V('c6', 'A woman slid a big plastic storage bin toward him. He thought it was luggage, and told her there was no room for it. She pushed it back. Inside were her two children: a toddler, holding a newborn baby.', [('map', 'kiley')]),
  V('c10', 'He carried the bin down from the roof first, with the children inside. Then he helped their mother down, and settled all three in the rescue basket. The basket went up with the mother and both children together.', [('map', 'kiley')]),
  V('c11', 'Afterwards, he said the bin had been a good call by their mother: inside it, the children were out of the rain and the wind, and they could not slide off the roof. Over three days, Kiley\'s crew rescued a hundred and twelve people.',
    [('photo', P('3709576'))], 'Cape Cod Jayhawk over Houston, Aug. 27, 2017'),
  V('c12', 'Rain was the other problem. When the heaviest bands came through, Greene said, the pilots could not see. They would set down in a ballpark or a car park, wait for the band to pass, and lift off again.',
    [('clip', '546526', 0.0, 12.0), ('clip', '546526', 33.0, 45.0)], 'Coast Guard rescue, greater Houston, Aug. 28, 2017'),
  V('c13', 'On the ground, Harris County\'s firefighters and police recorded more than sixty-one thousand rescues. Nobody counted the people saved by neighbours in their own boats.',
    [('clip', '546389', 0.0, 39.0)], 'Texas National Guard, Houston, Aug. 27, 2017'),
  V('c14', 'Military police units drove into the floodwater in trucks. Sergeant Anthony Lara\'s first mission was in Dickinson.', [('clip', '547138', 4.5, 15.0)], 'Army National Guard high-water vehicle, Sugar Land, Aug. 30, 2017'),
  B('c15', 'Lara', '549208', [(4.30, 32.88)], 'When we first hit ground we did a mission with the Texas Search and Rescue team, and we went out to Dickinson. The water was probably, I\'d say, maybe three feet deep. It got too deep to go in, but we were able to rescue some civilians that did come up to us with civilian boats that came up to our vehicles. We escorted them back, and then from there took them to shelters.',
    [('sync', '549208', 0, 9), ('clip', '546389', 108.0, 125.0)], 'Sgt. Anthony Lara · 712th Military Police Co. · interview Sept. 6, 2017 → Texas National Guard trucks, Houston, Aug. 27, 2017 (not his mission)'),
  V('c16', 'In League City, Specialist Kyle Wampler\'s unit worked with the local police.', [('clip', '547660', 25.0, 34.0)], 'Army National Guard, Pearland, Aug. 30, 2017'),
  B('c17', 'Wampler', '549218', [(38.84, 56.47)], 'We got to go out and perform a rescue on a elderly house, and you know, pulling this guy out. And he can barely walk, and just having to help him, even into our trucks and stuff like that. It just really stood out to me, because I know that if we weren\'t there to help \'em, that, you know, I don\'t know who else would or could have.',
    [('sync', '549218', 0, 8), ('clip', '547686', 30.0, 54.0)], 'Spc. Kyle Wampler · 712th Military Police Co. · interview, Sept. 2017 → high-water truck, Fort Bend County, Sept. 1, 2017 (not his mission)'),
  V('c18', 'Crews from across the country joined them. On Tuesday, a New York Air National Guard helicopter lifted a family out of a flooded neighbourhood in Houston.', [('clip', '546792', 144.0, 160.0)], 'New York Air National Guard, Houston, Aug. 29, 2017'),
  N('c19', 12.0, [('clip', '546792', 250.0, 263.0)], 'Natural sound', 'New York Air National Guard, Houston, Aug. 29, 2017'),
 ]),
 dict(n='4', title='The reservoirs', when='Fri Aug 25 – Wed Aug 30', items=[
  V('d1', 'Almost everywhere in Houston, the water came from the rain and from overflowing bayous. But west of downtown, a different problem was building, behind two dams.', [('map', 'res_intro')]),
  V('d2', 'Addicks and Barker are earthen dams built in the 1940s to catch floodwater before it reaches the city. On August twenty-fifth, as Harvey approached, the Army Corps of Engineers closed their gates, as planned.', [('map', 'res_intro')]),
  V('d3', 'The basins filled. And inside them, on private land, whole neighbourhoods had been built. More than nine thousand homes and businesses there flooded, from water that was being held back.', [('map', 'res_pools')]),
  N('d3b', 8.0, [('clip', '547036', 125.0, 133.0)], 'Natural sound', 'Inside the Addicks reservoir, Aug. 30, 2017 · USACE'),
  V('d4', 'Downstream, Buffalo Bayou was already running high from rain on the city. Around midnight on August twenty-eighth, with the pools still rising, the Corps began releasing water through the gates. Its reason was the safety of the dams: it had estimated that a dam failure would put six hundred thousand lives at risk.', [('map', 'res_release')]),
  V('d5', 'According to the governor\'s commission, the releases flooded about four thousand homes along the bayou. On August thirtieth, both reservoirs reached their highest levels on record.', [('map', 'res_release')]),
  N('d5b', 7.0, [('clip', '547036', 85.0, 92.0)], 'Natural sound', 'Barker Dam outlet, Aug. 30, 2017 · USACE'),
  V('d6', 'Years later, federal courts ruled that by flooding these homes to protect others, the government had taken private property and owed compensation. One court praised the Corps\' professionalism, and found that, at the levels the water actually reached, the risk of a dam failure had been minimal.',
    [('clip', '547036', 50.0, 65.0)], 'Flooded office parks along Buffalo Bayou, Aug. 30, 2017 · USACE'),
 ]),
 dict(n='5', title='East, and the rivers', when='Tue Aug 29 – Fri Sep 1', items=[
  V('e1', 'Harvey finally drifted east. Its heaviest rain of all fell near Beaumont and Port Arthur: more than sixty inches at Nederland.', [('map', 'east')]),
  N('e2', 12.0, [('clip', '590199', 27.0, 39.0)], 'Natural sound', 'Air Force Reserve rescue, Port Arthur, Aug. 30, 2017'),
  V('e3', 'Near Beaumont, an Air Force Reserve crew lowered a pararescueman to a flooded house. He came back up with an elderly woman in the basket.', [('clip', '547337', 20.0, 50.0), ('clip', '547337', 66.0, 90.0)], 'Air Force Reserve, near Beaumont, Aug. 31, 2017'),
  N('e4', 6.0, [('clip', '547337', 93.0, 99.0)], 'Natural sound', 'Air Force Reserve, near Beaumont, Aug. 31, 2017'),
  V('e4b', 'In Orange, near the Louisiana line, people walked out along flooded roads.', [('clip', '547127', 0.0, 20.0)], 'Orange, Texas, Aug. 30, 2017 · Army National Guard'),
  V('e5', 'In Vidor, a pararescue team from the Alaska Air National Guard worked the streets by boat.', [('clip', '547400', 0.0, 8.3)], 'Lt. Dan Warren · 212th Rescue Squadron, Alaska Air National Guard · Vidor'),
  B('e6', 'Warren', '547400', [(8.36, 19.16), (34.16, 51.96)], 'What we\'re doing here is providing boat teams in and out of these very flooded streets. Many times past the windows, we\'ve seen cars completely submerged. These people need a way out. / Vidor\'s been fantastic. Everybody that we\'ve come upon has helped us, either with boat trailers, because we\'ve had a hard time accessing dry or wet land. They\'ve helped us out with food, or just come up to us, shook our hands and thanked us. It\'s a pretty rewarding experience, seeing the best of America down here.',
    [('sync', '547400', 0, 11), ('clip', '547430', 75.0, 100.0)], 'Lt. Dan Warren · 212th Rescue Squadron, Alaska Air National Guard → his unit\'s area, Vidor, Aug. 31, 2017'),
  V('e7', 'West of Houston, the water was still rising after the rain had stopped. The Brazos River at Richmond crested on September first, more than ten feet above flood stage. More than two hundred thousand residents were under an evacuation order.', [('map', 'brazos')]),
  V('e8', 'In Pecan Grove, under a mandatory evacuation, Army National Guard trucks and a Texas search-and-rescue team took people out, with their children, their bags and their dogs.',
    [('clip', '547686', 174.0, 200.0)], 'Pecan Grove, Fort Bend County, Sept. 1, 2017 · Army National Guard'),
  N('e9', 22.0, [('clip', '547686', 222.0, 236.0), ('clip', '547686', 366.0, 380.0)], 'Natural sound', 'Pecan Grove, Fort Bend County, Sept. 1, 2017 · Army National Guard'),
  V('e10', 'By then the rain had ended. Dozens of rain gauges in south-east Texas had recorded more than forty inches, the very top of the forecast range.', [('map', 'observed')]),
 ]),
 dict(n='6', title='After the water', when='September 2017', items=[
  V('f0', 'When the water went down, what had been inside the houses came out to the kerb.', [('clip', '548574', 6.0, 25.0), ('clip', '548574', 47.0, 70.0)], 'Army Reserve soldiers help clear a flooded house, Houston, Sept. 4, 2017'),
  V('f1', 'In Dickinson, Matthew Dusek spoke to his insurance adjuster.', [('clip', '551726', 100.0, 107.0)], 'Dickinson, Texas, Sept. 4, 2017'),
  B('f2', 'Dusek', '551726', [(35.84, 46.04)], 'Just talked to the claims adjuster and it kinda sent me into a little spin, \'cause I don\'t have a house. I\'m homeless. I don\'t know.',
    [('sync', '551726', 0, 99)], '— (his name is in the original frame)'),
  V('f3', 'Harvey killed sixty-eight people directly, thirty-six of them in Harris County. In the county, about a hundred and fifty-four thousand houses flooded. Across Texas, more than a hundred and twenty-two thousand people had to be rescued.',
    [('photo', 'assets/raw/other/usgs_high_water_marks.jpg')], '68 direct deaths · 36 in Harris County · 154,170 houses flooded · 122,000+ rescued (NHC; HCFCD; Governor\'s Commission) · photo: USGS'),
  B('f4', 'Dusek', '551726', [(90.56, 97.52)], 'I got my family, and I got my Coast Guard family, I got my uniform family, so that\'s what I hold onto.', [('sync', '551726', 0, 99)], '—'),
 ]),
 dict(n='7', title='The answer', when='', items=[
  V('g1', 'The flood was forecast. But no forecast could name the streets, and there was no general order to leave Houston. When the downpour hit Houston on Saturday night, many people could only wait to be rescued.',
    [('clip', '547686', 380.0, 400.0)], 'Pecan Grove, Sept. 1, 2017'),
  V('g2', 'On one of those roofs, a mother had already done what she could. She put her two children in a plastic bin and kept them dry, until Brendan Kiley reached them.', [('freeze', 'K1')], 'Brendan Kiley · Coast Guard rescue swimmer (interview still)', gap=1.0),
  N('g6', 4.0, [('freeze', 'K1'), ('black',)], 'Rain, natural sound of 546526, fades out'),
 ]),
]

def words(t): return len(re.findall(r"[A-Za-z0-9'’]+", t))
def fmt(s): return f"{int(s // 60)}:{s % 60:04.1f}"
t = 0.0; seq = []
for sc in SCENES:
    sc['start'] = t
    for it in sc['items']:
        t += it['gap']; it['s'] = t
        d = words(it['text']) / RATE if it['k'] == 'vo' else (sum(b - a for a, b in it['segs']) + 0.35 * (len(it['segs']) - 1)) if it['k'] == 'bite' else it['secs']
        t += d; it['e'] = t
        seq.append({k: v for k, v in it.items() if k not in ('s', 'e')})
    sc['end'] = t
def shot_txt(s):
    k = s[0]
    if k == 'clip': return f"**{s[1]}** {fmt(s[2])}–{fmt(s[3])}"
    if k == 'map': return f"map **{s[1]}**"
    if k == 'photo': return f"photo `{os.path.basename(s[1])}`"
    if k == 'freeze': return {'K1': 'Kiley interview still (620835 1:59.2)', 'G1': 'Greene interview still (620838 1:55.0, cropped above subtitles)'}[s[1]]
    if k == 'sync': return f"**{s[1]}** in sync, first {s[3]} s on the speaker"
    if k == 'goes': return f"NOAA GOES-16 loop {s[1]}–{s[2]} s"
    if k == 'card': return 'card: ' + s[1].replace('\n', ' / ')
    return k
L = ['# HARVEY · HOUSTON, 2017 — edit plan v3 (rough cut 3)', '',
     'Status: the current working plan after the owner\'s v3 notes. v2 stays in `script_v2.md` for reference. '
     'Generated from `harvey/tools/make_script_v3.py`; rough cut built by `harvey/tools/build_rough_v3.py` with maps from `harvey/tools/maps_v3.py`.', '',
     '**Working question:** "Catastrophic flooding was forecast days in advance. Why did so many people still end up trapped?"', '',
     f'**Estimated length at {RATE} words/s: {fmt(t)}.** The rough cut uses the real length of each temporary line.', '',
     '## Logic of each block: map shows what changed → footage shows the consequence → a person says what it meant', '',
     '| # | Part | Story time | Est. film time |', '|---|---|---|---|']
for sc in SCENES: L.append(f"| {sc['n']} | {sc['title']} | {sc['when']} | {fmt(sc['start'])}–{fmt(sc['end'])} |")
for sc in SCENES:
    L += ['', f"## {sc['n']}. {sc['title']} · {fmt(sc['start'])}–{fmt(sc['end'])}", '', '| Time | Sound / words | Picture | Label |', '|---|---|---|---|']
    for it in sc['items']:
        snd = f"**Narrator:** \"{it['text']}\"" if it['k'] == 'vo' else (f"**{it['who']}** ({it['src']}, original sound): \"{it['text']}\"" if it['k'] == 'bite' else it['sound'])
        L.append(f"| {fmt(it['s'])}–{fmt(it['e'])} | {snd} | {' → '.join(shot_txt(s) for s in it['shots'])} | {it['label']} |")
L += ['', '## Notes', '- Under interviews: the speaker is shown first, then the voice continues over footage of the same unit\'s general work, labelled "not his mission". No other unit\'s specific rescue sits under a personal story.',
      '- Kiley\'s tub rescue is shown only as a labelled schematic reconstruction of the actions in the AFRAS citation (no faces, no real house shape).',
      '- All archive in its own aspect ratio: 4:3 and other sizes are pillarboxed on a plain dark background; no blur fill.',
      '- Dusek\'s name is burned into the original 551726 frame at 0:39–0:46, so our label is omitted there.']
open(ROOT + '/script/script_v3.md', 'w').write('\n'.join(L) + '\n')
json.dump({'rate': RATE, 'est': round(t, 1), 'seq': seq}, open(ROOT + '/script/film_v3.json', 'w'), indent=1)
print('est', fmt(t))
for sc in SCENES: print(sc['n'], sc['title'], fmt(sc['end'] - sc['start']))
