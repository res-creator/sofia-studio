# Конкретные события и места, которых нет на Pixabay: ищем на Wikimedia Commons, смотрим контактные листы.
import json, os, sys, subprocess
from PIL import Image, ImageDraw
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', 'lib'))
import commons_find as cf, look
Q = ['Grindavik eruption 2024', 'Grindavik crack 2023', 'Grindavik barrier', 'Grindavík houses lava January 2024', 'Sundhnúkur eruption',
     'Svartsengi power station', 'Heimaey 1973 eruption', 'Eldfell 1973', 'Vestmannaeyjar 1973 lava cooling', 'Eldfell Heimaey',
     'Eyjafjallajökull eruption 2010', 'Eyjafjallajökull ash plume', 'airport 2010 ash cancelled flights', 'Lakagígar', 'Laki craters',
     'Cod War Iceland', 'Icelandic Coast Guard Þór 1976', 'HMS Andromeda Cod War', 'net cutter Cod War', 'Geir Haarde', 'Kaupthing',
     'Landsbanki Reykjavík headquarters', 'Iceland protests 2009', 'Okjökull plaque', 'Ok glacier funeral', 'Apollo astronauts Iceland 1967',
     'Neil Armstrong Iceland', 'Holuhraun', 'Hellisheiði power station', 'Carbfix', 'Straumsvík aluminium smelter', 'Fjarðaál',
     'Ingólfur Arnarson statue', 'Coat of arms of Iceland stockfish', 'Iceland 1 krona coin', 'Skeiðará bridge 1996', 'Grímsvötn 1996 jökulhlaup',
     'Katla 1918 eruption', 'Perlan Reykjavík', 'Hekla', 'Lögberg Þingvellir', 'Hull trawler', 'Grimsby fish docks', 'Naval Air Station Keflavik',
     'Fagradalsfjall 2021 tourists', 'Reykjavik 1930s', 'Askja Öskjuvatn', 'Laki 1783 painting', 'Benjamin Franklin', 'Mid-Atlantic Ridge map',
     'Iceland hotspot plume', 'Thingvellir rift', 'Reykjavik geothermal pipes', 'Blue Lagoon lava 2024', 'Hallormsstaður forest', 'Vatnajökull from space']
if __name__ == '__main__':
    tdir = os.path.join(cf.CACHE, 'thumbs'); os.makedirs(tdir, exist_ok=True)
    rows = []
    for q in Q:
        names = cf.search(q, 6); print(q, len(names), flush=True)
        for n in names: rows.append((q, n))
    json.dump(rows, open(f'{D}/commons_rows.json', 'w'), ensure_ascii=False, indent=0)
    cols, per = 6, 30; os.makedirs(f'{D}/cache/sheets', exist_ok=True)
    for s in range(0, len(rows), per):
        img = Image.new('RGB', (cols * 320, 5 * 210), (20, 20, 24))
        for i, (q, n) in enumerate(rows[s:s + per]):
            tp = os.path.join(tdir, str(abs(hash(n)) % 10**10) + '.jpg')
            if not os.path.exists(tp):
                subprocess.run(['curl', '-sS', '-A', cf.UA, '-o', tp, cf.thumb_url(n)]); 
            try: im = Image.open(tp).convert('RGB'); im.thumbnail((316, 178))
            except Exception: im = Image.new('RGB', (316, 178), (90, 0, 0))
            x, y = (i % cols) * 320, (i // cols) * 210; img.paste(im, (x + 2, y + 2))
            ImageDraw.Draw(img).text((x + 4, y + 182), f"{s + i} {n[:38]}", fill=(255, 255, 255), font=look.font(14, 500))
        img.save(f'{D}/cache/sheets/cm_{s // per:02d}.jpg', quality=80)
