#!/bin/bash
# One-time setup (Linux or macOS). Needs: Node 18+, Python 3.10+, ffmpeg, curl.
set -e
cd "$(dirname "$0")"
command -v ffmpeg >/dev/null || { echo "Install ffmpeg first (apt install ffmpeg / brew install ffmpeg)"; exit 1; }
npm install                                   # @napi-rs/canvas + fonts (Unbounded, Nunito, Caveat)
python3 -m pip install -r requirements.txt || python3 -m pip install --break-system-packages -r requirements.txt
mkdir -p models preview2 out
K=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
[ -f models/kokoro-v1.0.onnx ] || curl -L -o models/kokoro-v1.0.onnx $K/kokoro-v1.0.onnx      # ~310 MB, English voices
[ -f models/voices-v1.0.bin ]  || curl -L -o models/voices-v1.0.bin  $K/voices-v1.0.bin       # ~27 MB
[ -d models/sherpa-onnx-whisper-small ] || curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2 | tar xj -C models   # listen-back check
echo "OK. Try: python3 tts_v2.py market && python3 split_nar.py market && bash build_audio.sh market && bash render.sh market"
