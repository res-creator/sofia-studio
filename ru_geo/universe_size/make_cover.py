from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import numpy as np, math, sys
W,H=1280,720
F='/usr/share/fonts/opentype/inter/'
YEL=(255,214,0); RED=(255,40,40)
def stroke_text(d,xy,t,f,c,sw=10):
    d.text(xy,t,font=f,fill=c,stroke_width=sw,stroke_fill=(0,0,0))
# фон: Уэбб, тёмный
im=Image.open('archive/img/jwst2.jpg').convert('RGB')
w=im.width; h=w*9//16; bg=im.crop((0,(im.height-h)//2,w,(im.height-h)//2+h)).resize((W,H),Image.LANCZOS)
bg=ImageEnhance.Brightness(ImageEnhance.Color(bg).enhance(1.4)).enhance(0.75).convert('RGBA')
# сфера реликтового излучения (Planck) справа
m=Image.open('archive/img/cmb_map.jpg').convert('RGB').crop((150,70,620,330)).resize((800,800),Image.LANCZOS)
tex=np.asarray(ImageEnhance.Color(m).enhance(1.3)).astype(np.float32)
R=430; cx,cy=W+40,H//2+20; N=2*R
yy,xx=np.mgrid[0:N,0:N]; u=(xx-R)/R; v=(yy-R)/R; rr=np.sqrt(u*u+v*v); inside=rr<1
z=np.sqrt(np.clip(1-rr*rr,0,1))
lon=np.arctan2(u,z); lat=np.arcsin(np.clip(v,-1,1))
tx=((lon/np.pi*0.9+0.5)*799).clip(0,799).astype(int); ty=((lat/np.pi*0.9+0.5)*799).clip(0,799).astype(int)
sph=tex[ty,tx]*(0.35+0.75*z[...,None]**0.6)[...]
alpha=(inside*255).astype(np.uint8)
S_=Image.fromarray(sph.clip(0,255).astype(np.uint8)).convert('RGBA'); S_.putalpha(Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(1.2)))
glow=Image.new('L',(N+240,N+240),0); ImageDraw.Draw(glow).ellipse((90,90,N+150,N+150),fill=230); glow=glow.filter(ImageFilter.GaussianBlur(45))
gl=Image.new('RGBA',glow.size,(255,150,60,0)); gl.putalpha(glow)
bg.alpha_composite(gl,(cx-R-120,cy-R-120)); bg.alpha_composite(S_,(cx-R,cy-R))
# крошечная Земля слева
e=Image.open('archive/img/blue_marble.jpg').convert('RGB')
ea=np.asarray(e.convert('L')); ys,xs=np.nonzero(ea>25); ecx,ecy=(xs.min()+xs.max())/2,(ys.min()+ys.max())/2; er=max(xs.max()-xs.min(),ys.max()-ys.min())/2
D=34; e=e.crop((int(ecx-er),int(ecy-er),int(ecx+er),int(ecy+er))).resize((D,D),Image.LANCZOS).convert('RGBA')
mk=Image.new('L',(D,D),0); ImageDraw.Draw(mk).ellipse((0,0,D-1,D-1),fill=255); e.putalpha(mk)
EX,EY=230,520
g2=Image.new('L',(D+60,D+60),0); ImageDraw.Draw(g2).ellipse((18,18,D+42,D+42),fill=200); g2=g2.filter(ImageFilter.GaussianBlur(10))
gg=Image.new('RGBA',g2.size,(120,180,255,0)); gg.putalpha(g2); bg.alpha_composite(gg,(EX-30,EY-30)); bg.alpha_composite(e,(EX,EY))
d=ImageDraw.Draw(bg)
# пунктир от Земли к краю
x0,y0=EX+D+14,EY+D//2-6; x1,y1=cx-R-30,cy+40
n=22
for i in range(n):
    t0=i/n; t1=(i+0.55)/n
    d.line([(x0+(x1-x0)*t0,y0+(y1-y0)*t0),(x0+(x1-x0)*t1,y0+(y1-y0)*t1)],fill=(255,255,255),width=6)
# стрелка «МЫ»
d.line([(150,600),(EX+4,EY+D+4)],fill=RED,width=12)
a=math.atan2(EY+D+4-600,EX+4-150); tip=(EX+8,EY+D+8)
d.polygon([tip,(tip[0]-40*math.cos(a-0.5),tip[1]-40*math.sin(a-0.5)),(tip[0]-40*math.cos(a+0.5),tip[1]-40*math.sin(a+0.5))],fill=RED)
lab=ImageFont.truetype(F+"Inter-Black.otf",64)
stroke_text(d,(60,585),"МЫ",lab,(255,255,255),6)
# подпись на сфере
stroke_text(d,(cx-R+40,cy-40),'КРАЙ',ImageFont.truetype(F+'Inter-Black.otf',84),(255,255,255),7)
# главный текст
big=ImageFont.truetype(F+'Inter-Black.otf',150)
stroke_text(d,(40,30),'ЧТО ЗА',big,(255,255,255),11)
stroke_text(d,(40,200),'КРАЕМ?',big,YEL,11)
bg.convert('RGB').save(sys.argv[1],quality=93)
