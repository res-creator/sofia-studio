# Обложка «Реальный размер стран»: кадр нашего 3D-глобуса (14 Гренландий в Африке) + надписи.
# python3 make_cover.py cover.jpg   (кадр берётся из video/parts/globe.mp4 на 7.2 с)
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import subprocess, sys, tempfile, os
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
tmp=os.path.join(tempfile.gettempdir(),'cs_globe_frame.png')
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss','7.2','-i','video/parts/globe.mp4','-frames:v','1',tmp],check=True)
g=Image.open(tmp).convert('RGB').crop((380,0,1300,1080))
g=ImageEnhance.Contrast(ImageEnhance.Color(g).enhance(1.25)).enhance(1.15).resize((int(920*800/1080),800),Image.LANCZOS)
import numpy as np
c=Image.new('RGB',(W,H),(4,4,8))
m=np.clip(np.linspace(0,1,g.width)/0.25,0,1)**1.5; m=np.tile(m,(g.height,1))
c.paste(g,(W-g.width+30,-40),Image.fromarray((m*255).astype('uint8')))
d=ImageDraw.Draw(c)
def st(xy,t,f,col,sw=9): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0))
st((40,0),'14',ImageFont.truetype(F+'Inter-Black.otf',300),(255,214,0),12)
st((48,300),'ГРЕНЛАНДИЙ',ImageFont.truetype(F+'Inter-Black.otf',96),(255,255,255))
st((52,410),'в одной Африке',ImageFont.truetype(F+'Inter-Black.otf',58),(255,255,255),6)
f2=ImageFont.truetype(F+'Inter-Black.otf',50); t='НА КАРТЕ ВЫГЛЯДЯТ РАВНЫМИ'
bb=d.textbbox((0,0),t,font=f2)
d.rounded_rectangle((48,515,48+bb[2]+44,515+bb[3]+30),12,fill=(228,32,32))
d.text((70,523),t,font=f2,fill=(255,255,255))
c.save(sys.argv[1],quality=93)
