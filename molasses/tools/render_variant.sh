#!/bin/sh
# usage: tools/render_variant.sh VARIANT OUT.mp4   (VARIANT = bryan | todd; needs vo/VARIANT/timeline.json + mix.wav)
set -e
V=$1; OUT=$2
cp vo/$V/timeline.json src/data/timeline.json
cp vo/$V/mix.wav public/audio/mix.wav
npx remotion render src/index.ts Main "$OUT" --codec=h264 --audio-codec=aac --audio-bitrate=256k --crf=18 --concurrency=4 --log=error
