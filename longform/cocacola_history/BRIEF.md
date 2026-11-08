# Brief for a chapter animator — "How Coca-Cola Took Over the World in 10 Minutes" (How It's Run long-form, YouTube 16:9)

You build the PICTURE + SFX stems of your chapter(s) in `longform/cocacola_history/chapters/<chapter>/`. The lead joins all chapters, adds one music bed,
masters to −14 LUFS and merges subtitles. Other agents work on other chapters at the same time (4 CPUs shared — render the full video once, at the end).

## Hard limits
- Write ONLY inside your chapter folder(s). Do not edit `longform/kit/`, `howitsrun_style/`, `hirkit/`, other chapters or episodes.
  Need a new prop/set? Put it in your chapter's own `<name>kit.js` (you may copy code from the kit or `longform_rewards/*` / earlier episodes).
- No git, no ElevenLabs calls, no API keys. Do not change `script.json` or `vo/` (temporary voice; it will be swapped later — so cue everything from word timings).
- English only on screen. Never use hand type `thumb`. Brand names only as plain bold type ("COCA-COLA", "PEPSI"): no logo copies, no script lettering.
- Real people: use `LOOKS.pemberton / candler / robinson / woodruff` from the kit (same face every time). Anyone alive or recent: generic, by role only.
- Facts: show only what the script says (or what `sources.md` supports). Visual metaphors must read as jokes, not as staged history.

## Read first
1. `longform/cocacola_history/STYLE.md` — the look (mandatory). Look at the attached reference sheet idea: detailed worlds, simple expressive characters, constant events.
2. `longform/kit/*.js` — look.js (palettes, textures, plates, word, dateCard, chapterCard, finish), toon.js (characters, poses, expressions, LOOKS),
   props.js (bottles, glass, jug, kettle, crate, truck, fountain, shelves, storefront, lamppost, street, coins, bills, ticket, poster, clock, calendar, phone, tv,
   vending, carton, burst, puff, speedLines, sparkles, bubble, arrow, crowd), engine.js (timeline, cam, layers, shake, run + CLI), sfx.py (SFX names).
3. **The reference chapter `chapters/c0_hook/episode.js`** — copy its structure: scenes with `t0` from word timings, `EN.cam` keys, `EN.layers` parallax, plates on stressed words, cues, music.
4. Your lines: `chapters/<chapter>/script.json` (+ timings in `vo/*.align.json`, `vo/speech.json`).

## Timing contract
- `const TL = EN.timeline(__dirname, { start: 3.0, gap: 0.55 })` → chapter card 0–2.6 s (pass `card: { n: 'CHAPTER 1', title, sub, era }` to `EN.run`), first line at 3.0 s.
  Longer gap before a punchline is fine (`gaps: { id: 0.9 }`). `T` = last voice end + 0.8 s.
- Each scene starts at a word: `at('p3', 'dry') - 0.12`. Scenes 2–8 s, a new visual event every ~2–4 s, camera always moving, nothing frozen, no empty frames.
- Chapter titles (card): c1 "CHAPTER 1 · The Pharmacist · Atlanta, 1886"; c2 "CHAPTER 2 · The Salesman · 1888–1913"; c3 "CHAPTER 3 · The One-Dollar Deal · 1899–1915";
  c4 "CHAPTER 4 · Everywhere · 1919–1945"; c5 "CHAPTER 5 · The Rival · 1898–1985"; c6 "CHAPTER 6 · New Coke · 1985"; c7 "CHAPTER 7 · The Real Secret · Today".
- **c7 only:** after the last line, an END CARD 5.0 s with no voice: question "COKE OR PEPSI?" + "Tell us in the comments" + a drawn arrow pointing down (draw it yourself), over a picture that
  echoes the film (two bottles side by side on the 1886 counter). Put it as the last scene; set `TL.T` accordingly (e.g. build the timeline with `tail: 5.8`).

## Files in each chapter folder
- `episode.js` (+ optional `<name>kit.js`) → `node episode.js T|cues|srt seg.srt|still t1,t2 out.png|frame t out.png|video seg_video.mp4|shots`
- `mix.py` = copy of `chapters/c0_hook/mix.py` (writes `vo.wav` + `fx.wav` from cues.json; music is made by the lead from your `music` sections).
  SFX names: see `longform/kit/sfx.py` (`SFX` dict: pop, fizz, whoosh, cut, stamp, ding, tick, kaching, coins, clink, glassclink, paper, tape, typewriter, ring, phone…, crowdcheer,
  crowdboo, murmur, factory, clank, machine, engine, horn, plane, boom, rumble2, wind, boing, slideup, slidedown, sparkle, gavel, bell, drumroll, cymbal, heartbeat, gasp, steps, flap…).
  Use sound at important moments only; never noise at 0.0; nothing loud under the voice.
- Music moods for `music: [[t, mood], ...]`: gaslight, ragtime, ragminor, march, pop, build, up, light, calm, soft, tension, dark, sad, modern.
- `build.sh`: `node episode.js cues && python3 mix.py && node episode.js srt seg.srt && node episode.js video seg_video.mp4` (cd to its folder first).

## QC before reporting
- Stills first (`node episode.js still ...`, Read the PNG): faces visible, nobody cut by the frame edge by accident, text readable and not over faces, no empty/unpainted areas
  (the engine fills the background with the era sky colour — cover the whole frame with your layers), consistent characters, every scene has motion.
- After the render: contact sheet every 1 s (`ffmpeg -i seg_video.mp4 -vf "fps=1,scale=384:216,tile=6x6" sheet_%02d.png`), look at every frame, fix, re-render only if needed.
- `ffprobe`: 1920x1080, 30 fps; duration == T (±0.05); `vo.wav`/`fx.wav` exist; `node episode.js shots` → average scene length ≤ 5 s.

## Report back (short)
Folder(s), T, number of scenes + average length, the picture beat by beat (one line per spoken line), any fact you put on screen that is not in the voice, anything unsure.

## Scene ideas per chapter (starting points — improve them; keep the humour visual and the history accurate)
**c1 The Pharmacist (p1–p8)** — p1 Georgia drugstore → Civil War flashback in grey smoke (saber flash, no gore, a bandage), a medicine bottle with a dark cloud above him (respectful).
p2 Pemberton as a busy inventor-pharmacist, bubbling flasks, ironic poster "CURES EVERYTHING!" (period-style), his bottle labelled "FRENCH WINE COCA". p3 town vote, a giant "DRY" stamp slams on Atlanta,
saloon doors shut, his wine bottle sweats. p4 the kettle: wine tossed out, coca leaf, kola nut, then a comic avalanche of sugar → syrup. p5 calendar MAY 8 1886, walk with the jug to "JACOBS' PHARMACY",
soda water fizz, "5¢" plate, first customer sips. p6 Frank Robinson at a ledger, lightbulb, COCA + KOLA → "COCA-COLA" plate, a pen draws loopy flourishes (abstract, not the logo).
p7 counter shows 9; a scale: advertising spend outweighs the coins coming in. p8 he hands torn pieces of a deed to different men, "1888", an empty chair at sunset (respectful).
**c2 The Salesman (a1–a6)** — a1 Candler collects all the pieces into one, "$2,300" plate. a2 a door slams on "a drink they've never tasted" (thought bubble). a3 a blizzard of free-glass tickets:
a mail carrier buried, a queue at the fountain, "1 IN 9 AMERICANS" with nine figures, one lit. a4 the name on clocks, calendars, trays, paper fans — a man turns around and the name is on everything.
a5 a US map lights state by state, "1895"; a lab with a "REMOVED" stamp over the coca extract (factual, no drama). a6 cliffhanger: two bowler-hat silhouettes at Candler's door.
**c3 The One-Dollar Deal (b1–b7)** — b1 a steam train from "CHATTANOOGA", two lawyers with a bottle. b2 Candler unimpressed, a bottle foams over in a comic mess, a reluctant "fine". b3 a single $1 bill
on the desk → it sits in a drawer gathering dust and cobwebs ("REPORTEDLY NEVER COLLECTED"). b4–b5 a map: bottling plants pop up town after town; local businessmen pour their own money bags in;
trucks roll out; a diagram: company → syrup → bottlers → everything else. b6 a shelf of copycat bottles with obviously made-up names ("KOKE-OLA", "COCA-NOLA", "KOLA-KOKA"), a confused customer.
b7 lights go out: a hand finds the curvy bottle in the dark; broken pieces still look like it; "1915" + "TERRE HAUTE, INDIANA", spotlight reveal of the contour bottle.
**c4 Everywhere (w1–w7)** — w1 a bank vault, a truck of money, "$25,000,000", "1919". w2 Robert Woodruff takes the big chair; "within an arm's reach of desire" as a comic stretchy arm reaching a Coke
in every situation. w3 six-bottle carton, a gas-station cooler, a vending machine, ads everywhere; a painter at an easel paints a jolly Santa, "1931". w4 "MYTH?" stamp: an older red-suited Santa
magazine cover drawn earlier; ads made the warm jolly Santa the standard. w5 "1941", a telegram "5¢ FOR EVERY MAN IN UNIFORM — WHATEVER IT COSTS". w6 crates of bottling machines on a ship,
plants in tents near the front, "64 BOTTLING PLANTS" pins on a world map. w7 soldiers home, a map with the drink in dozens of countries ("WENT GLOBAL BY FOLLOWING THE ARMY").
**c5 The Rival (r1–r5)** — r1 a North Carolina pharmacy 1898, blue "PEPSI" bottle; "BANKRUPT" stamps twice. r2 a Coke boardroom waves it away ("REPORTEDLY" plate). r3 Depression breadline mood:
the Pepsi bottle twice as tall for the same nickel, "12 OZ vs 6.5 OZ", "5¢ = 5¢". r3b 1971: young people from many countries on a sunny hilltop in Italy, music notes, a radio playing the song (no lyrics on screen).
r4 "1975": blind taste table, cups A and B, a TV camera, people pick B → it's Pepsi; comic metaphor race of two giant bottles on a track: Pepsi gaining. r5 a dark boardroom, lightning: "WHAT IF WE CHANGE THE TASTE?"
**c6 New Coke (n1–n6)** — n1 taste lab, a tally board "≈ 200,000 PEOPLE", the new cup wins a trophy over old and Pepsi. n2 "APRIL 23, 1985" press conference, camera flashes, a generic executive.
n3 people stuffing car trunks with cases, protest signs, a switchboard with operators drowning in calls, "1,500 CALLS A DAY", a phone melting (comic). n4 warm flashback: a kid and grandpa sharing a Coke
at a soda fountain → the bottle is a memory; "IT BELONGED TO THEM". n5 "JULY 11, 1985", a comeback parade with confetti, "COCA-COLA CLASSIC", calendar flips "79 DAYS", "31,000+ CALLS".
n6 "ONE OF THE BIGGEST MARKETING MISTAKES EVER" stamp, then a chart line shaped like a heart: "HOW MUCH PEOPLE CARED".
**c7 The Real Secret (t1–t4 + end card)** — t1 a modern world map with ships and trucks, "33+ BILLION CASES A YEAR", "200+ COUNTRIES & TERRITORIES", "$47 BILLION (2024)".
t2 split screen 1899 vs today: the company makes concentrate → independent bottling partners → stores (moving conveyor). t3 recap as five cards popping with checks: free ticket, $1 bill, contour bottle,
soldier, angry crowd. t4 Pemberton at his counter with nine glasses; the camera pulls back and the counter becomes the whole modern world, "2.2 BILLION A DAY". End card 5 s: "COKE OR PEPSI?" + arrow.
