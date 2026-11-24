# loudness / voicing / spectral centroid / text for tag tests
import sys, subprocess, io, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel('small', compute_type='int8')
def load(p): return sf.read(io.BytesIO(subprocess.run(['ffmpeg','-v','error','-i',p,'-ar','16000','-ac','1','-f','wav','-'],capture_output=True).stdout), dtype='float32')[0]
for p in sys.argv[1:]:
    a = load(p); n = 640; fr = [a[i:i+n] for i in range(0, len(a)-n, 320)]; act = [x for x in fr if np.sqrt((x**2).mean()) > .01]
    voiced = 0; cent = []
    for x in act:
        c = np.correlate(x, x, 'full')[n-1:]; k = 40 + np.argmax(c[40:230]); voiced += c[k] > .45 * c[0]
        S = np.abs(np.fft.rfft(x * np.hanning(n))); f = np.fft.rfftfreq(n, 1/16000); cent.append((S*f).sum()/max(1e-9,S.sum()))
    rms = 20*np.log10(np.sqrt((a**2).mean())+1e-9); pk = 20*np.log10(np.abs(a).max()+1e-9)
    t = ''.join(s.text for s in m.transcribe(np.concatenate([np.zeros(9600,'float32'),a,np.zeros(9600,'float32')]), beam_size=5)[0]).strip()
    print(f'{p.split("/")[-1]:16s} rms {rms:5.1f} peak {pk:5.1f} voiced {voiced/max(1,len(act)):.2f} centroid {np.median(cent):5.0f}  {t}', flush=True)
