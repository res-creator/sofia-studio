# Обложка «Как высоко можно построить?»: вид вниз с Бурдж-Халифы (J. Baikovicius, CC BY-SA 2.0). python3 make_cover.py cover.jpg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import numpy as np, sys
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
im=Image.open('archive/broll/burj_lookdown.jpg').convert('RGB')
h=int(1920*9/16); c=im.crop((0,(im.height-h)//2,1920,(im.height-h)//2+h)).resize((W,H),Image.LANCZOS)
c=ImageEnhance.Brightness(ImageEnhance.Contrast(ImageEnhance.Color(c).enhance(1.6)).enhance(1.25)).enhance(1.1)
a=np.asarray(c).astype(np.float32)
yy,xx=np.mgrid[0:H,0:W]; v=1-0.55*np.clip(1-np.hypot((xx-W*0.62)/W,(yy-H*0.6)/H)*1.6,0,1)   # затемнение по краям
dark=np.clip(1-0.55*np.clip((700-xx)/700,0,1)*np.clip((560-yy)/560,0,1)*1.6,0.25,1)      # левый верх под текст
a*= (dark*(0.75+0.25*(1-v)))[...,None]
c=Image.fromarray(a.clip(0,255).astype(np.uint8))
d=ImageDraw.Draw(c)
def st(xy,t,f,col,sw=10): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0))
st((40,30),'ПОЧЕМУ',ImageFont.truetype(F+'Inter-Black.otf',150),(255,255,255),11)
st((40,200),'НЕ ВЫШЕ?',ImageFont.truetype(F+'Inter-Black.otf',150),(255,214,0),11)
f2=ImageFont.truetype(F+'Inter-Black.otf',48); t='ПОД НОГАМИ ПОЛКИЛОМЕТРА'
bb=d.textbbox((0,0),t,font=f2)
d.rounded_rectangle((44,400,44+bb[2]+44,400+bb[3]+30),12,fill=(228,32,32)); d.text((66,408),t,font=f2,fill=(255,255,255))
c.save(sys.argv[1],quality=93)
