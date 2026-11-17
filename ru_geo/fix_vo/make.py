# Точечные фразы для правок по отчётам критиков (ElevenLabs v3, Todd, stability 0.0). Ключ подставляет прокси.
# Один запрос за раз, пауза 3 с; готовые файлы не перегенерируются. Обработка как в основной озвучке (FX + громкость −16 LUFS).
import json, os, subprocess, sys, time
D = os.path.dirname(os.path.abspath(__file__))
LINES = {
 'ww3_petrov': 'Он не стал передавать наверх сигнал о нападении. Он доложил: ложное срабатывание. И взял решение на себя.',
 'nk_hrw': 'Их ловят и возвращают. По данным Human Rights Watch, только за один день в октябре две тысячи двадцать третьего года обратно отправили больше пятисот человек.',
 'nk_fao': 'По оценке ФАО, в две тысячи двадцатом и двадцать втором годах недоедали около сорока пяти процентов людей на Севере.',
 'nk_camps': 'А в политических лагерях, по оценке комиссии ООН две тысячи четырнадцатого года, держали от восьмидесяти до ста двадцати тысяч человек.',
 'nk_sub': '[chuckles] Кстати, подписаться на этот канал можно без анкеты. Сонбун мы не проверяем.',
 'nk_seoul': 'Самый короткий путь на Юг: от Пхеньяна до Сеула около двухсот километров.',
}
FX = ('highpass=f=75,equalizer=f=300:t=q:w=1.2:g=-2.5,equalizer=f=120:t=q:w=0.9:g=1.8,equalizer=f=3200:t=q:w=1.0:g=2.2,'
      'highshelf=f=10000:g=2,deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3,alimiter=limit=0.89')
tot = 0
for k, txt in LINES.items():
    raw, out = f'{D}/{k}.mp3', f'{D}/{k}.wav'
    if not os.path.exists(raw):
        body = json.dumps(dict(text=txt, model_id='eleven_v3', language_code='ru', voice_settings=dict(stability=0.0, similarity_boost=0.8)))
        r = subprocess.run(['curl', '-sS', '-m', '300', '-o', raw + '.part', '-w', '%{http_code}', '-X', 'POST', 'https://api.elevenlabs.io/v1/text-to-speech/g14YnDYCsy3k7XLlcKlO?output_format=mp3_44100_192',
                            '-H', 'xi-api-key: proxy', '-H', 'Content-Type: application/json', '--data-binary', '@-'], input=body, capture_output=True, text=True).stdout
        time.sleep(3)
        if r != '200': print('ERR', k, r, open(raw + '.part', errors='ignore').read()[:300]); sys.exit(1)
        os.replace(raw + '.part', raw); tot += len(txt); print(k, len(txt), flush=True)
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', FX + ',silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=7', '-ar', '48000', '-ac', '1', out], check=True)
print('chars this run', tot)
