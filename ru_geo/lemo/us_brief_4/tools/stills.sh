#!/bin/sh
# stills of scenes/stills/*.json into out/st (background-safe). usage: sh tools/stills.sh
HERE=$(cd "$(dirname "$0")/.." && pwd); export LIB=${LIB:-/root/lemo-opuscar}
cd "$LIB" && node "$HERE/kit/batch.mjs" "$HERE"/scenes/stills/*.json --out "$HERE/out/st" > "$HERE/out/stills.log" 2>&1
python3 - "$HERE/out/st" <<'PY'
import sys, glob, os
from PIL import Image
d = sys.argv[1]; fs = sorted(glob.glob(os.path.join(d, 's_*.jpg')), key=lambda f: float(os.path.basename(f)[2:-4]))
ims = [Image.open(f).resize((960, 540)) for f in fs]
for k in range(0, len(ims), 6):
    W = Image.new('RGB', (1920, 540 * 3), 'black')
    for i, im in enumerate(ims[k:k + 6]): W.paste(im, ((i % 2) * 960, (i // 2) * 540))
    W.save(os.path.join(d, f'sheet_{k // 6}.jpg'))
PY
echo done >> "$HERE/out/stills.log"
