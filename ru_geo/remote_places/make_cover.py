# Обложка «Самое отдалённое место»: кадр нашего 3D-глобуса с точкой Немо + МКС (NASA). python3 make_cover.py cover.jpg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageChops
import numpy as np, subprocess, sys, tempfile, os
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
tmp=os.path.join(tempfile.gettempdir(),'rp_nemo_frame.png')
subprocess.run(['ffmpeg','-loglevel','error','-y','-ss','6','-i','video/parts/map_nemo.mp4','-frames:v','1',tmp],check=True)
k=720/1080; X0=300
g=Image.open(tmp).convert('RGB').crop((X0,0,1620,1080)).resize((int(1320*k),720),Image.LANCZOS)
g=ImageEnhance.Brightness(g).enhance(1.15)
c=Image.new('RGB',(W,H),(3,4,8)); GX=560
m=np.tile(np.clip(np.linspace(0,1,g.width)/0.3,0,1)**1.4,(H,1))
c.paste(g,(GX,0),Image.fromarray((m*255).astype('uint8')))
nx,ny=int((952-X0)*k+GX),int(444*k)
# МКС: снимок на чёрном, кладём «экраном»
iss=Image.open('archive/img/iss_station.jpg').convert('RGB').crop((0,0,1920,860)).resize((430,193),Image.LANCZOS)
iss=ImageEnhance.Contrast(iss).enhance(1.2)
IX,IY=W-440,-10
lum=np.asarray(iss.convert('L')).astype(np.float32); al=np.clip((lum-38)/45,0,1)
c.paste(iss,(IX,IY),Image.fromarray((al*255).astype('uint8')))
d=ImageDraw.Draw(c)
# пунктир от МКС к точке Немо
x0,y0=IX+215,IY+170
for i in range(12):
    t0=i/12; t1=(i+0.55)/12
    d.line([(x0+(nx-x0)*t0,y0+(ny-y0)*t0),(x0+(nx-x0)*t1,y0+(ny-y0)*t1)],fill=(255,214,0),width=6)
d.ellipse((nx-12,ny-12,nx+12,ny+12),fill=(255,60,40),outline=(255,255,255),width=3)
def st(xy,t,f,col,sw=9,**kw): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0),**kw)
st(((x0+nx)//2+16,(y0+ny)//2-10),'400 км',ImageFont.truetype(F+'Inter-Black.otf',44),(255,214,0),5)
big=ImageFont.truetype(F+'Inter-Black.otf',112)
st((40,150),'БЛИЖАЙШИЕ',big,(255,255,255))
st((40,280),'ЛЮДИ',big,(255,255,255))
st((40,410),'В КОСМОСЕ',big,(255,214,0))
f2=ImageFont.truetype(F+'Inter-Black.otf',46); t='ТОЧКА НЕМО'; bb=d.textbbox((0,0),t,font=f2)
d.rounded_rectangle((44,40,44+bb[2]+40,40+bb[3]+28),12,fill=(228,32,32)); d.text((64,48),t,font=f2,fill=(255,255,255))
c.save(sys.argv[1],quality=93)
