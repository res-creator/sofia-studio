# Polite downloader for the Wikimedia Commons originals listed below (respects 429 with long back-off; one request at a time).
import hashlib, urllib.parse, subprocess, time, os, sys
UA = "SofiaStudioDocResearch/1.0 (https://github.com/res-creator/sofia-studio)"
D = os.path.dirname(os.path.abspath(__file__))
FILES = [("Godtfred_Kirk_Christiansen.jpg", "godtfred_1950.jpg"), ("Danmarks_Tekniske_Museum_-_Lego_bricks.jpg", "bricks_1958_museum.jpg"),
  ("Lego_Pick_a_Brick_Wall_-_Arden_Fair_Mall_-_Sacramento,_California,_USA.jpg", "pick_a_brick_wall.jpg"), ("Kjeld_Kirk_Kristiansen_2018.jpg", "kjeld_2018.jpg"),
  ("26._Internationales_Management_Symposium_1996-Verleihung_Schmidheiny_Freiheitspreis-HSGH_022-000753-08.jpg", "kjeld_1996.jpg"),
  ("Lego_RCX.JPG", "lego_rcx.jpg"), ("BIONICLE_Exo-Toa.jpg", "bionicle_exo_toa.jpg"), ("Legoland_Billund_-_Indgangen_01.jpg", "legoland_entrance.jpg"),
  ("Aerial_Mattel_Headquarters_El_Segundo_May_2012.JPG", "mattel_hq_2012.jpg"), ("Ole_Kirks_Hus_01.jpg", "ole_kirks_hus_billund.jpg")]
for name, out in FILES:
    p = os.path.join(D, out)
    if os.path.exists(p) and os.path.getsize(p) > 10000: continue
    h = hashlib.md5(name.encode()).hexdigest(); url = f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(name)}"
    wait = 120
    for k in range(8):
        r = subprocess.run(['curl', '-sS', '-f', '-L', '-A', UA, '-o', p, '-w', '%{http_code}', url], capture_output=True, text=True)
        print(time.strftime('%H:%M'), out, r.stdout, flush=True)
        if r.stdout == '200': break
        if os.path.exists(p): os.remove(p)
        time.sleep(wait); wait = min(wait * 1.6, 900)
    time.sleep(90)
print('DONE', flush=True)
