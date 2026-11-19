# Шаблон «Что ты слышишь / что сказано» (слитная речь, бесплатный голос Kokoro)
`python3 tts_kokoro.py <workdir> <models_dir>` (нужны kokoro-v1.0.onnx и voices-v1.0.bin, см. ../setup.sh) ->
`python3 timeline.py <workdir>` -> `node render.js <workdir> <silent.mp4>` -> `python3 mix.py <workdir>` ->
громкость: `ffmpeg -i audio.wav -af "acompressor=threshold=0.05:ratio=4:attack=3:release=60:makeup=3,loudnorm=I=-14:TP=-1.5:LRA=7" audio4.wav` ->
`ffmpeg -i silent.mp4 -i audio4.wav -c:v copy -c:a aac -b:a 192k out.mp4`. Новые фразы: правка `script.json`. Обложка: `node render.js <workdir> cover.png 0`.
