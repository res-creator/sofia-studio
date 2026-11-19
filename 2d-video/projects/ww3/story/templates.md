# Шаблоны шотов (сгенерировано из scenes/templates/*.js — описание tpl())

Шот в story/shots.json: `{"id","start","end","line","scene","tpl":"имя","params":{…},"cues":{"имя":"слово"|секунды}}`. Без слова/секунд cue = доля длительности по умолчанию. Общие params: `cam {move: push|pull|driftL|driftR|rise|roll, z, x, y, amt}`, `tag {str, cue, kind: plate|label|source}`, `fx dust|rain|snow|none`. Проверочный набор всех шаблонов: story/templates_test.json.

## archive.js
- **archive** — Archive clip window. params: clip (archive.json id), from (s), aspect (16:9|4:3), caption («ИСПЫТАНИЕ, 1962, ТИХИЙ ОКЕАН»), credit («NARA · общественное достояние»), still (bool: a still image card — slow Ken Burns at assembly)

## diagrams.js
- **twoSensors** — Rule of two sensors: satellite ✓, radar ✓ → the alarm lamp lights only when both are green. params: mode (both|satOnly — 1983: satellite says launch, radars silent), cues sat, radar, lamp
- **sunGlint** — Blueprint 1983: the Sun → high clouds → a glint → the satellite on orbit mistakes it for an engine flare. params: cues sun, glint, sat
- **chain** — Chain of command: a row of line-art people, each with a padlock; the order passes along (a light dot travels) and every lock clicks shut/opens in turn. params: n (5), mode (pass|check — final: each person "re-checks", ticks appear), caption
- **briefcase** — The "nuclear briefcase" is not a button: it opens (cue "open") — inside a phone, a folder of options, a card to prove identity; labels pop at cues phone, folder, card
- **smokeDiagram** — Smoke rises above the clouds into the stratosphere (no rain there) and spreads as a thin dark film around the planet. params: cues rise, spread; labels
- **cutaway** — Cross-section diagrams. params: kind: "hotel" (Greenbrier: a grand hotel on a hill, a bunker underneath; cue "bunker" reveals it; tag «ГРИНБРАЙЕР, 1958–1961») | "mountain" (Cheyenne: granite mountain, buildings on giant springs, 25-ton doors; cues springs, doors)
- **hiroshimaMap** — Schematic city map (rivers, grid) with a 2-km circle (cue "circle") and ~170 green tree dots appearing (cue "trees"); optional «≈ 1 200 000» today (cue "people"). params: trees (170), people (str)
- **lamps** — Four safety stages of the 1961 bomb as lamps: three go dark one by one (cues off1..off3), the last stays lit (the simple switch). params: labels
- **treaties** — Treaty ribbon 1963 · 1968 · 1987 · 1993 … (cues y1..yN), optionally snapping at 2026 (snap:true, cue "snap"). params: years [{y:"1963", l:"ГОРЯЧАЯ ЛИНИЯ"}…], snap, bulb (house bulb «МЕГАТОННЫ В МЕГАВАТТЫ» at cue "bulb")
- **bunkersWorld** — Silhouettes of unnamed bunkers (cutaway domes) and flying command posts on several continents — no names, no flags. params: n (5)
- **cableVsHose** — Close-up comparison: cross-section of a deep-sea cable next to a garden hose, both ~2–3 cm; labels. params: none

## graphics.js
- **chapterTitle** — Chapter title card over a blurred set. params: str (e.g. «ПЕРВЫЙ ЧАС»), sub (small line above), hours index (show the strip with this chapter lit: 0..4), bg (space|field|control|none)
- **hoursStrip** — The navigator strip «1 ЧАС · СУТКИ · МЕСЯЦ · ГОД · 10 ЛЕТ». params: from, to (index; the marker travels between them over the shot or at cue "go"), labels (override), bg (space|void)
- **caseCard** — Big «N ИЗ 7» card opening each close call + the case icon and a small place/date line. params: n (1..7), where (e.g. «СЕВЕРНАЯ КАРОЛИНА · 1961»)
- **sevenRow** — Seven silhouettes/icons in a row (the close calls). params: state: "dim" (all dark) | "light" (light up one by one at cues l1..l7 or evenly) | "first" (only #1 glows — the switch) | "out" (all lit, then go out one by one, a glow remains) | "numbers" (cards 1–7 for the final question), labels (bool)
- **bigCounter** — Big animated number. params: from, to (number), at cue "count" (start) … cue "countEnd", unit (e.g. «БОЕГОЛОВОК»), prefix («≈»), year labels {from:"1986", to:"2026"}, source («SIPRI, январь 2026»), bg (void|globe), side bar {label, from, to} (small «военные запасы» bar that grows)
- **statCard** — One or two short facts as big numbers with labels (e.g. «> 99 %» «ДАННЫХ ПО ДНУ»; «≈ 600» «СИСТЕМ»). params: items [{v:"> 99 %", l:"…", cue}] (1–3), source, bg (void|space)
- **globeShot** — Earth from space (sets/space). params: lon0, lat0, spin, R, lights 0..1, night, hl {is,au,nz,…:1} (or cue "hl"), sats n, satsDead 0..1 (or cue "dead"), belt (cue "belt"), cables (draw over the shot or cue "cables"), smoke 0..1 | "cue", cold 0..1 | "cue", icons (["nav","cloud","clock"] badges on satellites at cue "icons"), tag, source, timer ("00:00"…)
- **mapShot** — Flat world/regional map. params: view {lon0,lon1,lat0,lat1}, hl {is,au,nz,…} (lit at cue "hl"), marks [{at:"hormuz"|[lon,lat], label, cue, color}], arcs [{from,to,cue,color}], cold 0..1 | "cue" (north turns blue — no strike marks ever), dots (n island dots for the 38-state map), tag, source, caption {str, cue} (big line under the map)
- **doomsday** — Doomsday Clock face, hands creep to near midnight; «85 СЕКУНД» readout at cue "sec". params: seconds (85), source
- **timer** — Digital timer running from "from" to "to" (mm:ss) during the shot; optional slice "decide" (a red segment of the bar: «НА РЕШЕНИЕ ≈ 10 МИН») at cue "decide". params: from ("00:00"), to ("30:00"), label, decide {min, label}
- **calendar** — Calendar sheet(s): days get crossed out one by one, one day circled red. params: month («СЕНТЯБРЬ 2001»), days 30, start weekday 0..6, cross [11,12,13,14], mark 17, or range {from:"31 ИЮЛЯ", to:"12 ДЕКАБРЯ"} (two-date flip card), single «5.02.2026»
- **barsShot** — Horizontal or vertical bars that grow at cues. params: rows [{label, v (0..1), str (value text), red, cue}], vertical (bool), title, source
- **thermo** — Thermometer drops to a value (cue "drop"); optional pale comparison («ЛЕДНИКОВЫЙ ПЕРИОД ≈ −6 °C · ТЫСЯЧИ ЛЕТ») at cue "compare". params: to (−8), label («−8 °C»), compare {v:−6, label}, globe (blue globe at the left)
- **uvScale** — UV index scale 0 → 11 «ЭКСТРЕМАЛЬНО» → needle runs past to 35 (cue "past"). params: max (35), source
- **slider** — A scale from «ЯДЕРНАЯ ОСЕНЬ» to «ЯДЕРНАЯ ЗИМА»; the knob slides back and forth (spectrum of answers). params: left, right, from (0..1), to (0..1)
- **curves** — Recovery curves returning to normal (light / temperature / ozone) with year ticks. params: lines [{label, back (years), color}], years (15)
- **quote** — Serif quote on a dark background, words fade in phrase by phrase; author/years line. params: str, by («1985 / 2022»), split ("|" separates phrases; cues q1,q2…)
- **priceTag** — Insert of a tiny microchip on a circuit board with a price tag «46 ¢» swinging in (cue "price"). params: price («46 ¢»), sub («ДЕТАЛЬ»)

## people.js
- **establish** — Wide of any set. params: set (station|control|study|sub|ocean|cockpit|bomberSky|goldsboro|kitchen|bedroom|port|field|tram|atoll|lab|norad|space|arctic|city), setOpts{}, cam{move,z,x,y,amt}, tag{str,cue,kind}, fx (dust|rain|snow|none), figures:[{who,x(0..1),s,facing,pose,expr}]
- **petrovDesk** — Petrov in the command post. params: pose (sit|desk|stand|phone|mic or [[frac,pose,cue]]), expr spec, alarm 0..1, banner 0..1, arcs n (0–5), lift (phone 0..1 or cue "lift"), z (1 wide … 1.8 medium), empty (no Petrov: empty chair + cap on desk), ghosts:[who…] (appear at cue "ghosts"), nameplate{name,role,cue}, frozen
- **bigHead** — Giant face close-up. params: who (cast id; Shoup is never used here), bg (set name), bgOpts{}, expr spec, look [x,y], side (-1 left of frame | 0 centre | 1 right), rimColor, alarm 0..1, rings (cue "rings": soft expanding rings — decision/realisation)
- **subCouncil** — Б-59: commander, zampolit, Arkhipov at the table. params: heat 0..1, alarm 0..1, focus (all|arkhipov|commander), cues: yes1, yes2 (nods), no (Arkhipov shakes head), expr per person {subcmd, zampolit, arkhipov} specs
- **subOutside** — Б-59 under water: ships above, training-charge flashes (cue "f1","f2","f3"), optional surfacing (surface 0..1 or cue "rise"). params: ships n, depth 0..1 (sub y), dawn, rise (bool)
- **k19** — Flash-back К-19: cold reactor compartment, sailors fixing pipes with their hands (crouch/reach), steam, desaturated memory tint, plate «К-19, 1961». params: n sailors (2–4), tagStr
- **cockpitCrew** — Bomber cockpit from behind two pilots. params: warn 0..1 (or cue "warn"), hatch (cue "hatch": one pilot climbs out through the top hatch), ground (parked, crews start engines; cue "start" lights up), expr
- **bomberNight** — Exterior night sky 1961: the jet, the tanker (tanker:true), the fuel plume growing over the shot (leak), breakup at cue "break", parachutes after it. params: tanker, leak (true), breakup (true), chutes n
- **goldsboroField** — Fields near Goldsboro at night: a canopy hanging on a tree (cue "tree") and/or the swamp (swamp:true). params: tree (bool), swamp (bool)
- **kitchenNews** — City kitchen, TV with the news; the viewer ("вы") at the table with a phone. params: who (viewer|petrov — Petrov at home 1998, no cap), tv{head,ticker}, pose (phone|sit|stand), expr spec, lampOn
- **phoneInsert** — Insert: a hand holds a phone. params: screen (message|subscribe|nosignal|map), str (message text), cue "press" (thumb taps the button → «ВЫ ПОДПИСАНЫ»), bg (city|kitchen)
- **bedroomCall** — 1980, 3:00 a.m.: the phone rings on the nightstand, the adviser sits up (cue "wake") and answers (cue "answer"). params: expr spec
- **noradHall** — Air-defence hall. params: screen (map|attack|digits|santa|radar|empty), digits [[frac,"000",cue?],…], digitsLabel, second (show 2nd screen "ПУСКОВ НЕТ"), alarm (0..1 or "cue" → cue "alarm"), crewExpr, shoup (Colonel Shoup from behind at a phone in the foreground), blip
- **santaCall** — 1955 split screen: left — a kid at home with a phone (happy), right — Colonel Shoup from behind at the hot-line phone (never his face). params: expr spec for the kid; cue "smile" (Shoup leans in, rings)
- **bankQueue** — 1914: a closed bank at night («ЗАКРЫТО»), a queue of plain silhouettes shuffling towards the door. params: n (people), sign
- **portScene** — Sea port at dusk (tanker, cranes, grain elevator). params: stopped (0..1 or cue "stop": lights go out, cranes freeze), truck (bool: grain truck drives along the berth), nz (green hills behind = New Zealand)
- **fieldScene** — Wheat field. params: grey 0..1 (sunless sky) or "cue" (cue "grey" fades the sun out), frost 0..1 or "cue" (cue "frost": rime spreads), tractor (bool, cue "stop" stops it), wind, elevator
- **tramRide** — Hiroshima tram on an empty street (1945) or on a bridge today (today:true). Schoolgirls inside (yellow headbands). params: today, dir (1 → right, -1 ←), speed, flowers 0..1, closeup (car fills the frame, the conductor girl at the door)
- **oleanderBloom** — Grey ground → sprouts push up → pink oleanders bloom (cue "bloom"). params: n flowers, warm (end in golden light)
- **atollGather** — Bikini, Feb 1946: Sunday, people sitting on the grass by the church; the governor (white uniform) talks to Chief Juda (lei). params: focus (crowd|talk), cue "answer" (Juda answers: nods, rings), expr {governor, chief}
- **atollBoats** — Boats with sails leave the atoll shore (progress over the shot); optional empty beach today (empty:true, boats:false), golden light. params: empty, golden
- **reef** — Under water in the crater: corals, a fish school, sharks; plate optional. params: fish n, sharks n
- **seabedCable** — Seabed with a thin data cable glowing; optional garden-hose comparison inset at cue "hose". params: hose (bool)
- **deadForest** — Chernobyl: a red, dead pine stand next to a living green forest, wolves/elk silhouettes walking (animals:true). params: animals
- **scientists** — Lab / computing centre. params: mode (one|two|empty), charts [left, right] (fall|rise|flat|spectrum), cue "vanish" (one: the scientist fades away → empty chair + papers, Aleksandrov 1985), expr spec, modern (monitors instead of tape reels)
- **arcticRocket** — Aurora over snow; a small research rocket climbs from the island (cue "launch"). params: rocket (bool)
- **hotline** — Hot line: two night skylines (no names, no flags), a glowing line links them; a teletype prints a paper strip in the middle (cue "print"). params: none
- **cityPhone** — A silhouette with a glowing phone against the night city. params: who (viewer), expr
