# Озвучка полного выпуска «Япония» голосом Todd (ElevenLabs v3) по абзацам SCRIPT.md (вступление уже есть в ../test3/vo_el/).
# Ключ подставляет прокси окружения. Строго по одному запросу, пауза 3 с; готовые файлы не перезаписываем (экономим кредиты).
import json, os, re, subprocess, time
D = os.path.dirname(os.path.abspath(__file__))
md = open(f'{D}/../SCRIPT.md').read()
body = md[md.index('## Глава 1'):md.index('\n---', md.index('## Глава 1'))]
TAGS = {  # эмоции в начале абзаца или перед шуткой
  'Мы пробовали повторить.': '[chuckles] ', 'Кроме автомата.': '[laughs softly] ', 'И, кажется, не шутят.': '[chuckles] ',
  'Коты при этом делают вид': '[chuckles] ', 'Классика.': '[laughs softly] ', 'Тарелки считают.': '[chuckles] ',
  'В общем, впервые в жизни чавкать': '[laughs softly] ', 'он может вежливо, но настойчиво': '[chuckles] ',
  'так что сейчас ведёт себя прилично': '[chuckles] ', 'будто у них наконец-то отпуск': '[laughs softly] ',
  'Японцы заметят.': '[chuckles] ', 'но настойчиво': '', 'А теперь — то, ради чего': '[excited] ',
}
items, ch, k = [], 0, 0
for line in body.splitlines():
    line = line.strip()
    if line.startswith('## '):
        m = re.match(r'## Глава (\d+)', line); ch = int(m.group(1)) if m else 10; k = 0; continue
    if not line or line.startswith('*(') or line.startswith('#'): continue
    t = line
    for key, tag in TAGS.items():
        if tag and key in t: t = t.replace(key, tag + key, 1)
    k += 1; items.append(dict(id=f'c{ch:02d}_{k:02d}', text=t))
json.dump(items, open(f'{D}/lines.json', 'w'), ensure_ascii=False, indent=1)
print(len(items), 'абзацев,', sum(len(i['text']) for i in items), 'знаков')
if __name__ == '__main__' and os.environ.get('GO') == '1':
    for it in items:
        out = f'{D}/{it["id"]}.mp3'
        if os.path.exists(out) and os.path.getsize(out) > 5000: continue
        body_ = json.dumps(dict(text=it['text'], model_id='eleven_v3', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
        for attempt in range(2):
            r = subprocess.run(['curl', '-sS', '-o', out, '-w', '%{http_code}', '-X', 'POST',
                                'https://api.elevenlabs.io/v1/text-to-speech/g14YnDYCsy3k7XLlcKlO?output_format=mp3_44100_192',
                                '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '-d', body_], capture_output=True, text=True).stdout
            if r == '200': break
            print('retry', it['id'], r, open(out, errors='ignore').read()[:200], flush=True); time.sleep(10)
        print(it['id'], r, os.path.getsize(out), flush=True); time.sleep(3)
