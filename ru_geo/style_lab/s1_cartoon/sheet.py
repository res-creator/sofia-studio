import sys,glob
from PIL import Image
fs=sorted(glob.glob('/home/user/sofia-studio/ru_geo/style_lab/s1_cartoon/stills/t*.png'))
want=sys.argv[1:]; fs=[f for f in fs if any(('t'+w.rjust(5,'0')+'.png') in f for w in want)] if want else fs
ims=[Image.open(f).resize((960,540)) for f in fs]
S=Image.new('RGB',(1920,540*((len(ims)+1)//2)))
for i,im in enumerate(ims): S.paste(im,((i%2)*960,(i//2)*540))
S.save('/tmp/claude-0/-home-user-sofia-studio/24c15af6-1f18-59ef-a680-971b83cb24ee/scratchpad/sheet.jpg',quality=85)
print(len(ims))
