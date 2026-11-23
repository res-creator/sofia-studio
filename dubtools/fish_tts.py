# Fish Audio zero-shot TTS with a reference clip (no saved model needed). Needs ref.mp3 + ref_text.txt next to it; proxy injects the API key.
# Free model: s2.1-pro-free (check Fish Audio terms for commercial use).
import ormsgpack, urllib.request, ssl, sys, json
REF_TEXT=open('ref_text.txt').read()
def tts(text,out,model='s2.1-pro-free'):
    body={"text":text,"format":"mp3","mp3_bitrate":192,"references":[{"audio":open('ref.mp3','rb').read(),"text":REF_TEXT}]}
    req=urllib.request.Request("https://api.fish.audio/v1/tts",data=ormsgpack.packb(body),headers={"Authorization":"Bearer dummy","content-type":"application/msgpack","model":model},method="POST")
    try:
        d=urllib.request.urlopen(req,timeout=300,context=ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')).read(); open(out,'wb').write(d); return len(d)
    except urllib.error.HTTPError as e: return 'ERR %s %s'%(e.code,e.read()[:300])
if __name__=='__main__': print(tts(sys.argv[1],sys.argv[2]))
