# Обложка «7 мест»: 4 настоящих места мозаикой + вопрос по центру. python3 make_cover.py cover.jpg
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter
import sys
W,H=1280,720; F='/usr/share/fonts/opentype/inter/'
def tile(f,box,w,h):
    im=Image.open('archive/img/'+f).convert('RGB').crop(box).resize((w,h),Image.LANCZOS)
    return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.35)).enhance(1.15)
c=Image.new('RGB',(W,H),(0,0,0)); g=6; w,h=(W-g)//2,(H-g)//2
c.paste(tile('everest_climbers.jpg',(200,0,1700,844),w,h),(0,0))
c.paste(tile('nyos_1986.jpg',(0,150,1728,1122),w,h),(w+g,0))
c.paste(tile('vostok_photo.jpg',(0,250,1200,925),w,h),(0,h+g))
c.paste(tile('trieste_1960.jpg',(200,300,1920,1268),w,h),(w+g,h+g))
c=c.convert('RGBA')
# тёмная полоса по центру
band=Image.new('RGBA',(W,250),(0,0,0,0)); bd=ImageDraw.Draw(band)
for y in range(250):
    a=int(225*min(1,(1-abs(y-125)/125)*1.8)); bd.line([(0,y),(W,y)],fill=(0,0,0,a))
c.alpha_composite(band,(0,H//2-125))
d=ImageDraw.Draw(c)
def st(xy,t,f,col,sw=9,anchor='mm'): d.text(xy,t,font=f,fill=col,stroke_width=sw,stroke_fill=(0,0,0),anchor=anchor)
st((W//2,H//2-48),'СКОЛЬКО ТЫ',ImageFont.truetype(F+'Inter-Black.otf',104),(255,255,255))
st((W//2,H//2+58),'ПРОДЕРЖИШЬСЯ?',ImageFont.truetype(F+'Inter-Black.otf',104),(255,214,0))
# красный бейдж «7 МЕСТ»
bx,by,r=W-120,110,92
d.ellipse((bx-r,by-r,bx+r,by+r),fill=(225,30,30),outline=(255,255,255),width=6)
d.text((bx,by-22),'7',font=ImageFont.truetype(F+'Inter-Black.otf',88),fill=(255,255,255),anchor='mm')
d.text((bx,by+42),'МЕСТ',font=ImageFont.truetype(F+'Inter-Black.otf',34),fill=(255,255,255),anchor='mm')
c.convert('RGB').save(sys.argv[1],quality=93)
