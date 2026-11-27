#!/bin/sh
# keep the render alive: restart the worker if it died; print progress
G=$(cd "$(dirname "$0")/.." && pwd)
n=$(ls $G/out/frames 2>/dev/null | grep -c '^f_.*\.jpg$')
if [ "$n" -lt 3776 ] && ! pgrep -f "frames.mjs $G " > /dev/null; then sh $G/tools/render.sh; fi
echo "$n/3776"
