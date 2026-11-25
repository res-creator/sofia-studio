# Assemble an audio preview as MP4: segments = [(png, wav_array)] -> out.mp4 (1080x1920, still cards, AAC)
import subprocess, numpy as np, soundfile as sf, os, tempfile
SR = 44100
def build(segments, out):
    tmp = tempfile.mkdtemp(dir='/tmp/claude-0/-home-user-sofia-studio/43e73c66-8e6e-5633-a8a3-d2d45001da3f/scratchpad'); lst = []; audio = []
    for i, (png, a) in enumerate(segments):
        d = len(a) / SR; v = f'{tmp}/s{i:02d}.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', f'{d:.3f}', '-i', png, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', '30', v], check=True)
        lst.append(f"file '{v}'"); audio.append(a)
    open(f'{tmp}/l.txt', 'w').write('\n'.join(lst)); a = np.concatenate(audio); sf.write(f'{tmp}/a.wav', a / max(1e-9, np.abs(a).max()) * .9, SR)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{tmp}/l.txt', '-i', f'{tmp}/a.wav', '-af', 'loudnorm=I=-16:TP=-1.5', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', out], check=True)
    return len(a) / SR
