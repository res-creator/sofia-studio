#!/bin/sh
# stills in the background + a contact sheet: sh tools/shots.sh <outdir> t1 t2 ...   (then wait for <outdir>/sheet.jpg)
HERE=$(cd "$(dirname "$0")/.." && pwd); OUT=$1; shift; rm -rf "$OUT"; mkdir -p "$OUT"
(cd /root/lemo-opuscar && node "$HERE/tools/stills.mjs" "$HERE" "$OUT" "$@" > "$OUT/log.txt" 2>&1
 cd "$OUT" && python3 -c "
from PIL import Image; import glob
fs=sorted(glob.glob('s_*.jpg'),key=lambda f:float(f[2:-4]))
W,H=960,540; out=Image.new('RGB',(W*2,H*((len(fs)+1)//2)))
for i,f in enumerate(fs): out.paste(Image.open(f).resize((W,H)),((i%2)*W,(i//2)*H))
out.save('sheet.jpg')")
