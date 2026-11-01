import json,subprocess
S=json.load(open('script.json'));GAP=1.6;LEAD=2.5;TAIL=5.0
t=LEAD;words=[];ch=[]
subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',str(GAP),'/tmp/gap.wav']);subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',str(LEAD),'/tmp/lead.wav'])
lst=open('/tmp/concat.txt','w');lst.write("file '/tmp/lead.wav'\n")
for c in S:
    w=json.load(open(f"vo/{c['id']}.json"));dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f"vo/{c['id']}.mp3"],capture_output=True,text=True).stdout)
    subprocess.run(['ffmpeg','-v','error','-y','-i',f"vo/{c['id']}.mp3",'-ar','44100','-ac','1',f"/tmp/{c['id']}.wav"])
    ch.append(dict(id=c['id'],title=c['title'],t0=t,t1=t+dur))
    for x in w: words.append(dict(ch=c['id'],w=x[0],t0=t+x[1],t1=t+x[2]))
    lst.write(f"file '/tmp/{c['id']}.wav'\n");
    if c is not S[-1]: lst.write("file '/tmp/gap.wav'\n")
    t+=dur+GAP
lst.close()
total=t-GAP+TAIL
json.dump(dict(chapters=ch,words=words,total=total),open('timeline.json','w'))
print('total',round(total,1),'=',round(total/60,2),'min')
