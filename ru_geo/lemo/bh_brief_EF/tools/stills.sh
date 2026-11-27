#!/bin/sh
# Stills of the film camera at the given local times:  sh tools/stills.sh 3 10.5 20 ...   → stills/s_<t>.jpg
HERE=$(cd "$(dirname "$0")/.." && pwd); export LIB=${LIB:-/root/lemo-opuscar}
D=$HERE/scenes/stills/tmp; rm -rf "$D"; mkdir -p "$D"
for t in "$@"; do echo "{\"extends\": \"scenes/film.json\", \"t\": $t, \"hand\": 0, \"out\": \"s_$t.jpg\"}" > "$D/s_$t.json"; done
cd "$HERE" && node kit/batch.mjs "$D"/*.json --out stills
