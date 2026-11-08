# vo/speech.json for a chapter: real speech start/end of every line (ffmpeg silencedetect, -45 dB). Usage: python3 speech.py <chapter> [...]
import json, os, re, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__))
for ch in sys.argv[1:]:
    cd = f'{D}/chapters/{ch}'; SP = {}
    for L in json.load(open(f'{cd}/script.json')):
        f = f"{cd}/vo/{L['id']}.mp3"; dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout)
        e = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=noise=-45dB:d=0.08', '-f', 'null', '-'], capture_output=True, text=True).stderr
        st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', e)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', e)]
        s0 = en[0] if st and st[0] < 0.02 and en else 0.0; s1 = st[-1] if st and (not en or st[-1] > en[-1]) else dur
        SP[L['id']] = [round(s0, 3), round(s1, 3)]
    json.dump(SP, open(f'{cd}/vo/speech.json', 'w'), indent=0); print(ch, 'speech ok')
