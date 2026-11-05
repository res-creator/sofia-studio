# Figma AI prompt templates (approved long-form standard)

Tool: Figma MCP `generate_image`, model **gpt-image-2.5-sunburst**, width 1920 × height 1080 (Figma returns 1536×864 PNG).
Put all generations of one film into ONE Figma file (`create_new_file` once, `create_session` once) and download every result right away
(`curl -f -L -o <file> "<image.url>"`) — the URL expires in 7 days. Never put text, letters, numbers or logos into prompts' images:
all type is added in code.

The constant style line (start every prompt with it):
> Rich hand-drawn 2D cartoon illustration for an animated history documentary, 16:9: bold clean ink outlines, painted cel shading,
> warm cinematic lighting with soft shadows, saturated harmonious colors, deep perspective, lots of period detail.

For part sheets use instead:
> … for 2D cut-out (puppet) animation, rich hand-drawn cartoon style: bold clean ink outlines, painted cel shading, warm light from the right.
> Solid flat pure chroma-key green background (#00FF00) everywhere, nothing else. All parts at the SAME scale, wide green gaps between parts.

## 1. Character — 2 generations per main character (once, reused everywhere)

**A. Expression heads (6 heads, pixel-aligned):**
> Expression sheet for 2D cut-out (puppet) animation, [style line for sheets]. SIX HEADS ONLY (head and short neck stump, no shoulders,
> no body) of the SAME character, arranged in a neat 3x2 grid with wide green gaps, every head exactly the same size, same front-facing
> angle and same position of ears, glasses and moustache, so they can be swapped in animation: [NAME] in [YEAR] — [face description:
> hair, facial hair, glasses, age, collar]. 1) neutral calm, mouth closed; 2) SAME but eyes fully CLOSED (blink); 3) warm smile with teeth;
> 4) talking, mouth open saying "ah"; 5) surprised, eyebrows high, mouth a round "o"; 6) skeptical, one eyebrow raised, mouth a flat line.
> Absolutely no text, letters, numbers or logos.

Swap 3–6 for the film's needs (angry, sad, laughing, worried…), but always keep 1 neutral + 2 blink.

**B. Body + arms (jacket with shoulders, arms WITHOUT shoulder caps):**
> Body-parts sheet for 2D cut-out (puppet) animation, [style line for sheets]. Character: [NAME] in [YEAR] — [clothes].
> 1) TORSO with SHOULDERS, front view, from the neck to the waist, NO head: a complete [jacket] on a man, with natural sloping shoulders
> and the TOP PART OF BOTH SLEEVES attached (each sleeve continues down from the shoulder for a short length). Neck opening with the collar at the top.
> No round sockets, no circles at the shoulders.
> 2) LEFT ARM piece only from mid upper-arm to the hand (NO shoulder): sleeve tube whose top end is plain and straight, hanging straight down, cuff, relaxed hand.
> 3) RIGHT ARM piece, same, hanging straight down, relaxed hand.
> 4) LEFT ARM piece from mid upper-arm, bent at the elbow outward, open palm turned up (shrug gesture).
> 5) RIGHT ARM piece from mid upper-arm, bent at the elbow outward, open palm turned up (shrug gesture).
> 6) RIGHT ARM piece from mid upper-arm, bent at the elbow, forearm raised beside the body, index finger raised, palm toward the viewer.
> Absolutely no text, letters, numbers or logos.

Gestures 4–6 can be swapped (hand on hip, fist, holding an object, hand to chin). The straight arms 2–3 are mandatory (they bend in code).
A woman / child / worker: same structure, change the clothes (dress → torso with sleeves, etc.).

## 2. Secondary characters — 1 generation per sheet (full-body poses, no rig)
> Character pose sheet for 2D cut-out animation, [style line for sheets]. FOUR full-body figures side by side with clear green space:
> 1) [CHAR A] — [description]: [pose/emotion]. 2) [CHAR A] again, same clothes and face: [pose 2]. 3) [CHAR B] — …: … 4) [CHAR B] again: …
> Identical faces and clothes for the same man. Absolutely no text, letters, numbers or logos.

They move as whole sprites (slide, hop, bob, swap poses) — enough for background roles.

## 3. Background plates — 1 generation per location / camera set-up
> [style line]. SCENE: [place, year], [time of day]. [Wide/close, camera height]. [Light: window beams / lamps / sunset].
> [6–12 concrete period details]. [Where the action space is: "the desk top occupies the lower third and is mostly clear", "leave the
> left third empty floor for a character"]. Absolutely no people, no text, no letters, no numbers, no logos.

Generate locations EMPTY (no people) — characters are puppets placed on top. Ask for an empty spot where the action/prop will be
("the flat bottom of the drawer in the center is EMPTY"). A wide establishing shot WITH people is allowed for the first shot of a location.

## 4. Props — 1 generation per sheet of 6
> Prop sheet for 2D cut-out animation, [style line for sheets]. Six separate objects with clear green space between them, each large and
> centered in its own area: 1) … 6) … (for money/papers: "with NO readable words or numbers, only abstract ornaments"). No text or logos.

## 5. Thumbnail — 1 generation
> YouTube thumbnail illustration, 16:9, [style line]. LEFT FOREGROUND (large, ~45% of the frame height, waist-up): [hero, emotion].
> BEHIND: [small setting]. RIGHT: [one hero object, huge]. FAR BACKGROUND: [scale/contrast]. Keep the TOP-LEFT quarter calm (headline space).
> Absolutely no text, letters, numbers or logos. — then add the headline + label text in code (see cocacola_history/thumb_figma.js).
