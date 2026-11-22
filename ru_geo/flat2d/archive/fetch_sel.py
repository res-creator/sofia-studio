#!/usr/bin/env python3
"""python3 fetch_sel.py: качает выбранные фото 1920 px, пишет <фильм>/archive/img и credits.json (автор, лицензия, подпись)."""
import json, os, re, sys, time, urllib.request
UA = {'User-Agent': 'Mozilla/5.0 (documentary research script; non-commercial research)'}
SEL = {
 'chernobyl': {
  'town86': ('town86_0', 'Припять'), 'wheel': ('town_wheel_8', 'Припять, парк (позднее фото)'), 'blocks': ('blocks_0', 'Припять сегодня'), 'pool': ('pool_4', 'Бассейн «Лазурный», Припять (позднее фото)'),
  'plantmodel': ('plant_before_0', 'Схема станции: четыре блока'), 'sarc': ('sarc_1', 'Четвёртый блок и «Укрытие»'), 'arch': ('arch_0', 'Новая защитная арка, 2016'), 'archbuild': ('arch_4', 'Строительство арки'),
  'liquid': ('liquid_1', 'Дезактивация, 1986'), 'pass': ('liquid_3', 'Пропуск на 1 мая 1986 года'), 'plantmap': ('liquid_4', 'План станции, 1986'), 'forsmark': ('forsmark_1', 'АЭС «Форсмарк», Швеция'),
  'bus': ('buses_0', 'Брошенный автобус в зоне'), 'school': ('school_0', 'Школа в Припяти (позднее фото)'), 'flat': ('flat_6', 'Квартира в Припяти (позднее фото)'), 'sign': ('sign_8', 'Граница зоны отчуждения'), 'slav': ('slav_0', 'Славутич')},
 'titanic': {
  'leave': ('leave_1', '«Титаник», 1912'), 'leave2': ('leave_6', '«Титаник» выходит из Саутгемптона'), 'cabin': ('cabin3_0', 'Каюта третьего класса'), 'boatdeck': ('boatdeck_0', 'Шлюпочная палуба «Титаника»'), 'promen': ('boatdeck_3', 'Палуба «Титаника»'),
  'iceberg': ('iceberg_0', 'Айсберг, сфотографированный рядом с «Титаником»'), 'iceberg2': ('iceberg_8', 'Айсберг, апрель 1912'), 'boatD': ('collD_0', 'Шлюпки «Титаника», 1912'), 'boatsC': ('carp_boats_1', 'Шлюпка с выжившими'), 'boatsC2': ('carp_boats_0', 'Шлюпка с выжившими'),
  'carp': ('carp_3', '«Карпатия»'), 'rostron': ('rostron_2', 'Капитан Артур Рострон'), 'ny': ('ny_0', 'Толпа у пирса 54, Нью-Йорк'), 'ny2': ('ny_1', 'Нью-Йорк, апрель 1912'), 'news': ('news_0', 'Газета, 17 апреля 1912'), 'senate': ('senate_5', 'Сенат США, расследование'),
  'cal': ('cal_0', '«Калифорниан»'), 'wireless': ('wireless_4', 'Радиорубка «Титаника»'), 'cartoon': ('sinking_2', 'Карикатура 1912 года про шлюпки'), 'boatD2': ('collD_2', 'Шлюпки «Титаника», 1912'), 'plan': ('boatdeck_4', 'Схема шлюпок «Титаника»'), 'tender': ('queens_8', 'На тендере «Америка»')}}
film = sys.argv[1]; C = json.load(open(f'cand_{film}.json', encoding='utf8')); os.makedirs(f'../../{film}/archive/img', exist_ok=True); cr = {}
for key, (ref, cap) in SEL[film].items():
    k, i = ref.rsplit('_', 1); c = C[k][int(i)]; fn = f'{key}.jpg'; path = f'../../{film}/archive/img/{fn}'
    th = re.sub(r'/(\d+)px-', '/1280px-', c['thumb']) if c.get('thumb') and re.search(r'/\d+px-', c['thumb']) else c['url']
    if c['w'] and c['w'] < 1280: th = c['thumb'] if False else c['url']
    if not os.path.exists(path) or os.path.getsize(path) < 5000:
        for a in range(8):
            try: open(path, 'wb').write(urllib.request.urlopen(urllib.request.Request(th, headers=UA), timeout=60).read()); break
            except Exception as e: print('retry', key, str(e)[:60]); time.sleep(20 + 15 * a)
        time.sleep(7)
    lic = c['license']; pd = 'public domain' in lic.lower() or lic.lower().startswith('pd')
    author = re.sub(r'\s+', ' ', c['author']).strip()
    if pd or len(author) < 2 or author.lower().startswith(('unknown', 'anonym')): author = author if author and not pd and len(author) > 2 else 'автор неизвестен'
    cr[key] = dict(file=fn, author=author[:60], license='общественное достояние' if pd else lic, cap=cap, page=c['page'], title=c['title'])
    print(key, 'ok', os.path.getsize(path) if os.path.exists(path) else 0, flush=True)
json.dump(cr, open(f'../../{film}/archive/credits.json', 'w'), ensure_ascii=False, indent=1)
