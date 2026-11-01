# Sound design: drone + rumble + boom + wave roar + stingers, mixed under the voiceover. Output: mix.wav
import numpy as np, wave, json, subprocess
SR=44100; D=30.0; N=int(SR*D); rng=np.random.default_rng(7)
t=np.arange(N)/SR
words=json.load(open('vo/words.json')); F=lambda x:0.35+x/1.1
def wt(w,n=0):
    k=0
    for ww,a,b in words:
        if ww.lower().startswith(w.lower()):
            if k==n: return F(a)
            k+=1
def env(t0,a,d,r):  # attack/decay envelope starting at t0
    x=t-t0; e=np.where(x<0,0,np.where(x<a,x/a,np.exp(-(x-a)/d)))
    return e*(x<a+r)
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    # simple one-pole via lfilter-like loop in chunks
    from scipy.signal import lfilter
    return lfilter([1-a],[1,-a],x)
mix=np.zeros(N)
# dark drone (A1 + fifth), swells
drone=(np.sin(2*np.pi*55*t)+.6*np.sin(2*np.pi*82.4*t+1)+.4*np.sin(2*np.pi*110.5*t))*0.5
swell=.45+.25*np.sin(2*np.pi*t/9)
mix+=drone*swell*0.18*np.minimum(1,t/2)
# tension riser before explosion (4.7 -> 8.75): filtered noise rising
boom=wt('exploded'); tr=(t>4.7)&(t<boom)
ns=rng.standard_normal(N); k=np.clip((t-4.7)/(boom-4.7),0,1); riser=(lp(ns,250)*(1-k)+lp(ns,2200)*k)*np.where(tr,k**2,0)
mix+=riser*1.3
# heartbeat-ish low pulses during tank scene
for k in np.arange(5.0,8.7,0.62):
    mix+=np.sin(2*np.pi*48*(t-k))*env(k,.005,.12,.5)*0.30
# BOOM at explosion
mix+=np.sin(2*np.pi*(38+60*np.exp(-(t-boom)*9))*(t-boom))*env(boom,.003,.55,2.0)*0.95
mix+=lp(ns,900)*env(boom,.002,.35,1.5)*1.2
# rushing roar during wave (9.6 -> 15.7), peaks ~13
roar=lp(rng.standard_normal(N),700)*np.clip((t-9.7)/2.5,0,1)*np.clip((16.3-t)/1.0,0,1)
mix+=roar*0.9*(1+.2*np.sin(2*np.pi*3*t))
mix+=np.sin(2*np.pi*42*t)*np.clip((t-9.6)/2,0,1)*np.clip((16-t)/1,0,1)*0.15
# impacts at CRUSHED / SWALLOWED / TRAPPED
for w in ['crushed','swallowed','trapped']:
    k=wt(w); mix+=np.sin(2*np.pi*55*(t-k))*env(k,.002,.2,.7)*0.6+lp(rng.standard_normal(N),1500)*env(k,.002,.1,.4)*0.5
# thick flood gurgle 18.5-21.5
g=lp(rng.standard_normal(N),180)*np.clip((t-18.4)/1,0,1)*np.clip((21.8-t)/.5,0,1); mix+=g*1.4
# "21" stinger
k=wt('Twenty-one'); mix+=np.sin(2*np.pi*65*(t-k))*env(k,.002,.4,1.5)*0.7
# silence-ish hole around 'not from' then hits
for n in (0,1):
    k=wt('Not',n); mix+=lp(rng.standard_normal(N),3000)*env(k,.001,.05,.25)*0.5
# MOLASSES slam
k=wt('molasses.'); mix+=np.sin(2*np.pi*(34+50*np.exp(-(t-k)*8))*(t-k))*env(k,.003,.7,2.2)*1.0+lp(rng.standard_normal(N),600)*env(k,.002,.4,1.6)*0.8
# duck bed under voice: crude — constant low bed, then fade out end
mix*=np.clip((D-t)/1.2,0,1)
mix=np.tanh(mix*1.1)*0.9
pk=np.max(np.abs(mix)); mix=mix/pk*0.8
with wave.open('mix_sfx.wav','w') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix*32767).astype('<i2').tobytes())
