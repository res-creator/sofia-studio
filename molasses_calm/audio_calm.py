# Quiet ambient bed: slow minor pads, soft low drone, sparse gentle bell notes, faint air. No hits, no risers.
import numpy as np, json, wave
from scipy.signal import lfilter
SR=44100; TL=json.load(open('timeline.json')); D=TL['total']; N=int(SR*D); t=np.arange(N)/SR; rng=np.random.default_rng(5)
def lp(x,fc): a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
chords=[(110,130.8,164.8),(87.3,130.8,174.6),(130.8,164.8,196),(98,123.5,146.8)]  # Am, F, C, G(ish) low voicings
seg=26.0; mix=np.zeros(N)
for ci in range(int(D//seg)+2):
    c=chords[ci%len(chords)]; t0=ci*seg-4; t1=t0+seg+8
    w=np.clip((t-t0)/6,0,1)*np.clip((t1-t)/6,0,1)
    for k,f in enumerate(c):
        for det in (-.4,0,.4):
            mix+=np.sin(2*np.pi*(f+det)*t+k)*w*(.5+.5*np.sin(2*np.pi*t/(13+k*3)+k))*0.018
mix+=np.sin(2*np.pi*55*t)*0.045*(.7+.3*np.sin(2*np.pi*t/19))
# sparse soft bell notes (A minor pentatonic), ~every 8-13 s
scale=[220,261.6,293.7,329.6,392,440,523.3]; k=6.0
while k<D-6:
    f=scale[rng.integers(len(scale))]; x=t-k
    note=np.where(x<0,0,np.sin(2*np.pi*f*x)*np.exp(-x/2.2)+.25*np.sin(2*np.pi*2*f*x)*np.exp(-x/1.2))*np.clip(x/.02,0,1)*(x<9)
    mix+=note*.020; k+=rng.uniform(8,13)
mix*=np.clip(t/4,0,1)*np.clip((D-t)/5,0,1)
mix=mix/np.max(np.abs(mix))*.8
with wave.open('bed.wav','w') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok',D)
