# Free local TTS (Kokoro, am_michael) per line + word timings via faster-whisper -> vo.wav, words.json
import json, numpy as np, soundfile as sf, os
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
K='/tmp/claude-0/-home-user-sofia-studio/176d0eba-3377-5cf0-9724-ed52b2b7b1d7/scratchpad/kokoro/'
k=Kokoro(K+'kokoro-v1.0.onnx',K+'voices-v1.0.bin'); L=json.load(open('script.json'))
SR=24000; GAP=0.28; out=[np.zeros(int(0.15*SR))]; t=0.15; lines=[]
for i,txt in enumerate(L):
    s,sr=k.create(txt,voice='am_michael',speed=1.22,lang='en-us'); assert sr==SR
    nz=np.where(np.abs(s)>0.01)[0]; s=s[max(0,nz[0]-200):nz[-1]+800]
    lines.append([t,t+len(s)/SR]); out.append(s); t+=len(s)/SR
    g=0.55 if i in (7,9) else GAP; out.append(np.zeros(int(g*SR))); t+=g
v=np.concatenate(out); sf.write('vo.wav',v,SR)
m=WhisperModel('base.en',device='cpu',compute_type='int8')
from scipy.signal import resample_poly
a16=resample_poly(v,2,3).astype(np.float32)
segs,_=m.transcribe(a16,word_timestamps=True)
W=[[w.word.strip(),round(w.start,3),round(w.end,3)] for sg in segs for w in sg.words]
json.dump({'T':round(t,3),'lines':lines,'words':W},open('words.json','w'))
print(round(t,2)); print([ [round(a,2),round(b,2)] for a,b in lines]); print(' '.join(w[0] for w in W))
