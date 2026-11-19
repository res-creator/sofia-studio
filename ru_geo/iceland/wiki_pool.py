# Фото конкретных событий из статей Википедии (файлы Commons; commons.wikimedia.org отвечает 429, а en.wikipedia.org — нет).
# Превью — с thumb.wikimedia.org, лицензию и автора потом берём со страницы en.wikipedia.org/wiki/File:...
import html, json, os, re, subprocess, sys, time, urllib.parse
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import commons_find as cf, look
UA = cf.UA
ART = ['Eldfell', 'Heimaey', '2010_eruptions_of_Eyjafjallajökull', 'Air_travel_disruption_after_the_2010_Eyjafjallajökull_eruption',
       '2023–2025_Sundhnúkur_eruptions', 'Grindavík', 'Svartsengi_Power_Station', 'Laki', 'Cod_Wars', '2008–2011_Icelandic_financial_crisis',
       'Geir_Haarde', 'Kaupthing_Bank', 'Okjökull', 'Apollo_program_training', 'Askja', 'Holuhraun', 'Hellisheiði_Power_Station', 'Carbfix',
       'Alcoa_Fjarðaál', 'Straumsvík', 'Ingólfr_Arnarson', 'Coat_of_arms_of_Iceland', 'Icelandic_króna', 'Skeiðarársandur', 'Grímsvötn',
       'Katla_(volcano)', 'Vík_í_Mýrdal', 'Perlan', 'Hekla', 'Þingvellir', 'Althing', 'Christianisation_of_Iceland', 'Forestry_in_Iceland',
       'Fagradalsfjall', 'Naval_Air_Station_Keflavik', 'Icesave_dispute', '2009_Icelandic_financial_crisis_protests', 'Geothermal_power_in_Iceland',
       'Iceland_hotspot', 'Mid-Atlantic_Ridge', 'Vatnajökull', 'Blue_Lagoon_(geothermal_spa)', 'Gjálp', 'Glacial_lake_outburst_flood',
       'Icelandic_Coast_Guard', 'ICGV_Þór_(1951)', 'ICGV_Týr', 'HMS_Andromeda_(F57)', 'Landnámabók', 'Reykjavík_Energy', 'Bárðarbunga',
       'Kitchenware_Revolution', 'Hreiðar_Már_Sigurðsson', 'Landsbanki', 'Glitnir', 'Port_of_Grimsby', 'Hull_Trawler', 'Þorgeir_Ljósvetningagoði']
BAD = re.compile(r'(flag|logo|icon|symbol|location|map|locator|coat_of_arms_of_(?!iceland)|commons-|wiki|edit|question_book|padlock|ambox|crystal|nuvola|disambig|portal|signature|\.svg)', re.I)
if __name__ == '__main__':
    rows = json.load(open(f'{D}/wiki_rows.json')) if os.path.exists(f'{D}/wiki_rows.json') else []
    seen = {n for _, n in rows}; done = {a for a, _ in rows}
    for a in ART:
        if a in done: continue
        r = subprocess.run(['curl', '-sS', '-A', UA, '--max-time', '60', 'https://en.wikipedia.org/wiki/' + urllib.parse.quote(a)], capture_output=True, text=True)
        names = []
        for m in re.findall(r'File:([^"&<#?/]+?\.(?:jpe?g|png|tiff?))', r.stdout, re.I):
            n = html.unescape(urllib.parse.unquote(m)).replace('_', ' ')
            if n not in seen and n not in names and not BAD.search(n.replace(' ', '_')): names.append(n)
        for n in names[:10]: rows.append((a, n)); seen.add(n)
        print(a, len(names), flush=True); time.sleep(1.5)
        json.dump(rows, open(f'{D}/wiki_rows.json', 'w'), ensure_ascii=False, indent=0)
    tdir = os.path.join(cf.CACHE, 'thumbs'); os.makedirs(tdir, exist_ok=True)
    cols, per = 6, 30
    for s in range(0, len(rows), per):
        img = Image.new('RGB', (cols * 320, 5 * 210), (20, 20, 24))
        for i, (a, n) in enumerate(rows[s:s + per]):
            tp = os.path.join(tdir, re.sub(r'[^\w.-]', '_', n)[:120] + '.jpg')
            if not os.path.exists(tp) or os.path.getsize(tp) < 1000:
                subprocess.run(['curl', '-sS', '-A', UA, '-o', tp, cf.thumb_url(n)])
            try: im = Image.open(tp).convert('RGB'); im.thumbnail((316, 178))
            except Exception: im = Image.new('RGB', (316, 178), (90, 0, 0))
            x, y = (i % cols) * 320, (i // cols) * 210; img.paste(im, (x + 2, y + 2))
            ImageDraw.Draw(img).text((x + 4, y + 182), f"{s + i} {n[:36]}", fill=(255, 255, 255), font=look.font(14, 500))
        img.save(f'{D}/cache/sheets/wk_{s // per:02d}.jpg', quality=80)
    print('rows', len(rows))
