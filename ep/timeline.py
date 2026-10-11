import json, re, subprocess, numpy as np, os
D=os.path.dirname(os.path.abspath(__file__))
S=json.load(open(f'{D}/seq.json'))
FPS=30
def dur(f): return float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f]))
def env(f):
    a=subprocess.check_output(['ffmpeg','-v','error','-i',f,'-ac','1','-ar','16000','-f','s16le','-']); x=np.frombuffer(a,np.int16).astype(np.float32)/32768
    hop=16000//FPS; n=len(x)//hop; r=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) for i in range(n)])
    r=r/(np.percentile(r,95)+1e-6); return [round(float(min(1,v)),3) for v in r]
def words(f, t0):
    al=json.load(open(f.replace('.mp3','.align.json')))
    ch,st,en=al['characters'],al['character_start_times_seconds'],al['character_end_times_seconds']
    out=[];cur='';ws=None;we=None;br=0
    for c,a,b in zip(ch,st,en):
        if c=='[': br=1; continue
        if c==']': br=0; continue
        if br: continue
        if c.isspace():
            if cur.strip(): out.append({'w':cur.strip(),'t0':t0+ws,'t1':t0+we})
            cur='';ws=None
        else:
            if ws is None: ws=a
            cur+=c; we=b
    if cur.strip(): out.append({'w':cur.strip(),'t0':t0+ws,'t1':t0+we})
    # drop pure-punctuation tokens
    return [w for w in out if re.search(r'[A-Za-z0-9]',w['w'])]
t=0; scenes=[]; lines=[]; turns=[]
for sc in S['SEQ']:
    s={'id':sc['id'],'t0':t,'marks':{},'lines':[]}
    for it in sc['items']:
        if 'wait' in it: t+=it['wait']
        elif 'mark' in it: s['marks'][it['mark']]=t
        elif 'turn' in it:
            d=2.4; turns.append({'phrase':it['turn'],'t0':t,'t1':t+d}); s['marks']['turn']=t; t+=d
        elif 'say' in it:
            f=f"{D}/vo/{it['say']}.mp3"; d=dur(f)
            L={'id':it['say'],'who':it['who'],'t0':t,'t1':t+d,'words':words(f,t),'env':env(f)}
            lines.append(L); s['lines'].append(it['say']); s['marks'][it['say']]=t; s['marks'][it['say']+'_end']=t+d; t+=d
    s['t1']=t; scenes.append(s)
json.dump({'fps':FPS,'T':t,'scenes':scenes,'lines':lines,'turns':turns,'cards':S['CARDS']},open(f'{D}/timeline.json','w'))
print('total',round(t,2)); [print(s['id'],round(s['t0'],1),round(s['t1']-s['t0'],1)) for s in scenes]
print(lines[0]['words'][:6])
