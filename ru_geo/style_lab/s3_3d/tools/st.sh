#!/bin/sh
# quick stills: sh tools/st.sh "t1,t2,..." [query]  → out/st/s_<t>.jpg + out/st/sheet.jpg (2x2 of the first four), log out/st.log
HERE=$(cd "$(dirname "$0")/.." && pwd)
cd /root/lemo-opuscar && node "$HERE/tools/stills.mjs" "$HERE" "$HERE/out/st" "$1" "${2:-ss=1}" > "$HERE/out/st.log" 2>&1
cd "$HERE/out/st" && python3 -c "
import sys
from PIL import Image
ts=[float(x) for x in sys.argv[1].split(',')][:4]
ims=[Image.open('s_%.2f.jpg'%t).resize((960,540)) for t in ts]
m=Image.new('RGB',(1920,1080));[m.paste(im,((i%2)*960,(i//2)*540)) for i,im in enumerate(ims)];m.save('sheet.jpg')" "$1"
echo done >> "$HERE/out/st.log"
