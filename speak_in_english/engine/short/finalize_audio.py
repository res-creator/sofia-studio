"""python3 short/finalize_audio.py <dir> [I=-14] [TP=-1.0]  -> <dir>/mix.wav  (two-pass ffmpeg loudnorm, linear gain when possible, 48 kHz) + report"""
import json, re, subprocess, sys
D = sys.argv[1]; I = sys.argv[2] if len(sys.argv) > 2 else "-14"; TP = sys.argv[3] if len(sys.argv) > 3 else "-1.0"
src = f"{D}/mix_raw.wav"
o = subprocess.run(["ffmpeg", "-nostats", "-i", src, "-af", f"loudnorm=I={I}:TP={TP}:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(re.search(r"\{[^{}]*\}", o[o.rindex("{"):], re.S).group(0))
af = f"loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", af, "-ar", "48000", f"{D}/mix.wav"], check=True)
print(f"{D}: input {m['input_i']} LUFS / TP {m['input_tp']} -> target {I} LUFS / {TP} dBTP (offset {m['target_offset']} dB)")
