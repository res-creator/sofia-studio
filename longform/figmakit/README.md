# figmakit — How It's Run long-form production kit (Figma AI art + code animation)

Rules and process: **`../LONGFORM_STYLE.md`** (read first).

```
lib/scene.js      camera, parallax, plates, occluders, sprites, FX (beams, dust, smoke, sparkle, glow, puff, shake), grade, transitions, render CLI, word timings
lib/puppet.js     character puppet: expression heads + blinks, tilt/nod/breath/shrug, one-piece bendy arms + drawn gestures, acting tracks
assets/           characters/<name>/(character.js + parts + src sheets) · backgrounds/ (Figma plates 1536x864) · props/ (keyed sprites)
prompts/PROMPTS.md  Figma prompt templates (characters, pose sheets, plates, props, thumbnail)
tools/            chroma.py (green-screen sheet -> sprites) · nostub.py (remove sleeve stubs) · grid.py (measure points) ·
                  headcheck.py (head alignment) · prepare.py (upscale cache) · estimate.py (generation budget)
examples/candler_desk.js   reference character shot (= approved test v6)
cache/            upscaled plates/props (git-ignored; python3 tools/prepare.py)
```

Quick start: `pip install opencv-python-headless && python3 tools/prepare.py && node examples/candler_desk.js still 0.3,3.2,8.6 /tmp/s.png`
