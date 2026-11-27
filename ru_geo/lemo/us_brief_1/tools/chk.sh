#!/bin/sh
# stills of the film at the given local times → out/chk/c_<t>.jpg ;  sh tools/chk.sh 3 6.5 12 …
HERE=$(cd "$(dirname "$0")/.." && pwd); mkdir -p "$HERE/scenes/chk" "$HERE/out/chk"; rm -f "$HERE"/scenes/chk/c_*.json
for t in "$@"; do echo "{\"extends\": \"scenes/film.json\", \"t\": $t, \"out\": \"c_$t.jpg\"}" > "$HERE/scenes/chk/c_$t.json"; done
cd "$HERE" && LIB=/root/lemo-opuscar node kit/batch.mjs scenes/chk/c_*.json --out out/chk 2>&1 | tail -2
