# KNOWN IN ADVANCE — disaster documentary channel (YouTube, 16:9) — editing principles

Channel name: **Known in Advance** (@KnownInAdvance). The name means the warning signs were there; it does NOT mean participants knew the exact outcome. Always keep apart what was observed at the time, what was forecast, and what became clear only afterward.

These apply to every new documentary episode, starting with `sthelens/`. They are adopted from the owner's review of Lahaina and the reference "Katrina 2005" (Dark Horizon); see `sthelens/research/reference_analysis.md`. Owner talks Russian; films are in American English.

## Order of work
1. Research facts **and** find real materials of the specific event **before** writing the final narration. Write the text to the chosen fragments.
2. Keep `research/materials.md` with these columns: local file, source URL, content, date/place (and how it is confirmed), timecodes, licence, function.
   - Mark each item: L = link only, D = downloaded, V = downloaded and actually viewed (frames checked; interviews transcribed).
3. Write an edit plan (`research/edit_plan.md`). For each shot it lists: the narration thought, the picture, what the viewer learns and why it stands here, and the transition.
4. Voice only after the scenes are proven buildable. Check each line with speech-to-text (scribe_v1).
5. Render, then check stills of the rendered file. Check facts, labels and legibility on a phone, speech clarity, and that there are no black or empty frames.

## Choosing material
- **Priority:**
  1. on-scene footage of the event;
  2. local news;
  3. recordings of warnings, statements and interviews;
  4. rescue/evacuation/aftermath documentation;
  5. verified photos of the event;
  6. maps/schematics for what footage can't explain.
- Generic stock only for a stated, specific need. It is never a gap filler. No pretty palms, sea, forest or abstract flame "for mood".
- Verify place, date, context, source and terms for **each file**, including third-party content inside government videos (for example, the music under USGS interviews).
- Never present another event, place or later aftermath as the moment itself. Label the time when footage was shot later (for example, "filmed ~9:30 a.m.").

## Every shot has a job
- **The question for each shot:** "What does the viewer learn from this image, and why here?"
- **Possible jobs:** show an action; introduce a person or place; confirm the narration; explain a mechanism; show scale or consequences; prepare the next turn.
- Hold a meaningful shot while the narration unpacks it. Cut when the action or the thought changes, not on a fixed rhythm. A new caption on the same map is not a new scene.
- If exact material doesn't exist, use an honest substitute and name it: a verified photo, a document, a sourced quote, or a schematic. If the gap hurts quality, report what is missing.

## Maps, schematics, documents
- **Maps:**
  - Use one consistent geographic base per film, built from real data (for example, a USGS DEM). Keep the orientation and labels stable; each return adds one layer.
  - Maps are for geography and cause–effect. They are not a substitute for footage of the action.
- **Schematics:** simple, accurate, limited to one task, and labelled "SCHEMATIC". Reconstructions are labelled. Never animate people or objects in historical photos as if it were real footage.
- **Documents:** show the real page in context first, then isolate the line that matters. It must be readable on a phone.

## Look and sound
- Keep the archive's native texture and aspect ratio (4:3 stays 4:3, pillarboxed). No stretching, no AI "enhancing".
- No constant darkening, vignette, particles, shake or transitions without a reason. A local gradient behind a label is allowed for legibility.
- Captions only for dates, names, places, key facts and sources. Don't duplicate each narrated sentence in big text.
- **Original sound:** give interviews, reports and eyewitness speech room. The narrator stops and the music dips well below them.
  - Never fake historical audio (radio chatter, screams, sirens) or add effects that suggest an archival origin.
- **Music:** licensed (Mixkit Free License), quiet, under the voice. Use silence where it carries meaning.
- **Narration:** natural and serious, with pauses by meaning.
  - Don't attribute knowledge of the future.
  - Don't claim "nobody expected" or "everyone ignored" unless sourced.
  - Don't invent thoughts, dialogue or last words.

## Intro (first 60–90 s)
- Give a clear place and time, a concrete threat or observation, the human context when verified, and a question that leads into the story.
- No long title sequence, no lecture, no full summary of the consequences up front. A short glimpse of the coming danger is OK if it creates the question.

## Voice
Todd `g14YnDYCsy3k7XLlcKlO`, `eleven_v4`, stability 0.45, similarity 0.8, style 0.35, speaker boost. Use the proxy (`xi-api-key: dummy`). Max 2 requests at once, ~3 s apart.

## Lessons added during Deepwater Horizon (`deepwater/`)
- Check who is actually on screen in hearing and interview footage before labelling it. In DVIDS 91190 the camera stays on a panel member while the witness speaks. Use the witness's voice over honest picture, labelled "Voice: …", never over another person's face.
- Run speech-to-text on every testimony cut. It shows clipped first and last words (e.g. "Sperry [Sun]", "[anymore]").
- When an official report states a hindsight judgement (e.g. "a key error"), present it as the investigators' conclusion, not as what people knew at the time.
- Owner preference: an opening of about 2 minutes is fine when it is built from a person's own testimony.
