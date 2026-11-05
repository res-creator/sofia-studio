# Harvey v3 — new archive and data found on Nov 5, 2026 (targeted search)

**Status codes.**
- **V** = downloaded and frames checked on contact sheets; speech, where any, transcribed locally.
- **D** = downloaded only.
- **L** = link only.

All DVIDS items below show "Public Domain" on their page. "Date taken" and "location" are the DVIDS page fields. Files are in `harvey/assets/raw/dvids/` (gitignored). Timecodes are file time.

**How the search was done.**
- DVIDS search pages are behind a bot check, so I did not use them.
- I read DVIDS item pages by ID for videos 546300–548700 (the Harvey upload weeks) and kept the 251 Harvey titles: `dvids_harvey_titles_scan.txt`.
- I opened and checked the 51 most relevant.
- Web search found the Dusek report again (551726, plus 548626, which has the same description and length) and nothing else on his street.

## Street level and residents (new)

| ID | Date / place (DVIDS) | What is on screen (checked) | Sound | Use |
|---|---|---|---|---|
| **546948** V | Aug 29, 2017 · Houston · El Paso CBP BORSTAR "swift water rescue in Houston, Texas" | 0:00–0:07 a woman clings to a utility pole in a fast current; an inflatable raft approaches. 0:22–0:28 a rescuer reaches her. 0:39–0:52 life vest on, she is pulled into the raft. 1:02–1:08 the raft moves down a flooded street. 1:19–1:28 they reach people standing in shallower water; she is helped out. | On-scene speech, transcribed: "I'm sorry." — "No, no, don't be sorry… we're gonna put the life vest on you… I got you… try to climb in this, I'll push you up… one, two… feel better?… You hurt?" No music (pitch test). | **Opening sequence** (waits → rescuer arrives → pulled in → safe). Never presented as Kiley's rescue. |
| **547686** V | Sep 1, 2017 · Pecan Grove (Fort Bend) · 36th Sustainment Brigade + Texas Task Force 2; "Rivers Edge neighborhood… mandatory evacuation" | 0:30–0:54 flooded road from a truck. 2:54–3:20 residents wade to the truck with a dog and bags. 3:42–4:18 families with small children seated in the truck. 6:06–6:40 they step down onto dry pavement. | Natural; one radio/phone line at 4:10. No music. | Residents' view, Brazos phase (Sept 1). |
| **547127**, **547123** V | Aug 30, 2017 · Orange, Texas · Capt. Martha Nigrelle, Army NG | People wading along a flooded road between pickups; flooded intersection. | Natural. | East phase. |
| **548574** V | Sep 4, 2017 · Houston · Army Reserve, Cpl. Timothy Yao | 0:06–0:25 debris piles at the kerb. 0:47–1:10 gutted kitchen and rooms. 1:34 a mattress carried out. 2:16–2:41 Spc. Chasidy Lafour interview. | Interview at the end (transcribed). No music detected. | Aftermath, the inside of a house. |
| **547660** V | Aug 30, 2017 · Pearland (DVIDS text; page location "Texas") · 147th ATKW PA | Trucks in floodwater; a resident wading with a soldier (0:34). | Interview + logo cards. | Spare. |
| **547433** V | Aug 31, 2017 · Wharton | NJ Task Force 1 and Guard: residents and pets carried to boats and trucks (7:00–10:22). | Natural. | Spare. Wharton is outside the Houston story. |
| **547779** V | Aug 31, 2017 · Richmond | Border Patrol airboat checks a flooded neighbourhood (2:19–2:31 residents at the edge). | Natural. | Spare. |
| **547138** V | Aug 30, 2017 · Sugar Land | High-water truck through a flooded road (0:04–0:15). | Natural. | Spare. |

## Air rescues: complete sequences (new)

| ID | Date / place | Sequence | Use |
|---|---|---|---|
| **546574** V | Aug 27 (page) / Aug 28 (caption) · Houston · Coast Guard hook camera | Roof with belongings and people (0:00–0:46). The basket comes down (0:50–1:02). A woman in purple gets in and rises (1:05–1:21). | Rescue block, "how a hoist works". Labelled Aug 27–28. |
| **546792** V | Aug 29, 2017 · Houston · 106th RQW (NY ANG) | Hoists. A one-month-old in a harness (caption). 2:24–2:58 a small boy in the cabin. 4:08–4:23 landing on grass; the family walks away. | Rescue → safety. |
| **546398** V | Aug 28, 2017 · Houston · CBP | A woman in pink waits on a roof; the rescuer is lowered and both are hoisted (0:11–0:49). | Spare. |
| **546610** V | Aug 29, 2017 · Texas · CBP | An elderly woman is hoisted; landing; handed to responders (0:12–0:55). | Spare; the place is only "Texas". |
| **546675** V | Aug 27 · Houston · CG hook camera | A litter hoist of a person (0:00–0:42). | Spare. |
| **547551**, **547283**, **547068** V | Aug 30 · Houston · 347th RQG / 41st RQS | Cabin GoPro: survivors pulled in; aerials of flooded subdivisions (547551 2:32–2:58). | Spare. |

## Interviews, sound status (pitch-and-side-channel test, see `script_v2.md`)

- Kiley 620835, Cosenza 620854: music bed throughout. Greene 620838: music at the head and tail, traces in between. **Not used as sound.**
- Clean, used as sound: Dusek 551726, Warren 547400, Lara 549208, Wampler 549218.
- Clean, not used: Lafour (in 548574).

## Data for the maps (all public domain or open)

**NOAA / NHC.**
- `data/hurdat2_harvey_AL092017.txt` — NHC best track (HURDAT2).
- `data/nhc_daily_rain_tx_la.csv` — NHC TCR rainfall supplement: daily and storm totals, 3,062 TX/LA rows.
- Used in the maps:
  - the "observed" map: 711 stations with complete Aug 25–31 data or storm totals, 138 of them at 40 in or more;
  - the Dickinson map: Dickinson NWS 43.92 in (Aug 25–31), League City 2.7 NE 43.33, Friendswood 2 NNW 50.04;
  - the east map: Nederland 1.5 SW 60.58.

**NWS ASOS hourly precipitation** via the Iowa Environmental Mesonet: `data/asos_p01i_raw.csv`, Aug 25 – Sep 1, 2017.
- Used on the night map: IAH, HOU, DWH, LVJ, AXH, CXO, GLS.
- Left out: SGR, EFD and TME. They report 0 through the night, which looks like missing data.

**Census 2017 boundaries and TIGER 2017** water and roads (public domain). Natural Earth 10 m land (public domain). Stored in `data/gis/` (gitignored, re-downloadable).

**Reservoir pools.**
- Terrain from the AWS Terrain Tiles (terrarium, z14; US source USGS 3DEP).
- Pool = connected area below the record level: Addicks 109.10 ft, Barker 101.56 ft (HCFCD, Aug 30).
- Seeded inside each reservoir. Addicks is clipped at its own embankment line as seen in the terrain; Barker is closed by its dam.
- Result: about 67 km² (Addicks) and 57 km² (Barker). **Approximate; labelled so on screen.**

**NOAA NGS emergency aerial imagery** (stormscdn.ngs.noaa.gov), Aug 30 flight. 936 z15 tiles over west Houston, plus z16 mosaics of the Barker west side, north Addicks and the Memorial/Buffalo Bayou area.
- Coverage checked: Dickinson is **not** covered on any date (Aug 27 – Sep 3).
- Beaumont and Port Arthur are covered Sep 1–2; Vidor Sep 2; Pecan Grove Aug 30 / 31 / Sep 3.

**New facts used** (checked in the primary documents):
- NHC TCR p. ~18: "Record water levels were observed on Buffalo Bayou, Clear Creek, Dickinson Bayou…"; "catastrophic flooding was reported in League City, Friendswood and Dickinson".
- NWS Service Assessment p. 27: Brazos River at Richmond "crested over 10 feet above flood stage on September 1, 2017. Over 200,000 residents were under an evacuation order".

## Still missing (searched, not found as public-domain originals)

- Dusek's house during the flood, or any Dickinson footage from Aug 26–28. Only the Sept 4 report exists (551726; 548626 has the same description and length).
- Night footage in Houston on Aug 26–27.
- Kingwood / Lake Houston, Meyerland, the George R. Brown shelter.
- Officials' briefings without TV logos.
- A participant's own phone video (like the reference film's), with known rights.
