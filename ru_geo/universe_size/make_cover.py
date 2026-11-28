from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import numpy as np, sys
W,H=1280,720
F='/usr/share/fonts/opentype/inter/'
YEL=(255,206,48); OR=(255,120,40)
def text(d,xy,t,f,c,sh=7):
    d.text((xy[0]+sh,xy[1]+sh),t,font=f,fill=(0,0,0)); d.text(xy,t,font=f,fill=c)
im=Image.open('archive/img/jwst2.jpg').convert('RGB')
w=im.width; h=w*9//16; bg=im.crop((0,(im.height-h)//2,w,(im.height-h)//2+h)).resize((W,H),Image.LANCZOS)
bg=ImageEnhance.Contrast(bg).enhance(1.25); bg=ImageEnhance.Color(bg).enhance(1.3)
a=np.asarray(bg).astype(np.float32); g=np.linspace(0,1,W)[None,:,None]; a*=(0.25+0.75*np.clip((g-0.15)/0.55,0,1))
bg=Image.fromarray(a.clip(0,255).astype(np.uint8)).convert('RGBA')
e=Image.open('archive/img/blue_marble.jpg').convert('RGB')
ea=np.asarray(e.convert('L')); ys,xs=np.nonzero(ea>25); cx,cy=(xs.min()+xs.max())/2,(ys.min()+ys.max())/2; r=max(xs.max()-xs.min(),ys.max()-ys.min())/2
e=e.crop((int(cx-r),int(cy-r),int(cx+r),int(cy+r))); D=620; e=e.resize((D,D),Image.LANCZOS); e=ImageEnhance.Color(e).enhance(1.2)
m=Image.new('L',(D,D),0); ImageDraw.Draw(m).ellipse((2,2,D-2,D-2),fill=255); m=m.filter(ImageFilter.GaussianBlur(1.5))
gl=Image.new('RGBA',(D+80,D+80),(0,0,0,0)); gm=Image.new('L',(D+80,D+80),0); ImageDraw.Draw(gm).ellipse((30,30,D+50,D+50),fill=160); gm=gm.filter(ImageFilter.GaussianBlur(18))
gl.paste((90,160,255,255),(0,0),gm)
EX,EY=-250,330
bg.alpha_composite(gl,(EX-40,EY-40)); e=e.convert('RGBA'); e.putalpha(m); bg.alpha_composite(e,(EX,EY))
d=ImageDraw.Draw(bg)
x0,y0=EX+D//2+250,EY+150; x1,y1=1230,250
n=26
for i in range(n):
    t0=i/n; t1=(i+0.55)/n
    d.line([(x0+(x1-x0)*t0,y0+(y1-y0)*t0),(x0+(x1-x0)*t1,y0+(y1-y0)*t1)],fill=OR,width=7)
d.polygon([(x1+22,y1-8),(x1-18,y1-22),(x1-6,y1+16)],fill=OR)
big=ImageFont.truetype(F+'Inter-Black.otf',170)
text(d,(50,40),'ГДЕ',big,(255,255,255))
text(d,(50,215),'КРАЙ?',big,YEL)
sm=ImageFont.truetype(F+'Inter-Black.otf',46)
t='МЕРЯЕМ ОДНИМ ЗОНДОМ'; bb=d.textbbox((0,0),t,font=sm)
X,Y=W-40-(bb[2]+40),570
d.rounded_rectangle((X,Y,X+bb[2]+40,Y+bb[3]+28),10,fill=(232,60,36))
d.text((X+20,Y+8),t,font=sm,fill=(255,255,255))
bg.convert('RGB').save(sys.argv[1],quality=92)
