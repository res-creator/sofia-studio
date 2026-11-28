from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import numpy as np, sys
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
im=Image.open('archive/img/voyager_craft.jpg').convert('RGB')   # 1920x1587
im=im.transpose(Image.FLIP_LEFT_RIGHT)
c=im.crop((0,40,1920,40+1080)).resize((W,H),Image.LANCZOS)
c=ImageEnhance.Contrast(c).enhance(1.15); c=ImageEnhance.Color(c).enhance(1.35)
a=np.asarray(c).astype(np.float32); g=np.linspace(0,1,W)[None,:,None]; a*=(0.35+0.65*np.clip((g-0.1)/0.5,0,1))
c=Image.fromarray(a.clip(0,255).astype(np.uint8)).convert('RGBA'); d=ImageDraw.Draw(c)
def st(xy,t,f,col,sw=10): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0))
st((40,40),'49 ЛЕТ',ImageFont.truetype(F+'Inter-Black.otf',150),(255,255,255),11)
st((40,215),'В ПУТИ',ImageFont.truetype(F+'Inter-Black.otf',150),(255,255,255),11)
f2=ImageFont.truetype(F+'Inter-Black.otf',96)
t='ПРОЛЕТЕЛ 0%'; bb=d.textbbox((0,0),t,font=f2)
d.rounded_rectangle((40,420,40+bb[2]+50,420+bb[3]+40),14,fill=(230,30,30))
d.text((65,430),t,font=f2,fill=(255,255,255))
st((48,580),'до края Вселенной',ImageFont.truetype(F+'Inter-Black.otf',52),(255,214,0),6)
c.convert('RGB').save(sys.argv[1],quality=93)
