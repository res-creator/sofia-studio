# Шаблон «Дословно» (формат 1, бесплатная озвучка Kokoro)
`python3 tts_kokoro.py <workdir> <models_dir>` (нужны kokoro-v1.0.onnx и voices-v1.0.bin, см. ../setup.sh) ->
`python3 timeline.py <workdir>` -> `node render.js <workdir> <silent.mp4>` -> `python3 mix.py <workdir>` ->
`ffmpeg -i silent.mp4 -i audio.wav -c:v copy -c:a aac -b:a 192k out.mp4`. Новые фразы: правка `script.json`. Обложка: `node render.js <workdir> cover.png 0`.
