import json,subprocess,os,re,concurrent.futures as cf
it=[i for i in json.load(open('dc_items.json')) if i['genre']=='Photographs']
UA='SofiaStudioBot/1.0 (educational; taneasirbu08@gmail.com)'
def one(i):
    sid=i['id'].split(':')[1]; out=f'photos/dc_{sid}.jpg'
    if os.path.exists(out): return sid,'cached'
    tmp=f'/tmp/dc_{sid}.bin'
    if i['coll']=='Boston Elevated Photographs: Accidents':
        io=re.search(r'IO_[0-9a-f-]+',i['uri']).group(0); u=f'https://cityofboston.access.preservica.com/download/file/{io}'
    else:
        # BPL: find first image id for the item
        r=subprocess.run(['curl','-sS','-m','40','-A',UA,f"https://www.digitalcommonwealth.org/search/{i['id']}.json"],capture_output=True,text=True)
        a=json.loads(r.stdout)['data']['attributes']; img=a.get('exemplary_image_ssi') or ''
        u=f"https://iiif.digitalcommonwealth.org/iiif/2/{img}/full/2400,/0/default.jpg"
    r=subprocess.run(['curl','-sS','-L','-m','180','-A',UA,'-o',tmp,'-w','%{http_code}',u],capture_output=True,text=True)
    if r.stdout!='200': return sid,'http '+r.stdout
    r=subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-vf','scale=2400:-2:flags=lanczos,format=gray' if False else 'scale=2400:-2:flags=lanczos','-q:v','3',out],capture_output=True,text=True); os.remove(tmp)
    return sid,'ok' if os.path.exists(out) else 'ffmpeg '+r.stderr[:100]
with cf.ThreadPoolExecutor(3) as ex:
    for sid,st in ex.map(one,it): print(sid,st,flush=True)
