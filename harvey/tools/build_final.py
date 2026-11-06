# Harvey — FINAL CUT (picture, graphics, music, sound) Narration: ElevenLabs voice Todd (VOICE=piper gives the old temporary voice).
# The owner's choices from the demo reel: 1 satellite map zoom, 5 big numbers over footage, 6 real documents with the key
# line marked, 7 chapter titles with grain and letter tracking, 8 whip / white-flash transitions, 9 photo push-in with a
# highlight circle, 10 split screen. Narration: present tense, built only from facts in research/verification.md.
# Archive: DVIDS / NOAA public domain, each shot labelled with place and date. Interviews with a music bed are not used as sound.
# Music: Mixkit Stock Music Free License (logged in lahaina/assets/music/music_log.json). Nothing added to the archive sound.
# Usage: PIPER_DIR=... FINAL_TMP=... DOCS=... python3 tools/build_final.py   -> harvey/final/harvey_final_tempvoice.mp4 (+ _phone)
import os, sys, json, math, hashlib, subprocess, wave
from multiprocessing import Pool
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..'); RAW = ROOT + '/assets/raw'
MUS = os.path.abspath(ROOT + '/../lahaina/assets/music'); TMP = os.environ['FINAL_TMP']; DOCS = os.environ['DOCS']
PIPER = os.environ['PIPER_DIR'] + '/en_US-ryan-high.onnx'
for d_ in ('vo', 'seg', 'maps', 'x'): os.makedirs(f'{TMP}/{d_}', exist_ok=True)
W, H, FPS, SR = 1920, 1080, 25, 48000
FI = '/usr/share/fonts/opentype/inter/'; FD = '/usr/share/fonts/truetype/'
FONTS = dict(k=FI + 'InterDisplay-Black.otf', b=FI + 'Inter-Bold.otf', s=FI + 'Inter-SemiBold.otf', m=FI + 'Inter-Medium.otf',
             mono=FD + 'jetbrains-mono/JetBrainsMono-Bold.ttf', serif=FD + 'liberation/LiberationSerif-Bold.ttf')
_fc = {}
def F(k, sz):
    if (k, sz) not in _fc: _fc[(k, sz)] = ImageFont.truetype(FONTS[k], int(sz))
    return _fc[(k, sz)]
YEL = (255, 200, 40)
def run(c, **k): subprocess.run(c, check=True, **k)
def dur(p): return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
def ease(t): t = min(1, max(0, t)); return t * t * (3 - 2 * t)
def seg(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)
def dv(s): return f'{RAW}/dvids/dvids_{s}.mp4'
GOES = RAW + '/other/noaa_star_goes16_harvey_geocolor.mp4'

# ------------------------------------------------------------------ the film
def C(src, a, d=None, **k): return dict(k='clip', src=src, a=a, d=d, **k)
def M(name, d=None): return dict(k='map', name=name, d=d)
L_BOR = 'Houston, Aug. 29, 2017 · Border Patrol BORSTAR swift-water rescue'
L_TXNG = 'Houston, Sunday, Aug. 27, 2017 · Texas National Guard'
L_CG = 'Houston, Aug. 27, 2017 · U.S. Coast Guard'
L_HOOK = 'Houston, Aug. 27–28, 2017 · Coast Guard hoist camera'
L_K1 = 'Brendan Kiley · Coast Guard rescue swimmer · interview still, 2018'
BEATS = [
 # ---------------- COLD OPEN: a real rescue, its own voices
 dict(id='o1', ch=0, shots=[C('546948', 0.0, push=0.05, label=L_BOR)], hold=6.6, nat=1.6),
 dict(id='o2', ch=0, shots=[C('546948', 14.9)], hold=2.6, nat=1.6),
 dict(id='o3', ch=0, shots=[C('546948', 44.3, push=0.06)], hold=5.0, nat=1.6, tin='whip'),
 dict(id='o4', ch=0, shots=[dict(k='split', a=('546164', 30.0), b=('546389', 8.0), la='FROM THE AIR', lb='IN THE STREET')],
      vo="August 2017. For four days, a hurricane's rain falls on Houston, the fourth-largest city in America.", hold=0.6, nat=0.35, tin='flash'),
 dict(id='o5', ch=0, shots=[C('546574', 2.0, push=0.06, label=L_HOOK, num=dict(v=122000, fmt='{:,}+', cap='people rescued across Texas', src='Governor’s Commission'))],
      vo="Across Texas, more than a hundred and twenty-two thousand people will have to be rescued.", hold=1.4),
 dict(id='o6', ch=0, shots=[C('546389', 42.0, label=L_TXNG)], vo="The flood was forecast, days in advance.", hold=0.5, nat=0.6, tin='whip'),
 dict(id='o7', ch=0, shots=[C('546164', 27.0, push=0.05)], vo="So why did so many people end up waiting on their roofs?", hold=1.2, nat=0.4),
 dict(id='o8', ch=0, shots=[dict(k='title', main=True, word='HARVEY', sub='HOUSTON · AUGUST 2017', bg=('546164', 31.0))], hold=5.2, tin='flash'),
 # ---------------- 01 THE WARNING
 dict(id='w0', ch=1, shots=[dict(k='title', num='01', word='THE WARNING', sub='FRIDAY, AUGUST 25, 2017', bg=('goes', 4.0))], hold=3.6, tin='flash'),
 dict(id='w1', ch=1, shots=[dict(k='goes', a=0.0, push=0.10, label='Satellite, Aug. 25, 2017 · NOAA/NESDIS/STAR, RAMMB/CIRA')],
      vo="Friday, August twenty-fifth. Two days ago, Harvey came back to life over the Gulf of Mexico. Now it is growing fast, and it is heading for Texas.", hold=0.6),
 dict(id='w2', ch=1, shots=[dict(k='doc', doc='adv22', marks=[(0, 0.30)], stops=[(0.0, 'page'), (0.55, 0)], src='NHC Advisory 22 · 4 p.m. CDT, Fri Aug. 25, 2017')],
      vo="At four in the afternoon, the National Hurricane Center warns of catastrophic, life-threatening flooding. Fifteen to thirty inches of rain. In places, forty.", hold=1.0, tin='whip'),
 dict(id='w3', ch=1, shots=[M('forecast')], vo="The warning is clear. What no forecast can show is which streets will flood.", hold=1.6),
 dict(id='w4', ch=1, shots=[M('evac')], vo=[("Along the coast, counties order people to leave. Houston and Harris County do not.", 0.7),
      ("County Judge Ed Emmett explains why. With a storm surge, you know who lives in its path. With rain, you don't know which neighbourhoods will flood.", 0)], hold=0.8),
 dict(id='w5', ch=1, shots=[M('rita'), dict(k='doc', doc='ntsb', marks=[(0, 0.25)], stops=[(0.0, 'page'), (0.45, 0)], src='NTSB Highway Accident Report HAR-07/01', d=6.0)],
      vo=[("And Houston remembers Rita.", 0.4), ("In 2005, millions tried to leave the city at once. Dozens of people died during that evacuation, twenty-three of them in one bus fire on the highway, the day before Rita came ashore.", 0)], hold=1.0),
 dict(id='w6', ch=1, shots=[M('stall')], vo=[("At about ten on Friday night, Harvey comes ashore near Rockport, a Category 4 hurricane.", 0.9), ("And then it stops.", 0)], hold=2.6, pause=True),
 # ---------------- 02 THE NIGHT
 dict(id='n0', ch=2, shots=[dict(k='title', num='02', word='THE NIGHT', sub='SATURDAY, AUGUST 26, 2017', bg=('546494', 2.0))], hold=3.6, tin='flash'),
 dict(id='n1', ch=2, shots=[M('night_scene')], night=True, vo=[("Saturday night. Harvey's rain bands settle over Houston, and stay.", 0.6),
      ("At nine twenty-seven, the weather service issues its first flash flood emergency.", 0.8), ("By two in the morning, five inches have fallen at Hobby Airport.", 0.6), ("By nine, more than eleven.", 0)], hold=1.6),
 dict(id='d1', ch=2, shots=[M('dickinson')], vo="South-east of the city, in Dickinson, the water is already inside Matthew Dusek's house. He is a Coast Guard chief.", hold=0.4),
 dict(id='d2', ch=2, shots=[C('551726', 12.0, push=0.05, label="Dusek's street in Dickinson, filmed Sept. 4, 2017 · voice: CPO Matthew Dusek, U.S. Coast Guard")],
      bite=('551726', 22.28, 25.80), hold=1.4),
 dict(id='m1', ch=2, shots=[C('546389', 44.0, label=L_TXNG)], vo="When daylight comes, the highways are rivers.", hold=1.0, nat=0.7, tin='whip'),
 dict(id='m2', ch=2, shots=[C('546166', 2.0, label='Houston, Aug. 27, 2017 · Coast Guard flood team')], vo="Cars sit in water up to their windows.", hold=0.8, nat=0.7),
 dict(id='m3', ch=2, shots=[C('546389', 8.0, num=dict(v=56000, fmt='{:,}', cap='calls to 911 in 15 hours · Harris County', src='NWS Service Assessment'))],
      vo="In fifteen hours, Harris County's 911 system takes fifty-six thousand calls.", hold=1.6, nat=0.5),
 dict(id='m4', ch=2, shots=[dict(k='doc', doc='sa_boat', marks=[(0, 0.10)], stops=[(0.0, 'page'), (0.30, 0)], quote=('“If you have a boat, we need your help.”', 'Harris County Judge Ed Emmett, Aug. 27, 2017 · quoted in the NWS Service Assessment', 0.55),
      src='NWS Service Assessment, Hurricane Harvey, 2018')], vo="The county judge goes on the air with a request.", hold=4.6, tin='whip'),
 dict(id='p1', ch=2, shots=[M('perez')], vo=[("Early that Sunday, a Houston police sergeant, Steve Perez, sets off for work in the rain. His wife had asked him not to go, the police chief said later.", 0.6),
      ("He drowns in his patrol car on a flooded road in north Houston. He is not found for two days.", 0)], hold=1.4),
 dict(id='r1', ch=2, shots=[C('546164', 27.0, push=0.05, label=L_CG)], vo="Those who cannot get out go up.", hold=0.4, nat=0.3, tin='whip'),
 dict(id='r2', ch=2, shots=[C('546574', 2.0, push=0.04, label=L_HOOK)], vo="Onto their roofs. And wait.", hold=4.4, pause=True),
 # ---------------- 03 THE ROOFS
 dict(id='f0', ch=3, shots=[dict(k='title', num='03', word='THE ROOFS', sub='SUNDAY, AUGUST 27, 2017', bg=('546164', 46.0))], hold=3.4, tin='flash'),
 dict(id='f1', ch=3, shots=[dict(k='photo', path='photos/dvids_img_3709576.jpg', circle='streets under water', label='Houston, Aug. 27, 2017 · Coast Guard helicopter from Cape Cod')],
      vo="From as far away as Cape Cod, Massachusetts, Coast Guard helicopters are arriving over Houston.", hold=1.2),
 dict(id='f2', ch=3, shots=[C('546164', 45.0, label=L_CG), C('546574', 9.0, label=L_HOOK)],
      vo="Most calls are just addresses from 911. One of the Cape Cod pilots, Simon Greene, said later that they followed the roads. The pilot who was not flying typed each address into a phone, and called out the turns.", hold=0.6, nat=0.5, tin='whip'),
 dict(id='f3', ch=3, shots=[C('546574', 46.0, label=L_HOOK), C('546574', 62.0, d=12.5)], hold=21.5, music_up=True),
 dict(id='f4', ch=3, shots=[C('546164', 79.0, label=L_CG)], hold=5.4, nat=0.6),
 dict(id='k1', ch=3, shots=[dict(k='still', src='620835', t=119.2, push=0.10, label=L_K1)], vo="One of the rescue swimmers flying those calls is Brendan Kiley.", hold=0.8, tin='flash'),
 dict(id='k2', ch=3, shots=[M('kiley')], vo=[("On his second day in Houston, he is lowered to a one-story house. Five people are waiting on the roof. The water is almost over the top of a car beside it.", 0.6),
      ("A woman pushes a big plastic storage bin toward him. He thinks it is luggage, and tells her there is no room for it. She pushes it back.", 0.9),
      ("Inside are her two children. A toddler, holding a newborn baby.", 1.4),
      ("He carries the bin down first, with the children inside. Then he helps their mother down. The basket goes up with all three of them together.", 0)], hold=1.2),
 dict(id='k3', ch=3, shots=[C('546526', 0.0, label='Greater Houston, Aug. 28, 2017 · U.S. Coast Guard'), C('546526', 33.0)],
      vo=[("Over three days, Kiley's crew rescues a hundred and twelve people.", 0.6), ("When the heaviest rain bands come through, Greene said, the pilots cannot see. They set down in a ballpark or a parking lot, wait for the band to pass, and lift off again.", 0)], hold=0.8, nat=0.5),
 dict(id='g1', ch=3, shots=[C('546389', 0.5, label=L_TXNG, num=dict(v=61064, fmt='{:,}', cap='rescues recorded by Harris County responders', src='Harris County'))],
      vo="On the ground, Harris County's firefighters and police record more than sixty-one thousand rescues. No one counts the people saved by neighbours in their own boats.", hold=1.0, nat=0.6, tin='whip'),
 dict(id='l1', ch=3, shots=[C('547138', 4.5, label='Sugar Land, Aug. 30, 2017 · Army National Guard high-water truck')],
      vo="Army National Guard trucks drive into the water. Sergeant Anthony Lara's first mission is in Dickinson.", hold=0.3, nat=0.5),
 dict(id='l2', ch=3, shots=[C('549208', 18.0, label='Sgt. Anthony Lara · 712th Military Police Co. · interview Sept. 6, 2017')], bite=('549208', 18.0, 26.15), hold=0.6, lead=0.0),
 dict(id='l3', ch=3, shots=[C('547660', 25.0, label='Pearland, Aug. 30, 2017 · Army National Guard')],
      vo="In League City, Specialist Kyle Wampler's unit pulls out an elderly man who can barely walk.", hold=0.3, nat=0.5),
 dict(id='l4', ch=3, shots=[C('549218', 51.0, label='Spc. Kyle Wampler · 712th Military Police Co. · interview, Sept. 2017')], bite=('549218', 51.0, 55.80), hold=0.8, lead=0.0),
 dict(id='y1', ch=3, shots=[C('546792', 144.0, label='Houston, Aug. 29, 2017 · New York Air National Guard')],
      vo="On Tuesday, a New York Air National Guard crew lifts a family out of a flooded neighbourhood.", hold=1.0, nat=0.5, tin='whip'),
 dict(id='y2', ch=3, shots=[C('546792', 248.0, push=0.04)], hold=7.0, nat=0.6, music_up=True),
 # ---------------- 04 THE DAMS
 dict(id='D0', ch=4, shots=[dict(k='title', num='04', word='THE DAMS', sub='WEST HOUSTON · AUGUST 25–30, 2017', bg=('547036', 126.0))], hold=3.6, tin='flash'),
 dict(id='D1', ch=4, shots=[M('sat_dams')], vo=[("West of downtown, a different danger is building, behind two dams.", 0.6),
      ("Addicks and Barker were built in the 1940s to hold floodwater back before it reaches the city. On August twenty-fifth, as planned, the Army Corps of Engineers closes their gates.", 0)], hold=1.6),
 dict(id='D2', ch=4, shots=[C('547036', 125.0, push=0.06, label='Inside the Addicks reservoir, Aug. 30, 2017 · USACE', num=dict(v=9000, fmt='{:,}+', cap='homes and businesses flooded inside the reservoirs', src='Governor’s Commission'))],
      vo="The basins fill. And inside them, on private land, whole neighbourhoods have been built. More than nine thousand homes and businesses there flood, from water that is being held back.", hold=1.0),
 dict(id='D3', ch=4, shots=[M('res_release')], vo="Downstream, Buffalo Bayou is already running high. Around midnight on August twenty-eighth, with the pools still rising, the Corps starts releasing water.", hold=1.2),
 dict(id='D4', ch=4, shots=[dict(k='doc', doc='court', marks=[(0, 0.25)], stops=[(0.0, 'page'), (0.45, 0)], src='U.S. Court of Federal Claims, No. 17-9002, opinion of Apr. 22, 2026, p. 40')],
      vo="The reason is the safety of the dams. The government had estimated that a dam failure would put six hundred thousand lives at stake.", hold=1.6, tin='whip'),
 dict(id='D5', ch=4, shots=[C('547036', 85.0, label='Barker Dam outlet, Aug. 30, 2017 · USACE', num=dict(v=4000, fmt='≈ {:,}', cap='homes flooded downstream by the releases', src='Governor’s Commission')),
      C('547036', 50.0, label='Office parks along Buffalo Bayou, Aug. 30, 2017 · USACE')],
      vo="The releases flood about four thousand more homes along the bayou. On August thirtieth, both reservoirs reach their highest levels on record.", hold=1.0),
 dict(id='D6', ch=4, shots=[dict(k='doc', doc='court', marks=[(1, 0.20)], stops=[(0.0, 'page'), (0.40, 1)], src='U.S. Court of Federal Claims, No. 17-9002, opinion of Apr. 22, 2026, p. 40')],
      vo=[("Years later, federal courts rule that by flooding these homes to protect others, the government took private property, and must pay for it.", 0.6),
          ("One court also praises the Corps' professionalism, and finds that at the levels the water actually reached, the risk of a dam failure was minimal.", 0)], hold=1.4),
 # ---------------- 05 THE RIVERS
 dict(id='R0', ch=5, shots=[dict(k='title', num='05', word='THE RIVERS', sub='AUGUST 29 – SEPTEMBER 1, 2017', bg=('547430', 76.0))], hold=3.4, tin='flash'),
 dict(id='R1', ch=5, shots=[M('east')], vo="Harvey finally drifts east. Its heaviest rain of all falls near Beaumont and Port Arthur. One gauge near Nederland records more than sixty inches.", hold=1.4),
 dict(id='R2', ch=5, shots=[C('590199', 27.0, push=0.05, label='Port Arthur, Aug. 30, 2017 · Air Force Reserve rescue')], hold=6.0, nat=0.7, tin='whip'),
 dict(id='R3', ch=5, shots=[C('547337', 20.0, label='Near Beaumont, Aug. 31, 2017 · Air Force Reserve'), C('547337', 68.0)],
      vo="Near Beaumont, an Air Force Reserve crew lowers a pararescueman to a flooded house. He comes back up with an older woman in the basket.", hold=1.2, nat=0.5),
 dict(id='R4', ch=5, shots=[C('547430', 75.0, label='Vidor, Aug. 31, 2017 · Alaska Air National Guard pararescue')],
      vo="In Vidor, a pararescue team from the Alaska Air National Guard works the streets by boat.", hold=0.3, nat=0.5, tin='whip'),
 dict(id='R5', ch=5, shots=[C('547400', 14.0, label='Lt. Dan Warren · 212th Rescue Squadron, Alaska Air National Guard · Vidor, 2017')], bite=('547400', 14.0, 18.95), hold=0.8, lead=0.0),
 dict(id='R6', ch=5, shots=[C('547127', 0.0, label='Orange, Texas, Aug. 30, 2017 · Army National Guard')], vo="In Orange, near the Louisiana line, people walk out along flooded roads.", hold=1.0, nat=0.6),
 dict(id='R7', ch=5, shots=[M('brazos')], vo=[("West of Houston, the water is still rising after the rain has stopped.", 0.5),
      ("The Brazos River at Richmond crests on September first, more than ten feet above flood stage. More than two hundred thousand people are under an evacuation order.", 0)], hold=1.2),
 dict(id='R8', ch=5, shots=[dict(k='split', a=('547686', 30.0), b=('547686', 176.0), la='THE ROAD IN', lb='PECAN GROVE · SEPT. 1, 2017')],
      vo="In Pecan Grove, Army National Guard trucks and a Texas search-and-rescue team take people out, with their children, their bags and their dogs.", hold=0.8, nat=0.5, tin='whip'),
 dict(id='R9', ch=5, shots=[C('547686', 224.0, label='Pecan Grove, Fort Bend County, Sept. 1, 2017 · Army National Guard'), C('547686', 368.0)], hold=9.0, nat=0.7, music_up=True),
 # ---------------- 06 AFTER
 dict(id='A0', ch=6, shots=[dict(k='title', num='06', word='AFTER', sub='SEPTEMBER 2017', bg=('548574', 8.0))], hold=3.4, tin='flash'),
 dict(id='A1', ch=6, shots=[C('548574', 6.0, label='Houston, Sept. 4, 2017 · Army Reserve soldiers help clear a flooded house'), C('548574', 47.0)],
      vo="When the water goes down, everything that was inside the houses comes out to the kerb.", hold=1.2, nat=0.5),
 dict(id='A2', ch=6, shots=[C('551726', 100.0, label='Dickinson, Texas, Sept. 4, 2017')], vo="In Dickinson, Matthew Dusek has just talked to his insurance adjuster.", hold=0.3, nat=0.0),
 dict(id='A3', ch=6, shots=[C('551726', 35.84)], bite=('551726', 35.84, 46.04), hold=1.0, lead=0.0),
 dict(id='A4', ch=6, shots=[M('observed')], vo="By the end, more than a hundred rain gauges have recorded forty inches or more: the very top of what was forecast.", hold=1.4, tin='whip'),
 dict(id='A5', ch=6, shots=[C('548574', 52.0, push=0.05, dim=0.55, nums=[dict(v=68, fmt='{:,}', cap='direct deaths · 36 in Harris County', src='NHC', t=0.0),
      dict(v=154170, fmt='{:,}', cap='houses flooded in Harris County', src='Harris County Flood Control District', t=0.5)])],
      vo=[("Harvey kills sixty-eight people directly, thirty-six of them in Harris County.", 0.8), ("In the county, more than a hundred and fifty thousand houses flood.", 0)], hold=1.4, nat=0.3),
 dict(id='A6', ch=6, shots=[C('551726', 90.26)], bite=('551726', 90.56, 97.52), hold=1.4, lead=0.3),
 # ---------------- ENDING: the answer, then one person
 dict(id='E1', ch=7, shots=[C('547686', 380.0, push=0.05, label='Pecan Grove, Sept. 1, 2017')],
      vo=[("The flood was forecast.", 0.5), ("But no forecast could name the streets, and there was no general order to leave Houston. When the downpour came on Saturday night, many people could only wait to be rescued.", 0)], hold=1.4, nat=0.4, tin='fade'),
 dict(id='E2', ch=7, shots=[dict(k='still', src='620835', t=119.2, push=0.14, label=L_K1)],
      vo=[("On one of those roofs, a mother had already done what she could.", 0.6), ("She put her two children in a plastic bin, and kept them dry, until Brendan Kiley reached them.", 0)], hold=3.6, tin='fade'),
 dict(id='E3', ch=7, shots=[dict(k='card')], hold=9.0, tin='fade'),
]
CHAPTERS = ['COLD OPEN', 'THE WARNING', 'THE NIGHT', 'THE ROOFS', 'THE DAMS', 'THE RIVERS', 'AFTER', 'ENDING']
# music by chapter: (track, from beat, to beat (end), offset in track, fade in, fade out, level)
MUSIC = [('188', 'o4', 'o7', 30.0, 3.0, 0.6, 0.050), ('678', 'o8', 'w0', 2.0, 0.05, 2.5, 0.070),
         ('563', 'w1', 'w6', 28.0, 3.0, 0.4, 0.045),
         ('188', 'n0', 'd2', 50.0, 1.0, 2.0, 0.048), ('597', 'm1', 'r2', 20.0, 1.5, 3.0, 0.042),
         ('679', 'f0', 'f4', 0.0, 0.3, 2.5, 0.052), ('184', 'k1', 'k2', 0.0, 2.5, 3.0, 0.040), ('616', 'k3', 'l4', 40.0, 2.0, 2.5, 0.050),
         ('168', 'y1', 'y2', 8.0, 2.0, 3.0, 0.045),
         ('571', 'D0', 'D6', 40.0, 1.5, 3.0, 0.040),
         ('614', 'R0', 'R6', 60.0, 1.5, 2.5, 0.040), ('593', 'R7', 'R9', 60.0, 2.0, 3.0, 0.040),
         ('520', 'A0', 'A6', 2.0, 2.0, 3.0, 0.042), ('546', 'E1', 'E3', 18.0, 3.0, 5.0, 0.045)]

# ------------------------------------------------------------------ voice + timeline
VOICE = os.environ.get('VOICE', 'todd')   # 'todd' = ElevenLabs narration in harvey/vo (tools/tts_final.py); 'piper' = temporary local voice
def piper(text, out):
    if VOICE == 'todd':
        key = os.path.basename(out)[:-4]; mp = f'{ROOT}/vo/{key}.mp3'
        if not (os.path.exists(mp) and open(mp[:-4] + '.txt').read() == text): raise SystemExit(f'missing narration {key}: run tools/tts_final.py')
        if not (os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(mp)):
            run(['ffmpeg', '-v', 'error', '-y', '-i', mp, '-af', 'silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse', '-ar', '48000', '-ac', '1', out])
        return
    if os.path.exists(out) and os.path.exists(out + '.txt') and open(out + '.txt').read() == text: return
    run(['python3', '-m', 'piper', '-m', PIPER, '--length-scale', '1.08', '--sentence-silence', '0.42', '-f', out], input=text, text=True, capture_output=True)
    open(out + '.txt', 'w').write(text)
def vo_parts(b):
    v = b.get('vo'); return [] if not v else [(v, 0)] if isinstance(v, str) else v
def timeline():
    t = 0.0; TL = []
    for b in BEATS:
        parts = []
        for j, (txt, gap) in enumerate(vo_parts(b)):
            p = f"{TMP}/vo/{b['id']}_{j}.wav"; piper(txt, p); parts.append((p, dur(p), gap))
        lead = b.get('lead', 0.35) if (parts or 'bite' in b) else 0.0
        speech = sum(d_ + g for _, d_, g in parts) if parts else (b['bite'][2] - b['bite'][1]) if 'bite' in b else 0.0
        d = lead + speech + b['hold']; TL.append(dict(b, s=t, sp=t + lead, d=d, parts=parts)); t += d
    return TL, t

# ------------------------------------------------------------------ frame sources
def decode(path, a, secs, vf_pre=''):
    vf = (vf_pre + ',' if vf_pre else '') + f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}'
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{a:.3f}', '-t', f'{secs + 0.3:.3f}', '-i', path, '-vf', vf, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3)
def frames_for(src, a, n):
    if src == 'goes':
        fr = decode(GOES, a, n / FPS * 0.62, 'crop=1200:675:0:262,setpts=PTS/0.62')   # 8 fps loop, shown slower than real time
    else:
        fr = decode(dv(src), a, n / FPS)
    if len(fr) == 0: raise SystemExit(f'no frames {src} {a}')
    idx = np.minimum(np.arange(n), len(fr) - 1); return fr, idx
VIG = None
def grade(f):
    global VIG
    if VIG is None:
        y, x = np.mgrid[0:H, 0:W]; r = np.sqrt(((x - W / 2) / (W / 2)) ** 2 + ((y - H / 2) / (H / 2)) ** 2)
        VIG = (1 - 0.28 * np.clip(r - 0.55, 0, 1) ** 1.6).astype(np.float32)[..., None]
        globals()['LUT'] = np.clip(255 * (0.5 + (np.arange(256) / 255 - 0.5) * 1.10) - 3, 0, 255).astype(np.uint8)
    return (cv2.LUT(f, LUT).astype(np.float32) * VIG).astype(np.uint8)
def push(f, z, dx=0.0, dy=0.0):
    if z <= 1.0005 and not dx and not dy: return f
    Mx = np.float32([[z, 0, (1 - z) * W / 2 + dx], [0, z, (1 - z) * H / 2 + dy]])
    return cv2.warpAffine(f, Mx, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
GR = None
def grain(f, amt, i):
    global GR
    if GR is None: GR = [np.random.default_rng(k).normal(0, 1, (H, W, 1)).astype(np.float32) for k in range(6)]
    return np.clip(f.astype(np.float32) + GR[i % 6] * amt, 0, 255).astype(np.uint8)

# ------------------------------------------------------------------ graphics
def gradient_bottom(im, h, a):
    g = np.linspace(0, 1, h, dtype=np.float32) ** 1.4 * a; arr = np.asarray(im).copy()
    arr[H - h:] = (arr[H - h:].astype(np.float32) * (1 - g[:, None, None])).astype(np.uint8); return Image.fromarray(arr)
def lower_third(d, text, u, dsec):
    # yellow bar grows, text slides in; holds up to 5.5 s, then fades out
    if not text: return
    t = u * dsec; show = min(dsec - 0.4, 5.8)
    a = seg(t, 0.25, 0.65) * (1 - seg(t, show - 0.5, show))
    if a <= 0.01: return
    parts = text.split(' · '); l1 = parts[0]; l2 = ' · '.join(parts[1:])
    x0, y0 = 72, H - 150; sl = (1 - seg(t, 0.25, 0.75)) * -40
    bh = 76 * seg(t, 0.2, 0.5); d.rectangle([x0, y0 + 76 - bh, x0 + 7, y0 + 76], fill=YEL + (int(255 * a),))
    d.text((x0 + 26 + sl, y0 + 2), l1, font=F('b', 36), fill=(255, 255, 255, int(255 * a)), stroke_width=2, stroke_fill=(0, 0, 0, int(120 * a)))
    if l2: d.text((x0 + 26 + sl * 0.6, y0 + 48), l2, font=F('m', 25), fill=(225, 230, 235, int(255 * a)), stroke_width=2, stroke_fill=(0, 0, 0, int(120 * a)))
def big_number(im, spec, u, dsec, slot=0):
    t = u * dsec; t0 = spec.get('t', 0.0) * dsec + 0.6; k = seg(t, t0, t0 + 1.4)
    if t < t0: return im
    v = spec['v'] * (1 - (1 - k) ** 3); s = spec['fmt'].format(int(round(v))); a = seg(t, t0, t0 + 0.3)
    d = ImageDraw.Draw(im, 'RGBA'); y = H - 250 - slot * 0  # numbers replace each other in place
    d.text((86, y), s, font=F('k', 190), fill=(255, 255, 255, int(255 * a)), anchor='ls', stroke_width=3, stroke_fill=(0, 0, 0, int(90 * a)))
    ca = seg(t, t0 + 0.9, t0 + 1.4); w = d.textlength(spec['cap'], font=F('b', 40))
    d.rectangle([86, y + 26, 86 + (w + 36) * ca, y + 90], fill=YEL + (int(240 * ca),))
    if ca > 0.6: d.text((104, y + 58), spec['cap'], font=F('b', 40), fill=(15, 15, 15, int(255 * seg(ca, 0.6, 1))), anchor='lm')
    if spec.get('src'): d.text((88, y + 122), 'Source: ' + spec['src'], font=F('m', 24), fill=(220, 225, 230, int(220 * ca)), anchor='lm')
    return im
def tracked(d, cx, y, word, font, spc, fill):
    ws = [d.textlength(ch, font=font) for ch in word]; tot = sum(ws) + spc * (len(word) - 1); x = cx - tot / 2
    for ch, w in zip(word, ws): d.text((x, y), ch, font=font, fill=fill, anchor='ls'); x += w + spc

# ------------------------------------------------------------------ shot renderers: each returns a function u -> RGB array
def sh_clip(sp, n, dsec):
    if sp['k'] == 'map': fr, idx = decode(sp['file'], 0, n / FPS), None; idx = np.minimum(np.arange(n), len(fr) - 1)
    elif sp['k'] == 'goes': fr, idx = frames_for('goes', sp['a'], n)
    else: fr, idx = frames_for(sp['src'], sp['a'], n)
    pz = sp.get('push', 0.03 if sp['k'] == 'clip' else 0.0); dim = sp.get('dim', 0)
    nums = sp.get('nums') or ([sp['num']] if sp.get('num') else [])
    def f(i):
        u = i / max(1, n - 1); x = fr[idx[i]]
        x = push(x, 1 + pz * ease(u) if pz else 1)
        if sp['k'] != 'map': x = grade(x)
        if dim: x = (x.astype(np.float32) * (1 - dim * seg(u * dsec, 0.2, 1.0))).astype(np.uint8)
        if not nums and not sp.get('label'): return x
        im = Image.fromarray(x)
        if nums:
            im = gradient_bottom(im, 520, 0.75)
            for k, nm in enumerate(nums):
                nxt = nums[k + 1]['t'] * dsec + 0.6 if k + 1 < len(nums) else 1e9
                if u * dsec < nxt - 0.25: im = big_number(im, nm, u, dsec)
        if sp.get('label') and not nums: lower_third(ImageDraw.Draw(im, 'RGBA'), sp['label'], u, dsec)
        elif sp.get('label'):   # label up top when a number holds the bottom
            d = ImageDraw.Draw(im, 'RGBA'); a = seg(u * dsec, 0.3, 0.7)
            d.text((W - 60, 56), sp['label'], font=F('m', 26), fill=(240, 240, 240, int(230 * a)), anchor='rt', stroke_width=2, stroke_fill=(0, 0, 0, 160))
        return np.asarray(im)
    return f
def sh_still(sp, n, dsec):
    fr = decode(dv(sp['src']), sp['t'], 0.1)[0]
    def f(i):
        u = i / max(1, n - 1); x = grade(push(fr, 1 + sp.get('push', 0.08) * ease(u)))
        if not sp.get('label'): return x
        im = Image.fromarray(x); lower_third(ImageDraw.Draw(im, 'RGBA'), sp['label'], u, dsec); return np.asarray(im)
    return f
def sh_photo(sp, n, dsec):
    P = Image.open(RAW + '/' + sp['path']).convert('RGB'); pw, ph = P.size; P = np.asarray(P)
    def f(i):
        u = i / max(1, n - 1); e = ease(u); z = 1 + 0.9 * e; cx = pw * (0.5 + 0.12 * e); cy = ph * (0.5 + 0.08 * e)
        vw = pw / z; vh = vw * H / W; x0, y0 = int(cx - vw / 2), int(cy - vh / 2)
        x = cv2.resize(P[max(0, y0):int(y0 + vh), max(0, x0):int(x0 + vw)], (W, H), interpolation=cv2.INTER_AREA)
        im = Image.fromarray(grade(x)); d = ImageDraw.Draw(im, 'RGBA'); a = seg(u, 0.55, 0.68)
        if a > 0 and sp.get('circle'):
            r = 165; cxp, cyp = W * 0.55, H * 0.52; sweep = 360 * seg(u, 0.55, 0.72)
            d.arc([cxp - r, cyp - r, cxp + r, cyp + r], -90, -90 + sweep, fill=YEL + (255,), width=9)
            d.text((cxp + r + 30, cyp), sp['circle'], font=F('b', 50), fill=(255, 255, 255, int(255 * seg(u, 0.66, 0.74))), anchor='lm', stroke_width=5, stroke_fill=(0, 0, 0, 200))
        lower_third(d, sp.get('label'), u, dsec); return np.asarray(im)
    return f
DOCMETA = None
def sh_doc(sp, n, dsec):
    global DOCMETA
    if DOCMETA is None: DOCMETA = json.load(open(DOCS + '/docs.json'))
    meta = DOCMETA[sp['doc']]; page = cv2.cvtColor(cv2.imread(meta['png']), cv2.COLOR_BGR2RGB)
    if sp['doc'] == 'adv22': page = page   # typeset bulletin page
    ph, pw = page.shape[:2]; P = 1800; bg = np.full((ph + 2 * P, pw + 2 * P, 3), (22, 24, 28), np.uint8)
    sh = np.zeros(bg.shape[:2], np.float32); sh[P + 30:P + ph + 30, P + 24:P + pw + 24] = 1; sh = cv2.GaussianBlur(sh, (0, 0), 28)
    bg = (bg.astype(np.float32) * (1 - 0.7 * sh[..., None])).astype(np.uint8); bg[P:P + ph, P:P + pw] = page
    groups = meta['boxes']
    def rect(tgt):
        if tgt == 'page': w = pw / 0.62; return (P + pw / 2, P + min(ph * 0.36, ph / 2), w)
        bx = groups[tgt]; x0 = min(b[0] for b in bx); x1 = max(b[2] for b in bx); y0 = min(b[1] for b in bx); y1 = max(b[3] for b in bx)
        w = max((x1 - x0) * 1.35, pw * 0.42); return (P + (x0 + x1) / 2, P + (y0 + y1) / 2 + (w * H / W) * (0.12 if sp.get('quote') else 0), w)
    stops = [(t, rect(g)) for t, g in sp['stops']]
    def cam(u):
        if u <= stops[0][0]: return stops[0][1]
        for (ta, ra), (tb, rb) in zip(stops, stops[1:]):
            if u <= tb:
                k = ease((u - ta) / (tb - ta)); w = math.exp(math.log(ra[2]) + (math.log(rb[2]) - math.log(ra[2])) * k)
                return (ra[0] + (rb[0] - ra[0]) * k, ra[1] + (rb[1] - ra[1]) * k, w)
        return stops[-1][1]
    def f(i):
        u = i / max(1, n - 1); cx, cy, w = cam(u); w *= 1 + 0.03 * u; h = w * H / W
        x0, y0 = cx - w / 2, cy - h / 2; crop = bg[int(y0):int(y0 + h), int(x0):int(x0 + w)]
        im = Image.fromarray(cv2.resize(crop, (W, H), interpolation=cv2.INTER_AREA)); d = ImageDraw.Draw(im, 'RGBA'); sc = W / w
        for g, t0 in sp['marks']:
            bx = groups[g]; tot = sum(b[2] - b[0] for b in bx); k = seg(u, t0, t0 + 0.22) * tot
            for b in bx:
                L = min(b[2] - b[0], max(0, k)); k -= b[2] - b[0]
                if L > 0: d.rectangle([(b[0] + P - x0) * sc, (b[1] + P - y0) * sc, (b[0] + L + P - x0) * sc, (b[3] + P - y0) * sc], fill=(255, 214, 0, 105))
        if sp.get('quote'):
            q, qs, t0 = sp['quote']; a = seg(u, t0, t0 + 0.08)
            if a > 0:
                d.rectangle([0, H - 300, W, H], fill=(10, 12, 16, int(235 * a)))
                d.text((W / 2, H - 190), q, font=F('serif', 70), fill=(255, 255, 255, int(255 * a)), anchor='mm')
                d.text((W / 2, H - 96), qs, font=F('m', 28), fill=(205, 210, 216, int(255 * a)), anchor='mm')
        if sp.get('src'):
            d.rectangle([0, 0, W, 64], fill=(10, 12, 16, 190)); d.text((40, 32), 'DOCUMENT', font=F('mono', 24), fill=YEL + (255,), anchor='lm')
            d.text((W - 40, 32), sp['src'], font=F('m', 24), fill=(225, 230, 235, 255), anchor='rm')
        return np.asarray(im)
    return f
def sh_title(sp, n, dsec):
    fr, idx = frames_for(sp['bg'][0], sp['bg'][1], n)
    def f(i):
        u = i / max(1, n - 1); t = u * dsec
        x = cv2.GaussianBlur(fr[idx[i]], (0, 0), 9 if not sp.get('main') else 5); x = push(x, 1.04 + 0.05 * u)
        x = (x.astype(np.float32) * (0.42 if not sp.get('main') else 0.5)).astype(np.uint8)
        im = Image.fromarray(x); d = ImageDraw.Draw(im, 'RGBA'); a = seg(t, 0.15, 0.7); out = 1 - seg(t, dsec - 0.35, dsec)
        big = F('k', 250 if sp.get('main') else 150); spc = (90 if sp.get('main') else 60) * (1 - ease(min(1, t / dsec * 1.2))) + (26 if sp.get('main') else 14)
        tracked(d, W / 2, H / 2 + 40, sp['word'], big, spc, (255, 255, 255, int(255 * a * out)))
        if sp.get('num'): d.text((W / 2, H / 2 - 170), sp['num'], font=F('mono', 44), fill=YEL + (int(255 * a * out),), anchor='mm')
        lw = 520 * seg(t, 0.5, 1.2); d.rectangle([W / 2 - lw / 2, H / 2 + 92, W / 2 + lw / 2, H / 2 + 96], fill=YEL + (int(255 * out),))
        tracked(d, W / 2, H / 2 + 160, sp['sub'], F('s', 36), 10, (255, 236, 190, int(255 * seg(t, 0.8, 1.4) * out)))
        return grain(np.asarray(im), 11, i)
    return f
def sh_split(sp, n, dsec):
    A, ia = frames_for(sp['a'][0], sp['a'][1], n); B, ib = frames_for(sp['b'][0], sp['b'][1], n)
    def f(i):
        u = i / max(1, n - 1); t = u * dsec; s = int(W - (W / 2) * ease(min(1, t / 0.7)))
        a = grade(A[ia[i]]); b = grade(B[ib[i]]); x = a.copy()
        if s < W: x[:, s:] = b[:, W // 4: W // 4 + (W - s)]
        x[:, max(0, s - 4):s + 4] = 255
        im = Image.fromarray(x); d = ImageDraw.Draw(im, 'RGBA'); al = int(255 * seg(t, 0.7, 1.1))
        d.text((60, H - 70), sp['la'], font=F('k', 52), fill=(255, 255, 255, al), anchor='ls', stroke_width=4, stroke_fill=(0, 0, 0, 160))
        d.text((W - 60, H - 70), sp['lb'], font=F('k', 52), fill=(255, 255, 255, al), anchor='rs', stroke_width=4, stroke_fill=(0, 0, 0, 160))
        lbl = sp.get('label')
        return np.asarray(im)
    return f
def sh_card(sp, n, dsec):
    def f(i):
        u = i / max(1, n - 1); t = u * dsec; im = Image.new('RGB', (W, H), (8, 9, 11)); d = ImageDraw.Draw(im, 'RGBA'); a = int(255 * seg(t, 0.3, 1.2) * (1 - seg(t, dsec - 1.0, dsec)))
        tracked(d, W / 2, 300, 'HARVEY', F('k', 120), 22, (255, 255, 255, a))
        d.text((W / 2, 360), 'HOUSTON · AUGUST 2017', font=F('s', 32), fill=(255, 236, 190, a), anchor='mm')
        lines = ['Archive footage and photos: DVIDS (U.S. Coast Guard, National Guard, Air Force Reserve, USACE, CBP) · NOAA',
                 'Data: NOAA/NHC, NWS, Iowa Environmental Mesonet, USGS 3DEP, U.S. Census TIGER · Documents: NHC, NWS, NTSB, U.S. Court of Federal Claims',
                 'Reconstruction based on the U.S. Coast Guard award citation · Every archive shot is labelled with its own place and date',
                 'Music: Mixkit (Mixkit Stock Music Free License)', 'Narration: AI voice (ElevenLabs)']
        for k, s in enumerate(lines): d.text((W / 2, 520 + k * 62), s, font=F('m' if k < 4 else 'b', 27), fill=(205, 210, 216, a) if k < 4 else YEL + (a,), anchor='mm')
        return np.asarray(im)
    return f
KIND = dict(clip=sh_clip, goes=sh_clip, map=sh_clip, still=sh_still, photo=sh_photo, doc=sh_doc, title=sh_title, split=sh_split, card=sh_card)

def transition(x, i, n, tin, tout):
    T = 6
    if tin == 'flash' and i < T: x = (x.astype(np.float32) + (255 - x.astype(np.float32)) * (1 - i / T) ** 1.5).astype(np.uint8)
    if tout == 'flash' and i >= n - 3: x = (x.astype(np.float32) + (255 - x.astype(np.float32)) * ((i - (n - 3) + 1) / 3)).astype(np.uint8)
    if tin == 'whip' and i < 5:
        k = 1 - i / 5; x = push(x, 1, dx=W * 0.45 * k ** 2); x = cv2.blur(x, (int(120 * k) + 1, 1))
    if tout == 'whip' and i >= n - 5:
        k = (i - (n - 5) + 1) / 5; x = push(x, 1, dx=-W * 0.45 * k ** 2); x = cv2.blur(x, (int(120 * k) + 1, 1))
    F_ = 12
    if tin == 'fade' and i < F_: x = (x.astype(np.float32) * (i / F_)).astype(np.uint8)
    if tout == 'fade' and i >= n - F_: x = (x.astype(np.float32) * ((n - 1 - i) / F_)).astype(np.uint8)
    return x
def render_shot(job):
    sp, n, out = job
    if os.path.exists(out): return out
    dsec = n / FPS; fn = KIND[sp['k']](sp, n, dsec)
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', '-g', '50', out + '.part.mp4'], stdin=subprocess.PIPE)
    for i in range(n):
        x = transition(np.ascontiguousarray(fn(i)), i, n, sp.get('tin'), sp.get('tout')); p.stdin.write(x.tobytes())
    p.stdin.close(); p.wait(); os.replace(out + '.part.mp4', out); return out

# ------------------------------------------------------------------ main
if __name__ == '__main__':
    TL, TOTAL = timeline(); T = {x['id']: x for x in TL}
    print(f'total {TOTAL:.1f} s = {TOTAL / 60:.2f} min', flush=True)
    for c in range(len(CHAPTERS)):
        xs = [x for x in TL if x['ch'] == c]; print(f'  {CHAPTERS[c]:12s} {xs[0]["s"] / 60:5.2f}  {sum(x["d"] for x in xs):6.1f}s')
    if os.environ.get('DRY'): sys.exit()
    # shot list with frame counts (frame-exact, cumulative rounding)
    shots = []
    for x in TL:
        fixed = sum(s.get('d') or 0 for s in x['shots']); free = [s for s in x['shots'] if not s.get('d')]
        at = x['s']
        for j, s in enumerate(x['shots']):
            ln = s.get('d') or (x['d'] - fixed) / max(1, len(free)); s2 = dict(s); s2.update(beat=x['id'], at=at, ln=ln, nat=x.get('nat', 0) if s['k'] == 'clip' else 0)
            if j == 0 and x.get('tin'): s2['tin'] = x['tin']
            shots.append(s2); at += ln
    for i in range(len(shots) - 1):
        if shots[i + 1].get('tin') in ('whip', 'flash', 'fade'): shots[i]['tout'] = shots[i + 1]['tin']
    fr0 = 0
    for s in shots:
        fr1 = int(round((s['at'] + s['ln']) * FPS)); s['n'] = fr1 - fr0; fr0 = fr1
    # maps first (each uses all 4 cores)
    for x in TL:
        for s in shots:
            if s['beat'] != x['id'] or s['k'] != 'map': continue
            env = dict(os.environ); tag = ''
            if s['name'] == 'night_scene':
                ss = x['sp']; st = []; c_ = ss
                for p_, d_, g_ in x['parts']: st.append((c_ - x['s'], c_ + d_ - x['s'])); c_ += d_ + g_
                D = s['n'] / FPS
                keys = [[0.0, '2017-08-26 20:30'], [st[1][0] + 0.3, '2017-08-26 21:27'], [st[1][1] - 0.2, '2017-08-26 21:40'], [st[2][0] + 0.2, '2017-08-27 02:00'],
                        [st[2][1] - 0.2, '2017-08-27 02:20'], [st[3][0] + 0.2, '2017-08-27 09:00'], [D, '2017-08-27 09:00']]
                env.update(NIGHT_KEYS=json.dumps(keys), NIGHT_DUR=f'{D:.3f}'); tag = hashlib.md5(json.dumps(keys).encode()).hexdigest()[:6]
            mp = f"{TMP}/maps/{s['name']}_{s['n']}{tag}.mp4"
            if not os.path.exists(mp):
                print('map', s['name'], s['n'] / FPS, flush=True); run(['python3', ROOT + '/tools/map_render.py', s['name'], f"{s['n'] / FPS:.3f}", mp], env=env)
            s['file'] = mp
    jobs = []
    for k, s in enumerate(shots):
        spec = {kk: v for kk, v in s.items() if kk not in ('at', 'nat')}; h = hashlib.md5(json.dumps(spec, sort_keys=True, default=str).encode() + open(__file__, 'rb').read()[:0]).hexdigest()[:10]
        jobs.append((spec, s['n'], f"{TMP}/seg/{k:03d}_{s['beat']}_{h}.mp4"))
    keep = {j[2] for j in jobs}
    for f_ in os.listdir(TMP + '/seg'):
        if TMP + '/seg/' + f_ not in keep: os.remove(TMP + '/seg/' + f_)
    with Pool(4) as pool:
        for k, out in enumerate(pool.imap(render_shot, jobs)):
            if k % 10 == 0: print('shot', k, '/', len(jobs), flush=True)
    open(TMP + '/list.txt', 'w').write(''.join(f"file '{j[2]}'\n" for j in jobs))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', TMP + '/list.txt', '-c', 'copy', TMP + '/video.mp4'])

    # ---------------- sound
    N = int((TOTAL + 1) * SR); tt = np.arange(N, dtype=np.float32) / SR
    def rd(src, ss=None, t=None, ch=1):
        raw = subprocess.run(['ffmpeg', '-v', 'error'] + (['-ss', str(ss)] if ss is not None else []) + (['-t', str(t)] if t is not None else []) + ['-i', src, '-ac', str(ch), '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; return a.reshape(-1, ch) if ch > 1 else a
    def rms(a): return float(np.sqrt((a ** 2).mean())) + 1e-9
    voice = np.zeros(N, np.float32); nat = np.zeros(N, np.float32)
    def put(buf, at, a, fade=0.05):
        i = int(at * SR); a = a[:max(0, N - i)].copy(); f = min(len(a) // 2, int(fade * SR))
        if f: a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
        buf[i:i + len(a)] += a
    for x in TL:
        c_ = x['sp']
        for p_, d_, g_ in x['parts']: a = rd(p_); put(voice, c_, a / rms(a) * 0.085); c_ += d_ + g_
        if 'bite' in x:
            s_, a0, a1 = x['bite']; a = rd(dv(s_), a0, a1 - a0); a -= a.mean(); put(voice, x['sp'], a / rms(a) * 0.09)
    for s in shots:
        if s['k'] == 'clip' and s['nat'] > 0:
            a = rd(dv(s['src']), s['a'], s['ln']); put(nat, s['at'], a / rms(a) * 0.05 * s['nat'], fade=0.25)
        if s['k'] == 'split' and T[s['beat']].get('nat', 0) > 0:
            a = rd(dv(s['b'][0]), s['b'][1], s['ln']); put(nat, s['at'], a / rms(a) * 0.05 * T[s['beat']]['nat'], fade=0.25)
    music = np.zeros((N, 2), np.float32); TR = {}
    for n_, b0, b1, off, fin, fout, lvl in MUSIC:
        if n_ not in TR: full = rd(f'{MUS}/mk{n_}.mp3', ch=2); TR[n_] = full / rms(full[int(10 * SR):])
        a0 = T[b0]['s']; a1 = T[b1]['s'] + T[b1]['d']; L = int((a1 - a0 + fout) * SR); m_ = TR[n_][int(off * SR):]
        while len(m_) < L: m_ = np.concatenate([m_, TR[n_][int(off * SR):]])
        m_ = m_[:L] * lvl; i0 = int(a0 * SR); m_ = m_[:max(0, N - i0)]
        e = np.clip((tt[i0:i0 + len(m_)] - a0) / fin, 0, 1) * np.clip((a1 + fout * 0.0 - tt[i0:i0 + len(m_)]) / fout + 1, 0, 1)
        e = np.clip((tt[i0:i0 + len(m_)] - a0) / fin, 0, 1) * np.clip((a1 + fout - tt[i0:i0 + len(m_)]) / fout, 0, 1)
        music[i0:i0 + len(m_)] += m_ * e[:, None]
    def sm(x, w):
        n = int(w * SR); c = np.concatenate([[0], np.cumsum(np.abs(x), dtype=np.float64)]); y = (c[n:] - c[:-n]) / n
        return np.pad(y, (n // 2, len(x) - len(y) - n // 2)).astype(np.float32)
    vact = np.clip(sm(voice, 0.35) / 0.02, 0, 1); duck = 1 - 0.55 * vact
    for x in TL:
        if x.get('pause'):          # the music falls away under the last words and over the held shot
            last = x['parts'][-1]; w0 = x['sp'] + sum(d_ + g_ for _, d_, g_ in x['parts'][:-1]) - 0.2; w1 = x['s'] + x['d']
            duck *= 1 - 0.8 * np.clip(np.minimum((tt - w0) / 0.5, (w1 - tt) / 0.8), 0, 1)
        if x.get('music_up'):
            duck *= 1 + 0.45 * np.clip(np.minimum((tt - x['s']) / 2.0, (x['s'] + x['d'] - tt) / 1.5), 0, 1)
    mix = (voice + nat * (1 - 0.6 * vact))[:, None] + music * duck[:, None]
    mix *= np.clip((TOTAL - tt) / 3.0, 0, 1)[:, None]; mix = mix / (np.abs(mix).max() + 1e-9) * 0.9
    with wave.open(TMP + '/mix.wav', 'w') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes((mix * 32767).astype(np.int16).tobytes())
    os.makedirs(ROOT + '/final', exist_ok=True); out = ROOT + ('/final/harvey_final.mp4' if VOICE == 'todd' else '/final/harvey_final_tempvoice.mp4')
    run(['ffmpeg', '-v', 'error', '-y', '-i', TMP + '/video.mp4', '-i', TMP + '/mix.wav', '-filter_complex', '[1:a]loudnorm=I=-15:TP=-1.5:LRA=11[a]',
         '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
    json.dump([{k: v for k, v in x.items() if k not in ('shots',)} for x in TL], open(ROOT + '/final/timeline_final.json', 'w'), indent=1, default=str)
    print('done', out, round(TOTAL, 1))
