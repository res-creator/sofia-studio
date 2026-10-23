import json,sys,subprocess,glob,os
os.makedirs('preview2',exist_ok=True)
# usage: python3 prev_v2.py <ep> "0;S['a1_her']['t']+0.5;SC['B1']['s']+2" sheet.png   (S = speech lines, SC = scenes, times in seconds)
from PIL import Image
ep=sys.argv[1]; T=json.load(open(f'eps/{ep}/timeline.json')); S={s['id']:s for s in T['speech']}; SC={s['id']:s for s in T['scenes']}
fr=[int(eval(e)*30) for e in sys.argv[2].split(';')]
for f in glob.glob(f'preview2/{ep}_*.png'): os.remove(f)
subprocess.run(['node',f'{ep}.js','0','0','--png='+','.join(map(str,fr))],check=True)
ims=[Image.open(f'preview2/{ep}_{f:05d}.png') for f in fr]
tw,th=(360,640) if ims[0].size[1]>ims[0].size[0] else (640,360)   # portrait (TikTok) or landscape (YouTube)
ims=[im.resize((tw,th)) for im in ims]
Sh=Image.new('RGB',(tw*len(ims),th))
for i,im in enumerate(ims): Sh.paste(im,(tw*i,0))
Sh.save(sys.argv[3])
