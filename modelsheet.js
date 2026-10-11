const F=require('./lib/fonts');
const {createCanvas}=require('@napi-rs/canvas');const {drawSofia}=require('./lib/sofia');const {drawGus}=require('./lib/gus');const {paint,roundRect,OL}=require('./lib/draw');const U=require('./lib/ui');const P=require('./lib/props');
const W=2400,H=2700,c=createCanvas(W,H),x=c.getContext('2d');
x.fillStyle='#FFF6E6';x.fillRect(0,0,W,H);
const T=(t,X,Y,s=48,col=OL)=>{x.font=`700 ${s}px ${F.EN}`;x.fillStyle=col;x.textAlign='center';x.fillText(t,X,Y);};
const t2=(t,X,Y,s=26)=>{x.font=`700 ${s}px ${F.RU}`;x.fillStyle='#8a5a3c';x.textAlign='center';x.fillText(t,X,Y);};
T('SOFIA & GUS — MODEL SHEET',W/2,90,80,U.ORANGE);
// row 1: expressions (heads)
T('Sofia — expressions',W/2,170,52);
const ex=[['neutral / talk',{mouth:{smile:0.6}}],['happy',{mouth:{open:0.5,smile:1},brow:{l:0.4,r:0.4}}],['laughing',{happyEyes:1,mouth:{open:0.8,smile:1},blush:1}],['shocked',{wide:1,brow:{l:1,r:1},mouth:{o:1}}],['angry',{brow:{angry:1},mouth:{smile:-0.6,open:0.3,teeth:1}}],['worried',{brow:{worry:1},mouth:{smile:-0.4},look:[0,1]}],
 ['disgusted',{sleepy:0.5,brow:{worry:0.8,l:0.5},mouth:{bleh:true}}],['sleepy',{sleepy:1,blink:0.7,mask:true,outfit:'pajama',hairMess:1}],['proud',{happyEyes:1,mouth:{smile:0.9},brow:{l:0.4,r:0.4}}],['dreamy',{happyEyes:1,blush:1,mouth:{smile:0.9}}],['sly',{turn:0.35,look:[1,0],brow:{l:-0.3,r:0.6},mouth:{smile:0.9,w:0.8}}],['suspicious',{look:[0.5,0.4],brow:{l:0.6,r:-0.2},mouth:{smile:0}}]];
ex.forEach(([n,p],i)=>{const cx=200+(i%6)*400,cy=380+Math.floor(i/6)*380;x.save();x.beginPath();x.arc(cx,cy,150,0,7);x.fillStyle='#fff';x.fill();x.lineWidth=6;x.strokeStyle=OL;x.stroke();x.clip();drawSofia(x,cx,cy+300,0.62,Object.assign({legs:'none'},p));x.restore();t2(n,cx,cy+190,30);});
// row 2: outfits & poses
T('Sofia — outfits & poses',W/2,1190,52);
const poses=[['sweater (main)',{}],['pajama + sleep mask',{outfit:'pajama',mask:true,hairMess:0.8}],['wave (open palm)',{armR:[230,-400],handR:'open',mouth:{open:0.5,smile:1}}],['fist pump (yes!)',{armR:[180,-330],handR:'fist',mouth:{open:0.5,smile:1}}],['explaining',{armL:[-190,-260],handL:'open',armR:[150,-100],mouth:{open:0.4,smile:0.7}}],['panic',{armL:[-200,-420],armR:[200,-420],handL:'open',handR:'open',wide:1,mouth:{o:1},hairMess:1}],['walking',{legs:'walk',walk:0.25}],['mixed outfit (gag)',{outfit:'mix',hairMess:1,glasses:false}]];
poses.forEach(([n,p],i)=>{const cx=170+i*295,fy=1830;drawSofia(x,cx,fy-262*0.55,0.55,p);t2(n,cx,fy+60,26);});
// row 3: Gus
T('Gus — the deadpan goose (best friend)',W/2,1990,52);
const gp=[['deadpan (default)',{lids:0.6}],['HONK',{lids:0.05,honk:1,wing:0.7}],['pointing with wing',{wing:0.9,lids:0.55,look:1}],['sad',{lids:0.8,neck:-0.6,look:-0.5}],['sipping / leaning',{neck:1.4,lids:1}],['walking',{walking:true,walk:0.3}],['holding a sign',{hold:(c,face,Hh)=>{c.translate(Hh.hx+128,Hh.hy+26);line(c,[[0,0],[0,40]],5,OL);c.scale(face,1);paint(c,q=>roundRect(q,-66,40,132,132,14),'#FFFFFF',{lw:6});U.textOutlined(c,'B',0,140,96,'#5BB8F0',{olw:12});}}]];
const {line}=require('./lib/draw');
gp.forEach(([n,p],i)=>{const cx=220+i*330,fy=2560;drawGus(x,cx,fy,0.62,p);t2(n,cx,fy+60,26);});
require('fs').writeFileSync('out/model_sheet.png',c.toBuffer('image/png'));
