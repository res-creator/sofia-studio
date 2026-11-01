# Sound design for the full documentary -> mix_sfx.wav (mono 44.1k). Cues come from timeline.json word times.
import numpy as np, json, wave, re
from scipy.signal import lfilter
SR=44100; TL=json.load(open('timeline.json')); D=TL['total']; N=int(SR*D); t=np.arange(N)/SR; rng=np.random.default_rng(11)
ch={c['id']:c for c in TL['chapters']}
def norm(w): return re.sub(r'[^a-z0-9-]','',w.lower())
def wt(c,word,n=0):
    k=0
    for w in TL['words']:
        if w['ch']==c and norm(w['w'])==norm(word):
            if k==n: return w['t0']
            k+=1
    raise Exception((c,word))
def lp(x,fc): a=np.exp(-2*np.pi*fc/SR); return lfilter([1-a],[1,-a],x)
def env(t0,a,d,r): x=t-t0; return np.where(x<0,0,np.where(x<a,x/a,np.exp(-(x-a)/d)))*(x<a+r)
def win(t0,t1,fi=1.0,fo=1.0): return np.clip((t-t0)/fi,0,1)*np.clip((t1-t)/fo,0,1)
noise=rng.standard_normal(N)
mix=np.zeros(N)
# --- bed: drone + slow pad
drone=(np.sin(2*np.pi*55*t)+.55*np.sin(2*np.pi*82.4*t+1)+.35*np.sin(2*np.pi*110.3*t))*(.55+.25*np.sin(2*np.pi*t/11))
mix+=drone*.13*np.minimum(1,t/3)
pad=(np.sin(2*np.pi*164.8*t)+np.sin(2*np.pi*196*t+.7)+.6*np.sin(2*np.pi*246.9*t+1.3))*(.5+.5*np.sin(2*np.pi*t/17))
mix+=pad*.018
wind=lp(noise,500)*(.5+.5*np.sin(2*np.pi*t/9+1))
mix+=wind*.10*win(0,ch['c03']['t0'],1,3)
# --- c01 title slam
tt=wt('c01','Today'); mix+=np.sin(2*np.pi*(40+50*np.exp(-(t-tt)*8))*(t-tt))*env(tt,.003,.6,2.2)*.8+lp(noise,700)*env(tt,.002,.25,1)*.5
# --- c03/c04 heartbeat that speeds up toward the collapse
tg=wt('c04','gave'); beat=ch['c03']['t0']+8; k=beat; i=0
while k<tg-.2:
    mix+=np.sin(2*np.pi*46*(t-k))*env(k,.004,.10,.5)*(.18+.35*(k-beat)/(tg-beat)); mix+=np.sin(2*np.pi*46*(t-k-.2))*env(k+.2,.004,.08,.4)*(.10+.2*(k-beat)/(tg-beat))
    k+=1.15-.55*(k-beat)/(tg-beat)
# riser then silence-hole then boom
ta=wt('c04','At'); k_=np.clip((t-ta)/(tg-ta),0,1); riser=(lp(noise,250)*(1-k_)+lp(noise,2500)*k_)*np.where((t>ta)&(t<tg),k_**2,0); mix+=riser*1.4
mix+=np.sin(2*np.pi*(36+70*np.exp(-(t-tg)*9))*(t-tg))*env(tg,.003,.6,2.4)*1.0+lp(noise,900)*env(tg,.002,.4,1.8)*1.3
# witnesses: ground rumble
tw=wt('c04','Witnesses'); mix+=lp(noise,120)*win(tw,tw+9,.5,2)*1.2
# --- c05 wave roar + impacts
t5=ch['c05']['t0']; mix+=lp(rng.standard_normal(N),700)*win(t5,t5+22,3,4)*(1+.25*np.sin(2*np.pi*3*t))*.9
mix+=np.sin(2*np.pi*42*t)*win(t5,t5+20,2,3)*.16
for w,n in [('It',1),('It',2),('It',3),('Buildings',0)]:
    k=wt('c05',w,n); mix+=np.sin(2*np.pi*55*(t-k))*env(k,.002,.2,.7)*.55+lp(rng.standard_normal(N),1500)*env(k,.002,.1,.4)*.45
# --- c06 thick gurgle
t6=ch['c06']['t0']; mix+=lp(rng.standard_normal(N),170)*win(t6,t6+26,2,3)*1.3*(.6+.4*np.sin(2*np.pi*t/2.3))
for w in [('cooled',0),('Scientists',0),('Post',0)]:
    k=wt('c06',*w); mix+=np.sin(2*np.pi*58*(t-k))*env(k,.002,.25,.9)*.45
# --- c07 warmer pad (rescue)
t7=ch['c07']['t0']; chord=(np.sin(2*np.pi*130.8*t)+np.sin(2*np.pi*164.8*t)+np.sin(2*np.pi*196*t))*win(t7,ch['c07']['t1'],3,3); mix+=chord*.03
# --- c08: 21 stinger, silence, molasses slam
k=wt('c08','Twenty-one'); mix+=np.sin(2*np.pi*65*(t-k))*env(k,.002,.5,1.8)*.75
for n in (0,1): k=wt('c08','Not',n); mix+=lp(rng.standard_normal(N),3000)*env(k,.001,.05,.25)*.5
k=wt('c08','molasses'); mix+=np.sin(2*np.pi*(34+50*np.exp(-(t-k)*8))*(t-k))*env(k,.003,.8,2.4)*1.0+lp(rng.standard_normal(N),600)*env(k,.002,.4,1.6)*.8
# --- c09 gavel knocks
for w,n in [('ruled',0),('paid',0)]:
    k=wt('c09',w,n); mix+=(np.sin(2*np.pi*130*(t-k))*env(k,.001,.05,.3)*.9+lp(rng.standard_normal(N),2500)*env(k,.001,.02,.1)*.6)
# --- c11 bell tones for the 21 names
sh=wt('c11','hundredth')
for i in range(21):
    k=sh+.6+i*.32+.3; f=[392,440,523.3,587.3,659.3][i%5]; mix+=(np.sin(2*np.pi*f*(t-k))+.3*np.sin(2*np.pi*f*2*(t-k)))*env(k,.004,.6,2.2)*.05
# --- end
k=wt('c12','school'); mix+=np.sin(2*np.pi*55*(t-k))*env(k,.003,1.0,3)*.7
mix*=np.clip((D-t)/2.0,0,1)*np.minimum(1,t/1.0)
mix=np.tanh(mix*1.1); mix=mix/np.max(np.abs(mix))*.8
with wave.open('mix_sfx.wav','w') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
print('ok',D)
