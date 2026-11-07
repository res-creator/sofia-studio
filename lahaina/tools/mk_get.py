# Download selected Mixkit stock clips (Free License only), normalise to 1920x1080/30fps/8 s, log licences.
import json, re, subprocess, time, os, sys
idx = json.load(open('/tmp/claude-0/mk/index.json'))
WANT = {
 'fire_forest': 'fire-burning-on-the-forest', 'building_burn': 'building-burning-down', 'sparks': 'sparks-of-fire-on-a-black',
 'flames_burst': 'flames-suddenly-burst', 'fire_nature': 'an-aggressive-fire-consuming', 'ff_bigfire': 'firefighters-putting-out-a-big',
 'ff_hose_woods': 'man-holding-a-fire-hose', 'ff_forest': 'two-firefighters-distinguishing', 'ff_street': 'firefighters-on-the-street-shooting',
 'firetruck': 'fire-truck-on-its-way', 'grass_fire': 'fire-consuming-dry-grass', 'smoke_grey': 'grey-smoke-on-a-black', 'smoke_motion': 'smoke-in-motion',
 'palm_wind': 'palm-tree-blowing-in-the-wind', 'trees_wind': 'wind-moving-trees', 'weeds_wind': 'weeds-waving-in-the-breeze', 'dry_grass_wind': 'dry-grass-in-the-wind',
 'tall_dry_grass': 'tall-and-dry-grass', 'windswept': 'windswept-grasslands', 'palms_hawaii': 'row-of-palm-trees-on-the-hawaii',
 'storm_clouds': 'storm-clouds-moving-in-the-sky', 'dark_clouds': 'dark-stormy-clouds-in-the-sky', 'storm_front': 'strong-storm-front-about',
 'hurricane_sat': 'satellite-view-of-an-angry-hurricane', 'cyclone_sat': 'swirling-cyclone-forming', 'weatherman': 'weatherman-showing-a-hurricane',
 'hurricane_research': 'researchers-tracking-hurricane', 'powerlines_storm': 'storm-clouds-moving-over-power', 'powerlines_silh': 'silhouettes-of-electric-power',
 'powerlines_field': 'electric-power-lines-in-the-field', 'phone_night': 'hands-texting-on-a-mobile-phone-at-night', 'phone_silh': 'silhouette-of-a-man-texting',
 'papers_stack': 'close-up-of-a-tall-stack-of-papers', 'docs_magnify': 'documents-with-magnifying-glass', 'contract_sign': 'contract-that-is-being-signed',
 'sign_doc': 'signing-an-important-document', 'lawyers': 'two-businessmen-in-suits-reviewing', 'lawyer_office': 'couple-at-lawyer-office',
 'press_conf': 'giving-a-conference-to-reporters', 'newspaper': 'pov-flipping-through-a-newspaper', 'screen_info': 'reflection-of-screen-information',
 'waves_dark': 'waves-crashing-ocean-background', 'waves_rocks': 'sea-waves-breaking-on-the-rocks', 'ocean_sunset': 'red-sunset-over-the-ocean',
 'clock_midnight': 'digital-clock-in-the-dark-marking', 'countdown': 'countdown-on-a-digital-counter', 'time_flies': 'alarm-clock-on-a-table-while-time',
 'alarm_bell': 'red-fire-alarm-bell-hanging', 'heli_sky': 'helicopter-flying-in-the-sky', 'heli_rescue': 'rescue-helicopter-in-action',
 'rescue_team': 'rescue-team-searching-for-survivors', 'ff_assist': 'firefighters-assisting-in-an-emergency', 'hawaii_flag': 'flag-of-hawaii-in-motion',
 'night_traffic': 'view-from-inside-a-car-in-night-traffic', 'rain_traffic': 'traffic-on-a-rainy-night', 'tunnel_drive': 'driving-in-a-dark-tunnel',
 'candles_dark': 'candles-in-the-dark', 'candle_hands': 'hands-of-a-girl-holding-a-candle', 'tap_drip': 'dripping-water-from-a-tap', 'tap_run': 'water-tap-running',
 'usa_flag': 'usa-flag-waving', 'clouds_forest': 'dark-clouds-passing-over-a-forest', 'lightning_night': 'lightning-in-the-night-sky',
}
allids = {}
for tag, lst in idx.items():
    for n, i in lst: allids.setdefault(n, i)
log = json.load(open('assets/stock_log.json')) if os.path.exists('assets/stock_log.json') else {}
for key, pre in WANT.items():
    if key in log and os.path.exists(f'public/stock/{key}.mp4'): continue
    hit = [(n, i) for n, i in allids.items() if n.startswith(pre)]
    if not hit: print('MISS', key); continue
    n, i = hit[0]; url = f'https://mixkit.co/free-stock-video/{n}-{i}/'
    page = subprocess.run(['curl', '-sSL', '-m', '30', '-A', 'Mozilla/5.0', url], capture_output=True, text=True).stdout
    lic = 'Restricted' if re.search(r'Restricted License', page) and not re.search(r'Mixkit (Stock Video )?Free License', page) else ('Free' if re.search(r'Free License', page) else 'unknown')
    mp4s = sorted(set(re.findall(rf'https://assets\.mixkit\.co/videos/{i}/{i}-(\d+)\.mp4', page)), key=int)
    if lic != 'Free' or not mp4s: print('SKIP', key, lic, mp4s); log[key] = {'url': url, 'license': lic, 'skipped': True}; continue
    res = [r for r in mp4s if int(r) <= 1080][-1] if any(int(r) <= 1080 for r in mp4s) else mp4s[-1]
    src = f'https://assets.mixkit.co/videos/{i}/{i}-{res}.mp4'
    subprocess.run(['curl', '-sSL', '-m', '180', '-o', f'/tmp/claude-0/mk/{key}_src.mp4', src], check=False)
    r = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'/tmp/claude-0/mk/{key}_src.mp4', '-t', '8', '-an', '-vf', 'fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p', '-c:v', 'libx264', '-crf', '20', '-preset', 'fast', f'public/stock/{key}.mp4'])
    log[key] = {'url': url, 'license': 'Mixkit Free License', 'file': src, 'ok': r.returncode == 0}
    print(key, res, r.returncode, flush=True); json.dump(log, open('assets/stock_log.json', 'w'), indent=1); time.sleep(1.5)
json.dump(log, open('assets/stock_log.json', 'w'), indent=1)
