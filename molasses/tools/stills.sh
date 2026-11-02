#!/bin/sh
# usage: tools/stills.sh outdir t1 t2 ...   (seconds) -> renders single frames
out=$1; shift; mkdir -p $out
for t in "$@"; do f=$(python3 -c "print(round($t*30))"); npx remotion still src/index.ts Main $out/f_$t.jpg --frame=$f --log=error || exit 1; done
