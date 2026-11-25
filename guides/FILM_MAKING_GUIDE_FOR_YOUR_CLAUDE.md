# How We Make Our Travel Documentary Films: The Complete Guide for Your Claude

**Who this is for.** This file is written for your Claude (Claude Code on your Mac). Give it the whole file and say: *"Read FILM_MAKING_GUIDE_FOR_YOUR_CLAUDE.md fully. We are making a new travel documentary film about <COUNTRY> for my English channel. Follow this guide step by step, stop at every gate marked OWNER GATE and show me the result."*

**What it covers.** How we make our long country films (India, Norway, Vietnam, Japan, China, and Turkey, which is in production now) completely from scratch: idea, angle, research, script, reviews, footage, music, voice, edit, quality control, packaging, publishing and promotion.

**What it does not cover.** Localising our finished films into English. That is in the separate guide you already have (ALL_INSTRUCTIONS_FOR_YOUR_AI.md). Its voice tools (kokoro_voice.py, master_voice.py, onset_check.py) are reused here.

**Every rule in this guide comes from real decisions we made on real films,** usually after a mistake. Where something is adapted for an English channel, it says so.

---

## 0. The pipeline at a glance

| # | Stage | Output file | Gate |
|---|---|---|---|
| 1 | Choose the country | short note with demand numbers | - |
| 2 | Saturation check (what is already taken) | `research/SATURATION.md` | - |
| 3 | Fact hunt: local sources + research | `research/HUNT_LOCAL.md`, `research/HUNT_RESEARCH.md`, `research/MYSTERIES.md` | - |
| 4 | Footage feasibility scout (no downloads) | `research/FOOTAGE_FEASIBILITY.md` | - |
| 5 | Pitch | `PITCH.md` | 2 critics + fact-check of the key facts, then **OWNER GATE** |
| 6 | Script | `script/FILM_master.txt`, `FILM_voice.txt`, `FILM_text.txt`, `STRUCTURE.md`, `OPENING_2MIN.md`, `BEAUTY_PLAN.md`, `SOURCES.md` | 2 critics to 10/10 + independent fact-checker |
| 7 | Footage download + shot lists | `footage/clips/`, `footage/CREDITS.md`, shot lists | - |
| 8 | Music per chapter | `music/`, `music_cues.json` | - |
| 9 | Draft voice (can be a free temporary voice) | `vo/takes/` | - |
| 10 | Edit the WHOLE film as a draft (480p or 720p) | draft video | automatic QA + contact sheets + independent reviewer, then **OWNER GATE** |
| 11 | Fix the owner's notes, final voice, mastering | final takes | QA again |
| 12 | Final render 4K, `.srt`, credits list | final video | QA again, **OWNER GATE** |
| 13 | Packaging: 3 completely different cover + title pairs | `cover/`, `TITLES.md` | thumbnail critic, 168 px check, **OWNER GATE** |
| 14 | Publish, pinned comment, end screen, community post, ads | log | - |
| 15 | Read the numbers after 48 h and 14 days | film log table | - |

Golden rule for the owner's time: **the owner judges the film, not our bugs.** Nothing goes to the owner before it has passed the automatic checks, contact sheets and an independent reviewer (section 10).

---

## 1. Philosophy: what kind of films we make

1. **We never copy videos.** AI models (including your Claude) give every user the same viral facts. Many channels now publish the same film about the same country in the same words. A channel that copied the format, countries, titles and covers of a successful competitor got 3,000 views where the original got 2.2 million, and stopped within 3 weeks. **A copy of a fresh winner on the same topic loses to the original.**
2. **We study competitors to know what is taken, then go around it.** List what everyone already says, then find our own angle: the same country shown from another side. Known facts are allowed only from a new entry point (a twist the viewer has not heard).
3. **Facts are checked.** Every number and claim has a source. An independent fact-checker reviews the script before any voice is recorded. No half-truths, not even in a title ("80,000 people disappear" and "80,000 missing-person reports, most are found" are not the same thing).
4. **Honest about the bad side, with respect.** We show the world as it is: dirt, poverty, beggars, low education, scams, problems. With numbers from reliable sources (UN, World Bank, UNESCO, national statistics), explaining causes, never mocking people. "Neither condemn nor approve." Balance: about 2 good facts for 1 bad one, more light than dark. The film can show every hard side and still make the viewer want to go and see it with their own eyes: curiosity sells the trip, not a flattering picture.
5. **People and life TODAY, not history lectures.** We are a travel channel. The viewer watches to go there. People first: how they live, work, eat, love, what they buy and pay (prices, salaries, rent, taxes), how they treat a visitor. Markets, street food, transport, housing, night life. History and landmarks only briefly, as background for today. Never "here is a wall, here is a temple". Our calm, beautiful Norway film had our best pictures and was still called boring because it told history and geography instead of people.
6. **Prices in US dollars.** The film is for everyone, not one nationality. Prices in local currency plus about-USD, or just USD. No comparisons with any one home country, no practical info that only works for one nationality. Tourists from one specific country are mentioned at most once, in passing.
7. **Emotion, humour, beauty.** The narration has a smile, interest and a couple of light laughs. Smart, sharp, well-timed humour in several places (bold but never offensive; quality over quantity, cut average jokes). Beauty pauses of 10-15 s with no voice, just music and landscapes.
8. **Each film has its own style.** Own colour grade, own label and arrow look, own transitions and rhythm, own recurring motif, own music mood per chapter, own typography. Previous films are a quality bar, never a template. Only the brand stays the same (end card, logo, text rules). This also protects monetisation: YouTube's "inauthentic / repetitive content" policy targets channels where every video follows one template.
9. **The goal of every film:** the viewer must *want to go there.*
10. **The film is one big hook,** a story with characters, a central question and a twist ending like a feature film. Not a list of facts.

---

## 2. Choosing the country and finding the angle

### 2.1 Choose a country with demand
- Search YouTube for "life in <country> documentary", "how people live in <country>", "<country> documentary 4K" and similar. Count videos longer than 10 minutes with 1M+ views and how many of them are fresh (last 2 years). Compare with 2-3 other countries.
- Prefer countries people dream about or search a lot, but always with our own angle.
- Check which competitors filmed this country in the last 3 months.
- Order matters: the end of each film announces the next country, so plan 2-3 films ahead.

### 2.2 Saturation check (mandatory)
Collect the ~30 most popular videos about the country (in our case Russian and English; for you: English plus 1-2 other big languages). Write down their angles from titles, chapters and descriptions.

**Rule:** an angle that appears in **3 or more** of these videos, or that has 3+ separate videos with 100K+ views, is *taken*. It may stay as background, never as a hook, a title or a chapter centrepiece.

Also note:
- which AI-looking channels published near-identical films recently (they all repeat the same thesis);
- where the real demand is that nobody serves in your language (for Turkey we found huge demand for wordless films about highland nomads and mountain villages, 2-15M views, and nothing like it with narration in our language. That became our angle);
- never copy a competitor's structure, title formula or description line by line.

Copy-paste prompt:
```
Do the saturation check for a documentary film about <COUNTRY>.
Search YouTube (logged out, do not open any player, never play sound) for 20-30 queries in English
and <SECOND LANGUAGE> such as "life in <COUNTRY> documentary", "how people live in <COUNTRY>", "<COUNTRY> 4K documentary",
"<COUNTRY> prices", "<COUNTRY> travel film". Keep videos longer than 8 minutes.
For the top ~80 videos get title, chapters, description, views, date (yt-dlp metadata only, no download).
Output research/SATURATION.md:
0) short summary: demand level vs 2 other countries, how many 1M+ videos, how many fresh;
1) a table of angles with counts (an angle in 3+ videos = TAKEN);
2) the BLACKLIST: ~40-50 facts and hooks any AI or top video gives first about this country;
3) white spots: topics with real demand that nobody tells well;
4) a contact sheet of the top-20 thumbnails.
```

### 2.3 The blacklist ("as everyone says" facts)
Before any script, a fresh helper lists the ~40-50 facts about the country that any AI or top video would say first: viral "interesting facts" lists, Wikipedia trivia, the top-30 videos. **None of them may be a hook, a title or a chapter centrepiece.** At most a one-line mention if the story needs it.

Example of why: our Japan sample opened with "the train company that apologised for leaving 20 seconds early". Another creator's Japan video had exactly the same fact. That is what we avoid.

### 2.4 The topic grid (best AND worst in every cell)
Fill for every country, the best and the worst in each cell:
women, men, love and family, food (best and scariest), prices and money, work, housing, children and school, old people, health and death, law and crime, religion and rituals, animals, climate and nature, transport, night, technology, taboos and bans, records, mysteries and secrets, what locals hate, what tourists never see.

### 2.5 Two fact hunters, different lenses
Run two independent helpers (strongest model, high effort):
- **Lens A, local sources in the local language:** news of the last 1-2 years, forums, court cases, local statistics offices, ministries, local documentaries, memes. Things not translated into English.
- **Lens B, scientists and rare data:** studies, archives, records, discoveries of the last 2 years.

Each gives ~3 facts per grid cell, each with a source link and a **"they'll say 'no way!' at the dinner table" score from 1 to 10.** Mark facts with one source or an unclear date as [CHECK], and facts that might already be known as [KNOWN?].

**The "other creator" test:** would someone who already made a video about this country know this fact? If yes, it is not a hook.

Copy-paste prompt (run twice, once per lens):
```
You are fact hunter <A: local-language sources | B: research and rare data> for a documentary about <COUNTRY>.
Read research/SATURATION.md first. Never use anything from its BLACKLIST as a hook.
Fill this grid, BEST and WORST in every cell: women, men, love and family, food (best/scariest), prices and money,
work, housing, children and school, old people, health and death, law and crime, religion and rituals, animals,
climate and nature, transport, night, technology, taboos, records, mysteries, what locals hate, what tourists never see.
Lens A: search in <LOCAL LANGUAGE> only (national statistics office, ministries, big local newspapers, local forums,
court news, last 1-2 years). Lens B: scientific papers, archives, records, discoveries of the last 2 years.
3 facts per cell. For each: the fact in one sentence, exact number, date, source URL, "no way!" score 1-10,
[CHECK] if single-source or unclear date, [KNOWN?] if another creator could already know it.
Convert local prices to USD at today's rate and write the rate and date at the top.
Output research/HUNT_<LOCAL|RESEARCH>.md. Do not write a script.
```

### 2.6 Select
- **1 central mystery** for the whole film. It goes into the title and the cover.
- **10-12 "no way!" facts** (we call them the 11 "no way!"), roughly one every 3 minutes, already worded after the fact-check.
- **2-3 living heroes** (real people we can show and hear, see 4.4).
- Balance: 2 good facts to 1 bad one.
- People: women and men seen through local eyes, not tourists' eyes.

### 2.7 Lessons from our numbers (put the strongest blocks evenly through the film)
Retention peaks (viewers rewatch) were:
- money and tricks: double prices, banknotes, markets;
- housing and its prices (micro-flats);
- a dark history chapter;
- the finale "why people come back home".

These blocks must be strong in every film and spread evenly.

---

## 3. The pitch (before any script)

The pitch is a plan the owner approves before production. Nothing is voiced, downloaded or edited before that OK.

Contents of `PITCH.md`:
1. **Working title, length, release date.** Our films are now ~30-35 min.
2. **The angle:** what is taken (from SATURATION.md), our angle in 3-5 lines, the **central question** that is heard by 0:30, how many times we return to it, and the three-layer answer in the finale. Show a table "hook / what exists now / status (free or taken)".
3. **The 11 "no way!" facts** with sources, already worded after a quick fact-check.
4. **Heroes:** who, which licensed footage of them exists (video ID, resolution, timecodes where they speak), where in the film they appear (3-4 times each).
5. **Skeleton:** chapters with times, the opening storyboard second by second, where each of the 19 content blocks sits (section 4.2).
6. **On-screen text budget** (section 9.4).
7. **Footage feasibility per chapter:** GREEN / YELLOW / RED, 2-3 concrete sources each, gaps and how we close them, traffic estimate in GB.
8. **Music per chapter:** mood and candidate tracks.
9. **Own style of this film:** grade, typography, motif, the new signature trick of this film.
10. **Covers and titles:** 3 completely different concepts.
11. **Risks and questions for the owner.**

The pitch goes through the two critics and a fact-check of the key facts (section 5) before the owner sees it. For Turkey it took 3 rounds (critic scores 6/5/6... then 8s, then 9s).

---

## 4. The script

### 4.1 Format: one master file, numbered paragraphs
We write `script/FILM_master.txt` as numbered paragraphs F001, F002, ... Each paragraph has:

```
F005  0:44
SYNC: <hero name>, <video ID> 0:42-0:49 | "<original words>" | caption: "<our English translation>"
VO: What the narrator reads, with numbers as digits (for critics, fact-check and .srt).
VIS: The exact shot: source + ID + timecode, and what is in it. "FIND:" = no shot yet.
TXT: On-screen text for this paragraph, or "-".
```

Header lines of the master file list: the heroes and the paragraphs where they appear, the mystery thread (which paragraphs carry it), the recurring motif, the exchange rate and date, the tag budget for the voice.

From the master we generate:
- `FILM_voice.txt`: the text for the voice engine, numbers written as words, nothing else (a small script converts digits to words and reports any digit left).
- `FILM_text.txt`: what is on screen paragraph by paragraph (the editor's main reference).
- `STRUCTURE.md`: chapters table (chapter, time, living voices, what happens).
- `OPENING_2MIN.md`: the first 2 minutes second by second.
- `BEAUTY_PLAN.md`: the beauty pauses.
- `SOURCES.md`: every fact with its source; every synch with its original transcript.

Length: estimate from words per minute of YOUR voice (measure it on a test paragraph). Our Russian narration runs ~138-145 words/min. If the film is too long, cut whole paragraphs, never speed up the voice.

### 4.2 The 19 mandatory content blocks
Every film contains:
1. A **central question** for the whole film + an unexpected answer in the finale (like a movie).
2. **2-3 living heroes** with names, to whom we return.
3. **Mysteries;** one mystery revealed in pieces (3-4 drops) and solved in the finale.
4. **"Myth and truth":** loud popular claims stated as a myth, then checked against evidence. Never presented as fact.
5. **Women:** how they differ from other cultures, beauty standards, fidelity/divorce, in numbers, without judgement.
6. **Sex life and "vice":** honestly, neutrally, with numbers, no explicit visuals, never a how-to.
7. **Crime** of the country (mafia, gangs), if there are sources.
8. **Looks and body:** height and so on, with studies.
9. **Food:** many numbers and percentages; the best and the worst.
10. **Rich and poor:** one city, two worlds.
11. **One day in the life of different people** (dawn to night).
12. **Real prices:** lunch, taxi, housing, a date (told with price tags on objects and voice, NOT with a paper-receipt graphic, which looked cheap).
13. **Young and old.**
14. **City and village.**
15. **What locals think of foreigners and tourists** (polls). If there is no honest poll, skip it rather than invent.
16. **What a tourist can and cannot do.**
17. **Little-known true stories about the country's famous people** (example type: a world-famous actor's parents nearly sold him to the doctor at birth).
18. **Good and bad, but more light;** honest, "neither condemn nor approve".
19. **A country scoreboard at the end** (8-10 scores with a number behind each: food, prices, safety, people, nature, night, "could you live here?"). It makes viewers argue in the comments. This one is our proposal and is optional.

### 4.3 The opening: the first 2 minutes are written and cut like a trailer
Data: on our Vietnam film 27% of viewers left by 2:00 because the atmospheric start took too long to reach the drama.

Rules:
- In the first 5 s: the strongest shot + a question.
- In the first 20-30 s: a teaser of the sharpest story of the film (shot + a hero's line).
- A new hook every 10-15 s.
- No intro, no "welcome", no logo before 0:30.
- By 0:30 the viewer knows why to watch to the end (the promise list, and that the answer comes at the end).
- By 2:00 the first "no way!" has happened.
- The first sentence repeats the promise of the cover.
- Then our signature: the country name revealed BEHIND a moving subject (a person walking, an animal) and the big title.
- Target retention: 60%+ at 0:30, 85%+ at 2:00.

`OPENING_2MIN.md` is a table: time / shot / voice or synch / screen text / which hook at which second. No shot shorter than 2 s.

Example of our Turkey opening logic (in English): "A bull was led to this cave and dropped dead. The priest stood right at the entrance and stayed alive." Then: "You'll say: gas? There is gas. But gas doesn't explain why the priest survived. Or why people came to watch. We found the answer. It's at the very end, and it's about this whole country." That last line is the promise.

### 4.4 Living heroes and live synchs (we have no presenter)
- Find real local people speaking in their own language in **Creative Commons (CC BY) YouTube videos** or other licensed footage: a nomad leader at her tent, an old tea grower, a hawk catcher, a street vendor.
- Get the transcript (YouTube auto-subtitles in the original language or burned-in subtitles), translate it ourselves, and **the fact-checker checks the translation against the original.** Heroes say only what they really said. In the Turkey check one translation was wrong ("could buy a truck in instalments" was mistranslated) and got fixed.
- Synch captions are our translation, bottom-left, 1-2 lines, only while the person speaks.
- Synchs are 5-12 s each; Turkey has 6 heroes' voices and 31 synchs.
- If footage is old, say so ("filmed in 2014", past tense) and never present old prices from it as today's.
- Living people we have no licensed footage of: no press photos without a licence, never fake them with AI. Tell their story by voice over places and hands, or schemes.

### 4.5 Story mechanics we use
- **The mystery thread:** the central mystery returns 3-4 times, each time with something new (one return can be a false lead), and only the finale gives the full answer, in 2-3 layers, ending in a warm conclusion about the whole country.
- **Reveal pattern:** fact, then a comparison you can see, then an ironic full stop, then a shot. Example: "If this river were on land, it would be the sixth largest in the world."
- **A recurring motif without words** that rhymes through the film and closes in the finale (Turkey: "breathing" - every chapter opens on a 2-second "breath" shot: steam over tea, mist over terraces, fire, wind...).
- **Chapters** each have one big word from the chapter's own material.
- **A short philosophical question** (~30 s) where it fits.
- **The subscribe ask:** once, one witty line at a gripping moment, never at the start, never begging (example: right after a cliffhanger, "Unlike the bulls of the ancient writer, you have a choice").
- **Honest "price" chapter** near the end: the hard sides one by one, slightly cooler colour grade.
- **Finale:** flashbacks of the heroes, a short pause, the answer, a question to the viewer, the announcement of the next country, then our brand text on black.

### 4.6 "We say it, we show it"
Every spoken line SHOWS its subject: the named person, the real object, the place, a visual for each number. A generic landscape under specific talk is boring and the viewer does not understand. Audit the script line by line: every VIS must match its VO. Lines with "FIND:" are a risk; a critic counted 35 of 104 paragraphs without a shot in our first Turkey draft and marked it down.

### 4.7 Language rules for the script
- Only the short hyphen "-". Never long dashes. Never the middle dot (U+00B7) anywhere on screen (it instantly marks content as machine-made).
- Write for the ear: short sentences, no repeated "this man" twice in a row, no filler link phrases.
- Voice emotion tags (if your engine supports them, e.g. ElevenLabs v3): sparingly. Our Turkey budget: [amused] 8 times max, [laughs softly] 3 times, plus [warmly], [curious], [whispers] where they earn it.
- Prices in USD in the voice. Do not stack several local-currency prices in a row.
- Neutral wording on sensitive topics, numbers instead of opinions, no politicians named, "neither condemn nor approve".

---

## 5. The review loop: 2 independent critics to 10/10 + an independent fact-checker

Nothing goes to the owner (pitch or script) before this loop.

- **Critic 1 "The viewer on a phone":** retention, hooks, pace, first 2 minutes, people, humour, mystery and finale, "showability". Criteria we use: first 2 minutes / uniqueness / people and life today / humour and emotion / mystery and finale / pace / showability.
- **Critic 2 "The documentary director/editor":** angle, arc like a movie, structure, facts, the 19 blocks, own style of the film, visuals and pauses, language for the voice, titles and covers. Criteria: arc like a movie / emotion and living voices / own style / visuals, pauses, currency strip / language for the voice / titles and covers.
- Each critic scores each criterion 1-10 and writes **"why not 10"** with a concrete fix. 10 means "nothing concrete left to improve".
- They are independent: they did not write the script and do not see each other's notes.
- After each round, write `script/CHANGES_vN.md` (what changed and why), save the old version in `script/vN/`, and run the next round.
- Target: both critics 10/10 on every item. In practice we reached 9-10 after 3 rounds. The remaining text-only fixes were applied, and items that can only be solved in the edit (shots, timecodes, licences) go to a separate list.

**The fact-checker** is a separate helper that has NOT seen the research. It checks every claim, number, date, name, translation of every synch, and every price conversion against primary or reliable sources and writes `FACTCHECK.md`:
- **OK** (with source);
- **FIX** (the exact new wording, ready to paste, both the digit version and the voice version);
- **FLAG** (decide before voicing).

It also counts forbidden characters (long dashes, middle dots) and recomputes all USD conversions at a dated exchange rate.

Copy-paste prompts:
```
You are CRITIC 1, "the viewer watching on a phone". You did not write this script.
Read script/FILM_master.txt and OPENING_2MIN.md for the <COUNTRY> film. Score 1-10 each:
1 first 2 minutes, 2 uniqueness (nothing from research/SATURATION.md blacklist as a hook), 3 people and life today,
4 humour and emotion, 5 mystery and finale, 6 pace over the whole length, 7 showability (every line has a real shot).
For every score below 10 write exactly why and the concrete fix (paragraph number + new wording).
Then: "Would I watch to the end: yes/no, why". Be harsh. Do not edit the script. Output script/CRITIC_A<round>.md.
```
```
You are CRITIC 2, an experienced documentary director. You did not write this script and did not see Critic 1.
Read script/FILM_master.txt, FILM_voice.txt, STRUCTURE.md, BEAUTY_PLAN.md, TITLES.md. Score 1-10:
1 arc like a feature film (question, drops, twist), 2 emotion and living voices, 3 this film's own style,
4 visual imagination, beauty pauses, currency strip, 5 language for the voice (rhythm, repetition, clarity),
6 titles and covers. Also check all 19 content blocks are present or honestly skipped.
For every score below 10: why and the exact fix. Text only; list edit-stage issues separately at the end.
Output script/CRITIC_B<round>.md.
```
```
You are an independent FACT-CHECKER. You have not seen the research. Check every number, date, name, quote and price
in script/FILM_master.txt against primary or reliable sources (official statistics, peer-reviewed papers, major media).
Check every SYNC translation against the original transcript in script/transcripts/.
Recompute all USD conversions at today's rate (write the rate, date and source).
For each item: OK (source URL) / FIX (exact replacement text for VO and for the voice file) / FLAG (why).
Count long dashes and middle dots in all script files (must be 0). Do not edit the script. Output script/FACTCHECK.md.
```

---

## 6. Footage: where it comes from, how we check licences, what we never use

### 6.1 Sources we actually use
| Source | Use | Licence notes |
|---|---|---|
| **Pexels** (video + photo) | yes, commercial and monetised | attribution not required (we credit anyway); don't sell clips as they are; don't show recognisable people in a degrading or false context. Search pages block bots: find IDs by web search ("site:pexels.com/video <query>") and download by ID |
| **Pixabay** (video + photo) | yes | Pixabay Content License, attribution not required; careful with people, logos, brands. **Pixabay now has AI-generated clips: reject them.** Official API with a free key (store the key in the macOS Keychain, never print it) |
| **YouTube Creative Commons (CC BY)** | yes, a main source of real people and 4K walks/drones | attribution REQUIRED in the description: "Author - channel, link, CC BY 3.0". Download only the needed seconds |
| **Wikimedia Commons** (photo + video) | yes | each file has its own licence (CC0 / CC BY / CC BY-SA / public domain): read it on the file page; credit author + licence + link in the description. Great for big photos (5,000-13,000 px) and archive pictures |
| **NASA and other US government works** | yes, public domain | Earth imagery (Blue Marble, ISS night photos), terrain data (SRTM) for our maps. ESA/ESO images are often CC BY and need credit: prefer the NASA public-domain version |
| **archive.org** (US Navy, Air Force, NARA) | yes, public domain | for DVIDS material add their standard "does not imply endorsement" line in the description and hide unit emblems |
| Copernicus / satellite data | yes | credit as their terms require |

### 6.2 How we check licences (before every download)
- **YouTube:** search only with the Creative Commons filter (YouTube search URL parameter `sp=EgIwAQ==`). Then check each video's licence from metadata without downloading:
  ```
  yt-dlp --skip-download --no-warnings --print "%(id)s	%(license)s	%(height)s	%(duration)s	%(channel)s	%(title)s" "https://www.youtube.com/watch?v=<ID>"
  ```
  The licence must read "Creative Commons Attribution". Log it to a TSV with the date.
- **Check the author is the real author.** Reject re-uploads with a fake CC licence: TV and news re-uploads, state broadcaster clips, "8K Vistas"-type compilations, "CC compilation" channels, other people's films. Only original creators' footage: walking tours, drones, vlogs (pick seconds without the presenter in frame).
- **Preview without downloading:** use YouTube's storyboard images (yt-dlp exposes them as `sb*` formats) to build a contact sheet with timecodes (~50-300 KB per video), choose the seconds, then download only that section:
  ```
  yt-dlp --download-sections "*12:30-13:10" -f "bv*[height<=2160]" -o "clips/c06_yt_tea_slope.%(ext)s" "https://www.youtube.com/watch?v=<ID>"
  ```
  Sound from YouTube clips is not used (their music is irrelevant).
- **Pexels/Pixabay:** note ID, author, resolution, duration. **Commons:** note title, author, licence from the API.
- **Official tourism-board sites, news agencies, broadcasters:** NOT usable without a written licence. We do not write to agencies without the owner's OK.
- Keep `footage/CREDITS.md` (every clip: our file name, author, licence, resolution, source URL with the start second) and generate `CREDITS_USED.md` from the clips that actually made it into the edit. That list goes into the description.

Small tools worth having your Claude write (we have them): `yt_search.py` (CC search + `--check ID` licence check), `yt_storyboard.py` (contact sheet without download), `pb_search.py` (Pixabay API, 4K first), `commons_search.py` (Commons API: size, type, licence, author), `fetch.py` (downloads one file at a time from a jobs list and logs credits).

### 6.3 What a good shot is
- The real country TODAY, "wow": living people and faces, markets, street food, steam, lights, transport, night markets, old people, students, couriers, drones over cities, mountains. Sharp, beautiful, with movement.
- **4K > 1440p > 1080p**; 720p only if nothing else exists. We want juicy, sharp, meaningful shots; weak shots were the main complaint about one of our films.
- Every shot shows exactly what is said at that second.
- Look at every used shot at 1:1 for logos, watermarks, burned-in subtitles, date stamps, presenter in frame. Crop (we crop ~10% from 4K to remove a corner logo) or choose other seconds.
- Hard topics (affairs, sex work, unemployment, loneliness, executions): no recognisable faces of random people. Backs, hands, silhouettes, wide shots, night windows. Some things are not shown at all.
- No blur-fill strips around vertical clips. No near-black shots. Letterbox bars must be pure black to the frame edge.
- Never repeat a second of footage in the film (beauty pauses included).
- Every shot must be from this country (a QA check catches "wrong country" shots).

### 6.4 What we never use
- **AI fakes of real people, real places or real animals** presented as documentary footage. Real heroes are never faked or "made to look like them".
- AI images only as clearly illustrative material where no real footage can exist, never pretending to be a real identifiable person; if you ever insert realistic AI scenes of real places, tick YouTube's "altered or synthetic content" box at upload. We do NOT write "reconstruction" or "AI" on screen.
- Agency or broadcaster footage without a licence.
- Fake-CC re-uploads.
- Shots with logos, watermarks, tickers, foreign subtitles, source infographics: crop or replace. Never cover them with a plate.
- Whole vlogs of other creators re-uploaded (copyright strike risk).

### 6.5 Traffic and storage budget
- Estimate traffic before downloading. Turkey: ~15-18 GB for ~300-380 clips + ~150 photos. Our research phase (searching, licence checks, storyboards) took only ~150-200 MB.
- Download only the needed seconds (10-40 s per YouTube clip). Downloads go strictly one file at a time.
- **Never delete downloaded footage.** Move rejects to `footage/rejects/`. Keep a footage library.
- Name clips `cNN_<source>_<what_is_in_frame>` (NN = chapter, source = px/pb/yt/wm), Latin letters only.

Copy-paste prompt for a footage helper:
```
You are the footage scout and shot-list writer for chapter <NN> of the <COUNTRY> film. The script is approved; do NOT change text.
Read script/FILM_text.txt (what must be on screen), FILM_voice.txt, OPENING_2MIN.md and this guide's section 6.
For each of your paragraphs: list needed shots, find candidates (Pexels, Pixabay, YouTube with the CC filter, Wikimedia Commons,
NASA/public domain), check every licence BEFORE downloading, preview YouTube via storyboards, download only the needed seconds,
one file at a time, log credits. Reject fake-CC re-uploads, AI clips, anything with logos/subtitles/date stamps you cannot crop.
4K first. Every shot must show what the voice says at that second. Never delete files; move rejects to footage/rejects/.
Report: clips downloaded (count, GB), weak paragraphs, gaps with priority.
```

---

## 7. Music

### 7.1 Sources we actually used
- **YouTube Audio Library** (free, safe for monetisation) - our main source. Artists that worked for us: Nat Keefe, Chris Haugen, The Mini Vandals, Doug Maxwell, Aaron Kenny, Asher Fulero, The Grey Room, Reed Mathis, Bad Snacks and others; filter in Studio by genre and mood (World, Calm, Inspirational) and by instrument.
- **Kevin MacLeod (incompetech.com), CC BY 4.0** - credit in the description. Our two favourites, used in several films: "Infinite Perspective" and "Ascending the Vale". Others we used or shortlisted: "Ishikari Lore", "Eastern Thought", "Morning", "Wholesome". Avoid his dark cosmic tracks for travel films.
- **Pixabay Music** - only after checking the track page for Content ID claims and AI generation.
- **No AI-generated music** (we decided to keep the paid voice credits for voice only and use free library music).

### 7.2 How music works in our films
- **Music per chapter,** chosen for the chapter's mood: soulful and kind, calm in places, a little cheerful in others, **never dark,** even over the hard side (thoughtful piano, not doom).
- Mix the country's own instruments with universal warm travel music, so it is not "local music everywhere".
- Each film has its own musical mood. For tension or mystery use its own timbre (e.g. a low flute + pad), pizzicato only for humour.
- Be culturally careful: we did not use an instrument strongly associated with a neighbouring nation in a film that touches a contested region.
- Beauty pauses can share one theme with variations (Turkey: the same "breathing" theme on oud, then saz, kanun, strings...).
- Levels: music about -18 dB under the voice (ducked ~12 dB while the voice speaks), fuller in pauses, no holes (a quiet bed always underneath). Final mix at -14 LUFS.
- Ambience matches the picture and ends with the shot: rain only under rain shots, market noise only under the market. A soft clock tick or whoosh on chapter cards. Short live sound moments (a festival, a band) of 5-8 s without voice work well.
- Music-only moments stay a minority (~15% of the film or less). Our films are narration-rich.
- Loop and crossfade library tracks to fit; keep a `music_cues.json` (paragraph or card ID, track, level).

### 7.3 Downloading
Browser downloads strictly **one at a time,** wait 5-10 s and confirm the file landed before the next one. Bursts trigger Chrome's "allow multiple downloads" prompt and silently fail. Never grant that permission automatically.

### 7.4 Credits
Music credits go **only in the description,** never on screen. Kevin MacLeod format:
```
"<Track>" Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```
YouTube Audio Library tracks that require attribution show the exact line in the library: copy it as is.

---

## 8. Voice

### 8.1 Our approach
- One voice for the whole film (we use one fixed ElevenLabs voice for our channel). **It is never sped up**: it sounds exactly as generated. Length is controlled by the text, not by speed.
- **Lively, with emotion:** interest, a smile in the voice, a couple of light laughs, a few jokes in the text. Done with emotion tags, punctuation and the text itself, never with tempo.
- Test first: generate one short test paragraph and approve it by ear before voicing the film.
- The draft can use a free temporary voice; the final voice is recorded only after the owner approves the draft (saves paid credits).
- Pauses cost nothing: beauty pauses and music moments are not in the voice budget.

### 8.2 For your English channel
- Use your own voice setup if you have one.
- Free option: **Kokoro TTS** (open source, Apache 2.0, safe for monetisation). Your localisation kit already uses Kokoro `am_puck` (male, US) at speed 1.05 via `kokoro_voice.py`. For a female narrator, Kokoro's `af_heart` (US English) is the free voice we use on another English project. Pick one voice and keep it for the whole film.
- Kokoro has no emotion tags: put emotion into the words and punctuation (short sentences, questions, "and here's the thing...").

### 8.3 Mandatory mastering (every film)
Paragraphs generated separately drift in tone and brightness ("higher, lower"). After mastering the narration sounds like one studio session. Use `master_voice.py` from your kit. The chain, in order:
1. matching EQ of each take toward the average spectrum of all takes (limited to about +-4-5 dB);
2. high-pass at 75 Hz;
3. very light denoise;
4. -2.5 dB at 300 Hz;
5. +2 dB at 4 kHz and a +1.5 dB air shelf from 11 kHz;
6. de-esser;
7. compressor 2.5:1, 12 ms attack, ~180 ms release, soft knee;
8. very light soft-clip warmth;
9. soft limiter;
10. every take to -16 LUFS.

No reverb. Take lengths stay the same.

### 8.4 Voice checks
- **Pitch jumps:** measure the median pitch of each paragraph; a take that jumps more than ~1 semitone from its neighbours is re-voiced (EQ cannot fix pitch). Deliberate energy changes at chapter starts may stay.
- **Dull starts:** many separately generated takes start muffled for the first words. Measure the first ~0.6-1 s against the rest; regenerate flagged ones with the previous sentence prepended as a lead-in and cut at the first real word (`onset_check.py` + `kokoro_voice.py --lead` in your kit).
- **Wording:** transcribe every take with Whisper and compare with the script (word-match ratio). Fix wrong words and **wrong stresses/pronunciations of local names** (check every place and person name by ear).
- No clipped word ends or sound holes at paragraph joins.

---

## 9. Edit

### 9.1 Structure of the film
Cold open (trailer, ~1:30) → country name behind a moving subject → big title → chapters (each opened by a chapter card with one big word from the chapter's material) → beauty pauses between → honest "price" chapter → finale (flashbacks, answer, question, next country) → brand text on black.

### 9.2 Our visual devices (the quality bar; choose a fresh mix for each film)
- **Country name behind a moving subject** in the opening (per-frame subject mask: macOS Vision foreground mask or rembg; layers = background, word, subject).
- **One big title** over a landscape (once per film).
- **Chapter cards:** live shot with a person or object large in the foreground, calm camera, one big word behind or beside it.
- **Our own maps:** soft land colours, handwritten labels, a white route line; smooth motion (no jitter).
- **Explanatory schemes** of nature (how a glacier cuts a fjord, how gas pools in a cave) - our own animations.
- **Place names INSIDE the landscape,** camera-tracked (up to ~5 per film; check for jitter).
- **Place labels bottom-left** like a news lower-third: small-radius rectangle, thin light border, frosted fill tinted to the shot, no dot.
- **Number cards** centred, only the strongest numbers (~6 per film), big digits, premium entrance and exit animation.
- **Price tags hanging exactly ON their objects** (up to ~10 per film). If no shot shows the object clearly, the price is said by voice or shown as a number card.
- **Handwritten callouts with an arrow** (up to 10 per film): the arrowhead ends ON the person or object, the label sits beside it in free space. Check on several frames, subjects move.
- **Speech or thought bubbles for animals** (1-3 per film), witty.
- **Circle / underline** a key number or place (1-2 per film).
- **Rounded "window" frames on black,** split windows (2-4) for rhymes, archive photos flying in diagonally, **FPV fly-through transitions** past a dark rock (1-3 per film).
- **One consistent warm cinematic grade** per film (each film its own tint: e.g. turquoise water, ochre stone, white travertine for Turkey; not orange everywhere). Hard-side shots get a slightly cooler variant, never beautified into a lie.

### 9.3 The currency strip (key prices only)
The main price is big in **$**. For 5-8 key prices per film (not every price), a strip of other currencies pops up under it one by one with a soft "ding": our channel shows the currencies of its audience. **For your English channel, adapted:** pick 3-4 currencies of your biggest audience countries from Studio's geography report (for example £, €, A$, ₹), in order of audience share. Rate as of the edit date; write "exchange rates as of DD.MM.YYYY" in the description. The strip stays at least 2 s and never covers faces. All other prices: $ only. Mark these spots `[CUR]` in the script.

### 9.4 On-screen text budget (less is more)
- **Key words only:** 1-4 big words per caption. Never sentences, never paragraphs, never duplicating the voice.
- **At least ~40 s between text elements** (place names in the landscape do not count). A scheme with its arrow counts as one element.
- A synch caption and a place label are never on the same frame.
- Typical per-film budget: place names in landscape 5, number cards 6, price tags up to 10, callouts up to 10, bubbles up to 3, circle/underline 2, one big title, one country-behind-subject, 2-3 FPV transitions, 1 subscribe moment, ~5 schemes.
- Let shots breathe with no text.

### 9.5 Hard rules for every frame
- **Nothing flashes:** no shot, bubble, tag or widget on screen shorter than ~2 s (1.5 s absolute minimum). Trailers too: at least 2 s per shot.
- **Overlays die with their shot:** a bubble, arrow or label never carries into the next shot; fade out 0.2-0.3 s before the cut unless the same subject continues.
- **No dark outline/stroke under text, no dark plates, bands, gradients or scrims behind text.** White text, at most a very soft, wide, low-opacity shadow or local darkening of the footage.
- **No masks eating words** (the subject must never cut through the letters of a chapter word).
- **Text fits its frame** and the safe area; nothing spills outside boxes.
- **Only the short hyphen "-".** Never long dashes. **Never the middle dot (U+00B7)**; for "$5 / ₹420" put each on its own line.
- **No on-screen credits or source labels** ("NASA simulation", "photo:", "visualisation"). No "reconstruction" or "AI" labels. No empty cards or boxes.
- **No burned-in subtitles** for the narration (an .srt is uploaded instead).
- **No placeholders** left in any render you show.
- **Sound effects and ambience end with their shot.**
- **Beauty pauses:** every 4-6 minutes (about one per chapter), 10-15 s, no voice, music only, 3-6 wide nature shots (rivers, sea, mountains, water) cut on the beat, live 4K video only (no slideshow of stills), no text, placed after heavy blocks or before a new chapter. Plan them in `BEAUTY_PLAN.md` with times, shots and source IDs.
- **End:** the last card is only our brand text on black (no logo, no credits, no drawn "watch next" boxes). Keep the last 8-20 s calm and clean so YouTube's end-screen elements can sit there.

### 9.6 Rendering
- Drafts at 480p or 720p (720p lets you check text jitter and small captions), the whole film, not a sample.
- Final at 4K only after the owner's OK on the draft.
- **One heavy render at a time;** limit parallel workers (start with 4; raise only if the Mac stays cool: check `pmset -g therm`). Throttle with `xargs -P N`, check `ps` right after launch. Measure real speed (frames per minute) before promising a time.
- Finished videos for the owner go into one videos folder, not scattered on the Desktop.

---

## 10. QA before anyone sees it

Our owner once sent 11 notes on a draft: outlines behind text, masks eating words, placeholders, jittery maps, text overflowing its box, overlapping captions, goofy music, shots from the wrong country, a chaotic final map. Then: "you could make them good from the start, check everything again... I have to rewatch a lot, I get tired too." Since then every draft goes through three checks first.

### 10.1 Automatic checks (a script over the timeline and the video)
- text elements overlap? gap between captions in one screen region at least ~0.4 s;
- text fits its box and the safe area;
- no placeholders / text-only slots;
- no masks on words;
- no dark plates or outlines in the overlay code;
- nothing shown under the minimum duration (2 s);
- price tags and callouts sit on their objects (check first, middle and last frame of the shot);
- maps move smoothly (frame-difference check);
- **repeated shots:** same file and same seconds, AND look-alike files (perceptual hash of a few frames per clip, because two different files can show the same place);
- shots not from this country (from notes and filenames);
- **foreign text in frame:** OCR every used span (Apple Vision text detection or similar) for logos, watermarks, date stamps, burned-in subtitles (flag any text in the bottom ~22% and in the corners);
- no long dash, en dash or middle dot in any overlay or caption;
- audio: integrated loudness, silences/holes, music cues not from a banned "goofy" list, sync of voice and picture.

### 10.2 Contact sheets
Render the whole film as frames **every 2 s** on sheets and look at every sheet yourself: wrong country, logos, dates, ugly frames, text problems. Separate sheets for the first 2 minutes and for every card, map, graphic and overlay at its middle.

### 10.3 An independent reviewer
A fresh helper that did not make the film checks it against all the rules in this guide. Then fix everything, run the checks again, and only then send to the owner with one line: what was checked.

Copy-paste prompt:
```
You are an independent QA reviewer. You did not make this film. Do not trust anything the editor says.
Inputs: the draft video, its contact sheets (every 2 s), script/FILM_text.txt and FILM_MAKING_GUIDE_FOR_YOUR_CLAUDE.md sections 6, 9 and 10.
Check: wrong-country shots, logos/watermarks/subtitles/date stamps, repeated shots, anything on screen < 2 s,
overlays crossing a cut, arrows/tags not ON their subject, text outside its box, dark outlines/plates,
long dashes or middle dots, on-screen credits or "AI/reconstruction" labels, placeholders, masks eating letters,
text closer than ~40 s apart, beauty pauses (every 4-6 min, 10-15 s, no voice), audio holes or jumps,
ambience not matching the picture, the end card (brand text only, clean tail).
Report every problem with timecode, what is wrong and the fix. Severity: BLOCKER / MUST / NICE.
```

---

## 11. Delivery

- **Order:** script (critics 10/10 + fact-check) → **whole film as a draft** with a temporary voice → owner's notes → final voice + mastering → final 4K render → QA again.
- **Final file:** 4K. Upload as a regular video (no premiere: premieres cannot be A/B tested).
- **No burned-in subtitles.** Upload an accurate `.srt` as a separate track, built from the final voice's word timings: cue = sentence split into chunks of at most 2 lines x ~40 characters, minimum 1 s, no overlaps, never starting before its words. Only short hyphens, no middle dots.
- Turn on **automatic dubbing** if available, and add **title and description translations** (Spanish, Portuguese, German, French, Hindi and others where sensible).
- **Description:** search phrase in the first lines (e.g. "life in <country>", "<country> prices 2026"), the hook, chapters with timestamps, "Facts checked against sources." (not "checked by hand"), main sources, "Exchange rates as of DD.MM.YYYY", then all footage credits (CC BY authors with links are mandatory) and music credits. **Credits only in the description, never on screen, never as a "SOURCES" comment.**
- Disclosure: AI narration over real licensed footage does not require the "altered or synthetic content" label; realistic AI scenes of real places do. Ticking it does not reduce reach.
- Don't add "| Documentary | 4K" to the title if part of the film is 1080p or photos.

---

## 12. Packaging: covers and titles

Our films had excellent retention (average view 13-15 minutes) but a click-through rate of only ~3%, with 97% of impressions in "Suggested" next to other videos about the same country. **We lose on the click, not on the watch.** Packaging is made with as much care as the film.

### 12.1 Before any cover
- Keep a base of top documentary/travel covers (million-view videos) and study it before every cover; add new ones weekly.
- **Anti-banal check:** generate 10 concepts through forced different lenses: an object close-up, an absurd juxtaposition, a local's point of view, a number as art, an animal, a tiny detail, "what's wrong in this picture", a time contrast, a humour twist, myth vs reality. Then search YouTube for the topic phrase, look at the top 20 thumbnails and titles, and **reject any concept that resembles one of them** in subject, pose or words.
- Avoid clichés per country (for Turkey we banned: mosque at sunset, hot-air balloons, flag, turquoise sea with thin letters, AI girls, presenter's face, dark covers).

### 12.2 Three completely different cover + title pairs
Every film gets **3 completely different pairs, each on its own hook:** a person with emotion / a price or number / a forbidden or shock angle / a question / a contrast. Never 3 variants of one idea. Draft ~5, pick the 3 most different and strongest.

Cover principles that won (from 79 million-view videos):
1. One huge word (the country), bold, readable at 168 px.
2. At most 5-6 words of text in total; the hook adds what the picture does not say (a verdict, paradox, threat, ban). A question needs an object ("A paradise?" beats "Why?").
3. A large face with strong emotion, or one strange object, or a contrast in one frame. A real local face beats a doll-like AI beauty.
4. A price only if it is wild (a $7 tomato), never "coffee for $1 in a cheap country".
5. Bright, not mostly dark; the bottom-right corner empty (the timer sits there).
6. The cover and the title never repeat each other: the cover is emotion + 2-4 words, the title is concrete facts.
7. Only places and things that are in the film. Real heroes are never drawn or faked on covers; people on AI covers are fictional and anonymous (small, from behind, silhouettes).
8. The country name is clearly visible on every cover; nothing covers faces.
9. Own typography per film; plain clean white bold letters for the country (no grunge texture by default, no thick outlines, no yellow plates).

### 12.3 The poster cover style (our current template, use it one to one)
Ask your Claude: *"Read section 12.3 and write prompts for ChatGPT for covers of the film <COUNTRY>. Here is the film text: <SCRIPT>."*

Style:
1. A vivid, juicy, "poster" photo of one main place of the country, at sunset or sunrise, saturated colours.
2. A huge country name in white letters (bold sans-serif) across the whole cover.
3. A depth effect, one of:
   - a building / person / object stands IN FRONT of the letters and covers their bottom (no more than a third of the letters!);
   - the letters stand on water and are reflected in it;
   - the letters are behind a slope / branches, the foreground overlaps their edge.
4. Above the name: a short intriguing question in white handwritten script (the film's main mystery).
5. A "4K" badge in a thin white frame in the bottom-left corner (only if the final film really is 4K).
6. 16:9, 1280x720.

Rules (mandatory):
- **Only places and things that are in the film.** First find them in the film text (with timecode), then write the prompt. Not in the film = not on the cover.
- **The question comes from the film** (a number or mystery the film explains), and it does not repeat the title.
- The country name must be readable in full even when small: the object in front covers only the bottom of the letters.
- No yellow plates, thick outlines, round icons: that looks like cheap AI.
- No exploitation: no children in poverty, no blood, no half-naked people.
- Each prompt = a different place and a different depth trick (the test needs different covers).
- Text on the cover in the channel's language (English channel = English text).

The prompt template (verbatim, fill only the <placeholders>, no extra lines):
```
Create a vivid, rich, saturated travel-poster YouTube thumbnail, 16:9, 1280x720, photorealistic, crisp detail.
Scene: <MAIN PLACE FROM THE FILM>, at golden sunrise / sunset, <2-3 details: people, boats, flowers, lights>.
Text: a huge bold white word "<COUNTRY>" <TRICK: placed behind the <object>, so the <object> overlaps only the bottom third of the letters / standing on the water with its mirror reflection below>. All letters must stay clearly readable. Above it, small elegant white handwritten script: "<INTRIGUING QUESTION>". Small "4K" badge in a thin white rounded outline in the bottom-left corner.
Spell every word exactly as written. No other text, no logos.
```

Fix prompt if the object covered the letters:
```
Keep everything the same, but move the <object> down and make it smaller, so it covers only the bottom third of the letters. All letters "<COUNTRY>" must be clearly readable. Keep the script text and the 4K badge exactly as they are.
```

After ChatGPT:
- check every letter (if the image model breaks the text, keep only the picture and set the text with code);
- faces and hands without distortions;
- convert to JPG 1280x720 (under 2 MB);
- in YouTube Studio use "Test & compare" with the 3 different covers.

Examples that worked: Japan - Shibuya in the rain, a transparent umbrella in front of the letters, "Where do 80,000 people vanish?"; Vietnam - floating market, letters reflected in the river, "Is it really cheap?"; Vietnam - the Golden Bridge, stone hands holding the letters; India - Varanasi, letters reflected in the Ganges.

### 12.4 Check at small size
Render every cover at **168x94 px** (the "Suggested" sidebar size) on one sheet next to competitors' covers and judge it there. Fine detail dies at that size. Then run a harsh thumbnail critic (3 voices: a phone viewer at 120 px, a pro designer, the owner's taste).

### 12.5 Titles
- **Long and concrete, 70-95 characters.** Country first, then 2-3 concrete "no way!" facts from the film, with a number or price **in the first ~45 characters.**
- One main hook per title (two hooks cancel each other out). The cover adds a second hook.
- Concrete beats abstract: "your neighbour can see your salary" beats "it's not customary to be rich". No abstract metaphors like "The price of paradise".
- No half-truths, no promises the film does not keep.
- Never copy a competitor's title formula word for word.

Formulas that work (examples are real million-view English titles from our study):
1. **Paradox:** "Here the poor live better than the rich. <Country> and its secret".
2. **"Life in <country> | 3 strange facts":** "Living in Norway | The Truth About Life in the World's Richest and Most Beautiful Country".
3. **Country - list of contrasts:** "<Country> - X, Y and the kindest people on earth".
4. **"The <country> nobody shows you" + specifics:** "Entering the Slum that Japan Doesn't Want You to See"; "The Real Bali Most People Miss".
5. **Superlative:** "Brunei, the richest and strictest country in the world".
6. **"How they really live".**
7. **Why/how + big outcome:** "Why Norway is Becoming the World's Richest Country".
8. **Price shock:** "People Pay $700 a Month to Live Like This in Paris".
9. **Time + immersion:** "72 hours in ...".
10. **Comparison or "three NOs":** "Cuba Is Collapsing: No Power, No Fuel, No Internet".

Our own example (Turkey, translated): "Turkey: 2,000 years ago at Pamukkale, bulls dropped dead while priests walked out alive".

### 12.6 A/B test and rotation
- Studio "Test & compare" (title and thumbnail): up to 3 variants. The winner is decided by **watch-time share,** not CTR. It runs from a few days to 2 weeks. **Do not change anything during the test** (it stops the test). On a new channel with few impressions it often ends "inconclusive"; then 2 strongly different variants are better than 3 shades.
- If A/B is not available on your channel yet (it needs channel history), rotate by hand: pair 1 at release, check CTR after 3-4 days, switch to pair 2, then pair 3. Log dates and CTR.
- **Do not judge CTR in the first 48 hours.** Healthy browse CTR target: 4-6%.

---

## 13. After publishing

### 13.1 Release rhythm
- One film per week, same weekday and time (we publish Thursdays mid-afternoon, 2-3 hours before the evening peak of our audience; adjust by Studio's "When your viewers are on YouTube").
- Each film's finale announces the next country, so the order is fixed.

### 13.2 Day of release checklist
- **Pinned comment from the channel** with an engaging question tied to the film plus one teaser. Write it in advance with the upload plan. Scheduled videos cannot be commented on before they go live, so check daily for published videos without a pinned comment. Verify you are commenting as the right channel (zoom in on the avatar) before posting.
- **End screen** at upload: our best video for the viewer + Subscribe, over the last ~8 s (the clean tail of the film). Nothing is drawn into the film for it.
- **Playlist** by region (Asia, Europe...).
- **Community post** on release day, and another after ~3 days (a poll "which country next?").
- **Channel trailer / featured video** = the best film by organic views; re-check weekly.
- Ads (13.4), if budget is agreed.

### 13.3 Comments
- Reply to every comment, as a living person: short simple sentences, emotion, plain talk, 1-3 sentences, one thought. No lecture tone, no colon-structured answers, no lists of facts, emoji almost never, short hyphens only.
- Never mention "AI", "bot" or "robot" in replies. If someone (e.g. a moderator) asks directly whether the voice is synthetic, answer honestly.
- Don't delete troll comments (they drive discussion); be kind.
- Replies to grief or death comments: show the owner first; warm support, no advice.
- Never post a "SOURCES" comment; sources live in the description.
- If a reply looks failed, reload and check before retrying (no double posts).

### 13.4 Paid promotion: rules so no money is wasted
- **Google Ads → Video campaign → "Video views", In-Feed ONLY** (shown in YouTube search and feed; we pay only when a person clicks our thumbnail and starts watching = real interested viewers). Uncheck In-Stream (skippable ads before other videos; people skip and leave) and Shorts. Turn off automatic "video enhancements". Studio's "Promote" button cannot choose the format, so we don't use it.
- **Geography and language** by your target audience (we target our language's countries where Google serves ads; for an English channel choose your English-speaking markets and test a second group separately).
- **Age 18+** (for a long documentary we also excluded 18-24 in the first test).
- **Audience:** a custom segment by searches ("life in <country>", "<country> travel", "<country> documentary", names of big travel channels) + the "Travel Buffs" interest. Don't target specific competitor channels as placements (most have ads disabled).
- **Exclusions:** content for kids ("family" label), embedded videos, live streams. After day 2-3 remove junk placements (mobile games/apps, kids channels) from the "where ads showed" report.
- **Budget:** a test of ~$25 (about $5/day for 5 days). Target cost per view ~$0.03; raise to $0.04-0.05 if less than half the budget is spent in 2 days. Start ads 1-2 days after the final cover and title are set, so organic CTR is visible first.
- **Ad creative:** the new cover, a short headline without CAPS, emoji or "!!!" (common rejection reasons), 2 description lines (~35 characters each).
- **Stop-loss on day 3:** pause if cost per view > $0.08, OR the average paid watch < 1 min, OR > 30% of impressions are in junk placements.
- **Decision on day ~12** (5 campaign days + 7 days of follow-on views):
  - scale if a subscriber costs ≤ $1 AND the average paid watch ≥ 4 min;
  - repeat with one change (other cover, other countries, other film) if in between;
  - stop if a subscriber costs > $2.5 OR the average paid watch < 1.5 min.
- Measure: cost per view, average paid watch time (the main quality metric), cost per watch minute, cost per subscriber, earned (follow-on) views per paid view. In Studio filter traffic source "YouTube advertising" to see paid viewers separately.
- Paid views and watch hours do NOT count towards monetisation eligibility; only organic follow-on views do. Paid traffic does not harm organic reach (YouTube's official position).
- Ad policy risks: shocking images (bodies, waste, bodily fluids), demeaning groups. Show poverty with respect, as always. If an ad is rejected or limited, read the reason; the fastest fix is promoting a different film.
- **Never any fake engagement** (bots, micro-workers, view farms). Never spend beyond the agreed budget without an explicit number from the owner. The card is entered only by the owner.

### 13.5 Reading the numbers (after 48 h and after 14 days)
- Don't judge CTR in the first 48 h; videos often "stand up" after 48-72 h.
- Look at: CTR by traffic source, intro retention at 0:30 (target 60%+), retention at 2:00 (target 85%+), average view duration, where the big drops are, the retention peaks (rewatched parts), new vs returning viewers' average view, paid vs organic.
- Turn findings into rules for the next film (example: Vietnam lost 27% by 2:00 → rule "teaser of the sharpest story in the first 20-30 s").
- Fill the **film log** after 48 h and after 14 days:

| Film | Released | Views 48 h / 14 days | CTR | Avg view (%) | What worked | What didn't |
|---|---|---|---|---|---|---|

- Don't delete weak videos; unlist if needed (deleting loses all their history and signals). Give the channel 90 days and ~10 films before big conclusions.
- Update packaging of older films when CTR is low (A/B or manual rotation).

---

## 14. Folder layout for one film (suggested)

```
films/<country>/
  PITCH.md
  research/  SATURATION.md  HUNT_LOCAL.md  HUNT_RESEARCH.md  MYSTERIES.md  FOOTAGE_FEASIBILITY.md  FACTCHECK_PITCH.md  data/
  critics/   CRITIC_1_R1.md ...  CRITIC_2_R1.md ...  PITCH_v1.md ...
  script/    FILM_master.txt  FILM_voice.txt  FILM_text.txt  STRUCTURE.md  OPENING_2MIN.md  BEAUTY_PLAN.md
             SOURCES.md  FACTCHECK.md  CRITIC_A1.md ... CRITIC_B1.md ...  CHANGES_v2.md ...  TITLES.md  transcripts/  v1/ v2/
  footage/   clips/  rejects/  preview/  CREDITS.md  (search, check, storyboard, fetch tools)
  music/     (tracks)  music_cues.json
  vo/        takes/  (raw + mastered)
  film/      shot lists, build, audio mix, QA scripts, check/ (QA reports, contact sheets)
  cover/     variants, 168 px sheet
  CREDITS_USED.md
```

---

## 15. One-page checklist (print this)

**Angle**
- [ ] Saturation check done; blacklist of ~40-50 "as everyone says" facts written
- [ ] Two fact hunters (local language + research), every fact with a source and a "no way!" score
- [ ] 1 central mystery, 10-12 "no way!" facts, 2-3 living heroes with licensed footage
- [ ] Pitch through 2 critics + fact-check → owner OK

**Script**
- [ ] All 19 blocks present (or honestly skipped)
- [ ] First 2 minutes: hook every 10-15 s, promise by 0:30, first "no way!" by 2:00
- [ ] Mystery returns 3-4 times, answer in the finale in layers
- [ ] Every line has a real shot ("we say it, we show it")
- [ ] Synch translations checked against originals
- [ ] Prices in $, no single-country comparisons
- [ ] Humour: sharp, well-timed, several places; one witty subscribe line
- [ ] Beauty pauses planned every 4-6 min
- [ ] 2 critics at (or near) 10/10 + fact-checker FIXes applied
- [ ] 0 long dashes, 0 middle dots

**Footage and sound**
- [ ] Every licence checked before download; credits logged
- [ ] No fake-CC re-uploads, no AI fakes of real people/places, no agency footage
- [ ] Logos/subtitles/date stamps cropped or replaced
- [ ] Music per chapter, warm, never dark; downloaded one by one
- [ ] Voice not sped up; mastered; pitch jumps and dull starts fixed; names pronounced right

**Edit and QA**
- [ ] Text budget kept (key words only, ~40 s apart, nothing < 2 s, overlays die with the shot)
- [ ] No dark outlines/plates, no on-screen credits, no AI/reconstruction labels
- [ ] Tags and arrows ON their subjects
- [ ] End card = brand text on black, clean tail
- [ ] Automatic checks + contact sheets every 2 s + independent reviewer passed

**Release**
- [ ] 4K final, .srt uploaded, no burned subs, translations, auto-dubbing
- [ ] Description: search phrase, chapters, "facts checked against sources", rates date, all credits
- [ ] 3 completely different cover + title pairs, checked at 168 px, A/B or manual rotation
- [ ] Pinned question comment, end screen, playlist, community post
- [ ] Ads: In-Feed only, budget agreed, stop-loss day 3, decision day 12
- [ ] Film log filled at 48 h and 14 days
