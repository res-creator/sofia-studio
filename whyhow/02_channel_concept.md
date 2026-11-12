# Step 2 — New concept for How It's Run (Nov 2026)

Channel name and handle stay: **How It's Run** · @howitsrun. Language: English (US voice, US spelling).

## One-line idea
**Faceless documentaries that answer one big question about a real place on Earth or how something works there.**
"Why / How / What if" — every video is one question, answered with checked facts, maps and our own diagrams.

The name still fits: *how a city is run on frozen ground, how a desert town gets water, how long you'd last in the taiga.*

## Who it is for
English-speaking viewers 18–45 (US, UK, Canada, Australia, India, Europe) who watch Real Engineering, Wendover, RealLifeLore,
Half as Interesting, Geography Now — people who like maps, extremes and "I never knew that".

## Content pillars (mix them, ~40/40/20)
1. **Extreme places** — cold, heat, height, isolation: Norilsk, Oymyakon, La Rinconada, Danakil, Svalbard, Antarctica.
2. **How it works there** — the engineering that keeps a place alive: piles in permafrost, desalination, sea walls, underground towns.
3. **What if / survival** — "How long could you survive in…", "What if you lived in…" — scenario format, still built on real data
   (temperatures, distances, calories, rescue times), clearly labelled as a scenario.

## Rules that make it OUR channel (also our protection from the "inauthentic content" rule, see step 6)
- One question per video, answered for real by the end (open loop at the start, the answer + a twist at the end).
- Every number has a source in `SOURCES.md` and in the video description.
- Our own visual language: 3D-style maps, cross-sections ("cut the ground open"), animated counters, satellite views — not a slideshow of stock clips.
- Each script is written for its topic; no template sentences repeated across videos except the short intro/outro tag.
- Myths are named and checked ("You may have heard that… That's not quite true.").

## Channel description (About) — paste into YouTube
> Why don't houses in the Arctic sink into the ground? How does a desert city get its water? How long could you survive in the Siberian taiga?
>
> How It's Run explains the places on Earth that shouldn't work — but do. Every video answers one big question with real data, maps and
> diagrams. Facts are checked against scientific papers, government data and solid journalism; sources are always in the description.
>
> New documentaries every week.
> Narration is created with AI text-to-speech. Research, script, maps and graphics are made by our team.

## Channel keywords (YouTube Studio → Settings → Channel → Keywords)
```
how its run, documentary, geography, extreme places, how things work, why, what if, engineering explained, permafrost, arctic, siberia, survival, cities, infrastructure, earth facts, explained
```
Hashtags for videos (lowercase, 3 per video): `#documentary #geography` + one topic tag (`#permafrost`, `#siberia`, `#arctic` …).

## Title formulas (from the reference channels, adapted to English YouTube)
- `Why Don't/Doesn't X …?` — Why Don't Houses in Norilsk Sink Into the Permafrost?
- `How Does X …?` — How Does Dubai Get Drinking Water in the Desert?
- `How Long Could You Survive in X?`
- `What If You Lived in X?`
- `Why Is X More Dangerous Than Y?` (the top format of Неприступная Земля — use rarely, only if both places are really comparable)
Titles ≤ 60 characters where possible, the place name in the first half, no ALL CAPS, no fake promises.

## Thumbnail style — "Cutaway"
Size 1280×720 (JPG < 2 MB). Readable at 168×94 (phone search size).
- **Split frame**: top = the place (real free-licence photo or our 3D map), bottom/side = a **cross-section cut** in ice-blue showing the hidden thing
  (frozen ground, a water pipe, the depth of a mine). The cut is our signature — every thumbnail shows "what's inside".
- **2–4 words** of text max, heavy condensed font (Anton / Bebas Neue — both SIL OFL), white with black outline, one key word on a yellow strip.
  The text must ADD to the title, not repeat it (title "Why Don't Houses in Norilsk Sink…" → thumbnail "BUILT ON ICE").
- One number or one temperature badge is welcome (`−50°C`, `20 m DEEP`) — only if it is in the video.
- Coordinates tag in the bottom-left corner in small mono type (`69°N 88°E`) — series identity.
- Palette (continues the old How It's Run palette): ice blue `#4D8DFF`, yellow `#FFC857`, black `#171717`, cream `#F7F5F0`, warning red `#E63946` (sparingly).
- No faces of real people from photos without a licence; no AI-made "realistic photos" pretending to be the real place.

## Banner (2560×1440, everything important inside the safe area 1546×423 in the centre)
- Background: a dark-blue world map with a thin latitude grid; a few glowing dots on our first places (Norilsk, Oymyakon, Svalbard, Dubai…).
- Centre: **HOW IT'S RUN** (Anton, white) + line below: *"Why the hardest places on Earth still work"* (cream).
- Right of the safe area (TV-only zone): a cross-section of frozen ground with piles — the same "cutaway" idea as the thumbnails.
- Bottom line inside safe area: `New documentary every week`.
- Avatar: keep the current one or make a simple white compass-pin on ice blue (reads at 98×98).

## What we keep from the old How It's Run
| Keep | Why |
|---|---|
| Channel, name, handle, the 29 subs | Name fits the new idea; moving costs nothing |
| Fact rules from CHANNEL.md (primary sources, allegations stay allegations, labelled examples, no invented numbers) | Same standard, now even more important |
| Hook rules: strangest fact first, sound + motion from 0.0 s, open loop answered at the end, question to viewers at the end | Proven for retention; works the same in long videos |
| Palette (#4D8DFF, #FFC857, #171717, #F7F5F0, #E63946) and the bold-headline cover idea | Visual continuity for old subscribers |
| Subtitle know-how, loudness (−14 LUFS), quality checklist, ffmpeg tools | Already working |
| Kokoro **am_puck** + `dubtools/` (takes, mastering, onset check, SRT) | Owner's decision; free, Apache 2.0, already tested on 36-min films |
| Shorts | Old Shorts got 1–3K views — keep them; make new Shorts as 45–60 s cut-downs of each documentary |

| Drop / change | Why |
|---|---|
| "Money decides everything" story spine | New niche is places and how they work |
| 9:16 TikTok-first format | Main format is now 16:9, 12–20 min |
| Paper-collage cartoon characters and Figma puppets (`howitsrun_style/`, `longform/figmakit/`) | Documentary look: maps, diagrams, real photos; puppets stay in the repo, not deleted |
| Chris (ElevenLabs) voice | Replaced by Kokoro am_puck (no credits needed) |
| Old long videos (3–5 views) | Leave online in a playlist "Archive: money stories" — deleting doesn't help, they just stop being shown |
