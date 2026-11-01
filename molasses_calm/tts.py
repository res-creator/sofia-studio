import json,subprocess,base64,time,os
S=json.load(open('script.json'))
for i,c in enumerate(S):
    out=f"vo/{c['id']}.mp3"
    if os.path.exists(out) and os.path.exists(f"vo/{c['id']}.json"): continue
    body=json.dumps({"text":c['text'],"model_id":"eleven_v4","voice_settings":{"stability":0.8,"similarity_boost":0.8,"style":0.0}})
    for t in range(4):
        r=subprocess.run(['curl','-sS','-m','180','-X','POST','https://api.elevenlabs.io/v1/text-to-speech/4MQev7xxYPuQHlUvk604/with-timestamps?output_format=mp3_44100_128','-H','Content-Type: application/json','-H','xi-api-key: dummy','-d',body],capture_output=True,text=True)
        try: d=json.loads(r.stdout); open(out,'wb').write(base64.b64decode(d['audio_base64'])); break
        except Exception as e: print(c['id'],'retry',r.stdout[:200]); time.sleep(10*(t+1))
    a=d['alignment'];ch=a['characters'];s_=a['character_start_times_seconds'];e_=a['character_end_times_seconds']
    words=[];cur='';st=None
    for x,y,z in zip(ch,s_,e_):
        if x in ' \n':
            if cur: words.append((cur,st,pe));cur=''
        else:
            if not cur: st=y
            cur+=x;pe=z
    if cur: words.append((cur,st,pe))
    json.dump(words,open(f"vo/{c['id']}.json",'w')); print(c['id'],len(words),round(words[-1][2],1),flush=True); time.sleep(3)
