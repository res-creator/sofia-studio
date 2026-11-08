# The Match King — scene plan v1 (script v1 approved by the owner, Nov 2026)

Style: **2.5D parallax** (approved test: `tests/style_tests/test_parallax.mp4`). Flat painted layers at depth, a moving camera, depth-of-field blur,
light beams, dust, smoke. Real archive photos and 1920s newspapers are placed **inside** the parallax scenes as framed prints, newspaper pages on a table, or a
photo cut into 2–3 depth layers. Everything is drawn in code (no AI-image credits). Voice: Bryan (ElevenLabs) — after the owner allows the credits.
Timings ≈ 14 characters per second (Bryan in the LEGO film) + pauses; final timings come from the voice.

## Visual rules
- **Motif — one match.** A lit match appears in the cold open and returns at every chapter card. It burns shorter in each chapter. It goes out at his death (c3), and is lit again in the ending.
- **Light** follows the story: warm golden light during the rise (ch. 1–4), cold blue night for the trick (ch. 5), grey rain for the collapse (ch. 6–7), warm again for the ending.
- **Money circle** (ch. 3 and 5): glowing coins flow in a loop US → Kreuger → governments → back. In ch. 5 the same loop is shown as it really worked: new investors' money paid old investors.
- **Text on screen:** only dates, sums, names, sources — short, readable on a phone (≥ 44 px). Sources at the bottom left ("SOURCE: TIME, 1932"). Sums in the dollars of their year.
- **Kreuger** is a code-drawn puppet based on the period portraits (receding hair, clean-shaven, dark suit): young engineer (ch. 1) and the Match King (ch. 2–6). Lip-sync to the voice, blinks, head tilt, gestures: signing, lighting a match, a handshake, counting. **Never shown dead** (c3 is told with an empty room and the burnt-out match).
- **Chapter cards** (3 s, no voice): a match is struck, its flame reveals the chapter title and years.
- **Transitions** (the LEGO motion layer, `motion.js`): push-in / pull-out on every scene, whip pans between places, zoom-through into archive photos, a flash for time jumps, iris on chapter cards.

## Sets to build (each = 4–6 parallax layers; reused across scenes)
| # | Set | Used in |
|---|---|---|
| S1 | Paris, night: wet street, lit window of a 3rd-floor apartment, then the empty interior (desk, letters, a lamp) | h1, c3, c4 |
| S2 | Kalmar 1890s: small Swedish harbour town, the family match factory with a chimney | k1 |
| S3 | New York 1900s: skyline at dusk, the Flatiron under construction with steel frame and cranes | k2 |
| S4 | Stockholm 1912: the Olympic stadium being built (brick towers, scaffolding), concrete mixers | k3 |
| S5 | Match factory interior: long conveyor of matchboxes, machines, steam, workers' silhouettes | k4, t1, t2, m4 |
| S6 | Map room: a big wall map of Europe + the Atlantic, pins, ribbons; coins travel along the ribbons | t3, m1–m3, m2b, r2 |
| S7 | A government hall: columns, a long table, two chairs, a contract and a pen | m1, m2 |
| S8 | Match Palace, Stockholm: courtyard exterior with a fountain, then Kreuger's office | p1, p5, r4 |
| S9 | Park Avenue penthouse at night: roof garden with trees, the city below | p2 |
| S10 | Newsstand, New York, October 1929 (Time cover, archive) → the crash street | p3, c1 |
| S11 | Kreuger's office at night: forged bonds, an old printing press in the next room, a stamp | r3, r4 |
| S12 | "Maze of companies": paper doors/boxes in depth, each with a country name; coins pass through | r3 |
| S13 | Stockholm stock exchange: closed doors, a notice, rain | c5 |
| S14 | Accountants' room: piles of ledgers, a green lamp, red pencil | a1, a2 |
| S15 | US Senate hearing room 1933: wooden benches, microphones | a4 |
| S16 | Today: a table with a modern matchbox; the match is lit again | e1–e2 |

## Archive (free licences checked — research.md [53]; download once Wikimedia stops rate-limiting)
- Time cover, 28 Oct 1929 (PD-US) → p3
- Portrait c. 1920 (PD-Sweden) → h2, t2
- Colour autochrome, 8 Mar 1930, Georges Chevalier / Albert Kahn collection (CC BY 4.0, credit) → m5 or p2
- Office photo c. 1930 (PD-Sweden) → p5
- Founders photo 1908, Paul Toll + Kreuger (CC BY-SA 3.0, credit) → k3
- Kreuger reading a newspaper, before 1932 (PD-Sweden) → p4
- Match Palace (Tändstickspalatset) photos — licences to check → p1
- Paris, 17 Mar 1932, Agence Rol (PD) → c4 (used carefully, no body)
If a photo cannot be downloaded: the scene still works with the code-drawn set (as in the LEGO film), and nothing drawn is presented as a photo.

## Shot list
| Line | ≈ s | Set | What we see | Camera / transition | Text on screen |
|---|---|---|---|---|---|
| — | 3 | — | Darkness. A match is struck, the flame lights a matchbox label | macro push-in | — |
| h1 | 9 | S1 | Rainy Paris street at night, a lit window on the 3rd floor; police car lights pass | slow crane up to the window | PARIS · 12 MARCH 1932 |
| h2 | 9 | S5 → S6 | Endless matchboxes on a conveyor → the map: matchboxes cover two thirds of the world, coins fly to 15 capitals | whip pan; pull-back | IVAR KREUGER · ≈ 2/3 OF THE WORLD'S MATCHES · ≈ $400 M TO 15 GOVERNMENTS |
| h3 | 9 | S14 | Accountants open a ledger; numbers fade to nothing; a stamp NEVER EXISTED | push-in, rack focus to the page | ≈ $250 M OF ASSETS · NEVER EXISTED |
| h4 | 7 | S5 | Back to the burning match; it lights a single matchbox | push-in → iris | — |
| card 1 | 3 | — | Match strike → "THE ENGINEER · 1880–1913" | iris | |
| k1 | 10 | S2 | Kalmar harbour, the family factory chimney; a boy with a schoolbag walks past; then a ship leaving | slow pan left → right | KALMAR, SWEDEN · 1880 |
| k2 | 10 | S3 | New York at dusk; the Flatiron's steel frame rises; young Kreuger with rolled drawings on a beam | crane up the building | NEW YORK · 1900s · SOURCE: FORTUNE, 1933 |
| k3 | 11 | S4 | Stockholm stadium under construction; concrete pours; archive founders photo 1908 as a print on a site table | dolly along the scaffolding; zoom-through into the photo | KREUGER & TOLL · 1908 · STOCKHOLM OLYMPICS 1912 |
| k4 | 5 | S2 | The father's match factory again; Kreuger looks at it; a match flares | push-in on his face | — |
| card 2 | 3 | — | "THE MATCH TRUST · 1913–1923" | | |
| t1 | 9 | S5 | Stoves, lamps, cigarettes being lit (silhouettes); one match → a mountain of matchboxes | quick cuts on each word; pull-back | — |
| t2 | 9 | S5 | Factory signs being swapped for one: SWEDISH MATCH; portrait c.1920 framed on the wall | whip → push to the portrait | 1917 · SWEDISH MATCH |
| t3 | 11 | S6 | A ship crosses the Atlantic; Boston bank façade; certificates INTERNATIONAL MATCH printed | pan across the map | 1923 · INTERNATIONAL MATCH · LEE, HIGGINSON & CO. |
| t4 | 10 | S6 | Coins rise from many small American houses and flow across the ocean | pull-back | ≈ $250 M FROM AMERICAN INVESTORS |
| card 3 | 3 | — | "MATCHES FOR MONEY · 1925–1930" | | |
| m1 | 11 | S7 | Government hall; Kreuger slides a contract across the table; the minister signs | push-in on the pen | LOAN ⇄ MATCH MONOPOLY |
| m2 | 13 | S6 + S7 | Pins drop on Poland, France, Germany with sums; Russian matches stopped at the German border | map zooms per country | POLAND 1925 $6 M · FRANCE 1927 $75 M · GERMANY 1929 $125 M |
| m2b | 16 | S6 | The perfect circle: coins from US Main Street → Kreuger → France → interest back; the loop glows | slow orbit around the map | $50 M OF BONDS SOLD IN THE US |
| m3 | 9 | S6 | More pins: Greece, Hungary, Yugoslavia, Romania, Latvia, Ecuador, Turkey | fast push from pin to pin | ≈ $400 M · ≈ 15 GOVERNMENTS |
| m4 | 11 | S5/S6 | The map turns match-yellow country by country; counter to 60 % | pull-back | 1930 · ≈ 60 % OF WORLD PRODUCTION · 33 COUNTRIES · SOURCE: SWEDISH MATCH |
| m5 | 8 | S7 | Bankers bow to Kreuger; the word TRUST forms from matches | push-in | TRUST |
| card 4 | 3 | — | "THE MATCH PALACE · 1928–1929" | | |
| p1 | 5 | S8 | Match Palace courtyard, fountain, Kreuger walks in | crane down | STOCKHOLM · 1928 |
| p2 | 11 | S9 | Penthouse roof garden with trees over Manhattan; quick vignettes of Paris (Place Vendôme), Berlin, an island | whip pans between homes | PARK AVENUE · PARIS · BERLIN · STOCKHOLM |
| p3 | 8 | S10 | Newsstand: the real Time cover (archive) → newsboys shout, papers fly: CRASH | zoom-through the cover; flash | TIME · 28 OCT 1929 |
| p4 | 12 | S8 | Bankers at a table; a report stamped AUDITED IN SWEDEN; archive photo of Kreuger reading a newspaper | push-in | "TO ACCEPT A SWEDISH AUDIT OF THE GREATEST SWEDE" · TIME |
| p5 | 10 | S8 | A tiny gold key (his voting shares) opens a vault of giant companies | dolly into the vault | $50,000 OF VOTING SHARES → > $1 BILLION |
| card 5 | 3 | — | "THE TRICK" (no years) — cold blue | | |
| r1 | 9 | S6 | Governments pay back as a slow drip; investors' hands wait with cups | split depth: drip in focus | DECADES vs EVERY YEAR |
| r2 | 10 | S6 | The money circle again — now honest: new investors' coins go straight to old investors | orbit; the loop turns red | DIVIDENDS FROM CAPITAL, NOT PROFITS · SOURCE: KREUGER & TOLL RECORDS, PRINCETON |
| r3 | 10 | S12 | A maze of paper doors labelled LIECHTENSTEIN, NETHERLANDS…; coins pass and multiply in mirrors | slow dolly through the maze | — |
| r4 | 13 | S11 | Night office: a pen copies a signature; a printing press prints bonds; stack grows | macro push on the pen; cut on "fake" | ≈ $100 M OF FAKE ITALIAN BONDS |
| r5 | 5 | S11 | Lamp flickers; the coin stream stops | slow pull-back | — |
| card 6 | 3 | — | "OUT OF MATCHES · 1929–1932" — the match is short now | | |
| c1 | 11 | S10 | Crash street, people at bank doors; Swedish bank vault empties | whip pans | ≈ SEK 800 M ≈ 1/10 OF SWEDEN'S ECONOMY · SOURCE: RIKSBANK |
| c2 | 13 | S6 | Telephone poles/ERICSSON sign; ITT telegram arrives: RETURN $11 M | push-in on the telegram | ERICSSON → ITT · $11 M |
| c3 | 10 | S1 | The empty Paris room in morning light; letters on the desk; the match on the desk burns out | very slow push-in; no body | 12 MARCH 1932 |
| c4 | 9 | S1 | Outside: police at the door; a clock on the Paris Bourse ticks to closing | cut on the clock | OFFICIALLY: SUICIDE · MURDER THEORY: NEVER PROVEN |
| c5 | 9 | S13 | Stockholm exchange doors closed in rain, a notice; bank queues | crane down | — |
| card 7 | 3 | — | "THE BOOKS · 1932–1933" | | |
| a1 | 9 | S14 | Accountants with red pencils; ledgers crumble into dust | push-in | "SO CHILDISH…" · PRICE WATERHOUSE, 1932 |
| a2 | 14 | S14 | Two bars: reported $300 M vs real $40 M; coins from investors and banks | bars grow, pull-back | > $300 M REPORTED · ≈ $40 M REAL · $560 M FROM INVESTORS · $164 M FROM BANKS |
| a3 | 13 | S14 | A safe opens: almost empty; a coin rolls; creditors' hands get 32¢ | push-in to the safe | LARGEST BANKRUPTCY ON RECORD · < $10,000 CASH · 32¢ PER $1 |
| a4 | 15 | S15 | Stockholm: the PM's door closes; Washington: Senate hearing; a stamp INDEPENDENT AUDIT | whip pan Stockholm → Washington | SECURITIES ACTS 1933 · 1934 |
| e1 | 13 | S16 + S5 | The factory still works; a modern matchbox; a price tag | dolly; flash to today | 2022 · ≈ $16 BN |
| e1b | 11 | S16 | Kreuger's portrait fades into the smoke of the match | slow push-in | "THE FATHER OF TODAY'S FINANCIAL MARKET" · F. PARTNOY |
| e2 | 4 | S16 | The match is lit again, then darkness | hold | — |
| end | 3 | — | "Would YOU have trusted him?" + arrow | | |

Total ≈ 9.5 min.

## Production order
1. Kreuger puppet v2 (young + 1920s) and the motion layer from the LEGO film adapted to the parallax engine. Stills for the owner.
2. Sets S1, S5, S6 (most used) → stills. Then the other sets.
3. Voice (Bryan) — **only after the owner allows the ElevenLabs credits** (≈ 7,300 characters). Then word timings.
4. Chapters one by one: stills → video → check. Then music, SFX, −14 LUFS, SRT, cover, upload kit.
