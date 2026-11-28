# Обложка «Как создать свою страну?»: Силенд с вертолёта (Ryan Lackey, CC BY 2.0). python3 make_cover.py cover.jpg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import numpy as np, math, sys
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
src=Image.open('archive/img/sealand_aerial.jpg').convert('RGB').crop((0,100,1280,820))
SH=280; im=Image.new('RGB',(W,H)); im.paste(src.crop((0,0,W-SH,H)),(SH,0))
im.paste(src.crop((0,0,SH,H)).transpose(Image.FLIP_LEFT_RIGHT),(0,0))   # море слева продолжено зеркалом
c=ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.35)).enhance(1.2)
a=np.asarray(c).astype(np.float32); g=np.linspace(0,1,W)[None,:,None]
a*=(0.45+0.55*np.clip((g-0.05)/0.45,0,1))
c=Image.fromarray(a.clip(0,255).astype(np.uint8)); d=ImageDraw.Draw(c)
def st(xy,t,f,col,sw=10): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0))
st((40,40),'ЭТО',ImageFont.truetype(F+'Inter-Black.otf',150),(255,255,255),11)
st((40,210),'СТРАНА?',ImageFont.truetype(F+'Inter-Black.otf',150),(255,214,0),11)
f2=ImageFont.truetype(F+'Inter-Black.otf',50); t='1 ПОСТОЯННЫЙ ЖИТЕЛЬ'; bb=d.textbbox((0,0),t,font=f2)
d.rounded_rectangle((44,420,44+bb[2]+44,420+bb[3]+30),12,fill=(228,32,32)); d.text((66,428),t,font=f2,fill=(255,255,255))
# красная стрелка к платформе
p0,p1=(760,600),(990,420)
d.line([p0,p1],fill=(235,35,35),width=16); an=math.atan2(p1[1]-p0[1],p1[0]-p0[0])
d.polygon([(p1[0]+10*math.cos(an),p1[1]+10*math.sin(an)),(p1[0]-50*math.cos(an-0.5),p1[1]-50*math.sin(an-0.5)),(p1[0]-50*math.cos(an+0.5),p1[1]-50*math.sin(an+0.5))],fill=(235,35,35))
c.save(sys.argv[1],quality=93)
